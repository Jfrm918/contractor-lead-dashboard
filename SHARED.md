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

- **[2026-05-10 21:50] Athena working on marquee-studio:hub build — eta tonight.** New project at `~/.openclaw/workspace/marquee-studio/`. Internal hub for Marquee Studio (local web design freelance, Tulsa-area trades, Webflow handoff model). Liquid-glass design, 8 pages (overview/pricing/process/roles/discovery/contract/handoff/pipeline). Not deployed yet — pending Jason's OK.

---

## 4. Recent decisions (last 10, newest first — older roll off)

- 2026-05-11 19:05 — **Apex prod deployed + foam-dial-pro lint 11→0 (uncommitted).** Apex commit `41a4736` pushed to GitHub; `vercel --prod` produced `apexdata-99y2p2wnl-jfrm918s-projects.vercel.app` (Ready 40s). foam-dial-pro lint cleared on disk but **NOT committed** — project source has never been tracked in the workspace repo; pending Jason's decision.
- 2026-05-11 11:55 — **Athena cleaned contractor-lead-system/app lint 166→0.** Categories: 136 `react/no-unescaped-entities` (scripted via positional ESLint JSON output), 14 unused imports/vars (mechanical), 1 `require()` → top-level import in `twilio-verify.ts`, 5 `prefer-const` (auto-fix), 10 `react-hooks/set-state-in-effect` disabled per-line with intent comments (SSR-safe localStorage hydration, hover/motion media-query feature detection, demo-URL routing, polling fetch). No logic changed.
- 2026-05-10 22:18 — **Marquee Studio renamed to Green Country Web Co.** (regional brand — "Green Country" is NE Oklahoma's nickname). Tier names also renamed: Marquee/Marquee+ → Main Street/Main Street+. Hub repo path still `marquee-studio/` (folder rename deferred). All page copy + nav + contract + memory updated.
- 2026-05-10 21:50 — **NEW PROJECT: Green Country Web Co.** (originally named Marquee). Jason's 4th income stream alongside FoamDial, Vantage/Apex, Kalshi. Side-income freelance web design for Tulsa-area local businesses. **Argus role:** twice-daily scrape of local biz directories (Yelp, Maps, BBB) → site-quality scoring (mobile + desktop) → top 5 candidates per scan to Telegram. **Madison:** outreach voice + cadence. **Jason:** closes. **Athena:** builds in Webflow + handoff. Pricing $1.5K-$3.5K one-time. Clean walk-away (client owns domain/host/email). **ARGUS — REVIEW REQUESTED:** see `marquee-studio/` hub + section 7 below for what we want from you.
- 2026-05-10 21:55 — **Jason un-paused FoamDial Job Sites.** Reversing the 21:25 pause. Still confirming with him whether to resume work tonight or just remove from parked list.
- 2026-05-10 21:24 — **Athena improved Kalshi alert readability** (`9cf4b7b`): Argus alerts/digests now show Kalshi-style % first with cents in parentheses, e.g. `23% (23¢)`.
- 2026-05-10 21:20 — **Argus cleared his active WIP claim.** Kalshi C0→C2 is committed; remaining A3/A4 weekly retro + C4 ack-rate auto-tune are queued for tomorrow/cap reset, not active tonight. `~/.hermes/cron/jobs.json` has scheduler timestamp drift only.
- 2026-05-10 21:17 — **Argus shipped Kalshi C2 work-hours digest mode** (`648d62f`): Mon-Fri 7-17 CT candidates queue to `kalshi-pending-digest.json`; end-hour digest emits top remaining, journals emitted items, dry-run no-write verified.
- 2026-05-10 21:17 — **Argus hit 5 `[argus auto]` commits/24h cap** in `~/.hermes`; defer A3/A4 weekly retro + C4 ack-rate auto-tune until cap resets or Jason explicitly overrides.
- 2026-05-10 21:05 — **Argus shipped Kalshi C1-C3 config+ack sweep** (`50df263`): defaults include work-hours/ack knobs; `kalshi-ack-sweep.py` runs every 30m no-agent.

---

## 5. Open issues / known bugs (lowest-effort first)

- **[2026-05-11 19:05] foam-dial-pro lint CLEAN (uncommitted).** Athena cleared all 11 warnings on disk (3 unused disable directives auto-fixed, 4 unused imports/vars, 1 useMemo dep removed, 3 `<img>` disabled per-line for user-uploaded photos). Build + typecheck + lint pass. **NOT COMMITTED** — foam-dial-pro source is not tracked in the workspace repo; awaiting Jason's decision whether to import the project into the monorepo.
- **[2026-05-11 11:55] contractor-lead-system/app lint CLEAN.** Athena cleared all 166 problems (136 unescaped entities scripted, 14 unused imports/vars, 1 require()→import, 10 set-state-in-effect disabled per-line with intent comments). Build + typecheck still pass.

---

## 6. Hard rules both agents follow

- Argus may make local `[argus auto]` commits only for Rung 2 safe categories; never `git push` or `vercel --prod`. Athena may deploy/push with explicit Jason OK.
- Never modify the database schema (`prisma db push` / `migrate deploy`) without Jason's explicit per-change approval.
- Never touch `.env` files.
- If you discover the OTHER agent has work-in-flight on the same file, defer or coordinate — never silently double-handle.
- When you update this file, mention it in your reply to Jason ("Updated SHARED.md with X") so he knows the source of truth changed.

---

## 7. Marquee Studio — ARGUS REVIEW REQUEST (Athena, 2026-05-10 21:50)

**The ask:** I built the v0.1 internal hub at `~/.openclaw/workspace/marquee-studio/` (Next.js 16, Tailwind v4, liquid-glass design, 8 pages). Before Jason deploys it, would value your read on the operational/prospecting side — that's your lane.

**Specifically:**
1. **Prospecting source mix.** Hub assumes Yelp + Google Maps + BBB scrapes. Anything I'm missing for Tulsa-area trades/restaurants/services? (Nextdoor business listings? Chamber of commerce? County business license public data?)
2. **Site-quality scoring rubric** (see `/pipeline` page). I proposed weights for mobile-broken (+30), no-SSL (+20), old-design (+15), no-CTA (+15), slow-load (+10), stock-photo overload (+10). You've built more scoring rubrics than I have — push back if these weights are off or if I'm missing a signal.
3. **Cadence.** Twice-daily Argus scan, top 5 per scan. That's 70/week — far more than Madison can outreach (target: 25 sends/wk). Should I drop to once-daily, or keep 2× and let Madison cherry-pick?
4. **Validation phase metrics.** I set: 30-day window, kill if 0 builds + reply rate <5% on 25+ sends. Fair? Or too aggressive / too lenient?
5. **Demo mock automation.** I want a v2 where Argus generates an AI-rebuilt static screenshot of the prospect's site BEFORE outreach goes out. Feasible in your stack? Or is that better as an Athena-side Webflow + Playwright job?

**Not asking you to write anything tonight** — drop thoughts in section 4 (Recent decisions) when you have cycles. No urgency, this is validation-phase not build-now.

**Files to skim:** `marquee-studio/src/app/pipeline/page.tsx` (scoring + validation), `marquee-studio/src/app/roles/page.tsx` (your role spec). Hub will run at localhost:3000 once Athena boots dev; not deployed.
