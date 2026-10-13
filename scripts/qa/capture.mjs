#!/usr/bin/env node
/**
 * Browser QA for the portfolio templates. No project dependencies: it uses a
 * Playwright install and a Chrome binary you already have.
 *
 *   node scripts/qa/capture.mjs [--templates atlas,paper] [--widths 390,820,1440] [--links] [--base http://localhost:8080]
 *
 * Env: PLAYWRIGHT_PATH (module path to `playwright`), CHROME_PATH (browser binary),
 *      QA_OUT (output dir, default ./qa-output).
 * Writes <QA_OUT>/<template>-<width>-{fold,full}.png and report.json, then prints a summary.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const flag = (name) => process.argv.includes(`--${name}`);

const BASE = arg('base', 'http://localhost:8080');
const TEMPLATES = arg('templates', 'atlas,paper').split(',');
const WIDTHS = arg('widths', '390,820,1440').split(',').map(Number);
const OUT = resolve(process.env.QA_OUT ?? 'qa-output');
const HEIGHT = { 390: 844, 820: 1180, 1440: 900 };

const require = createRequire(import.meta.url);
const pwPath =
  process.env.PLAYWRIGHT_PATH ??
  join(homedir(), '.nvm/versions/node', process.version, 'lib/node_modules/@playwright/cli/node_modules/playwright');
const { chromium } = require(pwPath);

mkdirSync(OUT, { recursive: true });

/** Runs in the page: layout, typography, focus and performance facts. */
function inspectPage() {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map((h) => Number(h.tagName[1]));
  const skips = headings.filter((lvl, i) => i > 0 && lvl > headings[i - 1] + 1).length;
  const leaves = [...document.querySelectorAll('p,span,a,li,button,td,th,dt,dd,figcaption,caption,text,small,em,strong')].filter(
    (el) => visible(el) && el.textContent.trim() && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
  );
  const small = leaves.filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12).map((el) => el.textContent.trim().slice(0, 40));
  const targets = [...document.querySelectorAll('a[href],button,[role=button],summary')].filter(visible);
  const tiny = targets
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width < 24 || r.height < 24;
    })
    .map((el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30));
  const overflow = [...document.querySelectorAll('body *')]
    .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1 && visible(el))
    .filter((el) => !el.parentElement || el.parentElement.getBoundingClientRect().right <= document.documentElement.clientWidth + 1)
    .slice(0, 6)
    .map((el) => `${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).slice(0, 40)}`);
  return {
    title: document.title,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
    h1: headings.filter((l) => l === 1).length,
    headingSkips: skips,
    smallText: small.length,
    smallTextSamples: small.slice(0, 5),
    tinyTargets: tiny.length,
    tinyTargetSamples: tiny.slice(0, 6),
    overflow,
    imagesMissingAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    externalLinks: [...new Set([...document.querySelectorAll('a[href^="http"]')].map((a) => a.href))],
  };
}

const results = {};
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome' });

for (const t of TEMPLATES) {
  for (const w of WIDTHS) {
    for (const reduced of [false, true]) {
      if (reduced && w === 820) continue;
      const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHT[w] ?? 900 }, reducedMotion: reduced ? 'reduce' : 'no-preference', isMobile: w < 500, hasTouch: w < 1000 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 160)}`));
      page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text().slice(0, 160)}`));
      page.on('requestfailed', (r) => r.url().startsWith(BASE) && errors.push(`request: ${r.url()} ${r.failure()?.errorText}`));
      await page.addInitScript(() => {
        window.__lcp = 0;
        window.__cls = 0;
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(`${BASE}/?template=${t}`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1500);
      const tag = `${t}-${w}${reduced ? '-reduced' : ''}`;
      // Read performance before any screenshot: a full-page capture resizes the
      // viewport, which paints new LCP candidates and registers layout shifts.
      const perf = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: Number(window.__cls.toFixed(3)) }));
      const facts = await page.evaluate(inspectPage);
      await page.screenshot({ path: join(OUT, `${tag}-fold.png`) });
      if (!reduced) await page.screenshot({ path: join(OUT, `${tag}-full.png`), fullPage: true });
      // First 14 tab stops, to check that keyboard order reaches the essentials.
      const tabs = [];
      if (!reduced) {
        await page.mouse.click(1, 1);
        for (let i = 0; i < 14; i++) {
          await page.keyboard.press('Tab');
          tabs.push(await page.evaluate(() => {
            const el = document.activeElement;
            return el ? (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 32) : '';
          }));
        }
      }
      results[tag] = { ...facts, ...perf, errors, tabs };
      await ctx.close();
    }
  }
}
await browser.close();

if (flag('links')) {
  const links = [...new Set(Object.values(results).flatMap((r) => r.externalLinks))];
  const status = {};
  await Promise.all(
    links.map(async (url) => {
      try {
        const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 portfolio-qa' } });
        status[url] = res.status;
      } catch (e) {
        status[url] = `error: ${e.cause?.code ?? e.name}`;
      }
    }),
  );
  results._links = status;
}

writeFileSync(join(OUT, 'report.json'), JSON.stringify(results, null, 2));
for (const [tag, r] of Object.entries(results)) {
  if (tag === '_links') continue;
  const issues = [
    r.scrollWidth > r.clientWidth && `overflow ${r.scrollWidth}>${r.clientWidth} ${r.overflow.join(' ')}`,
    r.h1 !== 1 && `h1 x${r.h1}`,
    r.headingSkips && `heading skips ${r.headingSkips}`,
    r.smallText && `text<12px x${r.smallText}`,
    r.tinyTargets && `targets<24px x${r.tinyTargets} (${r.tinyTargetSamples.join(' | ')})`,
    r.errors.length && `errors x${r.errors.length}: ${r.errors[0]}`,
  ].filter(Boolean);
  console.log(`${tag.padEnd(22)} LCP ${String(r.lcp).padStart(5)}ms CLS ${r.cls} h=${r.height}  ${issues.length ? issues.join('; ') : 'ok'}`);
}
if (results._links) {
  const bad = Object.entries(results._links).filter(([, s]) => s !== 200);
  console.log(`links: ${Object.keys(results._links).length} checked, ${bad.length} not 200`, bad);
}
console.log(`output: ${OUT}`);
