import React from 'react';
import { useLeads } from '@/context/LeadContext';
import { Users, BookMarked, MessageSquare, Calendar } from 'lucide-react';

interface StatsBarProps {
  stats: {
    totalLeads: number;
    newLeadsToday: number;
    consultsBooked: number;
    smsResponseRate: number;
  };
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  // Compute Avg Intent from current leads in context (based on likelihood when present)
  const { leadState } = useLeads();
  const allLeads = Object.values(leadState.columns).flatMap(c => c.items);
  const scored = allLeads
    .map(l => (typeof l.assessment === 'string' ? undefined : l.assessment))
    .filter((a): a is { likelihood?: number } => !!a && typeof a.likelihood === 'number');
  const avgIntent = scored.length > 0
    ? Math.round((scored.reduce((sum, a) => sum + (a.likelihood || 0), 0) / scored.length) * 10) / 10
    : 0;
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4" data-component="stats-bar">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-[color:hsl(var(--rk-muted))] text-[color:hsl(var(--rk-info))] flex items-center justify-center mr-3">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Leads</p>
              <p className="text-lg font-semibold">{stats.totalLeads}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-[color:hsl(var(--rk-muted))] text-[color:hsl(var(--rk-success))] flex items-center justify-center mr-3">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">New Today</p>
              <p className="text-lg font-semibold">{stats.newLeadsToday}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-[color:hsl(var(--rk-muted))] text-purple-600 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Follow-ups Scheduled</p>
              <p className="text-lg font-semibold">{stats.consultsBooked}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-[color:hsl(var(--rk-muted))] text-[color:hsl(var(--rk-accent))] flex items-center justify-center mr-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">SMS Response Rate</p>
              <p className="text-lg font-semibold">{stats.smsResponseRate}%</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-[color:hsl(var(--rk-muted))] text-[color:hsl(var(--rk-primary))] flex items-center justify-center mr-3">
              <span className="text-sm font-semibold">AI</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Avg Intent</p>
              <p className="text-lg font-semibold">{avgIntent}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
