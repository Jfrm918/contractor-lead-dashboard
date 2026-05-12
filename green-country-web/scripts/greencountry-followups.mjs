#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_STATE_FILE = path.join(os.homedir(), '.hermes/state/greencountry-outreach.json');
const HALT_STATUSES = new Set(['live', 'dead', 'not_interested', 'wrong_person', 'spam', 'skipped']);

function parseArgs(argv) {
  const args = { stateFile: DEFAULT_STATE_FILE, now: new Date().toISOString() };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--state') args.stateFile = path.resolve(argv[++i]);
    else if (arg === '--now') args.now = new Date(argv[++i]).toISOString();
    else if (arg === '--name') args.name = argv[++i];
    else if (arg === '--url') args.url = argv[++i];
    else if (arg === '--trade') args.trade = argv[++i];
    else if (arg === '--city') args.city = argv[++i];
    else if (arg === '--id' || arg === '--prospect-id') args.prospect_id = argv[++i];
    else if (arg === '--stage') args.stage = argv[++i];
    else if (arg === '--status') args.status = argv[++i];
    else if (arg === '--reason') args.reason = argv[++i];
    else if (arg === '--json') args.json = true;
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else rest.push(arg);
  }
  args.command = rest[0] || 'due';
  args.positionals = rest.slice(1);
  return args;
}

function printHelp() {
  console.log(`Green Country follow-up cadence tool.\n\nUsage:\n  node scripts/greencountry-followups.mjs due\n  node scripts/greencountry-followups.mjs add --name "VR Electric" --url http://... --trade "Electrical Contractor"\n  node scripts/greencountry-followups.mjs sent --id <prospect_id> --stage day7\n  node scripts/greencountry-followups.mjs skip --id <prospect_id> --reason "bad fit"\n  node scripts/greencountry-followups.mjs reply --id <prospect_id> --status live\n\nState: ~/.hermes/state/greencountry-outreach.json`);
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

function daysBetween(startIso, endIso) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.floor((end - start) / 86400000);
}

function findDue(rows, nowIso) {
  return rows.flatMap((row) => {
    if (!row.day0_sent_at || HALT_STATUSES.has(row.status)) return [];
    const age = daysBetween(row.day0_sent_at, nowIso);
    if (age >= 14 && !row.day14_sent_at) return [{ ...row, due_stage: 'day14', days_since_day0: age }];
    if (age >= 7 && !row.day7_sent_at) return [{ ...row, due_stage: 'day7', days_since_day0: age }];
    return [];
  });
}

function requireId(args) {
  const id = args.prospect_id || args.positionals[0];
  if (!id) throw new Error('Missing --id <prospect_id>');
  return id;
}

function updateById(rows, id, updater) {
  let found = false;
  const next = rows.map((row) => {
    if (row.prospect_id !== id) return row;
    found = true;
    return updater(row);
  });
  if (!found) throw new Error(`No prospect found for id ${id}`);
  return next;
}

function formatDue(due) {
  if (due.length === 0) return '🟢 [greencountry followups] 0 due.';
  const lines = due.map((row) => `- ${row.due_stage.toUpperCase()} due: ${row.name} (${row.days_since_day0}d since Day 0) — ${row.url || 'no URL'}`);
  return `🟡 [greencountry followups] ${due.length} due:\n${lines.join('\n')}\nReply pattern for Argus: sent <prospect_id> or skip <prospect_id>.`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readState(args.stateFile);

  if (args.command === 'due') {
    const due = findDue(rows, args.now);
    console.log(args.json ? JSON.stringify(due, null, 2) : formatDue(due));
    return;
  }

  if (args.command === 'add') {
    if (!args.name) throw new Error('Missing --name');
    const prospect = {
      prospect_id: args.prospect_id || stableId(args.name, args.url),
      name: args.name,
      url: args.url || '',
      trade: args.trade || '',
      city: args.city || 'Tulsa',
      day0_sent_at: args.now,
      day7_sent_at: null,
      day14_sent_at: null,
      status: 'contacted',
      notes: [],
    };
    const withoutExisting = rows.filter((row) => row.prospect_id !== prospect.prospect_id);
    writeState(args.stateFile, [prospect, ...withoutExisting]);
    console.log(`added ${prospect.prospect_id} ${prospect.name}`);
    return;
  }

  if (args.command === 'sent') {
    const id = requireId(args);
    if (!['day7', 'day14'].includes(args.stage)) throw new Error('Missing --stage day7|day14');
    const field = `${args.stage}_sent_at`;
    const next = updateById(rows, id, (row) => ({ ...row, [field]: args.now, status: args.stage === 'day14' ? 'day14_sent' : 'day7_sent' }));
    writeState(args.stateFile, next);
    console.log(`marked ${id} ${args.stage} sent`);
    return;
  }

  if (args.command === 'skip') {
    const id = requireId(args);
    const next = updateById(rows, id, (row) => ({
      ...row,
      status: 'skipped',
      notes: [...(row.notes || []), { at: args.now, type: 'skip', reason: args.reason || '' }],
    }));
    writeState(args.stateFile, next);
    console.log(`skipped ${id}`);
    return;
  }

  if (args.command === 'reply') {
    const id = requireId(args);
    const status = args.status || 'live';
    const next = updateById(rows, id, (row) => ({
      ...row,
      status,
      replied_at: args.now,
      notes: [...(row.notes || []), { at: args.now, type: 'reply', status }],
    }));
    writeState(args.stateFile, next);
    console.log(`marked ${id} reply status ${status}`);
    return;
  }

  throw new Error(`Unknown command: ${args.command}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
