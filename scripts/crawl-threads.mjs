#!/usr/bin/env node
/**
 * Threads 프로필 크롤러
 *
 * 사용:
 *   node scripts/crawl-threads.mjs <profile-url>
 *   node scripts/crawl-threads.mjs https://www.threads.com/@choi.openai
 *
 * 첫 실행 시: 별도 Chrome 창이 뜨면 Threads에 로그인하세요 (한 번만).
 * 세션은 .chrome-data/ 에 저장돼서 다음부턴 자동 로그인.
 */

import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PrismaClient } from "../generated/prisma/client/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];
function findChrome() {
  for (const p of CHROME_PATHS) if (fs.existsSync(p)) return p;
  throw new Error("Chrome not found. macOS: 다운로드 https://google.com/chrome");
}

const profileUrl = process.argv[2] ?? "https://www.threads.com/@choi.openai";
const SCROLL_ROUNDS = parseInt(process.env.SCROLL_ROUNDS ?? "12", 10);
const SCROLL_DELAY_MS = parseInt(process.env.SCROLL_DELAY_MS ?? "1200", 10);

console.log("🚀 Threads 크롤러");
console.log("   profile:", profileUrl);
console.log("   scroll rounds:", SCROLL_ROUNDS);

const prisma = new PrismaClient();

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: false,
  userDataDir: path.join(ROOT, ".chrome-data"),
  defaultViewport: { width: 1100, height: 900 },
  args: ["--no-first-run", "--no-default-browser-check"],
});

const page = await browser.newPage();
await page.goto(profileUrl, { waitUntil: "domcontentloaded" });

console.log("\n⏳ 페이지 로드 대기 — 로그인 화면이 뜨면 로그인 후 엔터를 누르세요.");
console.log("   (이미 로그인 상태라면 그냥 엔터)");
await new Promise((resolve) => {
  process.stdin.once("data", () => resolve());
});

// 화면 내 author 추출
const author = await page.evaluate(() => {
  const m = location.pathname.match(/@([^/]+)/);
  return m ? `@${m[1]}` : "@unknown";
});
console.log("👤 author:", author);

// 무한 스크롤
console.log("📜 스크롤하면서 게시글 로드...");
let lastHeight = 0;
for (let i = 0; i < SCROLL_ROUNDS; i++) {
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
  await new Promise((r) => setTimeout(r, SCROLL_DELAY_MS));
  const h = await page.evaluate(() => document.body.scrollHeight);
  process.stdout.write(`   round ${i + 1}/${SCROLL_ROUNDS} (height ${h})\r`);
  if (h === lastHeight) {
    console.log("\n   더 로드할 게 없는 것 같음, 중단.");
    break;
  }
  lastHeight = h;
}
console.log("");

// 포스트 추출
const posts = await page.evaluate(() => {
  // Threads 의 게시글은 article 또는 data-pressable-container 안에 들어있음
  const containers = Array.from(
    document.querySelectorAll('div[data-pressable-container="true"]'),
  );
  const seen = new Set();
  const out = [];
  for (const el of containers) {
    // 본문 텍스트 — div[dir="auto"] 안에 종종 들어있음
    const textEls = Array.from(el.querySelectorAll('div[dir="auto"] span'))
      .map((s) => s.innerText.trim())
      .filter(Boolean);
    const text = textEls.join(" ").trim();
    if (!text || text.length < 5) continue;

    // 포스트 URL
    const linkEl = el.querySelector('a[href*="/post/"]');
    const href = linkEl?.getAttribute("href") ?? "";
    const fullUrl = href
      ? new URL(href, location.origin).toString()
      : "";
    if (!fullUrl || seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    // 시간 (있으면)
    const timeEl = el.querySelector("time");
    const postedAt = timeEl?.getAttribute("datetime") ?? null;

    out.push({ text, url: fullUrl, postedAt });
  }
  return out;
});

console.log(`✅ ${posts.length}개 게시글 추출`);

let added = 0;
let updated = 0;
for (const p of posts) {
  const existing = await prisma.highlight.findUnique({
    where: { sourceUrl: p.url },
  });
  if (existing) {
    // 본문이 더 길어졌으면 업데이트
    if (p.text.length > existing.text.length) {
      await prisma.highlight.update({
        where: { sourceUrl: p.url },
        data: { text: p.text },
      });
      updated++;
    }
  } else {
    await prisma.highlight.create({
      data: {
        sourceUrl: p.url,
        author,
        text: p.text,
        postedAt: p.postedAt ? new Date(p.postedAt) : null,
      },
    });
    added++;
  }
}

console.log(`\n💾 신규 ${added}개 · 갱신 ${updated}개 저장`);

await browser.close();
await prisma.$disconnect();
console.log("✨ 완료");
