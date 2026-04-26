// Seed data for contractor lead conversion dashboard

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Booking Requested' | 'Booked' | 'Closed Lost';
export type LeadSource = 'Google Ads' | 'LSA' | 'Organic' | 'Referral';
export type Trade = 'HVAC' | 'Plumbing' | 'Roofing' | 'Electrical' | 'Insulation';
export type Urgency = 'Urgent' | 'High' | 'Medium' | 'Low';
export type AlertType = 'hot_lead' | 'emergency' | 'estimate_requested' | 'follow_up';

export interface ConversationMessage {
  type: 'system' | 'outbound' | 'inbound';
  content: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  trade: Trade;
  service: string;
  city: string;
  status: LeadStatus;
  urgency: Urgency;
  lastContact: string;
  createdAt: string;
  missedCall: boolean;
  recovered: boolean;
  qualificationAnswers: { question: string; answer: string }[];
  bookingIntent: string;
  conversation: ConversationMessage[];
}

export function scoreLead(lead: Lead): { score: number; label: 'Hot' | 'Warm' | 'Low' | 'Bad Fit'; nextAction: string; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (lead.urgency === 'Urgent') { score += 30; reasons.push('urgent timeline'); }
  else if (lead.urgency === 'High') { score += 22; reasons.push('high urgency'); }
  else if (lead.urgency === 'Medium') { score += 12; reasons.push('medium urgency'); }

  if (lead.missedCall && !lead.recovered) { score += 18; reasons.push('missed call not recovered'); }
  if (lead.recovered) { score += 16; reasons.push('recovered missed lead'); }
  if (lead.status === 'Booking Requested') { score += 24; reasons.push('booking requested'); }
  if (lead.status === 'Booked') { score += 18; reasons.push('already booked'); }
  if (lead.status === 'Qualified') { score += 14; reasons.push('qualified'); }
  if (lead.status === 'Unqualified' || lead.status === 'Closed Lost') { score -= 35; reasons.push('poor fit or closed lost'); }
  if (lead.qualificationAnswers.length >= 2) { score += 8; reasons.push('qualification data captured'); }
  if (lead.bookingIntent) { score += 10; reasons.push('booking intent present'); }
  if (lead.source === 'Google Ads' || lead.source === 'LSA') { score += 6; reasons.push('paid lead source'); }

  score = Math.max(0, Math.min(100, score));
  const label = score >= 75 ? 'Hot' : score >= 45 ? 'Warm' : score >= 20 ? 'Low' : 'Bad Fit';
  const nextAction = label === 'Hot'
    ? 'Call now and push to booked estimate.'
    : label === 'Warm'
      ? 'Continue SMS qualification and offer estimate times.'
      : label === 'Low'
        ? 'Keep in nurture unless they reply with urgency.'
        : 'Do not chase; mark closed or unqualified.';

  return { score, label, nextAction, reasons };
}

export interface Alert {
  id: string;
  type: AlertType;
  leadId: string;
  contactName: string;
  summary: string;
  urgency: Urgency;
  recommendation: string;
  timestamp: string;
  read: boolean;
}

export interface ActivityEvent {
  id: string;
  type: 'missed_call_recovered' | 'lead_replied' | 'booking_requested' | 'owner_alert' | 'lead_qualified';
  description: string;
  leadName: string;
  timestamp: string;
}

// ---- LEADS ----
export const leads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Marcus Johnson',
    phone: '(512) 555-0147',
    email: 'mjohnson@email.com',
    source: 'Google Ads',
    trade: 'HVAC',
    service: 'AC Replacement',
    city: 'Austin, TX',
    status: 'Booking Requested',
    urgency: 'Urgent',
    lastContact: '2026-04-24T09:42:00',
    createdAt: '2026-04-24T08:15:00',
    missedCall: true,
    recovered: true,
    qualificationAnswers: [
      { question: 'What type of service do you need?', answer: 'Full AC replacement — unit is 18 years old' },
      { question: 'Is this your primary residence?', answer: 'Yes' },
      { question: 'Preferred timeline?', answer: 'This week if possible, it\'s 95 degrees' },
    ],
    bookingIntent: 'Wants estimate this week — system failed yesterday',
    conversation: [
      { type: 'system', content: 'Missed call from (512) 555-0147', timestamp: '2026-04-24T08:15:00' },
      { type: 'outbound', content: 'Hi Marcus, this is Austin Comfort Pros. We noticed we missed your call — sorry about that! How can we help you today?', timestamp: '2026-04-24T08:16:00' },
      { type: 'inbound', content: 'Hey yeah my AC went out yesterday. It\'s an old unit, probably need to replace the whole thing.', timestamp: '2026-04-24T08:18:00' },
      { type: 'outbound', content: 'That sounds rough, especially with this heat. Can you tell me — is this your primary residence, and do you know what type of unit you have?', timestamp: '2026-04-24T08:19:00' },
      { type: 'inbound', content: 'Yes primary home. It\'s a Carrier unit from 2008, 3.5 ton I think.', timestamp: '2026-04-24T08:22:00' },
      { type: 'outbound', content: 'Got it — 18 years is a good run for a Carrier unit. We can get a tech out to assess and give you a quote. When would work best for an estimate?', timestamp: '2026-04-24T08:23:00' },
      { type: 'inbound', content: 'Can someone come tomorrow morning? Like before noon?', timestamp: '2026-04-24T08:25:00' },
      { type: 'outbound', content: 'Let me check availability and have our team confirm a morning slot for you. We\'ll follow up shortly. Hang tight!', timestamp: '2026-04-24T08:26:00' },
    ],
  },
  {
    id: 'lead-002',
    name: 'Sarah Chen',
    phone: '(737) 555-0293',
    email: 'schen@email.com',
    source: 'LSA',
    trade: 'Plumbing',
    service: 'Water Heater Repair',
    city: 'Round Rock, TX',
    status: 'Qualified',
    urgency: 'High',
    lastContact: '2026-04-24T10:05:00',
    createdAt: '2026-04-24T07:30:00',
    missedCall: true,
    recovered: true,
    qualificationAnswers: [
      { question: 'What\'s the issue?', answer: 'Water heater making banging noises, barely warm water' },
      { question: 'How old is the unit?', answer: 'About 12 years' },
      { question: 'Any visible leaks?', answer: 'Small drip near the base' },
    ],
    bookingIntent: 'Open to repair or replacement — needs someone to look at it',
    conversation: [
      { type: 'system', content: 'Missed call from (737) 555-0293', timestamp: '2026-04-24T07:30:00' },
      { type: 'outbound', content: 'Hi Sarah, thanks for reaching out to Hill Country Plumbing. We missed your call — what can we help with?', timestamp: '2026-04-24T07:31:00' },
      { type: 'inbound', content: 'Hi, my water heater is acting up. Making loud banging and the water barely gets warm anymore.', timestamp: '2026-04-24T07:34:00' },
      { type: 'outbound', content: 'That sounds like sediment buildup or a failing element. Do you know how old the unit is, and have you noticed any leaking?', timestamp: '2026-04-24T07:35:00' },
      { type: 'inbound', content: 'It\'s around 12 years old. There is a small drip near the bottom actually.', timestamp: '2026-04-24T07:38:00' },
      { type: 'outbound', content: 'At 12 years with a leak, you might be looking at a repair or replacement. We can send someone out to diagnose and give options. Would this week work?', timestamp: '2026-04-24T07:39:00' },
      { type: 'inbound', content: 'Yes, anytime Thursday or Friday works for me.', timestamp: '2026-04-24T07:42:00' },
    ],
  },
  {
    id: 'lead-003',
    name: 'David Ramirez',
    phone: '(210) 555-0381',
    email: 'dramirez@email.com',
    source: 'Google Ads',
    trade: 'Roofing',
    service: 'Storm Damage Inspection',
    city: 'San Antonio, TX',
    status: 'New',
    urgency: 'Urgent',
    lastContact: '2026-04-24T10:30:00',
    createdAt: '2026-04-24T10:28:00',
    missedCall: true,
    recovered: false,
    qualificationAnswers: [],
    bookingIntent: '',
    conversation: [
      { type: 'system', content: 'Missed call from (210) 555-0381', timestamp: '2026-04-24T10:28:00' },
      { type: 'outbound', content: 'Hi David, this is Lone Star Roofing. We missed your call — are you dealing with storm damage or another roofing issue?', timestamp: '2026-04-24T10:30:00' },
    ],
  },
  {
    id: 'lead-004',
    name: 'Jennifer Walsh',
    phone: '(512) 555-0462',
    email: 'jwalsh@email.com',
    source: 'Organic',
    trade: 'Electrical',
    service: 'Panel Upgrade',
    city: 'Cedar Park, TX',
    status: 'Booked',
    urgency: 'Medium',
    lastContact: '2026-04-23T16:20:00',
    createdAt: '2026-04-22T11:00:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'What do you need done?', answer: '200 amp panel upgrade — building an addition' },
      { question: 'Current panel size?', answer: '100 amp, original to the house (1992)' },
      { question: 'Permit required?', answer: 'Yes, contractor said I need one' },
    ],
    bookingIntent: 'Estimate booked for April 28',
    conversation: [
      { type: 'outbound', content: 'Hi Jennifer, thanks for contacting Sparks Electric. How can we help?', timestamp: '2026-04-22T11:05:00' },
      { type: 'inbound', content: 'I need to upgrade my electrical panel. We\'re adding a room and the contractor says we need 200 amps.', timestamp: '2026-04-22T11:08:00' },
      { type: 'outbound', content: 'Makes sense — a 200 amp upgrade is common when adding square footage. What size is your current panel?', timestamp: '2026-04-22T11:09:00' },
      { type: 'inbound', content: '100 amps, it\'s the original from when the house was built in \'92.', timestamp: '2026-04-22T11:12:00' },
      { type: 'outbound', content: 'Got it. We\'d want to inspect the existing panel and discuss your addition plans. Can we book a time for an estimate?', timestamp: '2026-04-22T11:13:00' },
      { type: 'inbound', content: 'Monday the 28th would be great, morning preferred.', timestamp: '2026-04-22T11:16:00' },
      { type: 'outbound', content: 'Perfect — you\'re confirmed for Monday April 28 between 9-11 AM. We\'ll send a reminder the day before.', timestamp: '2026-04-22T11:18:00' },
    ],
  },
  {
    id: 'lead-005',
    name: 'Robert Kim',
    phone: '(737) 555-0519',
    email: 'rkim@email.com',
    source: 'Referral',
    trade: 'HVAC',
    service: 'Duct Cleaning',
    city: 'Pflugerville, TX',
    status: 'Contacted',
    urgency: 'Low',
    lastContact: '2026-04-24T08:50:00',
    createdAt: '2026-04-23T14:00:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'What service are you looking for?', answer: 'Duct cleaning — neighbor recommended you' },
      { question: 'Last time ducts were cleaned?', answer: 'Never — bought the house 5 years ago' },
    ],
    bookingIntent: 'Interested but not in a rush',
    conversation: [
      { type: 'outbound', content: 'Hi Robert, thanks for reaching out! Your neighbor spoke highly of us. What can we help with?', timestamp: '2026-04-23T14:05:00' },
      { type: 'inbound', content: 'Yeah Tom recommended you guys. I need duct cleaning, never had it done and we\'ve been here 5 years.', timestamp: '2026-04-23T14:10:00' },
      { type: 'outbound', content: 'That\'s definitely overdue! We do full duct cleaning including sanitizing. Is there a particular time frame you\'re looking at?', timestamp: '2026-04-23T14:12:00' },
      { type: 'inbound', content: 'No big rush, maybe sometime in the next couple weeks?', timestamp: '2026-04-23T14:18:00' },
      { type: 'outbound', content: 'Sounds good. I\'ll have our scheduling team reach out with some options. Thanks Robert!', timestamp: '2026-04-24T08:50:00' },
    ],
  },
  {
    id: 'lead-006',
    name: 'Amanda Torres',
    phone: '(512) 555-0674',
    email: 'atorres@email.com',
    source: 'Google Ads',
    trade: 'Plumbing',
    service: 'Slab Leak Detection',
    city: 'Georgetown, TX',
    status: 'Qualified',
    urgency: 'Urgent',
    lastContact: '2026-04-24T11:15:00',
    createdAt: '2026-04-24T09:45:00',
    missedCall: true,
    recovered: true,
    qualificationAnswers: [
      { question: 'What are you experiencing?', answer: 'Water bill doubled, hearing running water with everything off' },
      { question: 'Foundation type?', answer: 'Slab foundation' },
      { question: 'Hot or cold water leak?', answer: 'Seems like hot — floor is warm in one spot' },
    ],
    bookingIntent: 'Wants someone ASAP — worried about foundation damage',
    conversation: [
      { type: 'system', content: 'Missed call from (512) 555-0674', timestamp: '2026-04-24T09:45:00' },
      { type: 'outbound', content: 'Hi Amanda, this is Central Texas Plumbing. We missed your call — what\'s going on?', timestamp: '2026-04-24T09:46:00' },
      { type: 'inbound', content: 'I think I have a slab leak. My water bill was $380 last month and I can hear water running when nothing is on.', timestamp: '2026-04-24T09:48:00' },
      { type: 'outbound', content: 'That definitely sounds like a slab leak. Is your floor warm anywhere, or have you noticed any damp spots?', timestamp: '2026-04-24T09:49:00' },
      { type: 'inbound', content: 'Yes! The floor near the master bathroom is warm. I\'m freaking out about my foundation.', timestamp: '2026-04-24T09:51:00' },
      { type: 'outbound', content: 'I understand the concern. Warm floor with high water bills is a strong indicator of a hot water slab leak. We have electronic leak detection and can pinpoint exactly where it is. Can we get someone out today?', timestamp: '2026-04-24T09:52:00' },
      { type: 'inbound', content: 'Yes please, the sooner the better.', timestamp: '2026-04-24T09:53:00' },
    ],
  },
  {
    id: 'lead-007',
    name: 'Kevin O\'Brien',
    phone: '(210) 555-0728',
    email: 'kobrien@email.com',
    source: 'LSA',
    trade: 'Insulation',
    service: 'Attic Insulation',
    city: 'New Braunfels, TX',
    status: 'Contacted',
    urgency: 'Medium',
    lastContact: '2026-04-23T15:30:00',
    createdAt: '2026-04-23T10:20:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'What type of insulation service?', answer: 'Attic insulation — energy bills are too high' },
      { question: 'Home size?', answer: '2,400 sq ft, single story' },
    ],
    bookingIntent: 'Interested in a quote comparison',
    conversation: [
      { type: 'outbound', content: 'Hi Kevin, thanks for your interest in our insulation services. What are you looking to get done?', timestamp: '2026-04-23T10:25:00' },
      { type: 'inbound', content: 'My energy bills are crazy. Neighbor said insulation might help. How much does attic insulation cost for about 2400 sq ft?', timestamp: '2026-04-23T10:30:00' },
      { type: 'outbound', content: 'It varies by current insulation level and what R-value we target, but we can give a firm quote after a quick inspection. Want us to take a look?', timestamp: '2026-04-23T10:32:00' },
      { type: 'inbound', content: 'Sure, let me get a couple quotes and I\'ll get back to you.', timestamp: '2026-04-23T15:30:00' },
    ],
  },
  {
    id: 'lead-008',
    name: 'Lisa Nguyen',
    phone: '(512) 555-0831',
    email: 'lnguyen@email.com',
    source: 'Organic',
    trade: 'HVAC',
    service: 'Furnace Maintenance',
    city: 'Leander, TX',
    status: 'Booked',
    urgency: 'Low',
    lastContact: '2026-04-22T09:00:00',
    createdAt: '2026-04-21T16:40:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'Service needed?', answer: 'Annual furnace tune-up before summer' },
      { question: 'Unit type?', answer: 'Heat pump system, 4 years old' },
    ],
    bookingIntent: 'Estimate booked for April 29',
    conversation: [
      { type: 'outbound', content: 'Hi Lisa, thanks for scheduling with us. Just confirming your furnace maintenance for next Tuesday.', timestamp: '2026-04-22T09:00:00' },
      { type: 'inbound', content: 'Great, yes Tuesday works. Will you check the AC side too?', timestamp: '2026-04-22T09:05:00' },
      { type: 'outbound', content: 'Absolutely — our tune-up covers the full system including AC. See you Tuesday!', timestamp: '2026-04-22T09:06:00' },
    ],
  },
  {
    id: 'lead-009',
    name: 'Michael Patterson',
    phone: '(210) 555-0942',
    email: 'mpatterson@email.com',
    source: 'Google Ads',
    trade: 'Roofing',
    service: 'Full Roof Replacement',
    city: 'San Marcos, TX',
    status: 'Qualified',
    urgency: 'High',
    lastContact: '2026-04-24T07:20:00',
    createdAt: '2026-04-23T09:00:00',
    missedCall: true,
    recovered: true,
    qualificationAnswers: [
      { question: 'What roofing work do you need?', answer: 'Full replacement — roof is 22 years old and leaking in two spots' },
      { question: 'Insurance claim?', answer: 'Yes, filed after last month\'s hail' },
      { question: 'Roof size estimate?', answer: 'About 2,800 sq ft' },
    ],
    bookingIntent: 'Wants multiple bids — insurance adjustor coming next week',
    conversation: [
      { type: 'system', content: 'Missed call from (210) 555-0942', timestamp: '2026-04-23T09:00:00' },
      { type: 'outbound', content: 'Hi Michael, this is Lone Star Roofing. We missed your call — dealing with roof issues?', timestamp: '2026-04-23T09:02:00' },
      { type: 'inbound', content: 'Yeah, I need a full roof replacement. It\'s 22 years old and we have two active leaks after the last storm.', timestamp: '2026-04-23T09:08:00' },
      { type: 'outbound', content: 'Sorry to hear that. Have you filed an insurance claim? We work with adjustors regularly.', timestamp: '2026-04-23T09:09:00' },
      { type: 'inbound', content: 'Filed last week. Adjustor is coming out Monday or Tuesday.', timestamp: '2026-04-23T09:12:00' },
      { type: 'outbound', content: 'Great — we can do a free inspection before the adjustor comes so you know what to expect. Want us to come out Friday or Saturday?', timestamp: '2026-04-23T09:13:00' },
      { type: 'inbound', content: 'Saturday morning works if you can.', timestamp: '2026-04-24T07:20:00' },
    ],
  },
  {
    id: 'lead-010',
    name: 'Rachel Hoffman',
    phone: '(737) 555-1053',
    email: 'rhoffman@email.com',
    source: 'Referral',
    trade: 'Electrical',
    service: 'EV Charger Installation',
    city: 'Dripping Springs, TX',
    status: 'Booking Requested',
    urgency: 'Medium',
    lastContact: '2026-04-24T10:55:00',
    createdAt: '2026-04-23T12:15:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'What do you need?', answer: 'Level 2 EV charger installed in garage' },
      { question: 'Panel capacity?', answer: 'Not sure — house was built in 2019' },
      { question: 'Vehicle?', answer: 'Tesla Model Y' },
    ],
    bookingIntent: 'Ready to book — wants it done before road trip in May',
    conversation: [
      { type: 'outbound', content: 'Hi Rachel, thanks for the inquiry about EV charger installation. What kind of setup are you looking for?', timestamp: '2026-04-23T12:20:00' },
      { type: 'inbound', content: 'I need a Level 2 charger in my garage for a Tesla Model Y. A friend recommended you.', timestamp: '2026-04-23T12:25:00' },
      { type: 'outbound', content: 'We install those all the time. Do you know your panel capacity? A 2019 home should have plenty of room.', timestamp: '2026-04-23T12:26:00' },
      { type: 'inbound', content: 'I\'m not sure about the panel. Can your electrician check when they come?', timestamp: '2026-04-23T12:30:00' },
      { type: 'outbound', content: 'Absolutely. We\'ll assess the panel, recommend the right charger, and give you a full quote on the spot. When would be a good time?', timestamp: '2026-04-23T12:31:00' },
      { type: 'inbound', content: 'Next week would be great. I have a road trip in May so hoping to get it done soon.', timestamp: '2026-04-24T10:55:00' },
    ],
  },
  {
    id: 'lead-011',
    name: 'Carlos Gutierrez',
    phone: '(512) 555-1164',
    email: 'cgutierrez@email.com',
    source: 'LSA',
    trade: 'Plumbing',
    service: 'Drain Cleaning',
    city: 'Kyle, TX',
    status: 'Unqualified',
    urgency: 'Low',
    lastContact: '2026-04-23T11:40:00',
    createdAt: '2026-04-23T11:00:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'What plumbing service do you need?', answer: 'Kitchen drain is slow' },
      { question: 'Service area?', answer: 'Rental property — tenant called me' },
    ],
    bookingIntent: 'Decided to try DIY first',
    conversation: [
      { type: 'outbound', content: 'Hi Carlos, thanks for contacting us. What plumbing issue are you dealing with?', timestamp: '2026-04-23T11:05:00' },
      { type: 'inbound', content: 'Kitchen drain at one of my rental properties is slow. My tenant is complaining.', timestamp: '2026-04-23T11:10:00' },
      { type: 'outbound', content: 'We can get that cleared up quickly. Want us to schedule a drain cleaning?', timestamp: '2026-04-23T11:12:00' },
      { type: 'inbound', content: 'Actually I think I\'ll try snaking it myself first. I\'ll call back if that doesn\'t work.', timestamp: '2026-04-23T11:40:00' },
    ],
  },
  {
    id: 'lead-012',
    name: 'Brittany Moore',
    phone: '(210) 555-1275',
    email: 'bmoore@email.com',
    source: 'Google Ads',
    trade: 'HVAC',
    service: 'Ductless Mini-Split Install',
    city: 'Boerne, TX',
    status: 'Closed Lost',
    urgency: 'Medium',
    lastContact: '2026-04-22T13:00:00',
    createdAt: '2026-04-20T15:30:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'What HVAC service?', answer: 'Mini-split for converted garage' },
      { question: 'Size?', answer: 'About 400 sq ft' },
    ],
    bookingIntent: 'Went with a competitor — price was lower',
    conversation: [
      { type: 'outbound', content: 'Hi Brittany, thanks for reaching out about mini-split installation. Tell us about the space.', timestamp: '2026-04-20T15:35:00' },
      { type: 'inbound', content: 'I converted my garage into an office and need AC. About 400 sq ft.', timestamp: '2026-04-20T15:40:00' },
      { type: 'outbound', content: 'A single-zone mini-split would be perfect for that. We can come take measurements and give you a quote. When works?', timestamp: '2026-04-20T15:42:00' },
      { type: 'inbound', content: 'Actually I got a quote from someone else that was quite a bit cheaper. Going to go with them. Thanks though!', timestamp: '2026-04-22T13:00:00' },
    ],
  },
  {
    id: 'lead-013',
    name: 'James Whitfield',
    phone: '(737) 555-1386',
    email: 'jwhitfield@email.com',
    source: 'Organic',
    trade: 'Roofing',
    service: 'Gutter Installation',
    city: 'Buda, TX',
    status: 'Contacted',
    urgency: 'Low',
    lastContact: '2026-04-24T08:10:00',
    createdAt: '2026-04-24T07:45:00',
    missedCall: true,
    recovered: true,
    qualificationAnswers: [],
    bookingIntent: '',
    conversation: [
      { type: 'system', content: 'Missed call from (737) 555-1386', timestamp: '2026-04-24T07:45:00' },
      { type: 'outbound', content: 'Hi James, this is Lone Star Roofing. We missed your call — how can we help?', timestamp: '2026-04-24T07:46:00' },
      { type: 'inbound', content: 'Hi, I need seamless gutters installed. No rush, just want to get it done before fall.', timestamp: '2026-04-24T08:10:00' },
    ],
  },
  {
    id: 'lead-014',
    name: 'Patricia Sandoval',
    phone: '(512) 555-1497',
    email: 'psandoval@email.com',
    source: 'LSA',
    trade: 'Insulation',
    service: 'Spray Foam Insulation',
    city: 'Hutto, TX',
    status: 'New',
    urgency: 'Medium',
    lastContact: '2026-04-24T11:02:00',
    createdAt: '2026-04-24T11:00:00',
    missedCall: true,
    recovered: false,
    qualificationAnswers: [],
    bookingIntent: '',
    conversation: [
      { type: 'system', content: 'Missed call from (512) 555-1497', timestamp: '2026-04-24T11:00:00' },
      { type: 'outbound', content: 'Hi Patricia, this is EcoShield Insulation. We missed your call — are you looking for insulation work?', timestamp: '2026-04-24T11:02:00' },
    ],
  },
  {
    id: 'lead-015',
    name: 'Thomas Reed',
    phone: '(210) 555-1608',
    email: 'treed@email.com',
    source: 'Referral',
    trade: 'Electrical',
    service: 'Whole-Home Rewire',
    city: 'Seguin, TX',
    status: 'Qualified',
    urgency: 'High',
    lastContact: '2026-04-23T17:00:00',
    createdAt: '2026-04-22T08:30:00',
    missedCall: false,
    recovered: false,
    qualificationAnswers: [
      { question: 'What electrical work do you need?', answer: 'Full house rewire — buying a 1965 home' },
      { question: 'Has it been inspected?', answer: 'Yes, inspector flagged the knob-and-tube wiring' },
      { question: 'Timeline?', answer: 'Need it done before closing in 6 weeks' },
    ],
    bookingIntent: 'Needs estimate for the bank — part of the purchase requirement',
    conversation: [
      { type: 'outbound', content: 'Hi Thomas, we received your inquiry about a whole-home rewire. Tell us more about the property.', timestamp: '2026-04-22T08:35:00' },
      { type: 'inbound', content: 'I\'m buying a 1965 ranch house. Home inspector found knob-and-tube wiring throughout. Bank wants it rewired before closing.', timestamp: '2026-04-22T08:42:00' },
      { type: 'outbound', content: 'We see a lot of these. How many square feet and how many bedrooms/bathrooms?', timestamp: '2026-04-22T08:43:00' },
      { type: 'inbound', content: '1,800 sq ft, 3 bed 2 bath. I need a written estimate for the bank ASAP.', timestamp: '2026-04-22T08:48:00' },
      { type: 'outbound', content: 'We can get out there this week for a thorough assessment and have a written estimate to you within 48 hours. Would Thursday work?', timestamp: '2026-04-22T08:49:00' },
      { type: 'inbound', content: 'Thursday at 2pm would be perfect.', timestamp: '2026-04-23T17:00:00' },
    ],
  },
  {
    id: 'lead-016',
    name: 'Denise Crawford',
    phone: '(512) 555-1719',
    email: 'dcrawford@email.com',
    source: 'Google Ads',
    trade: 'HVAC',
    service: 'AC Repair',
    city: 'Manor, TX',
    status: 'Booking Requested',
    urgency: 'Urgent',
    lastContact: '2026-04-24T09:10:00',
    createdAt: '2026-04-24T08:55:00',
    missedCall: true,
    recovered: true,
    qualificationAnswers: [
      { question: 'What\'s happening?', answer: 'AC blowing warm air since last night' },
      { question: 'Unit age?', answer: '6 years old' },
      { question: 'Any ice on the unit?', answer: 'Yes, there\'s ice on the outside unit' },
    ],
    bookingIntent: 'Needs same-day service — has elderly parent at home',
    conversation: [
      { type: 'system', content: 'Missed call from (512) 555-1719', timestamp: '2026-04-24T08:55:00' },
      { type: 'outbound', content: 'Hi Denise, this is Austin Comfort Pros. We see you called — is your AC acting up?', timestamp: '2026-04-24T08:56:00' },
      { type: 'inbound', content: 'Yes! It started blowing warm air last night and now there\'s ice on the outside unit. My 82-year-old mom lives with me.', timestamp: '2026-04-24T08:58:00' },
      { type: 'outbound', content: 'Ice on the unit usually means a refrigerant issue or airflow problem. With your mom\'s health in mind, we\'ll prioritize this. Can we get a tech out today?', timestamp: '2026-04-24T08:59:00' },
      { type: 'inbound', content: 'Please yes, anytime today works. Thank you!', timestamp: '2026-04-24T09:00:00' },
      { type: 'outbound', content: 'We\'re on it. Expect a call from our dispatch team within the hour to confirm a time window. Hang in there!', timestamp: '2026-04-24T09:10:00' },
    ],
  },
];

// ---- ALERTS ----
export const alerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'hot_lead',
    leadId: 'lead-001',
    contactName: 'Marcus Johnson',
    summary: 'Recovered missed call — AC replacement needed ASAP, unit failed in 95°F heat',
    urgency: 'Urgent',
    recommendation: 'Call back within 30 minutes to confirm tomorrow morning estimate slot',
    timestamp: '2026-04-24T08:26:00',
    read: false,
  },
  {
    id: 'alert-002',
    type: 'emergency',
    leadId: 'lead-006',
    contactName: 'Amanda Torres',
    summary: 'Possible slab leak — warm floor, doubled water bill, worried about foundation',
    urgency: 'Urgent',
    recommendation: 'Dispatch leak detection tech today — customer is anxious',
    timestamp: '2026-04-24T09:53:00',
    read: false,
  },
  {
    id: 'alert-003',
    type: 'hot_lead',
    leadId: 'lead-016',
    contactName: 'Denise Crawford',
    summary: 'AC down with elderly parent in home — ice on unit, blowing warm air',
    urgency: 'Urgent',
    recommendation: 'Same-day dispatch required — health concern for elderly resident',
    timestamp: '2026-04-24T09:10:00',
    read: false,
  },
  {
    id: 'alert-004',
    type: 'estimate_requested',
    leadId: 'lead-009',
    contactName: 'Michael Patterson',
    summary: 'Full roof replacement — insurance claim filed, adjustor coming next week',
    urgency: 'High',
    recommendation: 'Schedule Saturday morning inspection before insurance adjustor visit',
    timestamp: '2026-04-24T07:20:00',
    read: true,
  },
  {
    id: 'alert-005',
    type: 'estimate_requested',
    leadId: 'lead-010',
    contactName: 'Rachel Hoffman',
    summary: 'EV charger installation — Tesla Model Y, wants it done before May road trip',
    urgency: 'Medium',
    recommendation: 'Book estimate for next week — customer has a deadline',
    timestamp: '2026-04-24T10:55:00',
    read: false,
  },
  {
    id: 'alert-006',
    type: 'follow_up',
    leadId: 'lead-003',
    contactName: 'David Ramirez',
    summary: 'Storm damage lead not yet recovered — initial text sent, no reply',
    urgency: 'Urgent',
    recommendation: 'Follow up with phone call — storm damage leads go cold fast',
    timestamp: '2026-04-24T10:45:00',
    read: false,
  },
  {
    id: 'alert-007',
    type: 'follow_up',
    leadId: 'lead-007',
    contactName: 'Kevin O\'Brien',
    summary: 'Insulation lead getting comparison quotes — hasn\'t committed yet',
    urgency: 'Medium',
    recommendation: 'Send follow-up with pricing breakdown and energy savings estimate',
    timestamp: '2026-04-24T08:00:00',
    read: true,
  },
  {
    id: 'alert-008',
    type: 'hot_lead',
    leadId: 'lead-015',
    contactName: 'Thomas Reed',
    summary: 'Whole-home rewire — bank requires estimate before closing in 6 weeks',
    urgency: 'High',
    recommendation: 'Ensure Thursday inspection happens — time-sensitive for home purchase',
    timestamp: '2026-04-23T17:05:00',
    read: true,
  },
];

// ---- RECENT ACTIVITY ----
export const recentActivity: ActivityEvent[] = [
  { id: 'act-001', type: 'missed_call_recovered', description: 'Missed call recovered — AC replacement inquiry', leadName: 'Marcus Johnson', timestamp: '2026-04-24T08:16:00' },
  { id: 'act-002', type: 'lead_replied', description: 'Customer replied with scheduling preference', leadName: 'Marcus Johnson', timestamp: '2026-04-24T08:25:00' },
  { id: 'act-003', type: 'owner_alert', description: 'Urgent alert sent — same-day AC repair needed', leadName: 'Denise Crawford', timestamp: '2026-04-24T09:10:00' },
  { id: 'act-004', type: 'missed_call_recovered', description: 'Missed call recovered — slab leak emergency', leadName: 'Amanda Torres', timestamp: '2026-04-24T09:46:00' },
  { id: 'act-005', type: 'lead_qualified', description: 'Lead qualified — slab leak confirmed, urgent dispatch', leadName: 'Amanda Torres', timestamp: '2026-04-24T09:53:00' },
  { id: 'act-006', type: 'booking_requested', description: 'Booking requested — EV charger installation', leadName: 'Rachel Hoffman', timestamp: '2026-04-24T10:55:00' },
  { id: 'act-007', type: 'owner_alert', description: 'Follow-up alert — storm damage lead not responding', leadName: 'David Ramirez', timestamp: '2026-04-24T10:45:00' },
  { id: 'act-008', type: 'missed_call_recovered', description: 'Missed call recovered — storm damage inspection', leadName: 'David Ramirez', timestamp: '2026-04-24T10:30:00' },
  { id: 'act-009', type: 'lead_replied', description: 'Customer confirmed Saturday morning inspection', leadName: 'Michael Patterson', timestamp: '2026-04-24T07:20:00' },
  { id: 'act-010', type: 'booking_requested', description: 'Booking requested — panel upgrade estimate', leadName: 'Jennifer Walsh', timestamp: '2026-04-23T16:20:00' },
  { id: 'act-011', type: 'missed_call_recovered', description: 'Missed call recovered — gutter installation inquiry', leadName: 'James Whitfield', timestamp: '2026-04-24T07:46:00' },
  { id: 'act-012', type: 'lead_qualified', description: 'Lead qualified — full roof replacement with insurance claim', leadName: 'Michael Patterson', timestamp: '2026-04-23T09:13:00' },
];

// ---- DASHBOARD METRICS ----
export const dashboardMetrics = {
  totalLeads: 16,
  missedCalls: 8,
  recoveredLeads: 7,
  qualifiedLeads: 9,
  estimatesBooked: 4,
  avgResponseTime: '47 sec',
};

export const funnelData = {
  leadsIn: 16,
  contacted: 13,
  qualified: 9,
  booked: 4,
};

// ---- SCORECARD DATA ----
export const scorecardData = {
  month: 'April 2026',
  totalInbound: 48,
  missedCalls: 22,
  recoveredMissedCalls: 18,
  recoveryRate: 82,
  qualifiedLeads: 31,
  bookedEstimates: 14,
  avgResponseTime: '52 sec',
  sourceBreakdown: [
    { source: 'Google Ads', leads: 19, booked: 7 },
    { source: 'LSA', leads: 12, booked: 3 },
    { source: 'Organic', leads: 9, booked: 2 },
    { source: 'Referral', leads: 8, booked: 2 },
  ],
  roi: {
    adSpend: 3200,
    estimatedRevenue: 42000,
    costPerLead: 67,
    costPerBooking: 229,
    bookingRate: 29,
  },
  weeklyTrend: [
    { week: 'Week 1', leads: 10, booked: 3 },
    { week: 'Week 2', leads: 13, booked: 4 },
    { week: 'Week 3', leads: 14, booked: 4 },
    { week: 'Week 4', leads: 11, booked: 3 },
  ],
};

// ---- ADMIN / MULTI-CLIENT DATA ----

export type ClientStatus = 'Active' | 'Trial' | 'Paused' | 'Onboarding';
export type PlanTier = 'Starter' | 'Growth' | 'Pro';
export type WorkflowHealth = 'Healthy' | 'Needs Attention' | 'Critical';
export type OnboardingStep = 'Phone Setup' | 'Script Approved' | 'Workflow Live' | 'First Lead' | 'Scorecard Sent';

export interface ClientAccount {
  id: string;
  companyName: string;
  ownerName: string;
  trade: Trade;
  city: string;
  serviceArea: string;
  status: ClientStatus;
  plan: PlanTier;
  workflowHealth: WorkflowHealth;
  assignedNumber: string;
  monthlyPrice: number;
  onboardingSteps: { step: OnboardingStep; completed: boolean; completedDate?: string }[];
  totalLeads: number;
  missedCalls: number;
  recoveredLeads: number;
  bookedEstimates: number;
  avgBookedJobValue: number;
  closeRatePct: number;
  openTasks: number;
  lastActivity: string;
  recentEvents: { description: string; timestamp: string }[];
  openIssues: string[];
  scriptNotes: string;
}

export interface AdminMetrics {
  totalClients: number;
  activeClients: number;
  trialClients: number;
  pausedClients: number;
  onboardingClients: number;
  totalLeadsAllClients: number;
  recoveredLeadsAllClients: number;
  bookedEstimatesAllClients: number;
  workflowsNeedingAttention: number;
  openSupportTasks: number;
}

export interface SupportTask {
  id: string;
  clientId: string;
  clientName: string;
  summary: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface OperatorAction {
  id: string;
  action: string;
  clientName: string;
  timestamp: string;
}

export const clientAccounts: ClientAccount[] = [
  {
    id: 'client-001',
    companyName: 'Tulsa Peak HVAC',
    ownerName: 'Marcus Bell',
    trade: 'HVAC',
    city: 'Tulsa, OK',
    serviceArea: 'Tulsa Metro',
    status: 'Active',
    plan: 'Pro',
    workflowHealth: 'Healthy',
    assignedNumber: '(918) 555-0100',
    monthlyPrice: 799,
    onboardingSteps: [
      { step: 'Phone Setup', completed: true, completedDate: '2026-03-01' },
      { step: 'Script Approved', completed: true, completedDate: '2026-03-03' },
      { step: 'Workflow Live', completed: true, completedDate: '2026-03-05' },
      { step: 'First Lead', completed: true, completedDate: '2026-03-06' },
      { step: 'Scorecard Sent', completed: true, completedDate: '2026-03-31' },
    ],
    totalLeads: 62,
    missedCalls: 34,
    recoveredLeads: 28,
    bookedEstimates: 19,
    avgBookedJobValue: 6800,
    closeRatePct: 42,
    openTasks: 0,
    lastActivity: '2026-04-24T10:15:00',
    recentEvents: [
      { description: 'Scorecard delivered for April week 3', timestamp: '2026-04-21T09:00:00' },
      { description: 'Lead recovered — AC replacement urgent', timestamp: '2026-04-24T08:16:00' },
      { description: 'Booking confirmed — duct cleaning', timestamp: '2026-04-23T14:30:00' },
    ],
    openIssues: [],
    scriptNotes: 'Approved script v3 — focuses on emergency same-day dispatch and senior-friendly language.',
  },
  {
    id: 'client-002',
    companyName: 'Red Fork Roofing',
    ownerName: 'Travis Dunn',
    trade: 'Roofing',
    city: 'Broken Arrow, OK',
    serviceArea: 'Tulsa County + Wagoner County',
    status: 'Active',
    plan: 'Growth',
    workflowHealth: 'Needs Attention',
    assignedNumber: '(918) 555-0200',
    monthlyPrice: 499,
    onboardingSteps: [
      { step: 'Phone Setup', completed: true, completedDate: '2026-03-10' },
      { step: 'Script Approved', completed: true, completedDate: '2026-03-12' },
      { step: 'Workflow Live', completed: true, completedDate: '2026-03-14' },
      { step: 'First Lead', completed: true, completedDate: '2026-03-15' },
      { step: 'Scorecard Sent', completed: true, completedDate: '2026-04-01' },
    ],
    totalLeads: 38,
    missedCalls: 21,
    recoveredLeads: 15,
    bookedEstimates: 11,
    avgBookedJobValue: 11500,
    closeRatePct: 31,
    openTasks: 2,
    lastActivity: '2026-04-24T09:45:00',
    recentEvents: [
      { description: 'Missed call — storm damage lead not recovered', timestamp: '2026-04-24T09:45:00' },
      { description: 'Follow-up workflow delayed — queue backup', timestamp: '2026-04-23T16:00:00' },
      { description: 'Lead qualified — full roof replacement with insurance', timestamp: '2026-04-23T09:13:00' },
    ],
    openIssues: ['Follow-up SMS delay (avg 4min vs target 1min)', 'Storm surge queue needs capacity increase'],
    scriptNotes: 'Script v2 — insurance claim handling added after April storm season feedback.',
  },
  {
    id: 'client-003',
    companyName: 'Green Country Plumbing',
    ownerName: 'Nina Vasquez',
    trade: 'Plumbing',
    city: 'Owasso, OK',
    serviceArea: 'North Tulsa Metro',
    status: 'Active',
    plan: 'Pro',
    workflowHealth: 'Healthy',
    assignedNumber: '(918) 555-0300',
    monthlyPrice: 799,
    onboardingSteps: [
      { step: 'Phone Setup', completed: true, completedDate: '2026-02-15' },
      { step: 'Script Approved', completed: true, completedDate: '2026-02-17' },
      { step: 'Workflow Live', completed: true, completedDate: '2026-02-19' },
      { step: 'First Lead', completed: true, completedDate: '2026-02-20' },
      { step: 'Scorecard Sent', completed: true, completedDate: '2026-03-31' },
    ],
    totalLeads: 71,
    missedCalls: 39,
    recoveredLeads: 34,
    bookedEstimates: 22,
    avgBookedJobValue: 4200,
    closeRatePct: 46,
    openTasks: 1,
    lastActivity: '2026-04-24T11:15:00',
    recentEvents: [
      { description: 'Lead recovered — slab leak emergency', timestamp: '2026-04-24T09:46:00' },
      { description: 'Booking confirmed — water heater repair', timestamp: '2026-04-24T07:42:00' },
      { description: 'Scorecard delivered for April week 3', timestamp: '2026-04-21T09:00:00' },
    ],
    openIssues: ['Owner requested bilingual script option — pending approval'],
    scriptNotes: 'Script v4 — emergency plumbing focus with slab leak and water heater specialty paths.',
  },
  {
    id: 'client-004',
    companyName: 'Route 66 Electric',
    ownerName: 'Derek Hale',
    trade: 'Electrical',
    city: 'Sapulpa, OK',
    serviceArea: 'West Tulsa + Creek County',
    status: 'Trial',
    plan: 'Starter',
    workflowHealth: 'Healthy',
    assignedNumber: '(918) 555-0400',
    monthlyPrice: 299,
    onboardingSteps: [
      { step: 'Phone Setup', completed: true, completedDate: '2026-04-15' },
      { step: 'Script Approved', completed: true, completedDate: '2026-04-17' },
      { step: 'Workflow Live', completed: true, completedDate: '2026-04-18' },
      { step: 'First Lead', completed: true, completedDate: '2026-04-19' },
      { step: 'Scorecard Sent', completed: false },
    ],
    totalLeads: 9,
    missedCalls: 5,
    recoveredLeads: 4,
    bookedEstimates: 2,
    avgBookedJobValue: 2600,
    closeRatePct: 35,
    openTasks: 1,
    lastActivity: '2026-04-24T10:55:00',
    recentEvents: [
      { description: 'Booking requested — EV charger installation', timestamp: '2026-04-24T10:55:00' },
      { description: 'Lead qualified — whole-home rewire', timestamp: '2026-04-22T08:49:00' },
    ],
    openIssues: ['First scorecard due end of month'],
    scriptNotes: 'Script v1 — general electrical with EV charger and panel upgrade paths. Trial period ends May 15.',
  },
  {
    id: 'client-005',
    companyName: 'Apex Insulation Solutions',
    ownerName: 'Carla Jennings',
    trade: 'Insulation',
    city: 'Sand Springs, OK',
    serviceArea: 'Greater Tulsa',
    status: 'Onboarding',
    plan: 'Growth',
    workflowHealth: 'Needs Attention',
    assignedNumber: '(918) 555-0500',
    monthlyPrice: 499,
    onboardingSteps: [
      { step: 'Phone Setup', completed: true, completedDate: '2026-04-20' },
      { step: 'Script Approved', completed: false },
      { step: 'Workflow Live', completed: false },
      { step: 'First Lead', completed: false },
      { step: 'Scorecard Sent', completed: false },
    ],
    totalLeads: 0,
    missedCalls: 0,
    recoveredLeads: 0,
    bookedEstimates: 0,
    avgBookedJobValue: 5000,
    closeRatePct: 30,
    openTasks: 3,
    lastActivity: '2026-04-23T11:00:00',
    recentEvents: [
      { description: 'Phone number assigned and tested', timestamp: '2026-04-20T14:00:00' },
      { description: 'Onboarding call completed with Carla', timestamp: '2026-04-19T10:00:00' },
    ],
    openIssues: ['Script draft pending owner review', 'Workflow config not started', 'Need service area zip codes confirmed'],
    scriptNotes: 'Draft v1 pending — spray foam and attic insulation focus. Waiting on Carla to approve language.',
  },
];

export const adminMetrics: AdminMetrics = {
  totalClients: 5,
  activeClients: 3,
  trialClients: 1,
  pausedClients: 0,
  onboardingClients: 1,
  totalLeadsAllClients: 180,
  recoveredLeadsAllClients: 81,
  bookedEstimatesAllClients: 54,
  workflowsNeedingAttention: 2,
  openSupportTasks: 4,
};

export const supportTasks: SupportTask[] = [
  { id: 'task-001', clientId: 'client-002', clientName: 'Red Fork Roofing', summary: 'Follow-up SMS delay — avg 4min, needs queue tuning', priority: 'High', status: 'Open', createdAt: '2026-04-23T16:00:00' },
  { id: 'task-002', clientId: 'client-005', clientName: 'Apex Insulation Solutions', summary: 'Script draft needs review — waiting on owner approval', priority: 'Medium', status: 'In Progress', createdAt: '2026-04-21T10:00:00' },
  { id: 'task-003', clientId: 'client-005', clientName: 'Apex Insulation Solutions', summary: 'Workflow configuration not started yet', priority: 'High', status: 'Open', createdAt: '2026-04-22T09:00:00' },
  { id: 'task-004', clientId: 'client-003', clientName: 'Green Country Plumbing', summary: 'Bilingual script option requested by owner', priority: 'Low', status: 'Open', createdAt: '2026-04-22T14:00:00' },
  { id: 'task-005', clientId: 'client-004', clientName: 'Route 66 Electric', summary: 'First scorecard due by end of April', priority: 'Medium', status: 'Open', createdAt: '2026-04-20T09:00:00' },
  { id: 'task-006', clientId: 'client-005', clientName: 'Apex Insulation Solutions', summary: 'Need zip code list for service area config', priority: 'Medium', status: 'Open', createdAt: '2026-04-23T08:00:00' },
];

export const operatorActions: OperatorAction[] = [
  { id: 'op-001', action: 'Delivered weekly scorecard', clientName: 'Tulsa Peak HVAC', timestamp: '2026-04-21T09:00:00' },
  { id: 'op-002', action: 'Updated follow-up script for storm season', clientName: 'Red Fork Roofing', timestamp: '2026-04-20T15:30:00' },
  { id: 'op-003', action: 'Completed onboarding call', clientName: 'Apex Insulation Solutions', timestamp: '2026-04-19T10:00:00' },
  { id: 'op-004', action: 'Assigned tracking number', clientName: 'Route 66 Electric', timestamp: '2026-04-15T14:00:00' },
  { id: 'op-005', action: 'Approved script revision v4', clientName: 'Green Country Plumbing', timestamp: '2026-04-14T11:00:00' },
  { id: 'op-006', action: 'Escalated storm-surge queue issue', clientName: 'Red Fork Roofing', timestamp: '2026-04-23T16:30:00' },
  { id: 'op-007', action: 'Sent trial conversion follow-up email', clientName: 'Route 66 Electric', timestamp: '2026-04-22T10:00:00' },
];

export function getClientStatusColor(status: ClientStatus): string {
  const map: Record<ClientStatus, string> = {
    'Active': 'text-emerald-400 bg-emerald-400/12 border-emerald-400/20',
    'Trial': 'text-blue-400 bg-blue-400/12 border-blue-400/20',
    'Paused': 'text-amber-400 bg-amber-400/12 border-amber-400/20',
    'Onboarding': 'text-purple-400 bg-purple-400/12 border-purple-400/20',
  };
  return map[status];
}

export function getHealthColor(health: WorkflowHealth): string {
  const map: Record<WorkflowHealth, string> = {
    'Healthy': 'text-emerald-400',
    'Needs Attention': 'text-amber-400',
    'Critical': 'text-red-400',
  };
  return map[health];
}

export function getHealthBg(health: WorkflowHealth): string {
  const map: Record<WorkflowHealth, string> = {
    'Healthy': 'bg-emerald-400/10 border-emerald-400/20',
    'Needs Attention': 'bg-amber-400/10 border-amber-400/20',
    'Critical': 'bg-red-400/10 border-red-400/20',
  };
  return map[health];
}

// Utility: get status pill class
export function getStatusPillClass(status: LeadStatus): string {
  const map: Record<LeadStatus, string> = {
    'New': 'pill pill-new',
    'Contacted': 'pill pill-contacted',
    'Qualified': 'pill pill-qualified',
    'Unqualified': 'pill pill-unqualified',
    'Booking Requested': 'pill pill-booking',
    'Booked': 'pill pill-booked',
    'Closed Lost': 'pill pill-closed',
  };
  return map[status];
}

export function getUrgencyPillClass(urgency: Urgency): string {
  const map: Record<Urgency, string> = {
    'Urgent': 'pill pill-urgent',
    'High': 'pill pill-high',
    'Medium': 'pill pill-medium',
    'Low': 'pill pill-low',
  };
  return map[urgency];
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export function timeAgo(dateStr: string): string {
  const now = new Date('2026-04-24T11:30:00');
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}
