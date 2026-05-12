#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), 'demos');
const DEFAULT_STATE_FILE = path.join(os.homedir(), '.hermes/state/greencountry-demo-screenshots.json');

function parseArgs(argv) {
  const args = {
    city: 'Tulsa',
    limit: Infinity,
    outputDir: DEFAULT_OUTPUT_DIR,
    stateFile: DEFAULT_STATE_FILE,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--batch') args.batch = argv[++i];
    else if (arg === '--name') args.name = argv[++i];
    else if (arg === '--trade') args.trade = argv[++i];
    else if (arg === '--city') args.city = argv[++i];
    else if (arg === '--url') args.url = argv[++i];
    else if (arg === '--output-dir') args.outputDir = path.resolve(argv[++i]);
    else if (arg === '--state-file') args.stateFile = path.resolve(argv[++i]);
    else if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Generate Green Country demo website screenshots for Madison outreach.\n\nUsage:\n  node scripts/generate-demo-screenshot.mjs --name "VR Electric" --trade "Electrical Contractor" --city Tulsa --url http://example.com\n  node scripts/generate-demo-screenshot.mjs --batch prospects.json --limit 5\n\nOutputs:\n  demos/<slug>.png\n  ~/.hermes/state/greencountry-demo-screenshots.json\n\nBatch input accepts an array of objects with name, trade, city, url/website.`);
}

function slugify(value) {
  return String(value || 'prospect')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'prospect';
}

function normalizeProspect(raw, defaults = {}) {
  const name = raw.name || raw.businessName || raw.business_name;
  if (!name) throw new Error('Prospect is missing name');
  const url = raw.url || raw.website || raw.final_url || raw.sourceUrl || '';
  const trade = raw.trade || raw.vertical || inferTrade(`${name} ${url}`);
  const city = raw.city || defaults.city || 'Tulsa';
  const slug = raw.slug || slugify(`${name}-${city}`);

  return {
    prospect_id: raw.prospect_id || raw.id || stableId(name, url, city),
    name,
    trade,
    city,
    url,
    slug,
  };
}

function stableId(...parts) {
  return crypto.createHash('sha1').update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 12);
}

function inferTrade(text) {
  const value = String(text).toLowerCase();
  const rules = [
    ['electric', 'Electrical Contractor'],
    ['roof', 'Roofing Contractor'],
    ['pest', 'Pest Control'],
    ['plumb', 'Plumbing Contractor'],
    ['hvac', 'HVAC Contractor'],
    ['heat', 'HVAC Contractor'],
    ['air', 'HVAC Contractor'],
    ['garage', 'Garage Door Contractor'],
    ['door', 'Garage Door Contractor'],
    ['insulation', 'Insulation Contractor'],
    ['construction', 'General Contractor'],
  ];
  return rules.find(([needle]) => value.includes(needle))?.[1] || 'Local Service Business';
}

function loadProspects(args) {
  if (args.batch) {
    const batchPath = path.resolve(args.batch);
    const text = fs.readFileSync(batchPath, 'utf8').trim();
    const rows = text.startsWith('[')
      ? JSON.parse(text)
      : text.split(/\n+/).filter(Boolean).map((line) => JSON.parse(line));
    return rows.slice(0, args.limit).map((row) => normalizeProspect(row, args));
  }

  if (!args.name) throw new Error('Pass --name for single mode, or --batch for batch mode');
  return [normalizeProspect(args, args)];
}

function imagePrompt(prospect) {
  return [
    `modern professional small-business website for ${prospect.trade} in ${prospect.city}`,
    `hero with ${prospect.name}`,
    'clean desktop homepage screenshot, strong local trust signals, service cards, prominent call and estimate buttons',
    'premium but practical contractor website, no watermark',
  ].join(', ');
}

function renderPng(prospect, outputPath) {
  const payload = JSON.stringify({ prospect, outputPath });
  const result = spawnSync('python3', ['-c', PY_RENDERER], {
    input: payload,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(`Python renderer failed: ${result.stderr || result.stdout}`);
  }
}

function readState(stateFile) {
  if (!fs.existsSync(stateFile)) return [];
  const text = fs.readFileSync(stateFile, 'utf8').trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.demos || [];
}

function writeState(stateFile, entries) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, `${JSON.stringify(entries, null, 2)}\n`);
}

function upsertState(stateFile, newEntries) {
  const existing = readState(stateFile);
  const byId = new Map(existing.map((entry) => [entry.prospect_id, entry]));
  for (const entry of newEntries) byId.set(entry.prospect_id, { ...byId.get(entry.prospect_id), ...entry });
  const merged = [...byId.values()].sort((a, b) => String(b.generated_at).localeCompare(String(a.generated_at)));
  writeState(stateFile, merged);
  return merged;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.outputDir, { recursive: true });

  const generatedAt = new Date().toISOString();
  const prospects = loadProspects(args);
  const entries = [];

  const existingState = readState(args.stateFile);
  const existingById = new Map(existingState.map((e) => [e.prospect_id, e]));

  for (const prospect of prospects) {
    const pngPath = path.join(args.outputDir, `${prospect.slug}.png`);
    // Skip rendering when a higher-quality demo already exists on disk.
    // Athena pre-generates SDXL Turbo PNGs that the PIL fallback would regress.
    const existing = existingById.get(prospect.prospect_id);
    const isRealDemo = fs.existsSync(pngPath)
      && existing
      && existing.generation_method
      && existing.generation_method !== 'local-concept-renderer';

    if (isRealDemo) {
      entries.push({ ...existing, status: 'ready_for_madison' });
      continue;
    }

    renderPng(prospect, pngPath);
    entries.push({
      prospect_id: prospect.prospect_id,
      name: prospect.name,
      trade: prospect.trade,
      city: prospect.city,
      url: prospect.url,
      slug: prospect.slug,
      demo_png_path: pngPath,
      image_prompt: imagePrompt(prospect),
      generation_method: 'local-concept-renderer',
      generated_at: generatedAt,
      status: 'ready_for_madison',
    });
  }

  upsertState(args.stateFile, entries);
  for (const entry of entries) {
    console.log(JSON.stringify(entry));
  }
}

const PY_RENDERER = String.raw`
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

payload = json.loads(sys.stdin.read())
p = payload['prospect']
out = payload['outputPath']
os.makedirs(os.path.dirname(out), exist_ok=True)
W, H = 1600, 1000
img = Image.new('RGB', (W, H), '#eef3f8')
d = ImageDraw.Draw(img)

def font(size, bold=False):
    names = [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/Library/Fonts/Arial Bold.ttf' if bold else '/Library/Fonts/Arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            pass
    return ImageFont.load_default()

f12, f16, f20, f24 = font(18), font(22), font(28), font(34)
f36, f48, f60 = font(42, True), font(58, True), font(70, True)

# Browser frame shadow + card
shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle((90, 70, 1510, 930), radius=34, fill=(20, 37, 56, 48))
shadow = shadow.filter(ImageFilter.GaussianBlur(24))
img = Image.alpha_composite(img.convert('RGBA'), shadow).convert('RGB')
d = ImageDraw.Draw(img)
d.rounded_rectangle((80, 58, 1520, 920), radius=34, fill='#ffffff')
d.rounded_rectangle((80, 58, 1520, 135), radius=34, fill='#10243a')
for i, c in enumerate(['#ff6b6b', '#ffd166', '#06d6a0']):
    d.ellipse((120 + i*34, 88, 142 + i*34, 110), fill=c)
d.rounded_rectangle((270, 82, 1110, 115), radius=16, fill='#203b58')
d.text((298, 87), (p.get('url') or 'greencountryweb.co/demo').replace('https://','').replace('http://',''), fill='#b9c7d6', font=f12)

# Header nav
d.rectangle((80, 135, 1520, 225), fill='#ffffff')
brand = p['name']
d.text((140, 162), brand, fill='#10243a', font=f36)
for x, label in [(930, 'Services'), (1060, 'Reviews'), (1190, 'Projects')]:
    d.text((x, 174), label, fill='#506277', font=f16)
d.rounded_rectangle((1330, 154, 1460, 202), radius=22, fill='#0f766e')
d.text((1354, 166), 'Call Now', fill='white', font=font(20, True))

# Hero gradient panel
for y in range(225, 650):
    t = (y-225)/425
    r = int(12 + t*16)
    g = int(43 + t*54)
    b = int(70 + t*88)
    d.line((80, y, 1520, y), fill=(r,g,b))
# Local abstract proof card
d.rounded_rectangle((1030, 300, 1435, 585), radius=28, fill='#f6fbff')
d.text((1070, 335), 'Fast estimates', fill='#10243a', font=f24)
d.text((1070, 385), 'Licensed local team', fill='#10243a', font=f24)
d.text((1070, 435), 'Clean, modern work', fill='#10243a', font=f24)
d.rounded_rectangle((1070, 500, 1310, 548), radius=22, fill='#0f766e')
d.text((1094, 512), 'Request Estimate', fill='white', font=font(20, True))

trade = p.get('trade') or 'Local Service Business'
headline = f"{trade.replace(' Contractor','')} help Tulsa trusts."
sub = f"A clean, mobile-first site for {brand}: clear services, proof, and one-tap calls for customers ready to book."
# Wrap headline so it never collides with the proof card.
h_words = headline.split(); h_lines=[]; h_line=''
for w in h_words:
    test = (h_line + ' ' + w).strip()
    if d.textlength(test, font=f60) > 830:
        h_lines.append(h_line); h_line=w
    else:
        h_line=test
if h_line: h_lines.append(h_line)
for idx, line in enumerate(h_lines[:2]):
    d.text((140, 292 + idx*76), line, fill='white', font=f60)
# Wrap subtext
words = sub.split(); lines=[]; line=''
for w in words:
    test = (line + ' ' + w).strip()
    if d.textlength(test, font=f20) > 760:
        lines.append(line); line=w
    else:
        line=test
if line: lines.append(line)
sub_y = 410 if len(h_lines) == 1 else 460
for idx, line in enumerate(lines[:3]):
    d.text((145, sub_y + idx*38), line, fill='#d8e8f6', font=f20)
d.rounded_rectangle((145, 550, 360, 610), radius=28, fill='#17b890')
d.text((174, 566), 'Get a quote', fill='#062033', font=font(22, True))
d.rounded_rectangle((385, 550, 610, 610), radius=28, outline='#d8e8f6', width=2)
d.text((415, 566), 'See services', fill='white', font=font(22, True))

# Service cards
card_y = 700
services_by_trade = {
    'Electrical Contractor': ['Panel upgrades', 'Troubleshooting', 'Commercial wiring'],
    'Roofing Contractor': ['Roof repairs', 'Storm inspections', 'Full replacement'],
    'Pest Control': ['Quarterly plans', 'Termite control', 'Same-week service'],
    'Plumbing Contractor': ['Leak repair', 'Water heaters', 'Drain cleaning'],
    'HVAC Contractor': ['AC repair', 'Tune-ups', 'Installations'],
    'Garage Door Contractor': ['Spring repair', 'New doors', 'Openers'],
    'Insulation Contractor': ['Attic insulation', 'Energy audits', 'Air sealing'],
}
services = services_by_trade.get(trade, ['Fast quotes', 'Local service', 'Clean handoff'])
for i, service in enumerate(services):
    x = 140 + i*455
    d.rounded_rectangle((x, card_y, x+395, card_y+145), radius=24, fill='#f7fafc', outline='#d8e2ec')
    d.rounded_rectangle((x+26, card_y+28, x+74, card_y+76), radius=14, fill='#dff7f1')
    d.text((x+94, card_y+30), service, fill='#10243a', font=font(25, True))
    d.text((x+94, card_y+70), 'Clear page section built to turn searchers into calls.', fill='#62748a', font=f12)

d.text((140, 878), 'Concept generated for Madison outreach · Green Country Web Co.', fill='#718096', font=f12)
img.save(out, 'PNG')
`;

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
