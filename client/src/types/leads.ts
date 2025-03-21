export interface Assessment {
  likelihood?: number;
  benefits?: number;
  overall: string;
}

export interface Lead {
  id: number;
  name: string;
  username: string;
  time: string;
  source: string;
  tags: string[];
  avatar?: string;
  assessment: Assessment | "Pending" | "Incomplete";
  
  // Optional fields based on lead status
  smsStatus?: 'Delivered' | 'Sent' | 'Pending';
  sendTime?: string;
  verifiedTime?: string;
  score?: number;
  qualScore?: number;
  priority?: string;
  consultDate?: string;
  financing?: string;
  reason?: string;
  notes?: string;
}

export interface LeadColumn {
  id: string;
  title: string;
  count: number;
  items: Lead[];
}

export interface LeadState {
  columns: {
    [key: string]: LeadColumn;
  };
  stats: {
    totalLeads: number;
    newLeadsToday: number;
    consultsBooked: number;
    smsResponseRate: number;
  };
}

export interface FilterOptions {
  dateRange?: string;
  leadSource?: string;
  procedure?: string;
}
