# Contractor Lead Conversion System — Operating Logic Spec V1

## Objective
Define exactly how the service works in the real world after a contractor becomes a client.

This spec is about operations, not visual design.

It answers:
- what happens after a missed call
- what gets logged
- what the admin dashboard controls
- what the client sees
- what gets maintained month to month

---

# 1. Core Service Promise
We help contractors convert more of the leads they already pay for by instantly following up on missed calls, qualifying prospects, and helping book more estimates.

The service is a **conversion layer** on top of their existing lead sources.

Primary lead sources:
- Google Ads
- Local Services Ads
- website forms
- organic calls
- referrals
- third-party lead vendors

---

# 2. Core Workflow
## A. Incoming Call
1. Prospect calls the tracked business number.
2. System checks call outcome.

Possible outcomes:
- answered live
- missed
- after-hours
- voicemail reached
- abandoned quickly

### Rules
- If answered live: log the call and stop automation unless follow-up is specifically configured.
- If missed or after-hours: trigger automated SMS recovery flow.
- If caller hangs up before answer but call duration suggests intent: treat as missed lead and trigger recovery flow.

---

## B. Missed-Call Recovery Flow
### Trigger
A call is marked as missed / after-hours / not connected to a human.

### Immediate action
System sends text within 30–90 seconds.

### Default first text
"Hey, this is {{company_name}}. Sorry we missed your call. What can we help you with today?"

Optional trade-specific variation can be used later.

### If lead replies
System enters qualification flow.

### If no reply
Follow-up schedule:
- follow-up #1: 15–30 minutes later
- follow-up #2: next morning if after-hours
- optional final touch: 24 hours later

Do not spam beyond configured sequence.

---

## C. Qualification Flow
Goal: determine whether this is a real sales opportunity and route correctly.

## Core data to collect
- name
- service needed
- city / ZIP / service area
- urgency
- property type
- preferred timing
- booking intent

## Optional trade-specific data
Examples:
- HVAC: no cooling / no heat / replacement / maintenance
- roofing: leak / storm damage / full replacement
- plumbing: clog / leak / water heater / emergency
- insulation: attic / walls / new build / retrofit

## Qualification logic
### Qualified lead
Lead is in service area, requests supported service, and shows intent.

### Unqualified lead
Lead is outside service area, unsupported service, spam, vendor, recruiting, or non-buyer.

### High-priority lead
Emergency request, strong intent, high-ticket job indicators, or ready-to-book behavior.

---

# 3. Booking / Handoff Logic
## If client has booking link
- send booking link after qualification
- mark status as Booking Requested
- monitor for booked state if response confirms appointment

## If client books manually
- notify owner/office team with summarized lead details
- mark status as Awaiting Manual Follow-Up

## If lead wants callback
- send alert to client team
- include callback reason and urgency

## Goal
No hot lead should sit unnoticed.

---

# 4. Owner / Office Alerts
## When to alert
Alert client when:
- high-priority lead appears
- emergency lead appears
- lead asks for estimate / inspection
- lead requests callback
- booking intent is confirmed
- system detects manual follow-up required

## Alert contents
Each alert should include:
- lead name
- phone
- service requested
- city
- urgency
- summary of conversation
- current status
- recommended next step

## Alert channels
V1 channels:
- SMS
- email

Later options:
- Slack
- CRM task
- dispatch system

---

# 5. Lead Status Model
Each lead should move through a clear pipeline.

## Statuses
- New
- Contacted
- Qualified
- Unqualified
- Booking Requested
- Booked
- Awaiting Manual Follow-Up
- Closed Lost

## Status rules
- New: created but not engaged
- Contacted: automated text sent or reply received
- Qualified: service area + service type + buyer intent confirmed
- Unqualified: not a fit
- Booking Requested: booking link or appointment next-step sent
- Booked: appointment confirmed
- Awaiting Manual Follow-Up: human action needed
- Closed Lost: lead went cold or chose competitor / no fit / no response

---

# 6. What Gets Logged
Every lead record should store:
- lead ID
- client account
- source
- first contact timestamp
- call outcome
- phone number
- name if known
- service type
- trade
- city / service area
- urgency
- property type
- current status
- booking intent
- booked yes/no
- owner alerted yes/no
- full conversation history
- last action timestamp
- assigned notes

This creates the reporting layer.

---

# 7. Client Dashboard Logic
## What the client sees
The client dashboard is not the control center. It is the proof-of-value layer.

### Main things shown
- total leads
- missed calls
- recovered leads
- qualified leads
- booked estimates
- average response time
- recent conversations
- recent alerts
- source breakdown
- monthly scorecard

## Purpose
Help client understand:
- we are catching leads
- we are recovering missed opportunities
- money is not leaking as badly

---

# 8. Admin / Operator Dashboard Logic
## What the operator sees
Jason needs to see the whole business, not one account.

### Admin overview should show
- total clients
- active / paused / trial clients
- total system leads
- recovered leads
- booked estimates
- workflows needing attention
- onboarding tasks
- support issues
- billing state

### Per-client controls
Admin should be able to inspect and manage:
- business info
- service area
- services offered
- hours
- forwarding number
- alert recipients
- qualification questions
- bad lead rules
- follow-up timing
- booking handoff mode
- workflow health
- script version

### Admin actions
- pause workflow
- resume workflow
- edit messaging
- update service areas
- update hours
- change alert rules
- review conversations
- review scorecard data
- flag issues needing manual intervention

---

# 9. Onboarding Workflow
After a client says yes:

## Step 1: Payment and kickoff
- collect setup fee / first payment
- send intake form

## Step 2: Collect required inputs
Required:
- company name
- trade
- main phone line
- forwarding destination
- owner/manager contact
- alert email
- service area
- services offered
- office hours
- booking process
- qualification questions
- disqualifier rules

## Step 3: Setup
- provision tracked number
- connect forwarding
- create SMS flows
- create alert flows
- set qualification logic
- create dashboard account

## Step 4: Testing
Test scenarios:
- answered call
- missed call
- after-hours call
- qualified lead reply
- unqualified lead reply
- booking request
- owner alert delivery

## Step 5: Go live
- enable production workflows
- monitor closely first 3–7 days

---

# 10. Month-to-Month Service Work
This is why the client keeps paying.

## Monthly recurring work
- monitor workflow health
- review missed-call recovery rates
- review qualification performance
- fix script issues
- improve follow-up logic
- review bad lead leakage
- update services/hours/areas if needed
- send monthly scorecard
- handle client support requests

## Periodic optimization opportunities
- tighten source attribution
- improve response timing
- adjust qualification questions by trade
- identify high-value lead patterns
- identify common lost-lead points

---

# 11. What the Client Pays For Each Month
They are not paying only for software access.

They are paying for:
- missed lead recovery
- conversion system maintenance
- workflow optimization
- reporting
- lead visibility
- faster response coverage
- better handling of paid lead spend

---

# 12. Human vs System Responsibilities
## System handles
- missed-call detection
- first-response SMS
- qualification prompts
- logging
- routing / alerting
- dashboard updates
- scorecard data aggregation

## Operator handles
- onboarding setup
- rule changes
- script improvements
- exception handling
- client communication
- reporting review
- monthly optimization

## Client handles
- answering live calls when able
- following up on escalated/hot leads
- confirming booked jobs when needed
- providing business rule updates

---

# 13. Failure / Edge Cases
Need clear fallback handling.

## Cases to handle
- caller does not reply
- caller gives unclear answer
- spam / telemarketer
- outside service area
- emergency request after hours
- duplicate lead
- existing customer service issue
- vendor/recruiting calls

## Fallback rule
If automation is uncertain, route to human follow-up instead of pretending confidence.

---

# 14. V1 Fulfillment Stack
Recommended V1 operations stack:
- Twilio for phone/SMS
- n8n for workflow automation
- dashboard app for client/admin visibility
- simple datastore / sheet / database for lead logging
- optional booking links

Avoid in V1:
- replacing the client CRM
- voice AI complexity first
- deep dispatch integrations first
- custom app installs

---

# 15. Success Metrics
Track these first:
- missed calls
- recovery rate
- response time
- qualified lead rate
- booking request rate
- booked estimate count
- manual follow-up count
- source-level performance

These are the metrics that justify the service.

---

# 16. Immediate Next Build Spec
After this document, next product spec should define:
1. exact onboarding intake form
2. exact default SMS scripts
3. qualification trees by trade
4. admin controls required in V1 backend
5. monthly scorecard template
