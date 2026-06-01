#!/bin/bash
# Weekly Planner — 로컬 서버 + Cloudflare Quick Tunnel 동시 실행
# 사용법: ./run-tunnel.sh   (Ctrl+C 로 둘 다 종료)

set -e
cd "$(dirname "$0")"

# 빌드된 .next 가 없으면 먼저 빌드
if [ ! -d ".next" ]; then
  echo "🔨 첫 실행 — 빌드 중..."
  npm run build
fi

# 종료 시 두 프로세스 모두 정리
cleanup() {
  echo ""
  echo "🛑 종료 중..."
  kill $SERVER_PID $TUNNEL_PID 2>/dev/null || true
  wait 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# Next.js 서버 시작 (백그라운드)
echo "🚀 Next.js 서버 시작..."
npm start > /tmp/planner-server.log 2>&1 &
SERVER_PID=$!

# 서버 살아날 때까지 대기 (최대 30초)
for i in {1..30}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 서버 OK (http://localhost:3000)"
    break
  fi
  sleep 1
done

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ 서버 시작 실패. 로그 확인: tail -50 /tmp/planner-server.log"
  cleanup
fi

# Cloudflare Quick Tunnel 시작 (포어그라운드 — URL 출력됨)
echo ""
echo "🌐 Cloudflare Tunnel 시작 (URL 곧 표시됨)..."
echo "    Ctrl+C 로 종료하면 서버도 같이 꺼집니다."
echo ""
cloudflared tunnel --url http://localhost:3000 &
TUNNEL_PID=$!

wait $TUNNEL_PID
