# Dashboard + Issue Tracker + 3D Interface — Design Spec

작성일: 2026-06-01
선행 spec: `2026-06-01-weekly-planner-design.md` (기본 칸반 MVP)

## 1. 한 줄 요약
기존 1인용 주간 플래너에 (a) Three.js 기반 "오늘" 중심 3D 메인 대시보드, (b) 이슈 트래커 + 월간 캘린더, (c) Card ↔ Issue 느슨한 연결을 추가한다. 기존 칸반은 "자세히 보기" 라우트로 유지.

## 2. 목적
- 매일 열었을 때 "오늘 뭐 하지" 가 한눈에 들어오는 몰입형 메인 화면
- 코딩/업무 중 마주친 문제(이슈)를 따로 등록·추적·캘린더에서 회상
- 시각적으로 즐거운 인터랙션 (GSAP + Three.js 학습/표현 가치)

## 3. 핵심 화면 변화

| 라우트 | 변경 |
|---|---|
| `/` | **신규** 3D 메인 대시보드 (기존 `/board` 리다이렉트 제거) |
| `/board` | **유지** 기존 칸반. 메인의 "자세히 보기"로 진입 |
| `/issues` | **신규** 월간 캘린더 + 이슈 등록/조회 |
| `/timeline` | **유지** 기존 회고 페이지 |
| `/login` | **유지** |

상단 네비: `오늘` (/), `보드` (/board), `이슈` (/issues), `회고` (/timeline), `로그아웃`

## 4. 화면 (a) — 3D 메인 대시보드

### 4.1 비주얼 컨셉
- "쇼케이스 타입": 카드들이 3D 공간에 부유. 카메라가 살아있음 (살짝의 idle parallax).
- 배경: 어두운 그라데이션 + 부드러운 안개 (fog). 부동 입자 효과 (subtle particles).
- 카드: 평면(Plane) 메시 + 그 위에 React UI를 Drei `<Html>` 로 얹음. (라이팅 + 그림자 받지만 UI는 일반 HTML.)

### 4.2 두 가지 카메라 모드
1. **TODAY 모드 (기본)** — 오늘 마감(`dueDay === 오늘 요일`) 카드 중 최우선 1장이 카메라 정면에 크게. 나머지는 뒤·옆에 흐리게 배경처럼 부유.
2. **WEEK 모드** — 카메라가 뒤로 빠지며 이번 주 7×3컬럼 카드들이 호(arc) 형태로 펼쳐짐.

### 4.3 전환
- "이번 주 보기" 버튼 (메인 우상단) → GSAP timeline 으로 카메라 `position` + `lookAt` 보간. ~0.8s.
- 역전환 ("오늘로 돌아가기") 동일.
- 페이지 진입 시: 카드들이 멀리서 날아와 자리 잡는 등장 애니메이션 (1초 이내).

### 4.4 인터랙션
- 카드 hover: 살짝 앞으로 튀어나옴 (scale + z-position).
- 카드 click: 기존 CardModal 열림 (편집/삭제 동일).
- 빈 공간에 떠있는 "할 일 추가" 3D 버튼 (Plane) → 클릭 시 AddCardForm 모달.
- 모바일: 터치는 OrbitControls 비활성. 탭만 인식 (드래그 X). 또는 데스크탑 전용 + 모바일은 자동으로 폴백 2D 화면 표시 (아래 §10 참조).

### 4.5 "오늘 카드 우선순위" 정의
오늘 우선순위 결정 로직 (TODAY 카드 1장 고르기):
1. 오늘 요일 = `dueDay` 인 카드 중 `column === "doing"` 1순위
2. 없으면 `column === "todo"` 2순위
3. 없으면 가장 가까운 `dueDay` 의 카드
4. 그래도 없으면 "오늘은 마감 없음 — 추가하세요" 빈 카드 표시

## 5. 화면 (b) — 이슈 트래커 + 캘린더

### 5.1 데이터 모델
새 Prisma 모델:

```prisma
model Issue {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    String    // "low" | "med" | "high"
  status      String    // "open" | "in_progress" | "resolved"
  reportedAt  DateTime  // 캘린더 그룹 기준일
  resolvedAt  DateTime?
  cardId      String?   // Card 와의 느슨한 링크
  card        Card?     @relation(fields: [cardId], references: [id], onDelete: SetNull)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([reportedAt])
  @@index([status])
  @@index([cardId])
}

model Card {
  // (기존 필드 그대로)
  issues  Issue[]   // 역방향 관계
}
```

### 5.2 캘린더 UI
- 월간 그리드 (7열 × 5~6행). 상단에 `< 2026-06 >` 월 이동 + "오늘로" 버튼.
- 각 셀: 그 날 `reportedAt` 인 이슈의 점 표시. 우선순위별 색 (low/med/high).
- 셀 클릭 → 우측 패널 (또는 모달) 에 그 날 이슈 리스트 + "이슈 추가" 버튼.
- 미해결 이슈는 진하게, resolved 는 흐리게 + 취소선.

### 5.3 이슈 등록/편집 (모달)
- 필드: 제목(필수), 설명, 우선순위(low/med/high), 상태(open/in_progress/resolved), 발생일(기본 오늘), 해결일(상태=resolved 시 자동 now), **연결 카드 선택(드롭다운, 이번 주 카드 + 빈 옵션)**
- 카드 연결은 선택. 미연결 가능.

### 5.4 이슈 목록 뷰 (캘린더 옆 사이드바)
- 필터: 전체 / 미해결만 (`status !== "resolved"`) / 해결됨만
- 정렬: 우선순위 → 발생일
- 항목 클릭 → 모달 열림

## 6. 화면 (c) 변경 — Card ↔ Issue 링크

### 6.1 카드 모달 확장
기존 `CardModal` 에 한 줄 추가:
- "연결된 이슈" 표시 (있으면). 클릭하면 이슈 모달로 점프.
- "이슈 연결" 버튼 — 클릭 시 이번 달 미해결 이슈 드롭다운 + "새 이슈 만들기".

### 6.2 데이터
- `Card.issues` 로 prisma include 시 자동 패치. UI에 표시.

## 7. 기술 스택 추가

| 라이브러리 | 용도 |
|---|---|
| `three` | 3D 엔진 (peer dep) |
| `@react-three/fiber` (R3F) | React → Three.js 바인딩 |
| `@react-three/drei` | 헬퍼 컴포넌트 (`<Html>`, `<OrbitControls>`, `<Float>`, `<Environment>`) |
| `gsap` | 카메라/객체 트위닝 |
| `react-day-picker` | 캘린더 그리드 (또는 자체 구현) |

## 8. 아키텍처

### 8.1 파일 구조 추가
```
app/
├─ (auth)/
│  ├─ page.tsx                    # NEW 3D 메인 (이전엔 redirect /board)
│  ├─ board/                      # 기존 유지
│  ├─ timeline/                   # 기존 유지
│  └─ issues/
│     └─ page.tsx                 # NEW 캘린더 + 사이드바
└─ actions/
   ├─ cards.ts                    # 기존 + linkIssue 추가
   └─ issues.ts                   # NEW: create/update/delete/list

components/
├─ scene/                         # NEW 3D 관련만 모음
│  ├─ Scene.tsx                   # <Canvas> 컨테이너
│  ├─ TodayCard.tsx               # 메인 큰 카드 (3D Plane + Html)
│  ├─ FloatingCards.tsx           # 주변 부유 카드들
│  ├─ WeekCardsArc.tsx            # WEEK 모드 호(arc) 배치
│  ├─ Particles.tsx               # 배경 입자
│  └─ useCameraMode.ts            # TODAY ↔ WEEK 전환 (GSAP)
├─ MobileFallback.tsx             # NEW: 모바일에서 3D 대신 보여줄 간단 보드
├─ issues/
│  ├─ Calendar.tsx                # NEW
│  ├─ IssuesList.tsx              # NEW
│  └─ IssueModal.tsx              # NEW
└─ (기존 컴포넌트 유지)

lib/
├─ today.ts                       # NEW 오늘 우선순위 카드 계산
└─ (기존)
```

### 8.2 서버 액션 — 신규
```
app/actions/issues.ts
- createIssue(input)
- updateIssue(id, patch)
- deleteIssue(id)
- (목록은 서버 컴포넌트에서 prisma 직접 호출)

app/actions/cards.ts (확장)
- linkIssueToCard(cardId, issueId | null)
```

## 9. 데이터 플로우

```
/  (서버 컴포넌트)
 ├─ prisma.card.findMany({ weekStart: 이번주 })
 ├─ todayCard = pickTodayCard(cards, 오늘요일)
 └─ <Scene initial="today" cards={cards} todayCard={todayCard} />

/issues
 ├─ prisma.issue.findMany({ reportedAt: { gte: 월시작, lte: 월끝 } })
 └─ <Calendar issues={issues} /> <IssuesList issues={openIssues} />
```

## 10. 모바일 대응

3D 풀 인터페이스는 모바일에서 비싸고 컨트롤이 어려움.
- 진입 시 `userAgent` + 화면 폭 검사. 모바일이면 `<Scene>` 대신 `<MobileFallback>` 표시.
- `MobileFallback` 은 단순 카드 리스트 (오늘 1장 큰 카드 + 나머지 작은 리스트). 기능 동일.
- 사용자가 강제로 3D 보기를 켤 수 있는 토글 제공 (작은 우상단 버튼).

## 11. 성능

- 카드 수 한 화면 최대 30 정도. 그 이상이면 LOD/컬링 필요하지만 1주 한도라 무시.
- `<Canvas>` `dpr={[1, 1.5]}` 로 픽셀 비율 제한.
- `Three.js` 객체는 React 언마운트 시 `dispose()` 호출. R3F 가 대체로 자동 처리.
- GSAP 트윈은 페이지 전환 시 `kill()`.

## 12. 에러 핸들링

- 3D 렌더 실패 (WebGL 미지원 브라우저) → ErrorBoundary 로 잡고 MobileFallback 표시.
- 이슈/카드 CRUD 에러 → 기존 패턴 (alert + 콘솔). (Toast 는 별도 후속 작업)

## 13. 환경 변수
변경 없음.

## 14. 테스트
- `lib/today.ts` 단위 테스트 (Vitest) — 우선순위 로직 검증.
- 그 외 수동 테스트 (3D 시각 검증은 자동화 어려움).

## 15. 범위 밖 (이번 spec 에서 제외)

- 이슈 댓글/활동 로그
- 이슈 일괄 가져오기 (GitHub Issues 동기화 등)
- 다중 사용자
- 캘린더에 다일 이벤트 (이슈는 단일 발생일만)
- 알림/리마인더
- 3D 카드 직접 드래그앤드롭 (편집은 모달로만)
- /board 칸반의 3D 화 (기존 2D 그대로)
- 다국어
- 다크모드 토글
- 통계/차트 대시보드

## 16. 향후 고려
- 이슈에 첨부파일/링크
- Three.js 카드에 동적 텍스처 (해결율, 마감 임박도 시각화)
- WebXR (VR 보드)
- 이슈와 회고를 연결 ("이번 주 해결한 이슈" 섹션)
