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

import { addExtra } from "puppeteer-extra";
import puppeteerCore from "puppeteer-core";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const puppeteer = addExtra(puppeteerCore);
puppeteer.use(StealthPlugin());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function cuid() {
  return "c" + crypto.randomBytes(12).toString("hex");
}

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

const dbPath = path.join(ROOT, "prisma", "dev.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const findStmt = db.prepare(
  "SELECT id, text FROM Highlight WHERE sourceUrl = ?",
);
const updateStmt = db.prepare("UPDATE Highlight SET text = ? WHERE id = ?");
const insertStmt = db.prepare(
  `INSERT INTO Highlight (id, sourceUrl, author, text, comments, summary, tags, postedAt, fetchedAt)
   VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
);

// 우선 기존 Chrome (디버그 포트)에 연결 시도 — 봇 감지 우회
let browser;
let usingExisting = false;
try {
  browser = await puppeteer.connect({
    browserURL: "http://127.0.0.1:9222",
    defaultViewport: { width: 1100, height: 900 },
  });
  usingExisting = true;
  console.log("🔗 기존 Chrome (포트 9222) 연결 성공");
} catch {
  console.log("📦 디버그 포트 없음 → 새 Chrome 실행 (stealth 모드)");
  console.log("   봇 감지 걸리면 별도 터미널에서 다음 명령 실행 후 재시도:");
  console.log("     npm run chrome-debug");
  browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: false,
    userDataDir: path.join(ROOT, ".chrome-data"),
    defaultViewport: { width: 1100, height: 900 },
    args: [
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-blink-features=AutomationControlled",
    ],
  });
}

const page = usingExisting
  ? (await browser.pages())[0] ?? (await browser.newPage())
  : await browser.newPage();
await page.goto(profileUrl, { waitUntil: "domcontentloaded" });

if (!usingExisting) {
  console.log("\n⏳ 페이지 로드 대기 — 로그인 화면이 뜨면 로그인 후 엔터를 누르세요.");
  console.log("   (이미 로그인 상태라면 그냥 엔터)");
  await new Promise((resolve) => {
    process.stdin.once("data", () => resolve());
  });
}

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
const now = new Date().toISOString();
for (const p of posts) {
  const existing = findStmt.get(p.url);
  if (existing) {
    if (p.text.length > existing.text.length) {
      updateStmt.run(p.text, existing.id);
      updated++;
    }
  } else {
    insertStmt.run(
      cuid(),
      p.url,
      author,
      p.text,
      "[]",
      "[]",
      p.postedAt ? new Date(p.postedAt).toISOString() : null,
      now,
    );
    added++;
  }
}

console.log(`\n💾 신규 ${added}개 · 갱신 ${updated}개 저장`);

if (usingExisting) {
  await browser.disconnect();
} else {
  await browser.close();
}
db.close();
console.log("✨ 완료");
