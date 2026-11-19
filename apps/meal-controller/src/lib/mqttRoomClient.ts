import mqtt, { type MqttClient } from 'mqtt'

/**
 * Cross-device room sync over public MQTT WSS.
 * Supabase Realtime project DNS for the previous host is NXDOMAIN, so pairing
 * uses a lightweight MQTT topic layout instead (same 6-digit room codes).
 *
 * Topics:
 * - presence/+  — role discovery
 * - detect      — viewer → phone (face / nudge / play outcome)
 * - command     — phone → viewer (play/pause + settings + wantPreview)
 * - preview     — viewer → phone (JPEG recognition thumbnails; only while paired + toggled)
 * - control     — legacy v1 (still subscribed for older peers)
 *
 * Privacy: frames stay on the MQTT broker used for pairing (same as control).
 * No separate cloud upload. Preview stops when unpaired or the phone toggles off.
 */
export const MQTT_BROKER_URL =
  import.meta.env.VITE_MQTT_BROKER_URL ?? 'wss://broker.emqx.io:8084/mqtt'

export function mqttTopics(room: string) {
  const base = `nyam-controller/v1/${room}`
  return {
    control: `${base}/control`,
    detect: `${base}/detect`,
    command: `${base}/command`,
    preview: `${base}/preview`,
    presence: `${base}/presence`,
    presenceWild: `${base}/presence/+`,
  }
}

export type PresenceMeta = { role: 'controller' | 'viewer'; at: number }

export function connectRoomMqtt(opts: {
  room: string
  role: 'controller' | 'viewer'
  clientKey: string
  onStatus: (s: 'connecting' | 'connected' | 'error', detail?: string) => void
  onPresence: (roles: Set<string>) => void
  onDetect: (payload: unknown) => void
  onCommand: (payload: unknown) => void
  onPreview: (payload: unknown) => void
}): {
  client: MqttClient
  publishDetect: (payload: unknown) => void
  publishCommand: (payload: unknown) => void
  publishPreview: (payload: unknown) => void
  dispose: () => void
} {
  const topics = mqttTopics(opts.room)
  const presenceTopic = `${topics.presence}/${opts.clientKey}`
  const rolesSeen = new Map<string, PresenceMeta>()

  opts.onStatus('connecting')

  const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `nyam-${opts.role}-${opts.clientKey}`,
    clean: true,
    reconnectPeriod: 2000,
    connectTimeout: 12_000,
    protocolVersion: 4,
    will: {
      topic: presenceTopic,
      payload: '',
      retain: true,
      qos: 0,
    },
  })

  const emitPresence = () => {
    const roles = new Set<string>()
    for (const meta of rolesSeen.values()) {
      if (meta.role) roles.add(meta.role)
    }
    opts.onPresence(roles)
  }

  const publishPresence = () => {
    const body: PresenceMeta = { role: opts.role, at: Date.now() }
    client.publish(presenceTopic, JSON.stringify(body), { retain: true, qos: 0 })
  }

  client.on('connect', () => {
    opts.onStatus('connected')
    client.subscribe(
      [
        topics.presenceWild,
        topics.detect,
        topics.command,
        topics.preview,
        topics.control,
      ],
      { qos: 0 },
      (err) => {
        if (err) {
          opts.onStatus(
            'error',
            '방에 들어가지 못했어요. 네트워크를 확인해 주세요.',
          )
          return
        }
        publishPresence()
      },
    )
  })

  client.on('reconnect', () => {
    opts.onStatus('connecting')
  })

  client.on('error', (err) => {
    opts.onStatus(
      'error',
      err?.message
        ? `연결이 안 돼요: ${err.message}`
        : '네트워크 연결이 안 돼요. Wi‑Fi나 데이터를 확인해 주세요.',
    )
  })

  client.on('message', (topic, buf) => {
    if (topic.startsWith(topics.presence + '/')) {
      const key = topic.slice((topics.presence + '/').length)
      const raw = buf.toString('utf8').trim()
      if (!raw) {
        rolesSeen.delete(key)
        emitPresence()
        return
      }
      try {
        const parsed = JSON.parse(raw) as PresenceMeta
        if (parsed?.role === 'controller' || parsed?.role === 'viewer') {
          rolesSeen.set(key, parsed)
          emitPresence()
        }
      } catch {
        /* ignore bad presence */
      }
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(buf.toString('utf8'))
    } catch {
      return
    }

    if (topic === topics.detect) {
      opts.onDetect(parsed)
      return
    }
    if (topic === topics.command) {
      opts.onCommand(parsed)
      return
    }
    if (topic === topics.preview) {
      opts.onPreview(parsed)
      return
    }
    if (topic === topics.control) {
      // Legacy v1: treat as detect-shaped for older controllers publishing play state
      opts.onDetect(parsed)
    }
  })

  const publishDetect = (payload: unknown) => {
    if (!client.connected) return
    client.publish(topics.detect, JSON.stringify(payload), { qos: 0 })
  }

  const publishCommand = (payload: unknown) => {
    if (!client.connected) return
    client.publish(topics.command, JSON.stringify(payload), { qos: 0 })
  }

  const publishPreview = (payload: unknown) => {
    if (!client.connected) return
    client.publish(topics.preview, JSON.stringify(payload), { qos: 0 })
  }

  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    try {
      client.publish(presenceTopic, '', { retain: true, qos: 0 })
    } catch {
      /* ignore */
    }
    client.end(true)
  }

  return { client, publishDetect, publishCommand, publishPreview, dispose }
}
