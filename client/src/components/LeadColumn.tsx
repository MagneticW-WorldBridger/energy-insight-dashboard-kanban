import React, { useState, useRef } from 'react';
import LeadCard from './LeadCard';
import { LeadColumn as LeadColumnType, Lead } from '@/types/leads';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeadColumnProps {
  column: LeadColumnType;
  onDragStart?: (id: number) => void;
  onDrop?: (id: string) => void;
}

const LeadColumn: React.FC<LeadColumnProps> = ({ column, onDragStart, onDrop }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  
  const handleDragStart = (lead: Lead) => {
    if (onDragStart) {
      onDragStart(lead.id);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't show dragover state when column is collapsed
    if (!collapsed && !isDragOver) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Only consider it a leave if we're leaving the column element itself
    // not its children
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (collapsed) return;
    
    console.log(`Drop detected on column: ${column.id} (${column.title})`);
    
    if (onDrop) {
      // The column.id is already a string, so we can pass it directly to onDrop
      onDrop(column.id);
    }
  };
  
  return (
    <div 
      ref={columnRef}
      className={`transition-all duration-300 flex flex-col 
        ${collapsed ? 'bg-gray-900' : isDragOver ? 'bg-amber-50' : 'bg-gray-50'} 
        rounded-md shadow-sm
        ${collapsed ? 'min-w-[60px] max-w-[60px]' : 'min-w-[320px] max-w-[320px]'}`} 
      data-component="lead-column"
      data-column-id={column.id}
      style={{ height: "calc(100vh - 200px)" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`${collapsed ? 'h-full' : 'p-3'} bg-gray-900 text-amber-300 ${collapsed ? 'rounded-md' : 'rounded-t-md'} flex items-center justify-between`}>
        {collapsed ? (
          <div 
            className="h-full w-full flex items-center justify-center cursor-pointer"
            onClick={() => setCollapsed(false)}
          >
            <span className="block writing-mode-vertical-rl transform rotate-180 whitespace-nowrap font-medium py-4">
              {column.title} ({column.count})
            </span>
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
