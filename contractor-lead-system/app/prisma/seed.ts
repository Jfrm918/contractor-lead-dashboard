import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { webcrypto } from "crypto";

// Polyfill for Node < 20 — ensure crypto.subtle is available at module scope
if (!globalThis.crypto?.subtle) {
  // @ts-expect-error — Node webcrypto is compatible
  globalThis.crypto = webcrypto;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Password hashing (matches src/lib/auth.ts PBKDF2 implementation) ───

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );
  const hash = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  const toHex = (b: Uint8Array) =>
    Array.from(b)
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  return `${toHex(salt)}:${toHex(hash)}`;
}

async function main() {
  // Create demo client
  const client = await prisma.client.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      companyName: "Austin Comfort Pros",
      trade: "HVAC",
      status: "active",
      planTier: "growth",
      timezone: "America/Chicago",
      contactName: "Jason Hadrava",
      contactEmail: "hadrava.business@gmail.com",
      contactPhone: "(918) 555-0100",
    },
  });

  // Create client settings
  await prisma.clientSettings.upsert({
    where: { clientId: client.id },
    update: {},
    create: {
      clientId: client.id,
      trackedNumber: "+15125550100",
      forwardingNumber: "+19185550100",
      callRecording: false,
      abandonedCallThresholdSec: 15,
      alertRecipients: [
        { name: "Jason Hadrava", phone: "(918) 555-0100", email: "hadrava.business@gmail.com" },
      ],
      serviceAreas: ["Austin, TX", "Round Rock, TX", "Cedar Park, TX", "Pflugerville, TX"],
      servicesOffered: ["AC Replacement", "AC Repair", "Heating Repair", "Duct Cleaning", "Maintenance Plans"],
      officeHours: {
        mon: { open: "07:00", close: "18:00" },
        tue: { open: "07:00", close: "18:00" },
        wed: { open: "07:00", close: "18:00" },
        thu: { open: "07:00", close: "18:00" },
        fri: { open: "07:00", close: "18:00" },
      },
      weekendHours: {
        sat: { open: "08:00", close: "14:00" },
        sun: { open: null, close: null },
      },
      smsTemplates: {
        initial: "Hi {{name}}, this is {{company}}. We noticed we missed your call — sorry about that! How can we help you today?",
        followup1: "Hey {{name}}, just following up from {{company}}. Still need help with {{service}}? We have availability this week.",
        followup2: "Last check-in from {{company}} — if you still need {{service}} help, reply here and we'll get you scheduled. No pressure!",
      },
      messageTiming: {
        initialDelaySec: 60,
        followup1DelaySec: 14400,
        followup2DelaySec: 86400,
      },
      qualificationQuestions: [
        "What type of service do you need?",
        "Is this your primary residence?",
        "Preferred timeline?",
      ],
      disqualifierRules: ["commercial_only", "out_of_area"],
      highPriorityRules: ["no_ac_in_summer", "elderly_household", "infant_in_home"],
      bookingMode: "manual_callback",
      workflowEnabled: true,
      smsEnabled: true,
      alertsEnabled: true,
    },
  });

  // Seed leads
  const leadsData = [
    {
      phone: "(512) 555-0147",
      callerName: "Marcus Johnson",
      source: "google_ads",
      trade: "HVAC",
      serviceType: "AC Replacement",
      city: "Austin, TX",
      urgency: "urgent",
      qualificationState: "qualified",
      qualificationAnswers: [
        { question: "What type of service do you need?", answer: "Full AC replacement — unit is 18 years old" },
        { question: "Is this your primary residence?", answer: "Yes" },
        { question: "Preferred timeline?", answer: "This week if possible, it's 95 degrees" },
      ],
      status: "booking_requested",
      missedCall: true,
      recovered: true,
      callOutcome: "missed",
    },
    {
      phone: "(512) 555-0238",
      callerName: "Sarah Chen",
      source: "lsa",
      trade: "HVAC",
      serviceType: "AC Repair",
      city: "Round Rock, TX",
      urgency: "high",
      qualificationState: "in_progress",
      qualificationAnswers: [],
      status: "contacted",
      missedCall: true,
      recovered: false,
      callOutcome: "missed",
    },
    {
      phone: "(512) 555-0391",
      callerName: "David Martinez",
      source: "organic",
      trade: "HVAC",
      serviceType: "Maintenance Plan",
      city: "Cedar Park, TX",
      urgency: "medium",
      qualificationState: "qualified",
      qualificationAnswers: [
        { question: "What type of service do you need?", answer: "Annual maintenance — two units" },
        { question: "Is this your primary residence?", answer: "Yes" },
        { question: "Preferred timeline?", answer: "Anytime this month" },
      ],
      status: "qualified",
      missedCall: false,
      recovered: false,
      callOutcome: "answered",
    },
    {
      phone: "(512) 555-0472",
      callerName: "Lisa Thompson",
      source: "referral",
      trade: "HVAC",
      serviceType: "Duct Cleaning",
      city: "Pflugerville, TX",
      urgency: "low",
      qualificationState: "pending",
      qualificationAnswers: [],
      status: "new",
      missedCall: false,
      recovered: false,
      callOutcome: "answered",
    },
    {
      phone: "(512) 555-0583",
      callerName: "Robert Kim",
      source: "google_ads",
      trade: "HVAC",
      serviceType: "AC Replacement",
      city: "Austin, TX",
      urgency: "urgent",
      qualificationState: "high_priority",
      qualificationAnswers: [
        { question: "What type of service do you need?", answer: "AC stopped working — house is 100+ degrees" },
        { question: "Is this your primary residence?", answer: "Yes, elderly mother lives here" },
        { question: "Preferred timeline?", answer: "Emergency — today if possible" },
      ],
      status: "new",
      missedCall: true,
      recovered: true,
      callOutcome: "missed",
    },
  ];

  for (const lead of leadsData) {
    const created = await prisma.lead.create({
      data: {
        clientId: client.id,
        ...lead,
      },
    });

    await prisma.leadEvent.create({
      data: {
        leadId: created.id,
        clientId: client.id,
        eventType: lead.missedCall ? "call_missed" : "call_answered",
        payload: { phone: lead.phone, callerName: lead.callerName, outcome: lead.callOutcome },
      },
    });

    if (lead.recovered) {
      await prisma.leadEvent.create({
        data: {
          leadId: created.id,
          clientId: client.id,
          eventType: "sms_sent",
          payload: { template: "initial", phone: lead.phone },
        },
      });
    }
  }

  // ── Create admin user ──
  const adminPasswordHash = await hashPassword("leadrecovery2026");
  await prisma.user.upsert({
    where: { email: "hadrava.business@gmail.com" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "hadrava.business@gmail.com",
      passwordHash: adminPasswordHash,
      name: "Jason Hadrava",
      role: "admin",
      clientId: client.id,
    },
  });

  console.log("Seed complete: 1 client, 5 leads, events created, admin user upserted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
