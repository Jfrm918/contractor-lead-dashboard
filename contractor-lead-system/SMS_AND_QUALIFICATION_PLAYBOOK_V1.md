# Contractor Lead Conversion System — SMS and Qualification Playbook V1

## Objective
Define the exact default SMS scripts and qualification flows for the contractor lead conversion service.

This is the first real fulfillment layer behind the dashboard.

It should help the system:
- recover missed calls
- identify real buyers
- route hot leads fast
- avoid wasting time on junk leads

---

# 1. Messaging Principles
All messages should be:
- short
- clear
- human
- direct
- easy to reply to
- not robotic
- not overly salesy

Avoid:
- long paragraphs
- weird AI phrasing
- too many questions at once
- sounding like a chatbot
- pretending certainty when the system is unsure

Tone:
- professional
- friendly
- local-business feel
- useful, not pushy

---

# 2. Default Missed-Call Recovery Sequence
## Trigger
A call is missed, after-hours, or not answered by a human.

## SMS #1 — Immediate
Send within 30–90 seconds.

**Template A**
"Hey, this is {{company_name}}. Sorry we missed your call. What can we help you with today?"

**Template B**
"Hi, this is {{company_name}}. Sorry we missed your call. What kind of project or service do you need help with?"

### Use
- Template A for general home services
- Template B when longer project context is common

---

## SMS #2 — First Follow-Up
Send if no reply after 15–30 minutes.

"Just following up in case you still need help. What kind of service are you looking for?"

---

## SMS #3 — Next-Day Follow-Up
Use only if lead came in after-hours or late in the day and still has not replied.

"Hey, this is {{company_name}} checking back in. If you still need help, reply here with what you need and we’ll point you in the right direction."

---

## Optional Final Touch
Only if desired by client. Avoid overuse.

"Wanted to follow up one last time. If you still need help with {{trade_or_service}}, reply here and we’ll get you taken care of."

---

# 3. Core Qualification Flow
Once the lead replies, the system moves into qualification.

## Goal
Learn the minimum needed to determine:
- is this a real buyer?
- is this in service area?
- is this a supported service?
- is this urgent?
- should we book, alert, or disqualify?

## Core question order
Ask one question at a time where possible.

### Question 1: Service Needed
"Got it — what do you need help with?"

If answer is clear, move on.
If unclear, ask a clarifier.

### Question 2: Location
"What city or ZIP is the property in?"

### Question 3: Urgency
"Is this something you need handled ASAP, or are you just pricing it out right now?"

### Question 4: Timing / Intent
"Are you looking to get someone out soon for an estimate/service?"

### Question 5: Trade-specific qualifier
Ask only what matters for that trade.

---

# 4. Universal Logic Rules
## Mark as Qualified if:
- inside service area
- valid service request
- real buyer intent
- wants estimate, service, inspection, quote, or callback

## Mark as Unqualified if:
- outside service area
- unsupported service
- obvious spam/vendor/recruiter
- no buyer intent after reasonable exchange

## Mark as High Priority if:
- emergency request
- urgent breakdown/problem
- strong booking intent
- high-value job signals

## Escalate to Human if:
- lead is confused
- answers are unclear after 2 attempts
- emergency or safety issue
- scheduling becomes too specific
- angry/upset customer
- existing customer service issue instead of new lead

---

# 5. Booking and Handoff Scripts
## If client has direct booking link
"Thanks — you look like a fit for {{company_name}}. Here’s the best link to book: {{booking_link}}"

## If manual callback needed
"Thanks — I’m sending this over to the team now so they can follow up with you."

## If high-priority lead
"Thanks — this looks urgent, so I’m flagging it for the team right now."

## If lead asks for price immediately
"We can help with that. A quick estimate usually depends on the exact job, location, and scope. What city is the property in and what do you need done?"

---

# 6. Disqualification / Soft Exit Scripts
## Outside service area
"Thanks for reaching out. It looks like that area is outside our normal service range."

## Unsupported service
"Thanks for reaching out. That’s not a service {{company_name}} handles right now."

## Vendor / spam / recruiting
"Thanks. This line is for customer service and estimate requests only."

## Lead goes cold after qualification started
No aggressive push.
Use one final nudge:
"If you still want help, reply here and we’ll keep it moving."

---

# 7. HVAC Qualification Flow
## Best for
- repair
- replacement
- no cool / no heat
- maintenance

## Suggested questions
1. "Are you needing repair, replacement, or routine service?"
2. "Is the system not cooling/heating at all, or is it still running?"
3. "What city is the property in?"
4. "Is this urgent, or are you just getting pricing right now?"

## High-priority triggers
- no heat in cold weather
- no cooling in extreme heat
- elderly/medical urgency
- water leaking from unit
- system fully down

## HVAC handoff line
"Got it — I’m flagging this for the team now so they can help with the next step."

---

# 8. Plumbing Qualification Flow
## Suggested questions
1. "What plumbing issue are you dealing with?"
2. "Is it a leak, clog, water heater issue, or something else?"
3. "What city is the property in?"
4. "Is this urgent or causing active damage right now?"

## High-priority triggers
- active leak
- no water
- sewer backup
- overflowing toilet
- water heater failure with urgency

---

# 9. Roofing Qualification Flow
## Suggested questions
1. "Are you dealing with a leak, storm damage, repair, or full replacement?"
2. "Is there active leaking right now?"
3. "What city is the property in?"
4. "Are you looking for an inspection/estimate soon?"

## High-priority triggers
- active leak
- storm damage
- insurance-related urgency
- emergency tarp need

---

# 10. Electrical Qualification Flow
## Suggested questions
1. "What electrical issue are you needing help with?"
2. "Is power out, partially out, or is this an upgrade/install request?"
3. "What city is the property in?"
4. "Does this need fast attention, or are you pricing a project?"

## High-priority triggers
- burning smell
- panel issues
- partial outage
- safety hazard
- sparking

## Safety escalation line
"If there’s an immediate safety hazard, please do not wait on text alone. I’m flagging this now for the team."

---

# 11. Insulation Qualification Flow
## Suggested questions
1. "Are you needing help with attic insulation, walls, crawlspace, or a new build?"
2. "Is this retrofit work or new construction?"
3. "What city is the property in?"
4. "Are you looking to get an estimate scheduled soon?"

## Useful extra qualifier
"Do you know roughly how big the project is?"

## High-priority signals
- full house project
- new build
- commercial scope
- immediate bid request

---

# 12. Garage Door Qualification Flow
## Suggested questions
1. "Are you needing repair, replacement, opener help, or a new install?"
2. "Is the door stuck open, stuck closed, or just not working right?"
3. "What city is the property in?"
4. "Do you need someone out quickly?"

## High-priority triggers
- stuck open overnight
- vehicle trapped
- security issue
- spring failure

---

# 13. Website Form / Text Lead Flow
The same qualification logic can be used for non-call leads.

## First response for form lead
"Hey, this is {{company_name}}. Thanks for reaching out. What kind of service do you need help with?"

If form already contains details, skip repeated questions and only ask missing info.

---

# 14. Alert Rules by Lead Type
## Send immediate owner alert when:
- high-priority emergency lead
- estimate requested with strong intent
- booking-ready lead
- lead asks for callback now

## Send batched or lower-priority notice when:
- standard qualified lead with normal urgency
- non-urgent pricing request
- informational lead that still looks legit

## No owner alert needed when:
- obvious spam
- outside service area
- unsupported service
- junk inquiry

---

# 15. Response Handling Rules
## If lead asks multiple things at once
Answer the main thing first, then continue qualification.

## If lead only says “call me”
Mark as callback requested and alert human.

## If lead asks “how much?” too early
Do not guess.
Gather scope + location first.

## If lead becomes frustrated
Stop trying to automate the conversation.
Escalate to human.

---

# 16. Admin Controls Needed for These Scripts
The admin/operator view should eventually allow Jason to edit:
- first-response message
- follow-up timing
- service area rules
- qualification questions by trade
- disqualifier rules
- escalation rules
- booking link
- alert recipients

---

# 17. Default V1 Recommendation
Use one simple universal structure first:
1. missed call happens
2. short apology + “what do you need help with?” text
3. collect service + location + urgency + intent
4. mark qualified/unqualified
5. alert owner if hot
6. push to booking or callback

That is the cleanest V1.

---

# 18. Immediate Next Spec After This
Next best document to build:
1. onboarding intake form
2. admin settings schema
3. monthly scorecard template
4. actual workflow map for Twilio + n8n
