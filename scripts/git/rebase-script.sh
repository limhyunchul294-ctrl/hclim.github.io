#!/bin/bash
# Git rebase 스크립트 - 이전 커밋 메시지를 "한글로 업데이트 및 최신화"로 통일

# 최신 커밋부터 1a107bb까지의 모든 커밋 메시지를 수정
git rebase -i 1a107bb

# 또는 특정 커밋부터 최신까지
# git rebase -i 38b8320^
# git rebase -i cd3a61d^

