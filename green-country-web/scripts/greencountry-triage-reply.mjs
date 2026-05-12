#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_STATE_FILE = path.join(os.homedir(), '.hermes/state/greencountry-outreach.json');

const RULES = [
  {
    category: 'spam',
    status: 'spam',
    next: 'ignore',
    needles: ['unsubscribe', 'casino', 'crypto', 'seo package', 'guest post', 'loan offer'],
  },
  {
    category: 'wrong_person',
    status: 'wrong_person',
    next: 'find correct owner/contact',
    needles: ['wrong person', 'not the owner', 'no longer with', 'does not work here', 'contact someone else'],
  },
  {
    category: 'not_interested',
    status: 'dead',
    next: 'mark dead; do not follow up',
    needles: ['not interested', 'no thanks', 'do not contact', "don't contact", 'stop emailing', 'we are good', "we're good", 'already have a website guy'],
  },
  {
    category: 'interested',
    status: 'live',
    next: 'book call',
    needles: ['interested', 'sounds good', 'send me', 'call me', 'give me a call', 'schedule', 'book', 'estimate', 'quote', 'demo looks good', 'tell me more'],
  },
  {
    category: 'needs_info',
    status: 'live',
    next: 'send pricing + 2-sentence process summary',
    needles: ['how much', 'cost', 'price', 'pricing', 'what is included', 'how long', 'examples', 'portfolio', 'questions'],
  },
];

function parseArgs(argv) {
  const args = { stateFile: DEFAULT_STATE_FILE, now: new Date().toISOString() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--state') args.stateFile = path.resolve(argv[++i]);
    else if (arg === '--now') args.now = new Date(argv[++i]).toISOString();
    else if (arg === '--name') args.name = argv[++i];
    else if (arg === '--url') args.url = argv[++i];
    else if (arg === '--id' || arg === '--prospect-id') args.prospect_id = argv[++i];
    else if (arg === '--text') args.text = argv[++i];
    else if (arg === '--file') args.text = fs.readFileSync(path.resolve(argv[++i]), 'utf8');
    else if (arg === '--json') args.json = true;
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
  console.log(`Green Country reply triage.\n\nUsage:\n  node scripts/greencountry-triage-reply.mjs --name "VR Electric" --text "Sounds good, send pricing"\n  node scripts/greencountry-triage-reply.mjs --id <prospect_id> --file reply.txt\n\nCategories: interested, not_interested, wrong_person, needs_info, spam.\nState: ~/.hermes/state/greencountry-outreach.json`);
}

function stableId(name, url) {
  return crypto.createHash('sha1').update(`${name || ''}|${url || ''}`).digest('hex').slice(0, 12);
}

function readState(file) {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, 'utf8').trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error(`${file} must contain a JSON array`);
  return parsed;
}

function writeState(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`);
}

function classify(text) {
  const normalized = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  for (const rule of RULES) {
    const hit = rule.needles.find((needle) => normalized.includes(needle));
    if (hit) return { ...rule, matched: hit };
  }
  return {
    category: 'needs_info',
    status: 'live',
    next: 'manual review; ask one clarifying question',
    matched: 'fallback',
  };
}

function summarize(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 140) return clean;
  return `${clean.slice(0, 137)}...`;
}

function upsertReply(rows, args, triage) {
  const id = args.prospect_id || stableId(args.name, args.url);
  if (!id) throw new Error('Missing --id or --name');
  const replyEvent = {
    at: args.now,
    type: 'reply_triage',
    category: triage.category,
    summary: summarize(args.text),
    next: triage.next,
    matched: triage.matched,
  };
  let found = false;
  const nextRows = rows.map((row) => {
    if (row.prospect_id !== id) return row;
    found = true;
    return {
      ...row,
      name: row.name || args.name || '',
      url: row.url || args.url || '',
      status: triage.status,
      replied_at: args.now,
      reply_category: triage.category,
      next_action: triage.next,
      notes: [...(row.notes || []), replyEvent],
    };
  });

  if (!found) {
    nextRows.unshift({
      prospect_id: id,
      name: args.name || 'Unknown prospect',
      url: args.url || '',
      day0_sent_at: null,
      day7_sent_at: null,
      day14_sent_at: null,
      status: triage.status,
      replied_at: args.now,
      reply_category: triage.category,
      next_action: triage.next,
      notes: [replyEvent],
    });
  }

  return { id, rows: nextRows };
}

function formatAlert(args, triage, id) {
  const name = args.name || id;
  return [
    `🟡 [greencountry reply] ${triage.category}: ${name}`,
    `Summary: ${summarize(args.text)}`,
    `Next: ${triage.next}`,
    `Prospect: ${id}`,
  ].join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.text) throw new Error('Missing --text or --file');
  if (!args.name && !args.prospect_id) throw new Error('Missing --name or --id');

  const triage = classify(args.text);
  const rows = readState(args.stateFile);
  const { id, rows: nextRows } = upsertReply(rows, args, triage);
  writeState(args.stateFile, nextRows);

  const payload = { prospect_id: id, category: triage.category, summary: summarize(args.text), next: triage.next, status: triage.status };
  console.log(args.json ? JSON.stringify(payload, null, 2) : formatAlert(args, triage, id));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
