# Contractor Lead Conversion System — Client Onboarding Spec V1

## Objective
Define the exact onboarding process for new contractor clients.

This spec covers:
- what information the client must provide
- what Jason/operator must configure
- how testing works before go-live
- what “ready to launch” means

The goal is to make onboarding:
- fast
- repeatable
- low-friction
- easy to manage
- easy to audit

---

# 1. Onboarding Outcome
By the end of onboarding, the client should have:
- a tracked number configured
- missed-call recovery active
- qualification flow configured
- owner alerts configured
- dashboard access ready
- testing completed
- live status approved

---

# 2. Onboarding Stages
## Stage 1: Closed / Welcome
Triggered when client accepts the offer and pays setup or first invoice.

### Operator actions
- mark client as Closed Won
- create client record in admin system
- send welcome message
- send intake form
- schedule kickoff if needed

### Deliverables to client
- welcome message
- onboarding form
- explanation of what is needed
- estimated launch timeline

---

## Stage 2: Intake Collection
Collect all required business and workflow inputs.

## Required client inputs
### A. Business identity
- company name
- owner / primary contact name
- email
- phone
- business address
- website URL
- trade / business type

### B. Core routing info
- main business line
- forwarding destination number
- after-hours destination if different
- best alert recipient mobile number
- best alert recipient email

### C. Service coverage
- service area cities
- ZIP codes if relevant
- areas excluded
- emergency service area rules if any

### D. Services offered
- primary services
- secondary services
- services not offered
- emergency services offered yes/no
- financing offered yes/no (optional)

### E. Hours and availability
- office hours
- after-hours rules
- weekend rules
- holiday rules if known

### F. Lead handling rules
- who should receive hot lead alerts
- callback expectations
- whether booking link exists
- whether office books manually
- maximum response expectations

### G. Qualification settings
- top qualification questions
- bad lead / disqualifier rules
- unsupported job types
- minimum job size if applicable
- preferred high-value lead indicators

### H. Branding / message tone
- preferred company name in messages
- tone preference (straight, friendly, premium, etc.)
- words to avoid
- any compliance or wording restrictions

---

# 3. Intake Form Structure
## Section 1 — Company Basics
Fields:
- Company name
- Primary contact
- Contact email
- Contact mobile
- Website
- Trade
- City / state

## Section 2 — Phone & Alert Setup
Fields:
- Main business line
- Forwarding number
- After-hours routing number
- Alert SMS recipient(s)
- Alert email recipient(s)

## Section 3 — Service Area
Fields:
- Cities served
- ZIP codes served (optional)
- Areas not served
- Emergency-service coverage notes

## Section 4 — Services Offered
Fields:
- Main services
- Services not offered
- Emergency services yes/no
- Minimum project rules if any

## Section 5 — Scheduling / Booking
Fields:
- Do you use a booking link?
- Booking URL if yes
- If no, who follows up manually?
- Preferred callback window
- Who handles appointment setting?

## Section 6 — Lead Qualification Rules
Fields:
- Top questions you want asked
- What makes a lead qualified?
- What should be considered junk / disqualified?
- What should be treated as urgent?
- What should trigger immediate owner alert?

## Section 7 — Messaging Preferences
Fields:
- Preferred business name in text
- Message tone
- Any wording to avoid
- Anything important we should know before texting leads?

## Section 8 — Final Confirmation
Fields:
- best person for approvals
- approval that provided info is accurate
- approval to proceed with setup once configured

---

# 4. Internal Operator Checklist
Once intake is received, operator completes:

## Account setup checklist
- create client account
- assign client ID
- assign trade
- assign service area profile
- assign status (onboarding)

## Communication setup checklist
- provision tracked number
- verify forwarding destination
- configure alert recipients
- configure after-hours behavior

## Workflow setup checklist
- create missed-call trigger
- create SMS first response
- create follow-up sequence
- create qualification flow
- create escalation rules
- create booking/callback logic
- create spam/disqualifier handling

## Dashboard checklist
- create client dashboard access
- map client-facing metrics
- create initial seeded/live account state

---

# 5. Testing Checklist
Before going live, run controlled tests.

## Call flow tests
- answered call test
- missed call test
- after-hours missed call test
- short abandoned call test

## SMS flow tests
- immediate response fires
- no-reply follow-up fires
- qualification logic works
- out-of-area disqualifier works
- urgent lead escalation works

## Alert tests
- high-priority SMS alert delivered
- email alert delivered
- summary content readable and correct

## Booking / handoff tests
- booking link sends correctly
- manual callback alert is routed correctly
- lead status updates correctly

## Dashboard tests
- lead appears in dashboard
- status updates correctly
- alert appears in activity
- scorecard metrics increment correctly

---

# 6. Launch Readiness Criteria
Client is ready to go live only when:
- required intake is complete
- tracked number is active
- forwarding works
- missed-call text fires correctly
- qualification flow passes basic test
- alerts are working
- dashboard access is ready
- client has approved messaging/tone

If any of those fail, do not mark live.

---

# 7. Go-Live Procedure
## Step 1
Confirm all tests passed.

## Step 2
Switch client status to Live.

## Step 3
Notify client launch is active.

## Step 4
Monitor closely for first 3–7 days.

## Step 5
Fix any:
- routing issues
- bad wording
- wrong qualification logic
- alert noise
- missed edge cases

---

# 8. First-Week Monitoring Checklist
During first week, review:
- total inbound calls
- missed-call rate
- text response rate
- qualified leads generated
- urgent alerts accuracy
- junk lead handling
- booking/callback routing accuracy

This is where fast improvements happen.

---

# 9. Admin Status Model for Onboarding
Each client should have onboarding stages visible in admin.

Suggested statuses:
- Closed Won
- Intake Sent
- Intake Partial
- Intake Complete
- Setup In Progress
- Testing
- Ready for Approval
- Live
- Needs Fix

This prevents confusion.

---

# 10. What the Client Should Experience
The client experience should feel simple.

They should feel like:
- setup was easy
- they were not overloaded with technical questions
- they know what is happening
- they know when launch happens
- they can trust the system after launch

So onboarding communication should stay short and clear.

---

# 11. Recommended Client Welcome Message
"Thanks for getting started with us. We’re going to set up your lead recovery system so missed calls and inbound leads get handled faster and more consistently. The next step is a short intake form so we can configure your service area, lead rules, alerts, and booking flow. Once that’s in, we’ll build, test, and launch it."

---

# 12. Recommended Operator SLA
For early-stage service, target:
- intake review within 1 business day
- setup after complete intake within 2–5 business days
- testing same day as setup completion when possible
- fixes within 1 business day for critical issues

---

# 13. What Not to Ask Up Front
Do not overload the client with unnecessary questions early.

Avoid asking for:
- deep CRM details
- every internal process they have
- giant SOP exports
- unnecessary ad-account access
- irrelevant technical details

Only collect what is needed to launch V1.

---

# 14. Immediate Next Spec After This
Best next documents:
1. monthly scorecard template
2. admin settings schema
3. Twilio + n8n workflow map
4. sales offer / pilot packaging
