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

- **[2026-05-11 19:18] Green Country hub deployed + scoring engine validated.** Hub live at `marquee-studio-on5s2rtrq-jfrm918s-projects.vercel.app`. Scoring engine at `marquee-studio/scripts/score-site.mjs` ran against 55 Tulsa prospects: 51/55 fetched, 39 scored 0-9, top prospect VR Electric @ 65. **Validation finding:** rubric is too coarse — needs a `looks_dated` AI vision signal to discriminate in the 0-30 bucket where most prospects cluster. See `marquee-studio/scripts/README.md` for Argus integration spec.

---

## 4. Recent decisions (last 10, newest first — older roll off)

- 2026-05-11 20:45 — **Green Country: Athena shipped 3 concrete steps tonight.** (1) Unblocked demo gen via SDXL Turbo MCP — 5 real 1024x768 PNGs generated for top prospects (VR Electric, Hudson Plumbing, NuRoof, Tulsa Overhead Door, Aspen Electrical), state file updated with `generation_method: stable-diffusion-sdxl-turbo`, Argus's script now skips overwriting Athena-generated demos. (2) Hub copy swept to Madison-voice: layout `noindex`, dropped Athena/Argus naming from `/`, `/process`, `/handoff`, `/discovery`, `/contract` signature → Madison. (3) Care Plan tier ($150/mo) added to `/pricing` as prominent ring-accent panel, replaced old `$200/mo Monthly maintenance` addon. Hub redeployed to `marquee-studio-clva6yt8y-jfrm918s-projects.vercel.app`. NOTE: src/ pages are deployed but still untracked in workspace repo (consistent with prior pattern); Jason's call whether to import.
- 2026-05-11 20:22 — **Green Country Task 3 shipped: reply triage MVP.** Added `marquee-studio/scripts/greencountry-triage-reply.mjs`; classifies interested / not_interested / wrong_person / needs_info / spam, updates `greencountry-outreach.json`, and prints a Telegram-ready hot-reply alert. Open upgrade: swap deterministic keyword rules for Claude classification once a reply inbox/thread is chosen.
- 2026-05-11 20:18 — **Green Country: two strategic decisions locked.** (1) **Monthly recurring revenue tier added:** $150/mo maintenance + hosting + GBP management + 1 round of small edits. Goal is to convert ~50% of build clients into recurring. By month 12: 5 retained × $150 = $9k/yr stack on top of build revenue; by month 24 the recurring base starts beating one-time. (2) **Madison = sole face of the company.** Brand stays "Green Country Web Co." (agency wrapper, separable asset), but every customer-facing surface is Madison-voice: outreach, social, hub footer, replies, closing calls. Jason joins calls only on technical escalation. Athena stays invisible. All hub copy + email templates need re-voicing.
- 2026-05-11 20:18 — **Green Country Task 2 shipped: follow-up cadence enforcement.** Added `marquee-studio/scripts/greencountry-followups.mjs`; initialized `~/.hermes/state/greencountry-outreach.json` as empty; verified Day 7 due detection with a temp VR Electric record. Madison/Jason use `due`, `add`, `sent`, `skip`, and `reply` commands until Telegram ack wiring is added.
- 2026-05-11 20:15 — **Green Country Task 1 MVP shipped: demo screenshot generation.** Added `marquee-studio/scripts/generate-demo-screenshot.mjs`; generated `demos/vr-electric-tulsa.png`; wrote `~/.hermes/state/greencountry-demo-screenshots.json` so Madison/Athena can find demo PNGs. True hosted image-gen is blocked until an image backend key is available (`FAL_KEY` missing in this cron env), so current method is a local concept renderer using the same option-b prompt.
- 2026-05-11 19:42 — **Green Country: Argus task spec locked, building starts.** Three tasks ranked by impact: (1) demo screenshot generation, (2) follow-up cadence enforcement, (3) reply triage. Jason approved ~$30/month vision budget for task 1. Sections 4/5 defer until first paid build. Spec in §7. Athena's open work: `looks_dated` signal, wire `/pipeline` to live state, build email-draft step.
- 2026-05-11 19:18 — **Green Country: hub deployed, scoring engine built + validated, Argus handoff spec written.** Hub at `marquee-studio-on5s2rtrq-jfrm918s-projects.vercel.app`. `scripts/score-site.mjs` is a Node-only batch scorer (no headless browser, runs in seconds for 55 URLs). Validation against 55 real Tulsa-area trade sites revealed the rubric needs a `looks_dated` AI vision signal — 76% of sites pass all 6 hard checks. Argus integration: `node scripts/score-site.mjs --batch urls.txt`. Project source still untracked in workspace repo (same as foam-dial-pro — Jason's call).
- 2026-05-11 19:05 — **Apex prod deployed + foam-dial-pro lint 11→0 (uncommitted).** Apex commit `41a4736` pushed to GitHub; `vercel --prod` produced `apexdata-99y2p2wnl-jfrm918s-projects.vercel.app` (Ready 40s). foam-dial-pro lint cleared on disk but **NOT committed** — project source has never been tracked in the workspace repo; pending Jason's decision.
- 2026-05-11 11:55 — **Athena cleaned contractor-lead-system/app lint 166→0.** Categories: 136 `react/no-unescaped-entities` (scripted via positional ESLint JSON output), 14 unused imports/vars (mechanical), 1 `require()` → top-level import in `twilio-verify.ts`, 5 `prefer-const` (auto-fix), 10 `react-hooks/set-state-in-effect` disabled per-line with intent comments (SSR-safe localStorage hydration, hover/motion media-query feature detection, demo-URL routing, polling fetch). No logic changed.
- 2026-05-10 22:18 — **Marquee Studio renamed to Green Country Web Co.** (regional brand — "Green Country" is NE Oklahoma's nickname). Tier names also renamed: Marquee/Marquee+ → Main Street/Main Street+. Hub repo path still `marquee-studio/` (folder rename deferred). All page copy + nav + contract + memory updated.

---

## 5. Open issues / known bugs (lowest-effort first)

- **[2026-05-11 19:05] foam-dial-pro lint CLEAN (uncommitted).** Athena cleared all 11 warnings on disk (3 unused disable directives auto-fixed, 4 unused imports/vars, 1 useMemo dep removed, 3 `<img>` disabled per-line for user-uploaded photos). Build + typecheck + lint pass. **NOT COMMITTED** — foam-dial-pro source is not tracked in the workspace repo; awaiting Jason's decision whether to import the project into the monorepo.
- **[2026-05-11 11:55] contractor-lead-system/app lint CLEAN.** Athena cleared all 166 problems (136 unescaped entities scripted, 14 unused imports/vars, 1 require()→import, 10 set-state-in-effect disabled per-line with intent comments). Build + typecheck still pass.
- **[2026-05-11 20:45] FAL_KEY blocker RESOLVED via option (c).** Athena now generates demos using the local stable-diffusion MCP (SDXL Turbo, Apple Silicon, no API key). 5 demos shipped. Argus's `generate-demo-screenshot.mjs` skips re-rendering when a non-`local-concept-renderer` PNG already exists, so Athena-generated demos survive Argus's cron runs. Long-term: Athena's `greencountry-build` cron should pre-generate the day's batch before Madison's morning send window.

---

## 6. Hard rules both agents follow

- Argus may make local `[argus auto]` commits only for Rung 2 safe categories; never `git push` or `vercel --prod`. Athena may deploy/push with explicit Jason OK.
- Never modify the database schema (`prisma db push` / `migrate deploy`) without Jason's explicit per-change approval.
- Never touch `.env` files.
- If you discover the OTHER agent has work-in-flight on the same file, defer or coordinate — never silently double-handle.
- When you update this file, mention it in your reply to Jason ("Updated SHARED.md with X") so he knows the source of truth changed.

---

## 7. Green Country Web Co. — ARGUS TASK SPEC (Jason-approved 2026-05-11 19:41)

**Status:** Hub deployed (`marquee-studio-on5s2rtrq-jfrm918s-projects.vercel.app`). Scoring engine validated against 55 Tulsa prospects — works, but needs `looks_dated` AI vision signal added later. Original review request (5 questions) is closed: Jason decided to ship and Argus's role is now build-the-pipeline, not review-the-rubric.

**Cadence assumption:** Madison sends 5 emails/day Mon-Fri = 25/wk. Validation kill criterion: 0 builds + <5% reply rate after 25+ sends.

**Three Argus tasks, ranked by impact. Build in this order:**

### Task 1 — Demo screenshot generation — **MVP shipped 2026-05-11 20:15**
For each prospect on Madison's send-today list, generate a rebuilt screenshot of what their site COULD look like, and store it where Madison can attach it to the outreach email. **Shipped today:** `scripts/generate-demo-screenshot.mjs` creates outreach-ready PNG concepts in `marquee-studio/demos/` and upserts `~/.hermes/state/greencountry-demo-screenshots.json`; validated with VR Electric. **Open upgrade:** hosted image-gen option (b) is blocked in this cron env because `FAL_KEY` is not set, so current output uses a local concept renderer with the same prompt metadata.

- **Input:** prospect URL (one at a time, or batch)
- **Process options Argus picks:**
  - (a) Playwright headless screenshot of current site → Claude vision prompt "Redesign this as a modern small-biz site preserving brand colors and business name" → render to HTML/CSS → screenshot the rebuild
  - (b) Simpler: Stable Diffusion / DALL-E "modern professional small-business website for [trade] in [city], hero with [biz name]" — no current-site reference, just a clean concept
  - **Athena's recommendation:** start with (b). Faster, cheaper, looks good enough for outreach. Upgrade to (a) once we have one paid build and want to invest in conversion.
- **Output:** PNG saved to a known path (suggest `~/.openclaw/workspace/marquee-studio/demos/<slug>.png`), URL written to a state file so Madison's email-draft step knows where to grab it
- **Budget:** ~$0.05-0.20 per prospect. At 5/day = max $1/day = $30/month. Approved.

### Task 2 — Follow-up cadence enforcement — **shipped 2026-05-11 20:18**
Track who got Day 0 / Day 7 / Day 14 emails. **Shipped today:** `scripts/greencountry-followups.mjs` reads/writes `~/.hermes/state/greencountry-outreach.json`, prints due Day 7/Day 14 lists, and supports `add`, `sent`, `skip`, and `reply` state updates. **Open upgrade:** wire the daily scheduled job + Telegram ack parser so Madison can close the loop by replying `sent X` / `skip X`.

- **State store:** `~/.hermes/state/greencountry-outreach.json` (suggested shape: `[{prospect_id, name, url, day0_sent_at, day7_sent_at, day14_sent_at, status}]`)
- **Trigger:** daily scheduled job at, say, 09:00 CT — scans state, finds prospects whose Day 7 or Day 14 send is due (or overdue), emits a Telegram message to Madison/Jason with the list
- **How Madison closes the loop:** replies to the Telegram with "sent X" or "skip X" — Argus updates state accordingly (same Telegram-ack pattern as Kalshi journal)
- **Edge:** if a prospect replies in between, status flips to "live" and follow-up halts

### Task 3 — Reply triage — **MVP shipped 2026-05-11 20:22**
When a prospect replies, classify (interested / not interested / wrong person / needs info / spam) and surface hot ones to Telegram instantly. **Shipped today:** `scripts/greencountry-triage-reply.mjs` accepts pasted text or a reply file, classifies into the five categories, updates `greencountry-outreach.json`, and prints a Telegram-ready alert. **Open upgrade:** choose inbox vs Telegram thread and replace keyword rules with Claude classification.

- **Input source:** Madison forwards replies to a dedicated inbox, OR pastes into a Telegram thread Argus watches. **Argus picks the easier-to-build channel.**
- **Process:** Claude classification prompt with five categories above; output category + 1-line summary + suggested next action
- **Output:** Telegram alert formatted similar to Kalshi alerts (clear category, business name, summary, "next: book call" / "next: send pricing" / "next: ignore")
- **State:** append to `greencountry-outreach.json`, update prospect status to "live" / "dead"

### Deferred (for after first paid build)
- **Task 4 (personalized openers):** scrape each prospect's site, pull years/services/pain signals, draft Madison-voice opener. Defer until we know which opener angle gets replies — no point automating the wrong template.
- **Task 5 (what's-working journaling):** track subject-line / opener / vertical reply rates over time. Defer until week 4 when there's enough volume to analyze.

### Contract with Athena
- Athena owns: the hub UI, the scoring engine (`marquee-studio/scripts/score-site.mjs`), the Webflow builds themselves, the email draft template Madison edits before sending.
- Argus owns: scraping, scoring batch runs, demo gen, follow-up cadence, reply triage, journaling.
- Shared state files live under `~/.hermes/state/greencountry-*.json` (Argus writes, Athena reads via the hub).

### Open Athena work
- Add `looks_dated` AI vision signal to `score-site.mjs` (60¢/month at scale, gets discrimination in the 0-30 bucket where 76% of prospects currently cluster).
- Wire the hub's `/pipeline` page counts to read from `greencountry-outreach.json` so it shows real state, not zeros.
- Build the email-draft step Madison runs (renders the demo screenshot + per-prospect signals into a copy-paste-ready email). **Re-voice for Madison-as-sole-face** (see §8 decision).
- Add new $150/mo **Care Plan** tier to hub `/pricing` page. Listed as add-on to any Main Street/Main Street+ build. Includes: hosting, GBP management, 1 round of small edits/mo, uptime monitoring. Goal: 50% attach rate.
- Sweep hub copy (`/`, `/pricing`, `/process`, `/discovery`, `/contract`, `/handoff`, `/roles`) to Madison-first voice. Drop any reference to "the team" / "we" that implies Jason or Athena are customer-facing. "Madison + studio" framing.

### Athena image-gen unblock for Argus
Athena has `mcp__stable-diffusion__generate_image` available (SDXL Turbo, local Apple Silicon, no API key). Faster path than FAL: refactor `generate-demo-screenshot.mjs` so option (b) calls a local stable-diffusion endpoint Athena exposes, or Athena pre-generates the day's demo batch ahead of Madison's send window. Decide approach after Jason confirms FAL_KEY path vs MCP path.

**Argus — if anything in this spec is wrong or undercooked, push back in section 4. Otherwise ship.**

---

## 8. Green Country — durable brand & pricing decisions (Jason-approved 2026-05-11 20:18)

These are directional choices that should NOT roll off section 4. Read these every Green Country session.

### Brand framing: agency wrapper, single face
- **Public face = Madison.** All cold outreach, social, replies, closing calls. Hub footer and About are Madison-voice. Customers should believe Madison runs the company.
- **Brand name stays "Green Country Web Co."** — never rename to include Madison's name. The brand is a separable asset (resellable, hireable-into, doesn't depend on one person).
- **Jason = silent operator + technical escalation only.** Joins customer calls if a tech question lands; otherwise invisible.
- **Athena = invisible build engine.** Never named in customer-facing surfaces. Madison is "the studio."
- **All hub + email copy must reflect this.** No "the team," no "we" that implies a multi-person customer-facing crew. "Madison + studio" or first-person Madison.

### Pricing: build + recurring stack
- **One-time builds:** Main Street $1,500 / Main Street+ $3,500 (unchanged).
- **NEW — Care Plan: $150/mo add-on.** Hosting, GBP management, 1 round of small edits per month, uptime monitoring. Offered at handoff. **Goal: 50% attach rate** on builds → $9k/yr stacked by month 12 from first cohort, beats one-time revenue by month 24.
- **Future tiers (do not build yet):** Site Audit productized at $200-500 (low-friction entry → upsells to builds); vertical specialization (HVAC-only / Plumbing-only positioning) after first 3 paid builds prove demand.

### Operational consequence
- Email-draft step Madison runs (Athena open task) must default to Madison-first voice.
- `/pricing` page needs Care Plan tier with attach-rate logic.
- `/discovery` and `/handoff` need a Care Plan checkbox / pitch step.
- Validation kill criterion unchanged: 0 builds + <5% reply rate after 25+ sends. **But add:** "of first 4 paid builds, does 1+ attach to Care Plan?" If 0/4 attach, recurring model is unviable and pricing rethinks.
