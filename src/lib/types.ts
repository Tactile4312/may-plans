export type PartnerKey = "p1" | "p2";
export type Status = "Planned" | "Completed" | "Postponed";
export const STATUSES: Status[] = ["Planned", "Completed", "Postponed"];

export interface DateItem {
  id: string;
  day: number; // day of the month
  title: string;
  cat: string;
  desc: string;
  place: string;
  planned: number;
  transport: number;
  food: number;
  q: string; // TikTok search words
  status: Status;
  actual: number | null; // null = not entered yet
  notes: string;
  rating: number; // 0–5
  span: number; // 1 = one day, 2 = overnight
  demoP?: boolean; // demo progress flag
}

export interface Contribution {
  id: string;
  date: string; // YYYY-MM-DD
  who: PartnerKey;
  amount: number;
  type: "Cash" | "Digital";
  note: string;
  purpose: string;
  demo?: boolean;
}

export interface Place {
  id: string;
  name: string;
  area: string;
  cat: string;
  cost: number;
  link: string;
  who: PartnerKey | "idea";
  note: string;
  visited: boolean;
  dateId: string | null;
}

export interface Planner {
  v: number;
  names: Record<PartnerKey, string>;
  budget: number;
  target: number;
  demo?: boolean;
  dates: DateItem[];
  contribs: Contribution[];
  places: Place[];
}
