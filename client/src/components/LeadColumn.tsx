import React from 'react';
import LeadCard from './LeadCard';
import { LeadColumn as LeadColumnType } from '@/types/leads';
import { MoreHorizontal } from 'lucide-react';

interface LeadColumnProps {
  column: LeadColumnType;
}

const LeadColumn: React.FC<LeadColumnProps> = ({ column }) => {
  return (
    <div 
      className="min-w-[320px] max-w-[320px] flex flex-col bg-gray-50 rounded-md shadow-sm" 
      data-component="lead-column"
      style={{ height: "calc(100vh - 200px)" }}
    >
      <div className="p-3 bg-gray-900 text-amber-300 rounded-t-md flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-medium">{column.title}</h3>
          <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">{column.count}</span>
        </div>
        <button className="p-1 rounded hover:bg-gray-700">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto space-y-2 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {column.items.map(item => (
          <LeadCard key={item.id} lead={item} />
        ))}
      </div>
    </div>
  );
};

export default LeadColumn;
