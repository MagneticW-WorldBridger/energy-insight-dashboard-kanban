import React from 'react';
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
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4" data-component="stats-bar">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Leads</p>
              <p className="text-lg font-semibold">{stats.totalLeads}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-green-100 text-green-600 flex items-center justify-center mr-3">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">New Today</p>
              <p className="text-lg font-semibold">{stats.newLeadsToday}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Consults Booked</p>
              <p className="text-lg font-semibold">{stats.consultsBooked}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">SMS Response Rate</p>
              <p className="text-lg font-semibold">{stats.smsResponseRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
