# Contractor Lead Conversion System — Database Schema V1

## Objective
Define the core data model for the contractor lead conversion system.

This schema needs to support:
- multi-client accounts
- missed-call recovery
- SMS conversations
- qualification state
- alerts
- onboarding
- admin controls
- client dashboard reporting
- monthly scorecards

This is the data backbone behind the system.

---

# 1. Design Goals
The V1 schema should be:
- multi-tenant
- simple enough to ship fast
- explicit enough to support reporting
- durable enough to support later automation expansion
- traceable for audits and debugging

Do not overcomplicate V1.

---

# 2. Core Entities
V1 should include these main entities:
1. clients
2. client_settings
3. leads
4. lead_events
5. messages
6. alerts
7. onboarding_checklists
8. scorecards
9. scorecard_metrics
10. admin_tasks
11. audit_logs

Optional later:
- users
- invoices
- booking_events
- integrations

---

# 3. Entity: clients
Represents each contractor account.

## Fields
- id (uuid, pk)
- company_name
- trade
- status
- plan_tier
- timezone
- website_url
- primary_contact_name
- primary_contact_email
- primary_contact_mobile
- launch_date
- created_at
- updated_at

## Status enum
- trial
- onboarding
- live
- paused
- canceled
- needs_attention

## Notes
This is the master account record.

---

# 4. Entity: client_settings
Stores configurable operating settings for each client.

## Fields
- id (uuid, pk)
- client_id (fk -> clients.id, unique per active settings profile)
- company_name_display
- preferred_message_name
- brand_tone
- words_to_avoid_json
- tracked_number
- forwarding_number
- after_hours_number
- alert_sms_recipients_json
- alert_email_recipients_json
- cities_served_json
- zip_codes_served_json
- excluded_areas_json
- primary_services_json
- secondary_services_json
- unsupported_services_json
- office_hours_json
- weekend_hours_json
- holiday_hours_json
- booking_mode
- booking_url
- qualification_questions_json
- disqualifier_rules_json
- high_priority_rules_json
- escalation_rules_json
- sms_initial_template
- sms_followup_1_template
- sms_followup_2_template
- sms_booking_template
- sms_callback_template
- sms_soft_exit_template
- workflow_enabled
- sms_enabled
- alerts_enabled
- scorecard_enabled
- settings_version
- created_at
- updated_at

## Booking mode enum
- self_book
- manual_callback
- hybrid

## Notes
JSON fields are acceptable for V1 where schema flexibility matters.

---

# 5. Entity: leads
Represents one inbound lead/opportunity.

## Fields
- id (uuid, pk)
- client_id (fk -> clients.id)
- source
- source_detail
- lead_channel
- call_sid (nullable)
- primary_phone
- secondary_phone (nullable)
- contact_name (nullable)
- service_type (nullable)
- trade (nullable)
- city (nullable)
- zip_code (nullable)
- property_type (nullable)
- urgency_level
- current_status
- qualification_state
- qualified_flag
- high_priority_flag
- booking_requested_flag
- booked_flag
- manual_followup_required_flag
- owner_alerted_flag
- disqualifier_reason (nullable)
- first_contact_at
- first_response_sent_at (nullable)
- last_inbound_at (nullable)
- last_outbound_at (nullable)
- last_activity_at
- closed_at (nullable)
- created_at
- updated_at

## lead_channel enum
- phone
- sms
- web_form
- referral
- other

## current_status enum
- new
- contacted
- qualified
- unqualified
- booking_requested
- booked
- awaiting_manual_followup
- closed_lost

## urgency_level enum
- low
- medium
- high
- emergency

## qualification_state enum
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

---

# 6. Entity: lead_events
Immutable event log for lead lifecycle actions.

## Fields
- id (uuid, pk)
- client_id (fk -> clients.id)
- lead_id (fk -> leads.id)
- event_type
- event_source
- event_summary
- payload_json
- created_at

## event_type examples
- inbound_call_received
- call_answered
- call_missed
- after_hours_call
- abandoned_call
- sms_sent
- sms_received
- qualified
- unqualified
- booking_requested
- booked
- alert_sent
- manual_followup_flagged
- lead_closed

## event_source examples
- twilio
- n8n
- admin
- system
- manual

## Notes
This table is critical for debugging and reporting.

---

# 7. Entity: messages
Stores SMS or other conversational messages.

## Fields
- id (uuid, pk)
- client_id (fk -> clients.id)
- lead_id (fk -> leads.id)
- direction
- channel
- provider_message_sid (nullable)
- message_body
- message_template_name (nullable)
- delivery_status
- sent_at (nullable)
- received_at (nullable)
- created_at

## direction enum
- inbound
- outbound

## channel enum
- sms

## delivery_status enum
- queued
- sent
- delivered
- failed
- received

---

# 8. Entity: alerts
Stores owner/team alerts triggered by the system.

## Fields
- id (uuid, pk)
- client_id (fk -> clients.id)
- lead_id (fk -> leads.id)
- alert_type
- urgency_level
- recipient_type
- recipient_value
- alert_summary
- delivery_status
- sent_at (nullable)
- created_at

## alert_type examples
- high_priority_lead
- emergency_lead
- booking_request
- callback_request
- manual_followup_needed

## recipient_type enum
- sms
- email

## delivery_status enum
- queued
- sent
- delivered
- failed

---

# 9. Entity: onboarding_checklists
Tracks new client onboarding progress.

## Fields
- id (uuid, pk)
- client_id (fk -> clients.id, unique)
- onboarding_stage
- intake_complete
- setup_complete
- testing_complete
- approved_for_launch
- required_items_json
- completed_items_json
- notes
- created_at
- updated_at

## onboarding_stage enum
- intake_sent
- intake_partial
- intake_complete
- setup_in_progress
- testing
- ready_for_approval
- live
- needs_fix

---

# 10. Entity: scorecards
Represents one reporting period for one client.

## Fields
- id (uuid, pk)
- client_id (fk -> clients.id)
- period_start
- period_end
- status
- executive_summary
- top_optimization_focus
- prepared_at (nullable)
- delivered_at (nullable)
- created_at
- updated_at

## status enum
- draft
- ready
- delivered

---

# 11. Entity: scorecard_metrics
Stores structured metrics for a scorecard period.

## Fields
- id (uuid, pk)
- scorecard_id (fk -> scorecards.id)
- metric_key
- metric_label
- metric_value_numeric (nullable)
- metric_value_text (nullable)
- metric_group
- created_at

## metric_key examples
- total_inbound_leads
- missed_calls
- recovered_missed_calls
- recovery_rate
- qualified_leads
- qualification_rate
- booking_requests
- booked_estimates
- avg_response_time_minutes
- manual_followup_required

## metric_group examples
- core_kpis
- source_breakdown
- funnel
- alerts
- quality

---

# 12. Entity: admin_tasks
Tracks operator work and support items.

## Fields
- id (uuid, pk)
- client_id (nullable fk -> clients.id)
- lead_id (nullable fk -> leads.id)
- task_type
- title
- description
- priority
- status
- assigned_to (nullable)
- due_at (nullable)
- completed_at (nullable)
- created_at
- updated_at

## task_type examples
- onboarding
- support
- workflow_fix
- reporting
- billing
- manual_followup

## priority enum
- low
- medium
- high
- urgent

## status enum
- open
- in_progress
- blocked
- completed
- canceled

---

# 13. Entity: audit_logs
Tracks sensitive admin changes and system edits.

## Fields
- id (uuid, pk)
- client_id (nullable fk -> clients.id)
- entity_type
- entity_id
- action_type
- actor_type
- actor_id_or_name
- change_summary
- before_json (nullable)
- after_json (nullable)
- created_at

## action_type examples
- create
- update
- pause
- resume
- delete
- send
- retry

## actor_type enum
- admin
- system
- workflow

---

# 14. Relationships Overview
## clients
- has one or many client_settings versions
- has many leads
- has one onboarding_checklist
- has many scorecards
- has many admin_tasks
- has many audit_logs

## leads
- belongs to one client
- has many lead_events
- has many messages
- has many alerts
- may have many admin_tasks

## scorecards
- belongs to one client
- has many scorecard_metrics

---

# 15. Recommended Indexes
## clients
- index on status
- index on trade

## client_settings
- unique index on client_id for active profile
- index on tracked_number

## leads
- index on client_id
- index on primary_phone
- index on current_status
- index on qualified_flag
- index on high_priority_flag
- index on created_at
- composite index on (client_id, created_at)
- composite index on (client_id, current_status)

## lead_events
- index on lead_id
- index on client_id
- index on event_type
- index on created_at

## messages
- index on lead_id
- index on provider_message_sid
- index on created_at

## alerts
- index on lead_id
- index on client_id
- index on alert_type
- index on created_at

## scorecards
- composite index on (client_id, period_start, period_end)

## admin_tasks
- index on client_id
- index on status
- index on priority

## audit_logs
- index on client_id
- index on entity_type
- index on created_at

---

# 16. V1 Storage Recommendations
For V1, a relational database is the right default.

Best fit:
- Postgres

Why:
- multi-tenant structure
- strong filtering/reporting
- easy future scale
- auditability
- works well with JSON fields where needed

---

# 17. Data Integrity Rules
- every lead must belong to a client
- every message must belong to a lead and client
- every alert must belong to a lead and client
- every scorecard must belong to a client
- important state transitions should also create lead_events
- system should avoid duplicate lead creation for same active inbound sequence when possible

---

# 18. Immediate Next Spec After This
Best next document:
1. API endpoints / service contracts
2. admin settings UI spec
3. actual backend implementation plan
