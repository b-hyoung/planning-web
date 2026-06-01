# Weekly Planner — Design Spec

작성일: 2026-06-01

## 1. 한 줄 요약
1인용 주간 칸반 플래너. 주차별로 카드를 만들어 할 일/진행 중/완료 컬럼에서 관리하고, 개인/업무는 색상 태그로 구분. 회고는 날짜별 완료 카드 타임라인으로 본다.

## 2. 사용자와 목적
- **사용자**: 본인 1명 (단일 사용자)
- **목적**: 개인 일과 업무 일을 한 화면에서 주 단위로 계획·진행·회고
- **인증**: env 변수에 저장된 비밀번호로 로그인 (단순 매칭)

## 3. 핵심 기능 (MVP)
1. 비밀번호 로그인 (쿠키 세션 유지)
2. 주차 선택기: 이번 주 / 이전·다음 주 이동
3. 칸반 보드: 할 일 → 진행 중 → 완료, 드래그앤드롭으로 이동
4. 카드 CRUD
   - 필드: 제목(필수), 메모, 마감 요일(월~일 중 하나, 옵션), 태그(개인/업무)
5. 태그 필터: 전체 / 개인만 / 업무만
6. 회고 타임라인: 완료된 카드들을 날짜 내림차순으로 나열 (날짜 헤더 + 그 날 완료된 카드 목록)

## 4. 기술 스택
| 영역 | 선택 | 이유 |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | 풀스택 단일 코드베이스, Server Actions로 API 생략 |
| Styling | Tailwind CSS | 빠른 스타일링, 컴포넌트 결합 좋음 |
| DB | SQLite + Prisma | 파일 한 개 → 백업/이동 쉬움, 1인용에 충분 |
| Drag & Drop | @dnd-kit/core | 모던, 접근성 좋음, React 친화적 |
| Session | iron-session | 가벼운 쿠키 기반 세션 |
| 상태관리 | useState/useReducer + Server Actions | 규모상 Redux 불필요 |

## 5. 데이터 모델

```prisma
model Card {
  id          String    @id @default(cuid())
  title       String
  memo        String?
  dueDay      Int?      // 0=월요일 ... 6=일요일, null=요일 미지정
  tag         String    // "personal" | "work"
  column      String    // "todo" | "doing" | "done"
  weekStart   DateTime  // 해당 주의 월요일 00:00 (로컬 KST 기준 UTC 저장)
  position    Int       // 컬럼 안에서의 정렬 순서
  createdAt   DateTime  @default(now())
  completedAt DateTime?

  @@index([weekStart])
  @@index([completedAt])
}
```

- **주 식별**: `weekStart` 필드 (해당 주 월요일 자정). UI에서 주를 선택하면 그 주의 `weekStart`에 해당하는 카드만 조회.
- **회고 뷰**: `completedAt IS NOT NULL` 카드를 `completedAt DESC` 정렬.
- **컬럼 이동 시**: `column` 갱신. `done`으로 이동 시 `completedAt = now()`, `done`에서 다른 컬럼으로 되돌리면 `completedAt = null`.

## 6. 라우팅 구조

```
/app
├─ layout.tsx                # 공통 레이아웃 + 세션 체크
├─ login/page.tsx            # 비밀번호 입력
├─ (auth)/                   # 인증 필요 라우트 그룹
│  ├─ board/page.tsx         # 칸반 보드 (메인) ?week=YYYY-MM-DD
│  └─ timeline/page.tsx      # 회고 타임라인
└─ actions/                  # Server Actions
   ├─ auth.ts
   └─ cards.ts
```

## 7. Server Actions
- `loginAction(password: string)` — env의 `APP_PASSWORD`와 비교, 일치하면 iron-session 쿠키 발급
- `logoutAction()` — 세션 파기
- `createCard(input)` — 새 카드 생성, position은 컬럼 끝
- `updateCard(id, patch)` — 제목/메모/요일/태그/컬럼 갱신. column이 done으로 바뀌면 completedAt 설정
- `deleteCard(id)`
- `reorderCards(column, orderedIds)` — 드래그 후 컬럼 내 순서 일괄 저장

모든 액션은 호출 전 세션 확인. 미인증이면 `/login`으로 redirect.

## 8. 컴포넌트 트리

```
<BoardPage>
  <WeekPicker />               # 주 이동
  <TagFilter />                # 개인/업무/전체
  <Board>
    <DndContext>
      <Column id="todo">
        <Card />, <Card />...
      </Column>
      <Column id="doing">...</Column>
      <Column id="done">...</Column>
    </DndContext>
  </Board>
  <CardModal />               # 카드 클릭 시 상세/편집

<TimelinePage>
  <DateGroup date="2026-05-30">
    <CompletedCard />
    <CompletedCard />
  </DateGroup>
  <DateGroup date="2026-05-29">...</DateGroup>
```

## 9. 에러 핸들링
- 인증 실패 → `/login`으로 redirect
- DB 에러 → 콘솔 로그 + 토스트 알림 ("저장 실패")
- 드래그 중 서버 에러 → 낙관적 업데이트 롤백 (이전 상태 복원)
- env에 `APP_PASSWORD` 없으면 앱 시작 시 명시적 에러

## 10. 테스트 전략
- MVP는 수동 테스트 중심 (시간 절약)
- 핵심 헬퍼(`lib/week.ts`)는 단위 테스트 (Vitest)
- 추후 Playwright로 로그인 + 카드 CRUD e2e

## 11. 배포
- 로컬 개발: `npm run dev`
- 로컬 영구 사용: `npm run build && npm start`
- (선택) Vercel 배포: SQLite는 안 되므로 이 경우 Postgres(Neon/Supabase)로 교체

## 12. 환경 변수
```
APP_PASSWORD=...           # 로그인 비밀번호 (평문 비교, MVP)
SESSION_SECRET=...         # iron-session 암호화 키 (32바이트 이상)
DATABASE_URL="file:./dev.db"
```

## 13. 디렉토리 구조

```
planning_web/
├─ app/                     # Next.js App Router
├─ components/              # UI 컴포넌트
├─ lib/                     # auth, db, week 헬퍼
├─ prisma/
│  ├─ schema.prisma
│  └─ dev.db                # gitignore
├─ public/
├─ docs/superpowers/specs/  # 설계 문서들
├─ .env.local               # gitignore
├─ .gitignore
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
└─ next.config.ts
```

## 14. 범위 밖 (이번 MVP에서 제외)
- 회원가입 / 다중 사용자
- 모바일 네이티브 앱
- 알림 / 리마인더
- 카드 첨부파일
- 통계 대시보드 (히트맵, 차트 등)
- 다국어 (한국어만)
- 카드 댓글 / 활동 로그
- 카드 라벨 외 추가 분류 (프로젝트, 우선순위 등)

## 15. 향후 고려
- 비번 평문 비교 → bcrypt 해시 비교 전환
- 카드 수 많아지면 컬럼별 페이지네이션 / 가상화
- 모바일 반응형 보강 (드래그 대안: long-press 메뉴)
- 통계 대시보드 추가 (사용자가 요청 시)
