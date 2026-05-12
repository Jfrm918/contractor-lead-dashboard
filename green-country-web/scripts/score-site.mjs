#!/usr/bin/env node
// Score a single business website against the Green Country rubric.
// Heuristic-only, no headless browser — fast enough for Argus to call in a scan loop.
//
// Usage:
//   node score-site.mjs <url>                 # JSON to stdout
//   node score-site.mjs --batch urls.txt      # one URL per line, JSON Lines out
//
// Rubric (must match green-country-web/src/app/pipeline/page.tsx):
//   mobile_broken    +30   no viewport meta or no responsive hint
//   no_ssl           +20   http:// or fetch fails on https
//   old_design       +15   copyright year <= currentYear - 2
//   no_cta           +15   no tel:/mailto: link and no <form>/<input type=email>
//   slow_load        +10   total fetch time > 5000ms on a single GET
//   stock_photo      +10   3+ images from known stock-photo CDNs
//
// Max score 100. Higher = more reason to pitch a rebuild.

const STOCK_DOMAINS = [
  'unsplash.com', 'images.unsplash.com',
  'shutterstock.com', 'image.shutterstock.com',
  'istockphoto.com', 'media.istockphoto.com',
  'gettyimages.com', 'media.gettyimages.com',
  'pexels.com', 'images.pexels.com',
  'pixabay.com', 'cdn.pixabay.com',
  'depositphotos.com', 'st.depositphotos.com',
  'adobestock.com', 't3.ftcdn.net',
];

const FETCH_TIMEOUT_MS = 15000;
const SLOW_THRESHOLD_MS = 5000;
const OLD_DESIGN_AGE_YEARS = 2;

async function fetchWithTimeout(url, timeoutMs) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: 'follow',
      headers: {
        // Many small-biz sites block default node-fetch UA.
        'User-Agent': 'Mozilla/5.0 (compatible; GreenCountryScoreBot/0.1; +https://greencountryweb.co)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    const text = await res.text();
    const elapsed = Date.now() - started;
    return { ok: res.ok, status: res.status, url: res.url, html: text, elapsed };
  } finally {
    clearTimeout(timer);
  }
}

function detectMobileBroken(html) {
  // No viewport meta = mobile broken. Any viewport tag with width/initial-scale = treated as responsive intent.
  const viewportMatch = html.match(/<meta[^>]+name=["']?viewport["']?[^>]*>/i);
  if (!viewportMatch) return { hit: true, reason: 'no viewport meta tag' };
  const viewportContent = viewportMatch[0];
  if (!/width\s*=/i.test(viewportContent)) {
    return { hit: true, reason: 'viewport tag missing width directive' };
  }
  return { hit: false, reason: null };
}

function detectOldDesign(html) {
  const currentYear = new Date().getFullYear();
  const threshold = currentYear - OLD_DESIGN_AGE_YEARS;
  // Catch ©2019, © 2020, &copy; 2018, Copyright 2017, etc.
  const re = /(?:©|&copy;|copyright)\s*&nbsp;?\s*(?:[a-z0-9 .,'-]{0,40})?(20\d{2})\b/gi;
  let m;
  let newest = 0;
  while ((m = re.exec(html)) !== null) {
    const y = parseInt(m[1], 10);
    if (y > newest && y <= currentYear) newest = y;
  }
  if (newest === 0) return { hit: false, reason: 'no copyright year found', detail: { newest_year: null } };
  if (newest <= threshold) {
    return { hit: true, reason: `copyright year ${newest} <= ${threshold}`, detail: { newest_year: newest } };
  }
  return { hit: false, reason: `copyright ${newest}`, detail: { newest_year: newest } };
}

function detectNoCta(html) {
  // Above-the-fold isn't reliably detectable from HTML alone, so we check the whole document for the
  // presence of ANY CTA signal. Absence is a much stronger signal than absence-above-fold.
  const telLink = /href=["']tel:/i.test(html);
  const mailtoLink = /href=["']mailto:/i.test(html);
  const phoneText = /\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(html);
  const formTag = /<form\b/i.test(html);
  const emailInput = /<input[^>]+type=["']email["']/i.test(html);
  const anyCta = telLink || mailtoLink || phoneText || formTag || emailInput;
  return {
    hit: !anyCta,
    reason: anyCta ? 'CTA found' : 'no tel:, mailto:, phone number, form, or email input on page',
    detail: { telLink, mailtoLink, phoneText, formTag, emailInput },
  };
}

function detectStockPhotoOverload(html, baseUrl) {
  let host;
  try { host = new URL(baseUrl).hostname; } catch { host = ''; }
  const imgSrcs = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    imgSrcs.push(m[1]);
  }
  const stockHits = imgSrcs.filter((src) => {
    try {
      const u = new URL(src, baseUrl);
      // Exclude same-host images regardless of path.
      if (u.hostname === host) return false;
      return STOCK_DOMAINS.some((d) => u.hostname === d || u.hostname.endsWith('.' + d));
    } catch {
      return false;
    }
  });
  return {
    hit: stockHits.length >= 3,
    reason: `${stockHits.length} stock-photo image(s) found`,
    detail: { stock_image_count: stockHits.length, total_images: imgSrcs.length },
  };
}

export async function scoreSite(url) {
  const result = {
    url,
    final_url: null,
    score: 0,
    max: 100,
    fetched: false,
    fetch_error: null,
    elapsed_ms: null,
    signals: {},
  };

  // SSL is judged from the input scheme + whether the https fetch works.
  const isHttp = /^http:/i.test(url);

  let fetchOut = null;
  let fetchErr = null;
  try {
    fetchOut = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  } catch (e) {
    fetchErr = e?.message || String(e);
  }

  if (!fetchOut || !fetchOut.ok) {
    // Try the http version if the original https fetch failed, to distinguish "no SSL" from "site dead".
    if (!isHttp && fetchErr) {
      const httpUrl = url.replace(/^https:/i, 'http:');
      try {
        const httpOut = await fetchWithTimeout(httpUrl, FETCH_TIMEOUT_MS);
        if (httpOut.ok) {
          fetchOut = httpOut;
          fetchErr = null;
          // SSL is broken: it served fine on http but not https.
          result.signals.no_ssl = { hit: true, reason: 'https failed, http worked', points: 20 };
          result.score += 20;
        }
      } catch { /* ignore */ }
    }
  }

  if (!fetchOut || !fetchOut.ok) {
    result.fetch_error = fetchErr || `HTTP ${fetchOut?.status}`;
    return result;
  }

  result.fetched = true;
  result.final_url = fetchOut.url;
  result.elapsed_ms = fetchOut.elapsed;

  // no_ssl — judged by where we actually landed, not where we started.
  // If input was http:// but the site redirected to https://, SSL is fine.
  if (!result.signals.no_ssl) {
    if (/^http:/i.test(fetchOut.url)) {
      result.signals.no_ssl = { hit: true, reason: 'final URL served over http', points: 20 };
      result.score += 20;
    } else {
      result.signals.no_ssl = { hit: false, reason: 'https ok', points: 0 };
    }
  }

  // mobile_broken
  const mb = detectMobileBroken(fetchOut.html);
  result.signals.mobile_broken = { hit: mb.hit, reason: mb.reason, points: mb.hit ? 30 : 0 };
  if (mb.hit) result.score += 30;

  // old_design
  const od = detectOldDesign(fetchOut.html);
  result.signals.old_design = { hit: od.hit, reason: od.reason, points: od.hit ? 15 : 0, detail: od.detail };
  if (od.hit) result.score += 15;

  // no_cta
  const nc = detectNoCta(fetchOut.html);
  result.signals.no_cta = { hit: nc.hit, reason: nc.reason, points: nc.hit ? 15 : 0, detail: nc.detail };
  if (nc.hit) result.score += 15;

  // slow_load
  const slow = fetchOut.elapsed > SLOW_THRESHOLD_MS;
  result.signals.slow_load = {
    hit: slow,
    reason: `${fetchOut.elapsed}ms ${slow ? '>' : '<='} ${SLOW_THRESHOLD_MS}ms`,
    points: slow ? 10 : 0,
  };
  if (slow) result.score += 10;

  // stock_photo
  const sp = detectStockPhotoOverload(fetchOut.html, fetchOut.url);
  result.signals.stock_photo = { hit: sp.hit, reason: sp.reason, points: sp.hit ? 10 : 0, detail: sp.detail };
  if (sp.hit) result.score += 10;

  return result;
}

// --- CLI ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: score-site.mjs <url>   |   score-site.mjs --batch <file>');
  process.exit(2);
}

if (args[0] === '--batch') {
  const fs = await import('node:fs');
  const file = args[1];
  if (!file) { console.error('--batch requires a file path'); process.exit(2); }
  const urls = fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  for (const u of urls) {
    try {
      const r = await scoreSite(u);
      process.stdout.write(JSON.stringify(r) + '\n');
    } catch (e) {
      process.stdout.write(JSON.stringify({ url: u, fatal: e?.message || String(e) }) + '\n');
    }
  }
} else {
  const r = await scoreSite(args[0]);
  process.stdout.write(JSON.stringify(r, null, 2) + '\n');
}
