import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Create demo client
const clientId = "00000000-0000-0000-0000-000000000001";
await client.query(`
  INSERT INTO clients (id, company_name, trade, status, plan_tier, timezone, contact_name, contact_email, contact_phone, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING
`, [clientId, "Austin Comfort Pros", "HVAC", "active", "growth", "America/Chicago", "Jason Hadrava", "hadrava.business@gmail.com", "(918) 555-0100"]);

// Create client settings
await client.query(`
  INSERT INTO client_settings (id, client_id, tracked_number, forwarding_number, call_recording, abandoned_call_threshold_sec,
    alert_recipients, service_areas, services_offered, office_hours, weekend_hours,
    sms_templates, message_timing, qualification_questions, disqualifier_rules, high_priority_rules,
    booking_mode, workflow_enabled, sms_enabled, alerts_enabled, created_at, updated_at)
  VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
  ON CONFLICT (client_id) DO NOTHING
`, [
  clientId,
  "+15125550100", "+19185550100", false, 15,
  JSON.stringify([{ name: "Jason Hadrava", phone: "(918) 555-0100", email: "hadrava.business@gmail.com" }]),
  JSON.stringify(["Austin, TX", "Round Rock, TX", "Cedar Park, TX", "Pflugerville, TX"]),
  JSON.stringify(["AC Replacement", "AC Repair", "Heating Repair", "Duct Cleaning", "Maintenance Plans"]),
  JSON.stringify({ mon: { open: "07:00", close: "18:00" }, tue: { open: "07:00", close: "18:00" }, wed: { open: "07:00", close: "18:00" }, thu: { open: "07:00", close: "18:00" }, fri: { open: "07:00", close: "18:00" } }),
  JSON.stringify({ sat: { open: "08:00", close: "14:00" }, sun: { open: null, close: null } }),
  JSON.stringify({ initial: "Hi {{name}}, this is {{company}}. We noticed we missed your call — sorry about that! How can we help you today?", followup1: "Hey {{name}}, just following up from {{company}}. Still need help with {{service}}? We have availability this week.", followup2: "Last check-in from {{company}} — if you still need {{service}} help, reply here and we'll get you scheduled. No pressure!" }),
  JSON.stringify({ initialDelaySec: 60, followup1DelaySec: 14400, followup2DelaySec: 86400 }),
  JSON.stringify(["What type of service do you need?", "Is this your primary residence?", "Preferred timeline?"]),
  JSON.stringify(["commercial_only", "out_of_area"]),
  JSON.stringify(["no_ac_in_summer", "elderly_household", "infant_in_home"]),
  "manual_callback", true, true, true,
]);

// Seed leads
const leads = [
  { phone: "(512) 555-0147", name: "Marcus Johnson", source: "google_ads", service: "AC Replacement", city: "Austin, TX", urgency: "urgent", qualState: "qualified", qualAnswers: [{ question: "What type of service do you need?", answer: "Full AC replacement — unit is 18 years old" }, { question: "Is this your primary residence?", answer: "Yes" }, { question: "Preferred timeline?", answer: "This week if possible, it's 95 degrees" }], status: "booking_requested", missed: true, recovered: true, outcome: "missed" },
  { phone: "(512) 555-0238", name: "Sarah Chen", source: "lsa", service: "AC Repair", city: "Round Rock, TX", urgency: "high", qualState: "in_progress", qualAnswers: [], status: "contacted", missed: true, recovered: false, outcome: "missed" },
  { phone: "(512) 555-0391", name: "David Martinez", source: "organic", service: "Maintenance Plan", city: "Cedar Park, TX", urgency: "medium", qualState: "qualified", qualAnswers: [{ question: "What type of service do you need?", answer: "Annual maintenance — two units" }, { question: "Is this your primary residence?", answer: "Yes" }, { question: "Preferred timeline?", answer: "Anytime this month" }], status: "qualified", missed: false, recovered: false, outcome: "answered" },
  { phone: "(512) 555-0472", name: "Lisa Thompson", source: "referral", service: "Duct Cleaning", city: "Pflugerville, TX", urgency: "low", qualState: "pending", qualAnswers: [], status: "new", missed: false, recovered: false, outcome: "answered" },
  { phone: "(512) 555-0583", name: "Robert Kim", source: "google_ads", service: "AC Replacement", city: "Austin, TX", urgency: "urgent", qualState: "high_priority", qualAnswers: [{ question: "What type of service do you need?", answer: "AC stopped working — house is 100+ degrees" }, { question: "Is this your primary residence?", answer: "Yes, elderly mother lives here" }, { question: "Preferred timeline?", answer: "Emergency — today if possible" }], status: "new", missed: true, recovered: true, outcome: "missed" },
];

for (const lead of leads) {
  const res = await client.query(`
    INSERT INTO leads (id, client_id, phone, caller_name, source, trade, service_type, city, urgency,
      qualification_state, qualification_answers, status, missed_call, recovered, call_outcome, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'HVAC', $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING id
  `, [clientId, lead.phone, lead.name, lead.source, lead.service, lead.city, lead.urgency, lead.qualState, JSON.stringify(lead.qualAnswers), lead.status, lead.missed, lead.recovered, lead.outcome]);

  const leadId = res.rows[0].id;

  await client.query(`
    INSERT INTO lead_events (id, lead_id, client_id, event_type, payload, created_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
  `, [leadId, clientId, lead.missed ? "call_missed" : "call_answered", JSON.stringify({ phone: lead.phone, callerName: lead.name, outcome: lead.outcome })]);

  if (lead.recovered) {
    await client.query(`
      INSERT INTO lead_events (id, lead_id, client_id, event_type, payload, created_at)
      VALUES (gen_random_uuid(), $1, $2, 'sms_sent', $3, NOW())
    `, [leadId, clientId, JSON.stringify({ template: "initial", phone: lead.phone })]);
  }
}

console.log("Seed complete: 1 client, 5 leads, events created.");
await client.end();
