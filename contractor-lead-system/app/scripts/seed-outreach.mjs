import 'dotenv/config';
import fs from 'node:fs';
import pg from 'pg';
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto?.subtle) globalThis.crypto = webcrypto;

const password = process.env.MADISON_OUTREACH_PASSWORD;
if (!password) throw new Error('MADISON_OUTREACH_PASSWORD is required');

const prospects = JSON.parse(fs.readFileSync('/Users/jfrm918/.openclaw/workspace/tulsa_lrp_prospects_clean.json', 'utf8'));
const migrationSql = fs.readFileSync('prisma/migrations/20260426123500_add_outreach_prospects/migration.sql', 'utf8');

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt'],
  );
  const hash = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  const toHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${toHex(salt)}:${toHex(hash)}`;
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(migrationSql);

const passwordHash = await hashPassword(password);
await client.query(`
  INSERT INTO users (id, email, password_hash, name, role, client_id, created_at, updated_at)
  VALUES (gen_random_uuid(), $1, $2, $3, $4, NULL, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role, client_id = NULL, updated_at = NOW()
`, ['madison@leadrecoverypro.local', passwordHash, 'Madison', 'outreach']);

for (const p of prospects) {
  await client.query(`
    INSERT INTO outreach_prospects
      (name, trade, tier, fit_score, phone, email, email_confidence, website, contact_url, source, source_url, rating, zip, fit_reason, madison_angle, created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW())
    ON CONFLICT (name) DO UPDATE SET
      trade = EXCLUDED.trade,
      tier = EXCLUDED.tier,
      fit_score = EXCLUDED.fit_score,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      email_confidence = EXCLUDED.email_confidence,
      website = EXCLUDED.website,
      contact_url = EXCLUDED.contact_url,
      source = EXCLUDED.source,
      source_url = EXCLUDED.source_url,
      rating = EXCLUDED.rating,
      zip = EXCLUDED.zip,
      fit_reason = EXCLUDED.fit_reason,
      madison_angle = EXCLUDED.madison_angle,
      updated_at = NOW()
  `, [
    p.name, p.trade, p.tier, p.fitScore, p.phone || null, p.email || null, p.emailConfidence || null,
    p.website || null, p.contactUrl || null, p.source || null, p.sourceUrl || null, p.rating || null,
    p.zip || null, p.fitReason, p.madisonAngle,
  ]);
}

await client.end();
console.log(`Seeded outreach user and ${prospects.length} prospects.`);
