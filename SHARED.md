# SHARED.md — single source of truth for Athena (Claude) + Argus (GPT)

**Both agents read this at the start of every session and update it when:**
- A project's status materially changes
- A bug is discovered, fixed, or marked WONTFIX
- Jason makes a directional decision that future-us needs to know
- One agent picks up work the other should NOT duplicate

**Format rule:** keep entries tight (1-3 lines each). Old entries roll off — don't let this file grow past ~5,000 chars. Aggressive pruning is correct.

---

## 1. Project priority right now (most → least)

1. **foam-dial-pro** (`/Users/jfrm918/.openclaw/workspace/foam-dial-pro/`) — daily-driver app, used in the field, top priority for diagnostics + any active work
2. **contractor-lead-system/app** (`/Users/jfrm918/.openclaw/workspace/contractor-lead-system/app/`) — hosts Vantage hub at `/vantage/*`. On hold for product direction, but tech still needs to stay green
3. **kdp/, foam-dial/ (legacy), home-hub/, evidence-ledger-hub/** — paused, do not touch unless explicitly asked

---

## 2. Live deployments

- foam-dial-pro → https://foamdial.vercel.app (Vercel, deploy via `vercel --prod --yes` from project root)
- vantage / contractor-lead-system → https://apexdataco.vercel.app/vantage (same)
- Both share one Neon Postgres DATABASE_URL

---

## 3. Work in flight (claim before starting; clear when done)

- **(none right now)** — claim format: `[YYYY-MM-DD HH:MM] [Athena|Argus] working on <project>:<area> — eta <X>` 

---

## 4. Recent decisions (last 10, newest first — older roll off)

- 2026-05-10 20:31 — **Argus broadened Kalshi watchdog to all markets.** Script now scans open events with nested markets across all categories (politics/entertainment/tech/novelty included) and filters by edge/microstructure/time-decay only; cron/silence/dedupe/6-day cap unchanged.
- 2026-05-10 20:10 — **Argus added Kalshi opportunity watchdog.** Script: `~/.hermes/scripts/check-kalshi-opportunities.py`; Hermes cron `b2ca254bfcb7` runs every 15 min, no-agent, Telegram delivery, self-silences outside 7am-11pm CT and caps alerts at 6/day. Public API note: `trading-api.kalshi.com` returns migration notice; live unauth endpoint is `https://api.elections.kalshi.com/trade-api/v2`.
- 2026-05-10 19:35 — **Vantage 2.0 LIVE on apexdataco.vercel.app.** Athena committed (3ca9fb4), pushed, deployed. Hub view, landing, pricing tiers all show CRE/lender/title/broker positioning. Argus's earlier cleanup commit (9d857cc) also live. Plus: created `/Users/jfrm918/.openclaw/workspace/vantage-product-marketing-context.md` — persistent source of truth for all Vantage marketing/sales output (per Corey Haines marketing-skills repo pattern). Both Athena + Argus must read it before drafting any landing copy, cold email, demo script. Day-30 kill criteria locked: zero customers + zero warm intros + zero "this is exactly what I need" cold reactions → pivot to AI-augmented productized agency for SMB vertical.
- 2026-05-10 18:15 — **Vantage strategic pivot locked.** Was: B2B intel for construction-supply vendors (insulation, roofing, equipment rental). Stepdad market signal said vendors are saturated. New: B2B intel for **commercial lenders, title/closing companies, and CRE brokers** in Tulsa. Same scraper + permit data + AI enrichment, plus new layers (property transfers from county recorder, loan maturity tracking, distress signals). Pricing reset: Lender $499/mo, Title $399/mo, Broker $299/mo, Pro Pipeline $999/mo. Why now: Jason's grandma is in lending (40 yr Tulsa network), papa Dave Cocolin = CEO of Paradigm Realty Advisors, uncle Jason Hadrava = co-founder Titan Title (9 offices). Warm-intro path is real once the rebuild is done. Competitors to position against: Reonomy ($400/mo, national, no permits), CompStak (lease/sales comps), Crexi (marketplace). Athena handling rewrite now.
- 2026-05-10 17:30 — **Argus promoted to Rung 2** — can now autonomously apply + locally-commit lint fixes, formatting, confirmed-dead-code removal, unused imports, stale-pending-note cleanup, and comment typos. Commit messages prefixed `[argus auto]` for audit. Cap: 5 autonomous commits/day. Still NEVER pushes to remote, deploys, modifies schema, or touches .env. SOUL.md updated with full Rung 2 rules + trust ladder. Promotion to Rung 3 (small logic fixes + preview deploys) requires 1 week of zero mistakes.
- 2026-05-10 15:05 — Argus capabilities expanded: (a) **vercel-deploy-watch** cron added — checks every 15 min for failed deploys on foamdial + apexdata projects, alerts Telegram only if broken (silent otherwise). Script at `~/.hermes/scripts/check-vercel-deploys.sh`. (b) Subagent delegation enabled — morning-sweep cron now spawns parallel subagents per project for faster, deeper sweeps. SOUL.md updated with delegation guidance.
- 2026-05-10 14:35 — Athena fixed all 3 issues from Argus's first sweep: (1) 7 ESLint set-state-in-effect errors silenced with `// eslint-disable-next-line` + justification (legit data-fetch / auto-fill patterns), (2) viewport export split from metadata in layout.tsx (Next 16 spec), (3) deleted stale `_field-events-pending.md` (work it described shipped May 10). Also cleaned up unused `equipmentExpanded`/`inputMode`/`logMode`/`selectedBrand` from the JobLogger refactor. Build green, deployed to foamdial.vercel.app.
- 2026-05-10 — Argus runs on GPT-5 (OpenAI Codex OAuth), Athena on Claude. Argus is read-only / Path A — alerts only, Athena handles fixes via forward-from-Jason.
- 2026-05-10 — FoamDial JobLogger split into 3 phases (Morning / Midday / EOD) with phase-specific sections. Equipment readings now required + always visible. Sets/gallons toggle removed (gallons-only). Brand chips removed. Address read-only when site linked.
- 2026-05-10 — FoamDial site lifecycle: status changes happen at EOD close-out via "How did the day end?" picker. Bottom site-actions panel is for manual override only.
- 2026-05-10 — Estimated material cost now gated to `viewMode === "owner"` (sidebar pill toggle Owner | Installer); installers don't see cost.
- 2026-05-10 — Installed Hermes Agent at `~/.hermes/`. Created Argus persona for background dev/QA.
- 2026-05-09 — Vantage hub: built `/vantage/hub/tulsa` with 18-trade filter + AI outreach drafts. Stepdad said no on Vantage ("I already use someone, get as many leads as I want") — paused, focus shifted to FoamDial.
- 2026-05-08 → 09 — Apex Data renamed to Vantage across the codebase. Pricing locked at $149/$299/$499/mo three tiers (NOT $99 — old pilot placeholder).

---

## 5. Open issues / known bugs (lowest-effort first)

- *(none flagged at the moment — Argus will populate this section as he sweeps)*

---

## 6. Hard rules both agents follow

- Argus may make local `[argus auto]` commits only for Rung 2 safe categories; never `git push` or `vercel --prod`. Athena may deploy/push with explicit Jason OK.
- Never modify the database schema (`prisma db push` / `migrate deploy`) without Jason's explicit per-change approval.
- Never touch `.env` files.
- If you discover the OTHER agent has work-in-flight on the same file, defer or coordinate — never silently double-handle.
- When you update this file, mention it in your reply to Jason ("Updated SHARED.md with X") so he knows the source of truth changed.
