PRD: Survivor Quiz Brawl (v1.1)
1. 프로젝트 개요 (Overview)
제품명: Survivor Quiz Brawl

핵심 컨셉: 'Vampire Survivors' 스타일의 로그라이크 액션 + 실시간 학습 퀴즈.

플랫폼: Web (PC/Mobile/Tablet 반응형).

핵심 가치: 몰입감 높은 게임 루프 내에 강제적 학습 요소를 배치하여 학습 효율 극대화.

2. 시스템 아키텍처 (Technical Architecture)
2.1. 기술 스택 (Tech Stack)
Frontend (Game Engine): Phaser 3 (필수: 대량의 스프라이트 렌더링 최적화).

Frontend (UI): React (교사 대시보드, 퀴즈 오버레이 UI).

Backend (Relay Server): Node.js + Socket.io (실시간 데이터 중계).

Role: 교사 PC는 '방장' 역할, 실제 통신은 클라우드 중계 서버를 통함.

AI Engine: Google Gemini 2.5 Flash (via API).

Data Processing: pdf-parse (수업 자료 텍스트 추출).

2.2. 데이터 흐름 (Data Flow)
퀴즈 생성 (Batch): 교사가 요청 시 10문제 단위로 청크(Chunk)를 나누어 비동기 생성 (Timeout 방지).

게임 상태 동기화:

Game Logic: Client-side (각 학생 기기에서 연산).

State Sync: 1~3초 주기로 Score, Level, AliveStatus만 서버로 전송 (트래픽 최소화).

3. 주요 기능 명세 (Feature Specifications)
3.1. 교사 모드 (Host/Admin)
A. 게임 셋팅 (Configuration)

자료 업로드: PDF, PPT 텍스트 추출.

퀴즈 옵션 설정:

생성 문제 수 (최대 100).

문제당 제한 시간 (Time Limit): 기본 15초 (설정 범위: 5초 ~ 60초).

API Key 입력 (Local Storage 저장).

퀴즈 검수: 생성된 문제 수정/삭제/재생성.

B. 게임 관제 (Live Dashboard)

QR 코드 로비: 접속 URL QR 코드 표시.

실시간 리더보드: 점수 순위, 생존자/사망자 카운트.

강제 종료: 수업 시간 종료 시 교사가 게임 서버 종료 트리거.

3.2. 학생 모드 (Player)
A. 게임 플레이 루프 (Core Loop)

전투 (Action): 자동 공격, 이동(WASD/Joystick), 몬스터 처치, 수정(XP) 획득.

레벨업 트리거 (Trigger): 경험치 바 100% 도달.

일시 정지 및 퀴즈 (Pause & Quiz):

상태: 게임 월드(몬스터, 투사체) 완전 정지 (Scene.pause()).

UI: 퀴즈 모달 팝업 (4지선다).

타이머: 교사가 설정한 제한 시간(예: 15초) 카운트다운 표시 (Progress Bar).

결과 판정:

정답 (Success): 3개의 무기/패시브 선택지 제시 (로그라이크 강화). 선택 후 게임 재개.

오답/시간초과 (Fail/Timeout):

강화 기회 박탈 (또는 패널티: HP 10% 감소).

"틀렸습니다!" 피드백 후 즉시 게임 재개 (강화 없이).

B. 무기 시스템 (Weaponry)

무기 20종 / 패시브 20종: (바나나, 마늘, 성경 등 패러디).

조합 (Evolution): 8레벨 무기 + 특정 패시브 보유 시 상자(Box) 혹은 다음 퀴즈 정답 시 진화.

4. 상세 로직 (Deep Dive)
4.1. 퀴즈 타이머 로직 (Timer Logic)
Client-Side Count: 네트워크 지연을 고려하여 타이머는 학생의 클라이언트에서 돕니다.

Timeout 처리: 제한 시간이 0이 되면 자동으로 submitAnswer(null)을 호출하여 오답 처리합니다.

UX: 남은 시간이 5초 미만일 때 붉은색 점멸 및 경고음 효과.

4.2. AI 프롬프트 전략 (System Prompt)
Plaintext

Role: Educational Quiz Generator
Task: Create {count} multiple-choice questions from the text.
Language: Korean
Format: JSON
[
  {
    "q": "문제 지문",
    "o": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "a": 0 (정답 인덱스)
  }
]
Constraint: 오답 선택지는 매력적인 오답(Distractors)이어야 함.
5. UI/UX 요구사항
Pixel Art Style: 레트로 게임 감성.

Feedback:

정답: 화려한 이펙트, 긍정적 사운드.

오답/시간초과: 화면 쉐이크(Shake), 깨지는 사운드.

[기술적 조언: 이것만은 주의하세요]
Phaser Scene 관리:

게임 화면(GameScene)과 퀴즈 화면(QuizScene)을 분리하세요.

레벨업 시 this.scene.pause('GameScene')을 하고 this.scene.launch('QuizScene')을 띄우는 방식(Overlay)이 가장 깔끔합니다. React로 퀴즈 UI를 띄울 거라면 Phaser Canvas 위에 HTML Overlay를 씌우는 방식(position: absolute)이 구현하기 쉽습니다.

타이머 동기화 이슈:

학생 기기마다 시계가 조금씩 다를 수 있습니다. 하지만 이 게임은 경쟁 요소가 '점수'이지 '누가 먼저 푸느냐'가 아니므로, 타이머는 철저하게 클라이언트(학생 기기) 기준으로 작동하게 두십시오. 서버가 1초 단위로 검증하려 들면 로직이 꼬입니다.