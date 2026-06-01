# Weekly Planner

1인용 주간 칸반 플래너. Next.js + SQLite + Prisma.

## 실행

1. 환경 변수 준비:

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` 을 열어 채워주세요:
   - `APP_PASSWORD` — 로그인할 비밀번호 (평문 비교)
   - `SESSION_SECRET` — 32바이트 이상 랜덤 문자열 (`openssl rand -hex 32` 추천)
   - `DATABASE_URL` — 기본값 `file:./prisma/dev.db` 그대로 두면 됩니다

2. 의존성 설치 + DB 생성:

   ```bash
   npm install
   npx prisma db push
   ```

3. 개발 서버:

   ```bash
   npm run dev
   ```

   브라우저에서 http://localhost:3000 → `/login` 으로 자동 이동.

## 프로덕션 모드

```bash
npm run build
npm start
```

## 명령어

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 |
| `npm test` | 단위 테스트 (week 헬퍼) |
| `npm run db:push` | 스키마 → DB 반영 |
| `npm run db:studio` | Prisma Studio (DB GUI) |

## 데이터 백업

`prisma/dev.db` 파일을 복사해 두면 됩니다. 새 머신에서는 같은 위치에 두고 `npm run dev` 만 하면 복원.

## 디렉토리 구조

```
app/
├─ login/                # 로그인 페이지 + auth action
├─ (auth)/               # 로그인 필요한 라우트 그룹
│  ├─ layout.tsx         # 세션 확인 + 헤더 네비
│  ├─ board/             # 메인 칸반 보드
│  └─ timeline/          # 회고 (완료 카드 날짜별)
└─ actions/cards.ts      # 카드 CRUD Server Actions

components/              # WeekPicker, TagFilter, AddCardForm, Column, CardItem, CardModal
lib/                     # auth, db (Prisma client), week (날짜 헬퍼 + 테스트)
prisma/                  # schema.prisma, dev.db (gitignored)
generated/prisma/        # Prisma 7 생성 클라이언트 (postinstall 자동 재생성)
docs/superpowers/        # 설계 spec + 구현 plan
```

## 수동 테스트 체크리스트

새 DB로 처음부터 한 번 돌릴 때:

```bash
rm -f prisma/dev.db
npx prisma db push
npm run dev
```

체크리스트:

- [ ] `/` 접속 → `/login` 으로 리다이렉트
- [ ] 틀린 비밀번호 입력 → 에러 메시지
- [ ] 맞는 비밀번호 → `/board` 진입
- [ ] 카드 3개 추가 (개인/업무, 마감 요일 섞어서)
- [ ] 카드 하나를 "진행 중", 다른 하나를 "완료" 로 드래그
- [ ] 카드 클릭 → 모달 열림, 제목/메모/태그/요일 편집 후 저장
- [ ] 카드 삭제 → 확인 다이얼로그 후 사라짐
- [ ] 필터 "개인" → 개인 카드만 보임
- [ ] 필터 "업무" → 업무 카드만 보임
- [ ] 필터 "전체" → 모두 보임
- [ ] 주차 → 다음 주: 카드 사라짐 (다음 주는 빈 보드)
- [ ] ← 이전 주: 카드 다시 나타남
- [ ] "이번 주" 버튼: 현재 주로 복귀
- [ ] `/timeline` 진입 → 완료 카드가 오늘 날짜 아래에 나열
- [ ] 완료 카드를 다시 진행 중으로 끌면 timeline 에서 사라짐 (페이지 새로고침 후)
- [ ] 로그아웃 → `/login` 으로 이동

## 기술 스택

- Next.js 16 (App Router, Turbopack 기본)
- React 19
- TypeScript 5
- Tailwind CSS v4
- Prisma 7 + SQLite (`better-sqlite3` 어댑터)
- @dnd-kit/core + @dnd-kit/sortable
- iron-session 8 (쿠키 세션)
- Vitest 4 (week 헬퍼 단위 테스트)
