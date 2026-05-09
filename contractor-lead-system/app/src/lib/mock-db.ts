/**
 * In-memory mock data layer used when DATABASE_URL is not set.
 * Keeps the API routes functional during local dev without Postgres.
 */

export interface MockClient {
  id: string;
  companyName: string;
  trade: string;
  status: string;
  planTier: string;
  timezone: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockClientSettings {
  id: string;
  clientId: string;
  trackedNumber: string | null;
  forwardingNumber: string | null;
  afterHoursNumber: string | null;
  callRecording: boolean;
  abandonedCallThresholdSec: number;
  alertRecipients: unknown[];
  serviceAreas: string[];
  servicesOffered: string[];
  officeHours: Record<string, unknown>;
  weekendHours: Record<string, unknown>;
  qualificationQuestions: string[];
  disqualifierRules: string[];
  highPriorityRules: string[];
  smsTemplates: Record<string, string>;
  messageTiming: Record<string, number>;
  bookingMode: string;
  bookingUrl: string | null;
  leadFilterEnabled: boolean;
  missedCallAckTemplate: string | null;
  workflowEnabled: boolean;
  smsEnabled: boolean;
  alertsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockKnownCaller {
  id: string;
  clientId: string;
  phone: string;
  label: string | null;
  type: string; // team, vendor, existing_customer, spam, other
  createdAt: Date;
  updatedAt: Date;
}

export interface MockLead {
  id: string;
  clientId: string;
  phone: string;
  callerName: string | null;
  source: string | null;
  trade: string | null;
  serviceType: string | null;
  city: string | null;
  urgency: string | null;
  qualificationState: string;
  qualificationAnswers: unknown[];
  status: string;
  missedCall: boolean;
  recovered: boolean;
  callerType: string;
  callSid: string | null;
  callOutcome: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockLeadEvent {
  id: string;
  leadId: string;
  clientId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

// ─── Seed data ───

const now = new Date();

const seedClients: MockClient[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    companyName: "Tulsa Peak HVAC",
    trade: "HVAC",
    status: "active",
    planTier: "pro",
    timezone: "America/Chicago",
    contactName: "Marcus Bell",
    contactEmail: "marcus@tulsapeakhvac.com",
    contactPhone: "(918) 555-0100",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    companyName: "Green Country Plumbing",
    trade: "Plumbing",
    status: "active",
    planTier: "pro",
    timezone: "America/Chicago",
    contactName: "Nina Vasquez",
    contactEmail: "nina@greencountryplumbing.com",
    contactPhone: "(918) 555-0300",
    createdAt: now,
    updatedAt: now,
  },
];

const seedSettings: MockClientSettings[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    clientId: "00000000-0000-0000-0000-000000000001",
    trackedNumber: "+19185550100",
    forwardingNumber: "+19185551234",
    afterHoursNumber: null,
    callRecording: false,
    abandonedCallThresholdSec: 15,
    alertRecipients: [{ name: "Marcus Bell", phone: "(918) 555-1234", email: "marcus@tulsapeakhvac.com" }],
    serviceAreas: ["Tulsa", "Broken Arrow", "Owasso"],
    servicesOffered: ["AC Repair", "AC Replacement", "Furnace Maintenance", "Duct Cleaning"],
    officeHours: {
      mon: { open: "08:00", close: "17:00" },
      tue: { open: "08:00", close: "17:00" },
      wed: { open: "08:00", close: "17:00" },
      thu: { open: "08:00", close: "17:00" },
      fri: { open: "08:00", close: "17:00" },
    },
    weekendHours: {},
    qualificationQuestions: [
      "What type of service do you need?",
      "Is this your primary residence?",
      "Preferred timeline?",
    ],
    disqualifierRules: ["out_of_service_area"],
    highPriorityRules: ["ac_down_in_heat", "elderly_resident", "no_heat_in_winter"],
    smsTemplates: {
      initial: "Hi {name}, this is {company}. We noticed we missed your call — sorry about that! How can we help you today?",
      followup1: "Hi {name}, just checking in — did you still need help with your {service} issue?",
      followup2: "Hi {name}, we want to make sure you're taken care of. Reply anytime and we'll get you scheduled.",
    },
    messageTiming: { initialDelaySec: 60, followup1DelaySec: 3600, followup2DelaySec: 86400 },
    bookingMode: "manual_callback",
    bookingUrl: null,
    leadFilterEnabled: true,
    missedCallAckTemplate: null,
    workflowEnabled: true,
    smsEnabled: true,
    alertsEnabled: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    clientId: "00000000-0000-0000-0000-000000000002",
    trackedNumber: "+19185550300",
    forwardingNumber: "+19185559876",
    afterHoursNumber: null,
    callRecording: false,
    abandonedCallThresholdSec: 15,
    alertRecipients: [{ name: "Nina Vasquez", phone: "(918) 555-9876", email: "nina@greencountryplumbing.com" }],
    serviceAreas: ["Owasso", "Collinsville", "Skiatook"],
    servicesOffered: ["Slab Leak Detection", "Water Heater Repair", "Drain Cleaning"],
    officeHours: {
      mon: { open: "07:00", close: "18:00" },
      tue: { open: "07:00", close: "18:00" },
      wed: { open: "07:00", close: "18:00" },
      thu: { open: "07:00", close: "18:00" },
      fri: { open: "07:00", close: "16:00" },
    },
    weekendHours: { sat: { open: "08:00", close: "12:00" } },
    qualificationQuestions: [
      "What's the issue?",
      "How old is the unit/fixture?",
      "Any visible leaks?",
    ],
    disqualifierRules: ["out_of_service_area"],
    highPriorityRules: ["slab_leak", "gas_smell", "flooding"],
    smsTemplates: {
      initial: "Hi {name}, thanks for reaching out to {company}. We missed your call — what can we help with?",
      followup1: "Hi {name}, just following up on your plumbing issue. Are you still looking for help?",
    },
    messageTiming: { initialDelaySec: 60, followup1DelaySec: 3600 },
    bookingMode: "manual_callback",
    bookingUrl: null,
    leadFilterEnabled: true,
    missedCallAckTemplate: null,
    workflowEnabled: true,
    smsEnabled: true,
    alertsEnabled: true,
    createdAt: now,
    updatedAt: now,
  },
];

// ─── Known callers seed ───

const seedKnownCallers: MockKnownCaller[] = [];

// ─── In-memory store (mutable copies) ───

let clients = structuredClone(seedClients);
let settings = structuredClone(seedSettings);
let leads: MockLead[] = [];
let events: MockLeadEvent[] = [];
let knownCallers = structuredClone(seedKnownCallers);

// ─── Accessors ───

export const mockDb = {
  // Clients
  findClient(id: string) {
    return clients.find((c) => c.id === id) ?? null;
  },

  findClientByTrackedNumber(phone: string) {
    const normalised = phone.replace(/\D/g, "").slice(-10);
    const s = settings.find((s) => {
      if (!s.trackedNumber) return false;
      return s.trackedNumber.replace(/\D/g, "").slice(-10) === normalised;
    });
    if (!s) return null;
    return clients.find((c) => c.id === s.clientId) ?? null;
  },

  // Settings
  findSettings(clientId: string) {
    return settings.find((s) => s.clientId === clientId) ?? null;
  },

  upsertSettings(clientId: string, data: Partial<MockClientSettings>) {
    const existing = settings.find((s) => s.clientId === clientId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() });
      return existing;
    }
    const created: MockClientSettings = {
      id: crypto.randomUUID(),
      clientId,
      trackedNumber: null,
      forwardingNumber: null,
      afterHoursNumber: null,
      callRecording: false,
      abandonedCallThresholdSec: 15,
      alertRecipients: [],
      serviceAreas: [],
      servicesOffered: [],
      officeHours: {},
      weekendHours: {},
      qualificationQuestions: [],
      disqualifierRules: [],
      highPriorityRules: [],
      smsTemplates: {},
      messageTiming: {},
      bookingMode: "manual_callback",
      bookingUrl: null,
      leadFilterEnabled: true,
      missedCallAckTemplate: null,
      workflowEnabled: true,
      smsEnabled: true,
      alertsEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    settings.push(created);
    return created;
  },

  // Leads
  createLead(data: Omit<MockLead, "id" | "createdAt" | "updatedAt">): MockLead {
    const lead: MockLead = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    leads.push(lead);
    return lead;
  },

  findLeadByPhoneAndClient(phone: string, clientId: string) {
    const normalised = phone.replace(/\D/g, "").slice(-10);
    return (
      leads.find((l) => {
        return (
          l.clientId === clientId &&
          l.phone.replace(/\D/g, "").slice(-10) === normalised
        );
      }) ?? null
    );
  },

  updateLead(id: string, data: Partial<MockLead>) {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return null;
    Object.assign(lead, data, { updatedAt: new Date() });
    return lead;
  },

  // Events
  createEvent(data: Omit<MockLeadEvent, "id" | "createdAt">): MockLeadEvent {
    const event: MockLeadEvent = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    events.push(event);
    return event;
  },

  // Known callers
  findKnownCaller(clientId: string, normalisedPhone: string) {
    return (
      knownCallers.find(
        (k) => k.clientId === clientId && k.phone === normalisedPhone,
      ) ?? null
    );
  },

  addKnownCaller(
    data: Omit<MockKnownCaller, "id" | "createdAt" | "updatedAt">,
  ): MockKnownCaller {
    const existing = knownCallers.find(
      (k) => k.clientId === data.clientId && k.phone === data.phone,
    );
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() });
      return existing;
    }
    const record: MockKnownCaller = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    knownCallers.push(record);
    return record;
  },
};
