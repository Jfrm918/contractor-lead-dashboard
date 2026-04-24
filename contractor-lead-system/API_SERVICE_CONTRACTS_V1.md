# Contractor Lead Conversion System — API Service Contracts V1

## Objective
Define the main backend endpoints/services that connect:
- the dashboard
- the database
- Twilio events
- n8n workflows
- admin controls
- scorecards

This is the layer that lets all parts of the system talk to each other.

---

# 1. Plain-English Purpose
The API is the **middleman**.

It does things like:
- save a new lead
- update a lead status
- send dashboard data to the app
- accept Twilio call/message events
- let admin settings be changed
- generate scorecard data

Without this layer, the app is just a screen.

---

# 2. V1 Service Areas
V1 should have these service groups:
1. client accounts
2. client settings
3. leads
4. messages
5. alerts
6. onboarding
7. scorecards
8. workflow webhooks
9. admin tasks
10. audit logging

---

# 3. Client Account Endpoints
## GET /api/clients
Purpose:
- list all client accounts for admin dashboard

Returns:
- client id
- company name
- trade
- status
- plan tier
- workflow health summary
- last activity

## GET /api/clients/:clientId
Purpose:
- fetch one client account summary

## POST /api/clients
Purpose:
- create new client account

## PATCH /api/clients/:clientId
Purpose:
- update core client account fields

---

# 4. Client Settings Endpoints
## GET /api/clients/:clientId/settings
Purpose:
- fetch client configuration settings

## PUT /api/clients/:clientId/settings
Purpose:
- save/update client configuration settings

Fields managed here include:
- tracked number
- forwarding number
- alert recipients
- service areas
- services offered
- qualification rules
- SMS templates
- booking mode
- workflow toggles

## POST /api/clients/:clientId/settings/test
Purpose:
- run a test/validation of configuration

---

# 5. Leads Endpoints
## GET /api/leads
Purpose:
- list leads with filters

Supported filters:
- client_id
- status
- qualified_flag
- high_priority_flag
- source
- date_range

## GET /api/leads/:leadId
Purpose:
- fetch one lead detail view

Returns:
- lead fields
- event log
- conversation messages
- alerts

## POST /api/leads
Purpose:
- create lead manually or from workflow

## PATCH /api/leads/:leadId
Purpose:
- update lead state

Common updates:
- status
- service type
- city
- urgency
- qualified flag
- booked flag
- notes

---

# 6. Lead Events Endpoints
## GET /api/leads/:leadId/events
Purpose:
- fetch the lead event timeline

## POST /api/leads/:leadId/events
Purpose:
- append an event from workflow or admin action

Examples:
- call_missed
- sms_sent
- sms_received
- qualified
- alert_sent

---

# 7. Messages Endpoints
## GET /api/leads/:leadId/messages
Purpose:
- fetch SMS conversation history

## POST /api/leads/:leadId/messages/outbound
Purpose:
- send or queue outbound message

## POST /api/webhooks/twilio/sms
Purpose:
- Twilio inbound SMS webhook receiver

This endpoint should:
- identify client/lead
- save inbound message
- trigger qualification logic

---

# 8. Call Webhook Endpoints
## POST /api/webhooks/twilio/call
Purpose:
- receive Twilio inbound call/call status events

This endpoint should:
- identify client by tracked number
- create or update lead
- record call event
- decide whether to trigger missed-call recovery flow

## POST /api/webhooks/twilio/status
Purpose:
- optional separate status callback if needed

---

# 9. Alerts Endpoints
## GET /api/clients/:clientId/alerts
Purpose:
- fetch recent alerts for client dashboard/admin

## POST /api/alerts
Purpose:
- create/send alert event

## PATCH /api/alerts/:alertId
Purpose:
- update alert delivery status

---

# 10. Onboarding Endpoints
## GET /api/clients/:clientId/onboarding
Purpose:
- fetch onboarding progress

## PUT /api/clients/:clientId/onboarding
Purpose:
- update onboarding checklist and stage

## POST /api/clients/:clientId/onboarding/launch
Purpose:
- mark client live if readiness criteria are met

---

# 11. Scorecard Endpoints
## GET /api/clients/:clientId/scorecards
Purpose:
- list monthly scorecards

## GET /api/clients/:clientId/scorecards/:scorecardId
Purpose:
- fetch one scorecard with metrics

## POST /api/clients/:clientId/scorecards/generate
Purpose:
- generate a draft scorecard for a time period

## PATCH /api/clients/:clientId/scorecards/:scorecardId
Purpose:
- update summary text or status

---

# 12. Admin Tasks Endpoints
## GET /api/admin/tasks
Purpose:
- list operator tasks across all clients

## POST /api/admin/tasks
Purpose:
- create support/onboarding/manual follow-up task

## PATCH /api/admin/tasks/:taskId
Purpose:
- update task status, assignee, or due date

---

# 13. Dashboard Summary Endpoints
## GET /api/dashboard/admin/summary
Purpose:
- power the admin overview screen

Returns examples:
- total clients
- active clients
- total leads
- recovered leads
- booked estimates
- workflows needing attention
- onboarding tasks

## GET /api/dashboard/client/:clientId/summary
Purpose:
- power the client dashboard overview

Returns examples:
- total leads
- missed calls
- recovered leads
- qualified leads
- booked estimates
- response time
- recent activity

---

# 14. Workflow Trigger / Internal Service Endpoints
These are for system-to-system use.

## POST /api/internal/workflows/missed-call-recovery
Purpose:
- trigger SMS recovery flow for a lead

## POST /api/internal/workflows/process-inbound-message
Purpose:
- run qualification logic on inbound message

## POST /api/internal/workflows/send-alert
Purpose:
- trigger alert dispatch

## POST /api/internal/workflows/recalculate-scorecard-metrics
Purpose:
- regenerate metrics

These should be protected and not exposed publicly without auth.

---

# 15. Suggested Response Shape
Use a consistent JSON response shape.

## Success
```json
{
  "success": true,
  "data": {}
}
```

## Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Client settings are incomplete"
  }
}
```

---

# 16. Authentication Model (V1)
## Client dashboard access
- authenticated access to only their own client data

## Admin dashboard access
- authenticated access to all clients and admin actions

## Webhook endpoints
- provider signature validation where possible
- secret/token validation for internal workflows

---

# 17. Validation Rules
## Examples
- cannot create lead without client_id or resolvable tracked number
- cannot mark booked without lead existing
- cannot mark client live if onboarding not complete
- cannot send alert without recipient/channel

Validation matters because bad data ruins reporting.

---

# 18. Plain-English Translation of What We’ve Built
Here is what all this means in normal language:

- **Dashboard** = what you and the client look at
- **Operating logic** = the rules for what the system does
- **SMS playbook** = the actual text messages and qualification flow
- **Onboarding spec** = what you collect from a client to set them up
- **Scorecard template** = the monthly report proving value
- **Admin settings schema** = all the knobs and switches you control
- **Workflow map** = how Twilio and n8n will actually make the system run
- **Database schema** = where all the information gets stored
- **API/service contracts** = how all those parts talk to each other

So in plain English:
we are building the **blueprint for a real business system**, one layer at a time.

---

# 19. Best Next Step After This
Best next document:
1. backend implementation plan
2. admin settings UI spec
3. actual build phase roadmap
