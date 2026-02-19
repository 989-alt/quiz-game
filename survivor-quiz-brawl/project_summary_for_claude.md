# Survivor Quiz Brawl - 프로젝트 요약 및 개발 방향

## 프로젝트 개요
교육용 서바이벌 퀴즈 게임. 뱀파이어 서바이버 스타일의 게임플레이 + AI 기반 퀴즈 생성.

## 기술 스택
- **Frontend**: React 18, TypeScript, Vite
- **Game Engine**: Phaser 3
- **Styling**: CSS (Tailwind 제거됨, 커스텀 픽셀 스타일)
- **AI**: Google Gemini API (gemini-2.5-flash)
- **파일 파싱**: pdfjs-dist (PDF), jszip (PPTX)
- **State**: Zustand

## 현재 상태 (claude 3차 제한 커밋 완료 - 솔로 모드 구현)

### 완료된 기능
1. **솔로 플레이 모드 (Solo Mode)**
   - **무한 퀴즈 생성**: `SoloQuizGenerator.ts` (수학 1~6학년 알고리즘 생성)
   - **정적 데이터 퀴즈**: `SoloQuizData.ts` (맞춤법, 속담 50+ 문제)
   - **게임 통합**: 로비 없이 즉시 시작, 로컬 상태 관리 (`quizStore` 내장)

2. **파일 업로드 개선**
   - PDF 한글 텍스트 추출 (pdfjs-dist)
   - PPTX 텍스트 추출 (jszip)
   - 다중 파일 업로드 지원
   - 개별 파일 삭제 기능
   - 파싱 진행률 표시 UI

2. **AI 퀴즈 생성**
   - Gemini 2.5 Flash 모델 사용
   - 텍스트 기반 4지선다 퀴즈 생성

3. **게임 시스템**
   - Phaser 기반 뱀서라이크 게임
   - 무기 시스템 (WeaponManager)
   - 적 스폰 및 웨이브 시스템
   - **무한 맵 시스템 (Infinite Map)**
     - TileSprite 기반 무한 스크롤 배경
     - 카메라/플레이어 중심의 좌표계
     - 엔티티 거리 기반 자동 정리 (Cleanup)

4. **UI/UX**
   - 반응형 레이아웃 (clamp 기반)
   - 픽셀 아트 스타일 테마
   - 글래스모피즘 카드 디자인

## 알려진 이슈 및 해결 필요 사항

### 긴급 (테스트 필요)
1. **PDF.js Worker 오류**: unpkg CDN으로 변경 - 실제 브라우저 테스트 필요
   - 파일: `src/services/fileParser.ts:7`
   - 설정: `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

### 중요
2. **번들 크기 최적화**: 빌드 결과 2MB+ (경고 발생)
   - 코드 스플리팅 필요 (dynamic import)
   - pdfjs-dist, jszip 청크 분리 권장

3. **Gemini API 에러 처리 개선**
   - 429 에러 (Rate Limit) 시 재시도 로직 없음
   - 사용자 친화적 에러 메시지 필요

### 개선 사항
4. **OCR 지원**: 이미지 기반 PDF 텍스트 추출 불가
5. **레거시 .ppt 파일**: PPTX로 변환 안내만 제공

## 주요 파일 구조

```
survivor-quiz-brawl/
├── src/
│   ├── components/
│   │   ├── teacher/
│   │   │   ├── FileUpload.tsx    # 파일 업로드 (다중 파일, 삭제)
│   │   │   ├── Dashboard.tsx     # 교사 대시보드
│   │   │   ├── QuizEditor.tsx    # 퀴즈 편집기
│   │   │   ├── QRLobby.tsx       # QR 코드 로비
│   │   │   └── Leaderboard.tsx   # 리더보드
│   │   ├── student/
│   │   │   ├── GameContainer.tsx # 게임 컨테이너
│   │   │   ├── QuizOverlay.tsx   # 퀴즈 오버레이
│   │   │   └── JoinRoom.tsx      # 방 참가
│   │   └── shared/
│   │       ├── PixelButton.tsx   # 픽셀 버튼
│   │       └── Timer.tsx         # 타이머
│   ├── services/
│   │   ├── fileParser.ts         # PDF/PPTX 파싱 (신규)
│   │   └── gemini.ts             # Gemini API (gemini-2.5-flash)
│   ├── game/
│   │   ├── scenes/GameScene.ts   # 메인 게임 씬
│   │   ├── utils/                # 유틸리티 (신규)
│   │   │   ├── SoloQuizGenerator.ts # 수학 퀴즈 생성 로직
│   │   │   └── SoloQuizData.ts      # 맞춤법/속담 데이터
│   │   └── weapons/              # 무기 시스템
│   ├── types/
│   │   └── quiz.ts               # Quiz, FileParseResult 타입
│   └── stores/
│       └── quizStore.ts          # Zustand 퀴즈 상태
├── package.json                  # pdfjs-dist, jszip 추가됨
└── index.html
```

## 다음 개발 방향 (우선순위)

### Phase 1: 안정화
- [ ] PDF Worker 실제 동작 테스트
- [ ] 에러 처리 및 재시도 로직 추가
- [ ] 번들 크기 최적화 (코드 스플리팅)

### Phase 2: 게임 기능
- [ ] 무기 밸런싱
- [ ] 새로운 적 타입 추가
- [ ] 보스 시스템
- [ ] 업그레이드 시스템 강화

### Phase 3: 멀티플레이어
- [ ] 실시간 동기화 (WebSocket/Socket.io)
- [ ] 교사-학생 연결 시스템
- [ ] 리더보드 실시간 업데이트

### Phase 4: 추가 기능
- [ ] 퀴즈 저장/불러오기
- [ ] 퀴즈 공유 기능
- [ ] 학습 통계 분석

## 개발 명령어

```bash
cd survivor-quiz-brawl
npm install     # 의존성 설치
npm run dev     # 개발 서버 (기본 포트: 5173)
npm run build   # 프로덕션 빌드
```

## Git 커밋 히스토리
- `solomode` (current): 솔로 플레이 (수학/맞춤법/속담), 무한 퀴즈 생성기, UI 통합
- `claude 2차 제한` (ac2e637): 파일 업로드 개선, 다중 파일, Gemini 2.5 Flash
- `claude 1차 제한` (2069928): 초기 구현

## 테스트 파일 경로
- PDF: `C:\Users\hit\Downloads\2026910045 더샵 분당센트로 무순위 입주자모집공고문.pdf`
- PPTX: `C:\Users\hit\Downloads\(PPT)4차시_(가짜 뉴스 판별법 형성평가)_이다은.pptx`

## 참고 사항
- Tailwind CSS 제거됨 (커스텀 CSS 사용)
- postcss.config.js, tailwind.config.js 삭제됨
- 픽셀 스타일 UI는 index.css에 정의
