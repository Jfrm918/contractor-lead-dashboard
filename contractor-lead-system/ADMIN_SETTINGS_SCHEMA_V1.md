# Contractor Lead Conversion System — Admin Settings Schema V1

## Objective
Define the internal settings structure required to configure and run each client account.

This is the operator control layer behind the admin dashboard.

---

# 1. Client Account Record
Each client account should have a top-level record.

## Core fields
- client_id
- company_name
- trade
- status
- plan_tier
- created_at
- updated_at
- launch_date
- timezone
- notes

## Suggested status values
- trial
- onboarding
- live
- paused
- canceled
- needs_attention

---

# 2. Business Profile Settings
## Identity
- company_name_display
- legal_name
- website_url
- business_phone
- primary_contact_name
- primary_contact_email
- primary_contact_mobile

## Branding
- brand_tone
- preferred_message_name
- words_to_avoid
- special_messaging_notes

---

# 3. Routing Settings
## Phone routing
- tracked_number
- forwarding_number
- after_hours_number
- call_recording_enabled
- voicemail_detection_mode
- abandoned_call_threshold_seconds

## After-hours logic
- after_hours_recovery_enabled
- after_hours_forwarding_enabled
- weekend_routing_mode
- holiday_routing_mode

---

# 4. Alert Settings
## Recipients
- alert_sms_recipients[]
- alert_email_recipients[]
- emergency_alert_recipients[]

## Alert triggers
- alert_on_high_priority
- alert_on_emergency
- alert_on_booking_request
- alert_on_callback_request
- alert_on_manual_followup

## Delivery behavior
- send_sms_alerts
- send_email_alerts
- quiet_hours_enabled
- quiet_hours_start
- quiet_hours_end

---

# 5. Service Coverage Settings
## Coverage
- cities_served[]
- zip_codes_served[]
- excluded_areas[]
- emergency_service_area_rules

## Trade settings
- primary_services[]
- secondary_services[]
- unsupported_services[]
- emergency_services_enabled
- minimum_job_size_notes

---

# 6. Hours and Availability Settings
- office_hours_by_day
- weekend_hours
- holiday_hours
- after_hours_response_mode
- callback_sla_notes

Example office_hours_by_day shape:
- monday: 08:00-17:00
- tuesday: 08:00-17:00
- etc.

---

# 7. Qualification Settings
## Core qualification
- required_questions[]
- trade_specific_questions[]
- qualification_rules[]
- disqualifier_rules[]
- high_priority_rules[]
- escalation_rules[]

## Buyer intent logic
- booking_intent_keywords[]
- callback_request_keywords[]
- emergency_keywords[]
- spam_keywords[]

---

# 8. Messaging Settings
## Templates
- sms_initial_template
- sms_followup_1_template
- sms_followup_2_template
- sms_booking_template
- sms_callback_template
- sms_soft_exit_template

## Timing
- initial_sms_delay_seconds
- followup_1_delay_minutes
- followup_2_delay_hours
- max_followup_attempts

## Style
- use_trade_specific_copy
- use_customer_name_when_known
- message_tone

---

# 9. Booking and Handoff Settings
- booking_mode
- booking_url
- manual_callback_owner
- manual_callback_team
- handoff_notes
- calendar_integration_enabled

## Suggested booking_mode values
- self_book
- manual_callback
- hybrid

---

# 10. Workflow Health Settings
- workflow_enabled
- sms_enabled
- alerts_enabled
- lead_logging_enabled
- scorecard_enabled
- last_workflow_test_at
- last_alert_test_at
- health_status

## Suggested health_status values
- healthy
- warning
- error
- paused

---

# 11. Dashboard and Reporting Settings
- client_dashboard_enabled
- admin_dashboard_enabled
- scorecard_frequency
- scorecard_recipient_emails[]
- show_source_breakdown
- show_response_time
- show_booking_metrics

---

# 12. Billing and Plan Settings
- setup_fee
- monthly_fee
- billing_status
- next_invoice_date
- payment_notes

## Suggested billing_status values
- active
- overdue
- paused
- canceled

---

# 13. Onboarding State Settings
- onboarding_stage
- intake_complete
- setup_complete
- testing_complete
- approved_for_launch
- onboarding_notes

## Suggested onboarding_stage values
- intake_sent
- intake_partial
- intake_complete
- setup_in_progress
- testing
- ready_for_approval
- live

---

# 14. Audit / Revision Tracking
- created_by
- last_updated_by
- settings_version
- last_template_revision
- last_rule_revision
- change_log[]

Each important settings change should be traceable.

---

# 15. Minimum V1 Admin Controls
For V1, Jason should be able to edit:
- company name / contact
- tracked and forwarding numbers
- alert recipients
- service areas
- services offered
- office hours
- qualification questions
- disqualifier rules
- high-priority rules
- SMS templates
- booking mode
- booking URL
- workflow enabled/paused

That is enough to operate the service.
