# 퇴근까지 레벨업 (Fun Prototype)

직장인의 근무시간(09:00~18:00)을 게임처럼 버티게 해주는 **재미형 집중 웹앱** 프로토타입입니다.

## 핵심 기능 (MVP)

- 퇴근 카운트다운 (18:00 기준)
- 포모도로 타이머 (25분)
- 오늘의 퀘스트 3개 관리
- XP/레벨업 시스템 + 미션/배지
- localStorage 자동 저장

## 실행 방법

### 방법 A) 파일 더블클릭 (가장 쉬움, Windows/Mac 공통)
1. `index.html` 파일을 브라우저(Chrome/Edge)로 열기
2. 바로 사용 가능

### 방법 B) 로컬 서버 실행 (권장)
VS Code Live Server 또는 Python 서버 사용

```bash
# fun-levelup-app 폴더에서
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속

## 폴더 구조

- `index.html` : 화면 구조
- `style.css` : 글래스모피즘/네온 UI 스타일
- `app.js` : 상태관리, XP, 타이머, 미션 로직
- `PLAN_EXECUTION.md` : 계획/실행 기록

## 향후 확장 아이디어

- 업무시간 자동 감지(평일/주말)
- 팀 랭킹/공유 모드
- 집중 사운드/애니메이션 테마
- 일일 브리핑 텍스트 자동 생성
