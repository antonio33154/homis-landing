/**
 * screenshot.mjs — Mac-compatible Puppeteer screenshot tool
 * Usage: node screenshot.mjs <url> [label]
 * Example: node screenshot.mjs http://localhost:3000
 *          node screenshot.mjs http://localhost:3000 hero
 *
 * Saves to: ./temporary screenshots/screenshot-N[-label].png
 * Requires: npm install puppeteer  (first time only)
 */

import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const { join } = path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, 'temporary screenshots');
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

// Auto-increment — find highest existing N
const existing = readdirSync(DIR)
  .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? 0))
  .filter(Boolean);
const next = existing.length ? Math.max(...existing) + 1 : 1;

const url   = process.argv[2] ?? 'http://localhost:3000';
const label = process.argv[3] ?? '';
const fname = `screenshot-${next}${label ? '-' + label : ''}.png`;
const out   = join(DIR, fname);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Force all scroll-reveal elements visible (animations won't fire in headless scroll)
await page.addStyleTag({
  content: `.reveal, .fade-up { opacity: 1 !important; transform: none !important; transition: none !important; }`
});

// Wait for Tailwind + fonts + images to finish
await new Promise(r => setTimeout(r, 1500));

const clip = process.argv[4] ? JSON.parse(process.argv[4]) : null;
await page.screenshot({ path: out, fullPage: !clip, ...(clip ? { clip } : {}) });
await browser.close();

console.log(`\n  ✦ Screenshot saved → ./temporary screenshots/${fname}\n`);
