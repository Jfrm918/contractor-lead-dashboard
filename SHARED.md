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
- **green-country-web → https://green-country-web-jfrm918s-projects.vercel.app** (permanent production alias, SSO protection disabled 2026-05-11 21:15, updates every deploy. Hub `noindex` keeps it out of search.)
- All share one Neon Postgres DATABASE_URL

---

## 3. Work in flight (claim before starting; clear when done)

*(none claimed at rollup — Athena/Argus should claim here before touching shared files.)*

---

## 4. Recent decisions (last 10, newest first — older roll off)

- 2026-05-11 21:15 — **Green Country: pricing tightened + $5K/mo profit target locked.** Tiers now $1,500 / $2,000 / $2,500 (Main Street+ dropped from $3,500). Home page Stat updated to $1.5–2.5K. Deploy: `green-country-kkdyscg02-jfrm918s-projects.vercel.app`. **North star: $5K/month profit (Year 3 realistic; Year 1 ~$1.5–2K/mo, Year 2 ~$3.5–4.5K/mo).** Kill criterion: if Year 2 ends below $2K/mo, rethink the model. Madison time budget 5 hrs/wk, Jason 1-2 hrs/wk — anything above means automation is failing.
- 2026-05-11 21:00 — **Argus evening rollup:** cleared completed lint/FAL items out of open issues; Green Country pipeline MVPs are shipped (demo gen, follow-up CLI, reply triage), but tomorrow's blockers are wiring those scripts into the hub/scheduled flow plus Athena's `looks_dated` scoring + email-draft step.
- 2026-05-11 20:55 — **Vercel project renamed `marquee-studio` → `green-country-web`.** Future deploy URLs should use `green-country-web-*` / `green-country-*`; old `marquee-studio-*` aliases still resolve.
- 2026-05-11 20:50 — **Folder renamed + projects imported.** Local `marquee-studio/` → `green-country-web/`; internal refs swept. `green-country-web/` and `foam-dial-pro/` are now imported into the workspace repo.
- 2026-05-11 20:45 — **Green Country: Athena shipped 3 concrete steps tonight.** 5 SDXL Turbo demos generated for top prospects; hub copy swept to Madison-voice/noindex; $150/mo Care Plan added to `/pricing`. Open: src pages are deployed but review/import state should be confirmed before more deploy work.
- 2026-05-11 20:22 — **Green Country Task 3 shipped: reply triage MVP.** `green-country-web/scripts/greencountry-triage-reply.mjs` classifies pasted/file replies and updates `greencountry-outreach.json`; open upgrade is real inbox/thread + Claude classifier.
- 2026-05-11 20:18 — **Green Country: strategic decisions locked.** Care Plan = $150/mo maintenance/hosting/GBP/edits target 50% attach; Madison is sole customer-facing face; Jason only technical escalation; Athena invisible.
- 2026-05-11 20:18 — **Green Country Task 2 shipped: follow-up cadence enforcement.** `green-country-web/scripts/greencountry-followups.mjs` supports `due`, `add`, `sent`, `skip`, and `reply`; open upgrade is scheduled daily job + Telegram ack parser.
- 2026-05-11 20:15 — **Green Country Task 1 MVP shipped: demo screenshot generation.** `green-country-web/scripts/generate-demo-screenshot.mjs` writes PNG concepts + state; local renderer is fallback, while Athena's SDXL demos now take precedence.
- 2026-05-11 19:42 — **Green Country Argus task spec approved.** Build order: demo screenshot generation → follow-up cadence → reply triage; ~$30/mo vision budget approved; personalization/journaling deferred until first paid build.
- 2026-05-11 19:18 — **Green Country hub deployed, scoring engine built + validated.** 55 Tulsa prospects tested; rubric needs `looks_dated` AI vision signal because most sites cluster in 0-30 bucket. Argus integration: `node scripts/score-site.mjs --batch urls.txt`.

---

## 5. Open issues / known bugs (lowest-effort first)

- **Green Country scoring:** `green-country-web/scripts/score-site.mjs` still needs a `looks_dated` AI vision signal; validation showed the current hard-check rubric is too coarse.
- **Green Country pipeline UI:** `/pipeline` still needs to read real counts from `~/.hermes/state/greencountry-outreach.json` instead of zeros.
- **Green Country outreach ops:** follow-up CLI and reply triage MVPs exist, but daily scheduled run + Telegram ack parser + real inbox/thread source are not wired yet.
- **Green Country email draft:** Athena still needs the Madison-voice email-draft step that pulls demo PNG + prospect signals into copy-paste-ready outreach.
- **Green Country Care Plan flow:** `/pricing` tier is shipped; `/discovery` and `/handoff` still need Care Plan checkbox/pitch step.

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
For each prospect on Madison's send-today list, generate a rebuilt screenshot of what their site COULD look like, and store it where Madison can attach it to the outreach email. **Shipped today:** `scripts/generate-demo-screenshot.mjs` creates outreach-ready PNG concepts in `green-country-web/demos/` and upserts `~/.hermes/state/greencountry-demo-screenshots.json`; validated with VR Electric. **Open upgrade:** hosted image-gen option (b) is blocked in this cron env because `FAL_KEY` is not set, so current output uses a local concept renderer with the same prompt metadata.

- **Input:** prospect URL (one at a time, or batch)
- **Process options Argus picks:**
  - (a) Playwright headless screenshot of current site → Claude vision prompt "Redesign this as a modern small-biz site preserving brand colors and business name" → render to HTML/CSS → screenshot the rebuild
  - (b) Simpler: Stable Diffusion / DALL-E "modern professional small-business website for [trade] in [city], hero with [biz name]" — no current-site reference, just a clean concept
  - **Athena's recommendation:** start with (b). Faster, cheaper, looks good enough for outreach. Upgrade to (a) once we have one paid build and want to invest in conversion.
- **Output:** PNG saved to a known path (suggest `~/.openclaw/workspace/green-country-web/demos/<slug>.png`), URL written to a state file so Madison's email-draft step knows where to grab it
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
- Athena owns: the hub UI, the scoring engine (`green-country-web/scripts/score-site.mjs`), the Webflow builds themselves, the email draft template Madison edits before sending.
- Argus owns: scraping, scoring batch runs, demo gen, follow-up cadence, reply triage, journaling.
- Shared state files live under `~/.hermes/state/greencountry-*.json` (Argus writes, Athena reads via the hub).

### Open Athena work
- Add `looks_dated` AI vision signal to `score-site.mjs` (60¢/month at scale, gets discrimination in the 0-30 bucket where 76% of prospects currently cluster).
- Wire the hub's `/pipeline` page counts to read from `greencountry-outreach.json` so it shows real state, not zeros.
- Build the Madison-voice email-draft step (demo PNG + per-prospect signals → copy-paste-ready outreach).
- Add Care Plan checkbox/pitch steps to `/discovery` and `/handoff` now that `/pricing` has the $150/mo tier.

### Athena image-gen unblock for Argus
Resolved via option (c): Athena can pre-generate outreach demo PNGs using local SDXL Turbo MCP, and Argus's script skips non-`local-concept-renderer` PNGs so those demos are not overwritten.

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
- `/pricing` page has the Care Plan tier; keep attach-rate logic in the sales flow.
- `/discovery` and `/handoff` still need a Care Plan checkbox / pitch step.
- Validation kill criterion unchanged: 0 builds + <5% reply rate after 25+ sends. **But add:** "of first 4 paid builds, does 1+ attach to Care Plan?" If 0/4 attach, recurring model is unviable and pricing rethinks.
