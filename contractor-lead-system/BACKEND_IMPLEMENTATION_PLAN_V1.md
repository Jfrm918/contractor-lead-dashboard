# Contractor Lead Conversion System — Backend Implementation Plan V1

## Objective
Define the practical build order for turning the contractor lead conversion system into a real working product.

This plan is about execution order.

The goal is to build the **smallest real version** that can:
- handle missed calls
- text the lead back
- qualify the lead
- alert the business
- log the data
- show the result in the dashboard

Anything beyond that is secondary.

---

# 1. Plain-English Goal
We are no longer asking:
- what should the product be?

We are now asking:
- what do we build first so this actually works?

That means we prioritize:
- speed
- usefulness
- reliability
- low complexity

---

# 2. Build Philosophy
## Do first
- the parts that make the system real
- the parts that prove value fast
- the parts that support one live pilot client

## Do not do first
- overbuilt AI features
- deep CRM integrations
- voice AI
- complicated analytics
- custom mobile app
- fancy enterprise permissions

V1 should be a **working lead recovery machine**, not a giant software project.

---

# 3. Phase 1 — Data Backbone
## Goal
Create the minimum data layer so leads, messages, alerts, and clients can exist.

## Build in this phase
- database setup (Postgres)
- core tables/entities:
  - clients
  - client_settings
  - leads
  - lead_events
  - messages
  - alerts
  - onboarding_checklists
- base seed data for dev

## Outcome
The system can store real data.

## Why first
Without storage, nothing else matters.

---

# 4. Phase 2 — Admin Settings Foundation
## Goal
Make client accounts configurable.

## Build in this phase
- admin settings forms / storage for:
  - company info
  - tracked number
  - forwarding number
  - alert recipients
  - service areas
  - services offered
  - qualification rules
  - SMS templates
  - booking mode
  - workflow toggles
- save/load settings via backend endpoints

## Outcome
You can configure one real client instead of hardcoding everything.

---

# 5. Phase 3 — Twilio Call Intake
## Goal
Catch real inbound calls and decide what happened.

## Build in this phase
- Twilio number configuration
- inbound call webhook endpoint
- call event logging
- answered vs missed logic
- lead creation from inbound call
- client matching by tracked number

## Outcome
The system knows when a lead called and whether the call was missed.

## This is the first real signal.

---

# 6. Phase 4 — Missed-Call SMS Recovery
## Goal
Actually recover missed leads.

## Build in this phase
- SMS send logic through Twilio
- initial missed-call response
- delayed follow-up #1
- optional follow-up #2
- outbound message logging

## Outcome
The system performs the core promise:
**missed call -> automatic text back**

## This is the most important phase.

---

# 7. Phase 5 — Inbound SMS Processing + Qualification
## Goal
Turn replies into structured leads.

## Build in this phase
- inbound Twilio SMS webhook
- message matching to open lead
- qualification state machine
- save service type, city, urgency, intent
- qualified/unqualified logic
- high-priority flag logic

## Outcome
The system can hold a basic qualification conversation and classify the lead.

---

# 8. Phase 6 — Owner Alerts + Manual Handoff
## Goal
Make sure hot leads reach the business.

## Build in this phase
- alert dispatch via SMS/email
- high-priority triggers
- callback-request triggers
- booking-request triggers
- alert log storage

## Outcome
The contractor is notified when a real lead needs attention.

---

# 9. Phase 7 — Live Dashboard Wiring
## Goal
Replace fake demo data with real data.

## Build in this phase
- client dashboard summary endpoint
- admin dashboard summary endpoint
- lead list from database
- conversation view from messages table
- alerts panel from alerts table
- activity feed from lead_events

## Outcome
The UI stops being just a demo and becomes a real operating dashboard.

---

# 10. Phase 8 — Onboarding Workflow Support
## Goal
Support repeatable client launches.

## Build in this phase
- onboarding checklist data
- onboarding status tracking in admin
- client launch readiness checks
- intake data persistence

## Outcome
You can onboard clients systematically.

---

# 11. Phase 9 — Monthly Scorecard Engine
## Goal
Support retention and reporting.

## Build in this phase
- scorecard metric calculation jobs
- saved reporting periods
- executive summary fields
- scorecard UI wiring

## Outcome
You can show monthly proof of work and value.

---

# 12. Recommended First Live Pilot Scope
Do not launch with everything.

## Best first real pilot includes only:
- one client
- one tracked number
- missed-call detection
- initial text back
- basic qualification questions
- hot lead alerts
- admin/client dashboard visibility

That is enough to prove value.

---

# 13. Fastest Path to a Working Version
If speed matters most, build in this exact order:
1. Postgres data model
2. client settings save/load
3. Twilio inbound call webhook
4. lead creation + event logging
5. missed-call SMS #1
6. inbound SMS reply capture
7. basic qualification logic
8. hot lead alerting
9. dashboard reads from live data

This is the shortest path to something real.

---

# 14. What Can Wait Until Later
These are not V1-critical:
- multi-user roles/permissions depth
- voice AI receptionist
- deep CRM sync
- automatic revenue attribution
- advanced analytics
- native app
- complicated billing automation
- multi-language support

These can waste months if done too early.

---

# 15. Technical Delivery Recommendation
## Best backend shape
- Next.js app for dashboard/UI
- Postgres for data
- API routes / backend services for app logic
- Twilio for calls/SMS
- n8n for orchestration and delayed workflow handling

## Why this shape
- fast to ship
- practical
- low cost
- easy to reason about
- enough for pilots

---

# 16. First Build Milestone Definition
## Milestone 1: “Missed Call Recovery Works”
You should consider the first real milestone complete when:
- a tracked call comes in
- system logs the lead
- missed call is detected
- text is sent automatically
- lead reply is captured
- lead appears in dashboard
- urgent lead can trigger alert

If that works, you have a real product beginning.

---

# 17. Resource / Time Reality
The risky path is trying to build the full company in one swing.

The smarter path is:
- get one workflow live
- prove it works
- tighten it
- then expand

That saves money and reduces stupid mistakes.

---

# 18. Best Next Build Artifact After This
The best next thing to create is:
**an actual phase-by-phase engineering task list**

Plain English:
- concrete tickets
- exact deliverables
- in build order
- so Claude/Codex can start implementation without guessing
