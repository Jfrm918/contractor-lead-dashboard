# Green Country scoring engine — scripts/

## What this is

A Node-only, heuristic scoring engine that turns a business URL into a "how badly does this site need a rebuild" score, per the rubric on `/pipeline`. Argus calls this from his twice-daily scrape job; the highest scorers go to the Telegram digest.

## Files

- `score-site.mjs` — the engine. One URL → JSON score breakdown.
- `generate-demo-screenshot.mjs` — Madison outreach demo generator. Prospect → PNG concept mock + state entry.
- `greencountry-followups.mjs` — Day 7 / Day 14 cadence checker and state updater for Madison replies.
- `greencountry-triage-reply.mjs` — reply classifier + outreach state updater for hot/cold responses.

## CLI

```bash
# single URL → pretty JSON
node score-site.mjs https://example.com

# batch mode: one URL per line → JSON Lines on stdout
node score-site.mjs --batch /path/to/urls.txt > scored.jsonl

# single prospect → demos/<slug>.png + ~/.hermes/state/greencountry-demo-screenshots.json
node generate-demo-screenshot.mjs \
  --name "VR Electric" \
  --trade "Electrical Contractor" \
  --city Tulsa \
  --url http://www.vrelectrictulsa.com/

# batch prospects: JSON array or JSONL with name/trade/city/url or website fields
node generate-demo-screenshot.mjs --batch /path/to/prospects.json --limit 5

# follow-up scan → prints Madison/Jason due list
node greencountry-followups.mjs due

# record Day 0 after Madison sends an initial email
node greencountry-followups.mjs add \
  --name "VR Electric" \
  --url http://www.vrelectrictulsa.com/ \
  --trade "Electrical Contractor"

# close the loop after a follow-up is sent/skipped/replied
node greencountry-followups.mjs sent --id <prospect_id> --stage day7
node greencountry-followups.mjs skip --id <prospect_id> --reason "bad fit"
node greencountry-followups.mjs reply --id <prospect_id> --status live

# triage a prospect reply and update outreach status
node greencountry-triage-reply.mjs \
  --name "VR Electric" \
  --text "Sounds good, send me pricing and a time to talk."
```

## Rubric (mirrors `/pipeline` page)

| Signal | Points | What triggers it |
|---|---|---|
| `mobile_broken` | 30 | No viewport meta, or viewport without `width=` |
| `no_ssl` | 20 | Final URL after redirects is `http://` |
| `old_design` | 15 | Copyright year ≤ currentYear − 2 |
| `no_cta` | 15 | No `tel:`, `mailto:`, visible phone number, `<form>`, or email input anywhere on page |
| `slow_load` | 10 | Single GET took > 5000ms |
| `stock_photo` | 10 | 3+ images from known stock-photo CDNs (Unsplash, Shutterstock, iStock, Getty, Pexels, Pixabay, Adobe Stock, Depositphotos) |

Max score: 100. Higher = better rebuild candidate.

## Argus integration

Argus's job is to feed URLs in and surface the top scorers. Suggested call shape:

```bash
# In Argus's scan loop
node ~/.openclaw/workspace/marquee-studio/scripts/score-site.mjs --batch scraped.txt > scored.jsonl

# Then sort by score, take top 5, format for Telegram digest
jq -s 'sort_by(-.score) | .[:5]' scored.jsonl
```

## Validation findings (2026-05-11, Athena)

Ran against 55 Tulsa-area trade businesses from `tulsa_lrp_prospects_clean.json`:

- 51/55 fetched successfully (4 timeouts / DNS failures)
- **39/51 scored 0-9** (passed every signal)
- **8/51 scored 30 from `mobile_broken` alone**
- Top prospect: VR Electric @ 65 (no_ssl + mobile_broken + no_cta)

**Gap identified:** The rubric undercounts "looks dated visually" — Squarespace/Wix templates from 2014 pass all six checks but are obvious rebuild candidates by sight. Recommended addition:

- **`looks_dated` (+15)** — second-pass AI vision call on top 20 candidates. Cheap (~$0.002 each via Haiku) and would lift the discrimination dramatically in the 0-30 range where most prospects cluster.

Status: ship current rubric as v0, add `looks_dated` after Jason's call on vision-API budget.
