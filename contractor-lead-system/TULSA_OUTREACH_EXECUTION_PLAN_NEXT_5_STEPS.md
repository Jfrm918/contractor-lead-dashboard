# Tulsa Outreach Execution — Next 5 Steps

## 1. Real target list built
Files:
- `TULSA_OUTREACH_TARGETS_V1.csv`
- `TULSA_OUTREACH_TRACKER_V1.csv`

What is in it now:
- 35 call-ready targets with phone numbers loaded
- 12 additional named companies loaded with missing phones to enrich later
- trades covered:
  - HVAC
  - plumbing
  - roofing
  - electrical
  - insulation
  - garage door

## 2. Working tracker built
The tracker is ready for daily use.

Recommended daily workflow:
1. call 10 companies
2. log outcome immediately
3. send same-day email follow-up to any warm contact
4. mark follow-up date before stopping
5. review booked demos weekly

## 3. Admin dashboard sync list
Next sales assets to push into the app admin area:
- objection handling sheet
- one-page proposal
- post-demo follow-up email
- client intake form copy
- follow-up call script
- first target list / tracker view

## 4. Backend tightening checklist
Next backend tasks after outreach push:
- connect live Postgres env
- run Prisma migrations against live DB
- harden settings auth on `/api/clients/[clientId]/settings`
- validate Twilio signatures on webhook route
- persist inbound calls/messages into live tables
- replace demo fallbacks on dashboard screens with real query paths

## 5. Pilot-ready outreach flow
Recommended first niche:
- HVAC

Recommended first sequence:
1. call owner or office
2. use missed-call conversion opener
3. if interest exists, book 15-minute demo
4. send one-page proposal after demo
5. offer pilot at `$500 setup + $500/month`

## Best immediate move
Start with the first 10 HVAC names in the tracker.
Why:
- highest pain around missed calls
- strong phone dependence
- easier to explain ROI fast

## Sourcing note
This list was assembled from:
- Today's Homeowner Tulsa HVAC roundup
- Discover Tulsa HVAC and plumber roundups
- DuckDuckGo local company search results
- direct company website checks where reachable

Use this as a working prospecting list, not a perfect master database.
The next pass should enrich owner names and emails only after first call attempts prove the niche is responding.
