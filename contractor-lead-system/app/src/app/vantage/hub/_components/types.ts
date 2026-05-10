export type Stage = 'cold' | 'replied' | 'demo' | 'verbal' | 'customer' | 'lost';

export type Prospect = {
  id: string;
  company: string;
  contactName: string;
  role: string;
  email: string;
  phone?: string;
  metro: string;
  segment:
    | 'Commercial lender'
    | 'Title / closing'
    | 'CRE broker'
    | 'Sponsor / borrower'
    | 'Developer';
  stage: Stage;
  lastTouchAt: string;
  nextAction: string;
  owner: 'Madison' | 'Jason';
  note?: string;
};

export type Action = {
  id: string;
  who: 'Madison' | 'Jason';
  text: string;
  done: boolean;
  priority: 'high' | 'med' | 'low';
};

export type WeekMetric = {
  label: string;
  value: number;
  goal?: number;
};

export const STAGE_LABEL: Record<Stage, string> = {
  cold: 'Cold',
  replied: 'Replied',
  demo: 'Demo booked',
  verbal: 'Verbal commit',
  customer: 'Customer',
  lost: 'Lost',
};

export const STAGE_ORDER: Stage[] = [
  'cold',
  'replied',
  'demo',
  'verbal',
  'customer',
  'lost',
];
