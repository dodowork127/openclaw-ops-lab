# BRIEFING_AND_KANBAN_RULES

## 1) 브리핑 포맷 자동 선택 규칙

앱/보고 시 기본 우선순위:

1. **퇴근 전 요약(eod)**: 17:00 이후
2. **팀장 보고(manager)**: 스트레스 70% 이상 또는 미완료 P1 존재
3. **개인 회고(review)**: 그 외 일반 상황

## 2) WhatsApp 보고 기본 구조

- 결론 1줄
- 칸반 현황(B/IP/R/D)
- 오늘 운동(러닝/걷기/근력/스트레칭) 1~2줄
- 다음 액션 3개
- 리스크/주의 1줄

## 3) Mission Control + GitHub 운영 규칙

- In Progress: 작업 브랜치 생성 시
- Review: PR 생성 시
- Done: PR 머지 시

카드 필수 필드:
- Title
- 성공 기준(DoD)
- 산출물 경로/PR 링크
- Priority

## 4) 커밋 위치 원칙

- 앱/기능 코드: `openclaw-ops-lab` 저장소에 커밋 + PR
- 에이전트 운영 이력: workspace 루트 `CHANGELOG_AGENT.md`에 별도 기록
