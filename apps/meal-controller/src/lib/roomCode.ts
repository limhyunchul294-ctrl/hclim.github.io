export type AppRole = 'combined' | 'controller' | 'viewer'

const ROOM_RE = /^[0-9]{4,6}$/

export function generateRoomCode(): string {
  // 6 digits — easy to read aloud / type on a TV browser
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function normalizeRoomCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_RE.test(code)
}

export function parseRoleFromUrl(
  search = typeof window !== 'undefined' ? window.location.search : '',
): { role: AppRole; room: string | null } {
  const params = new URLSearchParams(search)
  const roleParam = (params.get('role') || '').toLowerCase()
  const room = normalizeRoomCode(params.get('room') || '')
  if (roleParam === 'controller' || roleParam === 'viewer') {
    return {
      role: roleParam,
      room: isValidRoomCode(room) ? room : null,
    }
  }
  return { role: 'combined', room: null }
}

export function writeRoleToUrl(role: AppRole, room: string | null): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (role === 'combined') {
    url.searchParams.delete('role')
    url.searchParams.delete('room')
  } else {
    url.searchParams.set('role', role)
    if (room && isValidRoomCode(room)) url.searchParams.set('room', room)
    else url.searchParams.delete('room')
  }
  window.history.replaceState({}, '', url.pathname + url.search + url.hash)
}

export function viewerPairUrl(room: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set('role', 'viewer')
  url.searchParams.set('room', room)
  // Prefer clean path without hash noise
  url.hash = ''
  return url.toString()
}

export function controllerPairUrl(room: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set('role', 'controller')
  url.searchParams.set('room', room)
  url.hash = ''
  return url.toString()
}

export function channelNameForRoom(room: string): string {
  return `nyam-meal-${room}`
}
