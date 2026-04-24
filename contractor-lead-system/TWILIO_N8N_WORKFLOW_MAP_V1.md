# Contractor Lead Conversion System — Twilio + n8n Workflow Map V1

## Objective
Map the actual workflow logic needed to run the service using Twilio for phone/SMS and n8n for orchestration.

This is the first implementation blueprint.

---

# 1. Core Stack Roles
## Twilio handles
- tracked phone number
- inbound call events
- call status events
- SMS send/receive
- optional voicemail/call recording events

## n8n handles
- workflow orchestration
- rules and branching
- lead record creation/update
- qualification state
- alert routing
- follow-up timing
- dashboard data updates
- scorecard data preparation

---

# 2. Main Workflow: Missed Call Recovery
## Trigger source
Twilio inbound call webhook or call status event.

## Step flow
1. Inbound call hits tracked number.
2. Twilio forwards call based on configured routing.
3. Twilio returns call event/status.
4. n8n receives event.
5. n8n checks:
   - client account
   - time of day
   - whether call was answered
   - whether call was missed/abandoned/after-hours
6. If answered live:
   - create or update lead event
   - mark outcome as answered
   - stop recovery flow unless configured otherwise
7. If missed / after-hours / abandoned:
   - create lead record if new
   - log call event
   - queue SMS #1
   - set lead status to New or Contacted

---

# 3. SMS Follow-Up Workflow
## Trigger
Lead enters recovery state.

## Step flow
1. Wait configured delay (30–90 seconds).
2. Send initial SMS through Twilio.
3. Update lead:
   - first_response_sent_at
   - status = Contacted
4. Wait for reply window.
5. If no reply within configured time:
   - send follow-up #1
6. If still no reply and rule allows:
   - send follow-up #2 next day / configured delay
7. If still no response:
   - mark as no_response / stale lead path

---

# 4. Inbound SMS Reply Workflow
## Trigger
Twilio inbound message webhook.

## Step flow
1. Match incoming number to existing open lead.
2. If no open lead found:
   - create inbound SMS lead event
   - route to generic qualification start
3. Parse current state of conversation.
4. Determine next question or action.
5. Update qualification fields progressively.
6. If qualified:
   - set status = Qualified
   - evaluate urgency / booking intent
7. If unqualified:
   - set status = Unqualified
   - optionally send soft exit
8. If uncertain:
   - use fallback clarifier or route to human

---

# 5. Qualification State Machine
Each lead should move through states.

## Suggested state fields
- awaiting_service_type
- awaiting_location
- awaiting_urgency
- awaiting_intent
- awaiting_trade_specific_detail
- qualified
- unqualified
- awaiting_booking
- awaiting_manual_followup
- booked
- closed_lost

## Logic rule
Only ask the next missing important question.
Do not restart the whole script every message.

---

# 6. High-Priority / Emergency Workflow
## Trigger conditions
- emergency keywords
- high-priority service type
- urgent intent
- manual callback request

## Step flow
1. Mark lead high_priority = true.
2. Generate short summary.
3. Send owner alert via SMS and/or email.
4. Update lead status to Awaiting Manual Follow-Up or Qualified depending on flow.
5. Log alert sent timestamp.

---

# 7. Booking / Callback Workflow
## If booking mode = self_book
1. Send booking link.
2. Mark status = Booking Requested.
3. If confirmation arrives, mark Booked.

## If booking mode = manual_callback
1. Send internal alert.
2. Mark status = Awaiting Manual Follow-Up.
3. Notify team of callback request.

## If booking mode = hybrid
1. Offer booking link first.
2. If lead requests callback, route to manual follow-up.

---

# 8. Unqualified / Spam Workflow
## Trigger conditions
- outside service area
- unsupported service
- spam/vendor/recruiter intent

## Step flow
1. Set status = Unqualified.
2. Tag disqualifier reason.
3. Optionally send soft-exit response.
4. Exclude from hot lead alerts.
5. Keep in reporting for lead-quality analysis.

---

# 9. Data Storage Requirements
Each workflow step should write to the datastore.

## Minimum entities
### Client
- client_id
- settings
- status

### Lead
- lead_id
- client_id
- source
- phone
- name
- service_type
- city
- urgency
- status
- qualified_flag
- booking_flag
- high_priority_flag

### Event log
- event_id
- lead_id
- event_type
- timestamp
- payload_summary

### Message log
- message_id
- lead_id
- direction
- content
- timestamp
- delivery_status

### Alert log
- alert_id
- lead_id
- alert_type
- recipient
- sent_at
- status

---

# 10. n8n Workflow Set Recommendation
## Workflow 1 — Inbound Call Handler
Receives Twilio call events and decides answered vs missed path.

## Workflow 2 — Missed Call Recovery Sender
Handles delayed initial SMS and follow-ups.

## Workflow 3 — Inbound SMS Processor
Handles reply parsing and next-step logic.

## Workflow 4 — Qualification / Routing Engine
Applies rules and determines qualified / unqualified / hot lead / booking path.

## Workflow 5 — Alert Dispatcher
Sends SMS/email alerts to owner/team.

## Workflow 6 — Scorecard Aggregator
Builds monthly metrics from stored lead/event/message data.

Keep these modular.
Do not cram everything into one giant workflow.

---

# 11. Recommended Webhook Inputs
## Twilio call webhook fields
- From
- To
- CallSid
- CallStatus
- Direction
- CallDuration if available later
- Timestamp / event time

## Twilio SMS webhook fields
- From
- To
- Body
- MessageSid
- Timestamp

---

# 12. Reliability Rules
## Always log before branching when possible
This prevents silent lost events.

## Use idempotency where possible
Twilio retries can happen. Avoid duplicate lead creation.

## Tag every event with client_id
Multi-client reliability depends on this.

## If parsing fails
Fallback to human-safe message or manual follow-up route.

## Never assume booking happened without evidence
Need explicit signal.

---

# 13. First Implementation Order
1. client settings record
2. Twilio inbound call webhook
3. lead creation/logging
4. missed-call SMS #1
5. inbound SMS reply handling
6. basic qualification flow
7. high-priority alerts
8. booking/callback branch
9. dashboard live data wiring
10. scorecard aggregation

This is the highest-ROI order.

---

# 14. What Not to Build First
Do not start with:
- full AI voice agent
- CRM sync for every client
- heavy NLP complexity
- dispatch board integration
- multi-channel overengineering

Start with the missed-call recovery engine.

---

# 15. Immediate Next Implementation Spec
Best next doc after this:
1. database schema / entity model
2. API endpoints for dashboard + workflow events
3. admin settings UI spec
