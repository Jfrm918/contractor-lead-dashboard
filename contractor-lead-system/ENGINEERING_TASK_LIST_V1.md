# Contractor Lead Conversion System — Engineering Task List V1

## Objective
Turn the backend implementation plan into exact build tasks.

This is the execution checklist for building the first real working version.

---

# Phase 1 — Project Foundation
## Goal
Prepare the app to support real backend work.

### Tasks
- [ ] choose final backend runtime approach inside current Next.js app
- [ ] create environment variable structure
- [ ] add server-side config validation
- [ ] add database connection layer
- [ ] add shared types folder for core entities
- [ ] define basic error/response helpers for API routes
- [ ] add protected admin/client auth placeholder strategy for V1

### Deliverable
The app can safely support backend code and secrets.

---

# Phase 2 — Database Setup
## Goal
Stand up the real data layer.

### Tasks
- [ ] provision Postgres database
- [ ] choose ORM/query layer
- [ ] create schema for clients
- [ ] create schema for client_settings
- [ ] create schema for leads
- [ ] create schema for lead_events
- [ ] create schema for messages
- [ ] create schema for alerts
- [ ] create schema for onboarding_checklists
- [ ] create schema for scorecards
- [ ] create schema for scorecard_metrics
- [ ] create schema for admin_tasks
- [ ] create schema for audit_logs
- [ ] add indexes from database spec
- [ ] run first migration
- [ ] seed initial sample clients and leads

### Deliverable
The database is live and seeded.

---

# Phase 3 — Core API Skeleton
## Goal
Create the app endpoints needed for live data.

### Tasks
- [ ] create `/api/clients`
- [ ] create `/api/clients/:clientId`
- [ ] create `/api/clients/:clientId/settings`
- [ ] create `/api/leads`
- [ ] create `/api/leads/:leadId`
- [ ] create `/api/leads/:leadId/events`
- [ ] create `/api/leads/:leadId/messages`
- [ ] create `/api/clients/:clientId/alerts`
- [ ] create `/api/clients/:clientId/onboarding`
- [ ] create `/api/clients/:clientId/scorecards`
- [ ] create `/api/dashboard/admin/summary`
- [ ] create `/api/dashboard/client/:clientId/summary`
- [ ] standardize success/error JSON responses

### Deliverable
The app can read and write real data through stable endpoints.

---

# Phase 4 — Admin Settings Management
## Goal
Make one client fully configurable.

### Tasks
- [ ] build settings read/write service
- [ ] create admin settings form sections:
  - [ ] business profile
  - [ ] routing
  - [ ] alerts
  - [ ] service areas
  - [ ] services offered
  - [ ] qualification rules
  - [ ] SMS templates
  - [ ] booking mode
  - [ ] workflow toggles
- [ ] persist settings to database
- [ ] add validation rules for required settings
- [ ] add audit log entry on settings changes

### Deliverable
You can configure a real client without code edits.

---

# Phase 5 — Twilio Integration Setup
## Goal
Connect real phone and SMS events.

### Tasks
- [ ] create Twilio account config checklist
- [ ] add env vars for Twilio credentials
- [ ] build `/api/webhooks/twilio/call`
- [ ] build `/api/webhooks/twilio/sms`
- [ ] validate incoming webhook authenticity if feasible
- [ ] map tracked number to client account
- [ ] log inbound call event
- [ ] log inbound SMS event

### Deliverable
The system receives real Twilio events.

---

# Phase 6 — Lead Creation + Call Outcome Logic
## Goal
Create leads from inbound calls and decide what happened.

### Tasks
- [ ] create lead on first inbound call if no active matching lead exists
- [ ] save call_sid and source fields
- [ ] classify call outcome as:
  - [ ] answered
  - [ ] missed
  - [ ] after-hours
  - [ ] abandoned
- [ ] write lead_events for each call outcome
- [ ] set initial lead status and timestamps
- [ ] prevent obvious duplicate lead creation

### Deliverable
The system knows who called and whether recovery should start.

---

# Phase 7 — Missed-Call SMS Recovery
## Goal
Deliver the first real product promise.

### Tasks
- [ ] create missed-call recovery trigger service
- [ ] send SMS #1 after configured delay
- [ ] log outbound message
- [ ] send follow-up #1 if no reply
- [ ] send follow-up #2 if configured
- [ ] update lead status to contacted
- [ ] write related lead_events
- [ ] add guardrails to avoid spammy duplicate sends

### Deliverable
Missed call -> automatic text back works.

---

# Phase 8 — Inbound SMS Reply Handling
## Goal
Capture lead replies and continue the flow.

### Tasks
- [ ] match inbound SMS to open lead
- [ ] save inbound message to messages table
- [ ] update last activity timestamps
- [ ] detect callback request shortcut
- [ ] detect emergency/high-priority keywords
- [ ] pass message into qualification engine

### Deliverable
Replies are captured and attached to the correct lead.

---

# Phase 9 — Qualification Engine
## Goal
Turn SMS replies into structured lead data.

### Tasks
- [ ] create qualification state machine
- [ ] ask next missing question only
- [ ] store service type
- [ ] store city / ZIP
- [ ] store urgency
- [ ] store booking intent
- [ ] support trade-specific question branch
- [ ] classify lead as:
  - [ ] qualified
  - [ ] unqualified
  - [ ] high-priority
  - [ ] manual follow-up required
- [ ] write lead_events on each important state change

### Deliverable
The system can qualify a lead instead of just texting blindly.

---

# Phase 10 — Alerts + Handoff
## Goal
Notify the business when a real lead needs attention.

### Tasks
- [ ] build alert dispatch service
- [ ] send SMS alerts to owner/team
- [ ] send email alerts if enabled
- [ ] trigger alerts for:
  - [ ] emergency lead
  - [ ] high-priority lead
  - [ ] booking request
  - [ ] callback request
  - [ ] manual follow-up needed
- [ ] log alert delivery results
- [ ] mark owner_alerted_flag on lead

### Deliverable
Hot leads reach the contractor fast.

---

# Phase 11 — Dashboard Live Data Wiring
## Goal
Replace demo data with real records.

### Tasks
- [ ] wire admin summary cards to API
- [ ] wire client summary cards to API
- [ ] wire lead inbox to live leads data
- [ ] wire lead detail view to live messages/events/alerts
- [ ] wire recent activity feed to lead_events
- [ ] wire alerts page to alerts table
- [ ] wire onboarding/admin task widgets to database
- [ ] wire build log section to real docs metadata later if desired

### Deliverable
The dashboard becomes a real operating interface.

---

# Phase 12 — Onboarding Support
## Goal
Support repeatable client launches.

### Tasks
- [ ] create onboarding checklist CRUD
- [ ] create onboarding stage updater
- [ ] create launch-readiness validation
- [ ] show onboarding progress in admin view
- [ ] support intake-complete / testing-complete / live transitions

### Deliverable
Client onboarding becomes trackable and repeatable.

---

# Phase 13 — Scorecard Engine
## Goal
Generate monthly proof of value.

### Tasks
- [ ] calculate total inbound leads
- [ ] calculate missed calls
- [ ] calculate recovered missed calls
- [ ] calculate qualified leads
- [ ] calculate booking requests
- [ ] calculate booked estimates
- [ ] calculate response time
- [ ] generate source breakdown
- [ ] save scorecard record + metrics
- [ ] surface scorecard in client dashboard/admin view

### Deliverable
You can show monthly results with real data.

---

# Phase 14 — Pilot Readiness
## Goal
Make the system usable for one real client.

### Tasks
- [ ] create one real client settings profile
- [ ] connect one real tracked number
- [ ] run answered-call test
- [ ] run missed-call test
- [ ] run after-hours test
- [ ] run inbound SMS qualification test
- [ ] run alert delivery test
- [ ] confirm dashboard reflects live test data
- [ ] fix bugs found during test pass

### Deliverable
The first live pilot is possible.

---

# Priority Order
## Build first
1. database
2. core API
3. admin settings
4. Twilio call webhook
5. missed-call SMS
6. inbound SMS handling
7. qualification engine
8. alerts
9. dashboard live wiring

That is the shortest path to value.

---

# What to Ignore Until Later
- advanced user roles
- AI voice calls
- CRM integrations
- complex billing automation
- advanced analytics
- native app
- full multi-user client portal logic

These are distraction risks right now.

---

# Best Next Immediate Action
Start implementation with these 3 tickets first:
1. database setup + schema
2. client settings persistence
3. Twilio inbound call webhook

That gets us closest to a real working system fast.
