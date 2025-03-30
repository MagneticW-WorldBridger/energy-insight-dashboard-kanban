import React, { useState } from 'react';
import LeadCard from './LeadCard';
import { LeadColumn as LeadColumnType, Lead } from '@/types/leads';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeadColumnProps {
  column: LeadColumnType;
  onDragStart?: (id: number) => void;
  onDrop?: (id: number) => void;
}

const LeadColumn: React.FC<LeadColumnProps> = ({ column, onDragStart, onDrop }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const handleDragStart = (lead: Lead) => {
    if (onDragStart) {
      onDragStart(lead.id);
    }
  };
  
  return (
    <div 
      className={`transition-all duration-300 flex flex-col bg-gray-50 rounded-md shadow-sm
        ${collapsed ? 'min-w-[60px] max-w-[60px]' : 'min-w-[320px] max-w-[320px]'}`} 
      data-component="lead-column"
      style={{ height: "calc(100vh - 200px)" }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop && onDrop(parseInt(column.id))}
    >
      <div className={`${collapsed ? 'p-2' : 'p-3'} bg-gray-900 text-amber-300 rounded-t-md flex items-center justify-between`}>
        {collapsed ? (
          <div 
            className="writing-vertical py-4 flex flex-col items-center justify-center w-full cursor-pointer"
            onClick={() => setCollapsed(false)}
          >
            <div className="rotate-90 whitespace-nowrap flex items-center font-medium">
              {column.title}
              <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">{column.count}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center">
              <h3 className="font-medium">{column.title}</h3>
              <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">{column.count}</span>
            </div>
            <div className="flex items-center">
              <button 
                className="p-1 rounded hover:bg-gray-700 mr-1"
                onClick={() => setCollapsed(true)}
                title="Collapse column"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="p-1 rounded hover:bg-gray-700">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
      
      {!collapsed && (
        <div className="flex-1 p-2 overflow-y-auto space-y-2 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {column.items.map(item => (
            <LeadCard 
              key={item.id} 
              lead={item} 
              onDragStart={() => handleDragStart(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadColumn;
