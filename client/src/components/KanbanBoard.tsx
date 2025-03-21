import React from 'react';
import LeadColumn from './LeadColumn';
import { LeadColumn as LeadColumnType } from '@/types/leads';
import { useLeads } from '@/context/LeadContext';

interface KanbanBoardProps {
  columns: {
    [key: string]: LeadColumnType;
  };
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns }) => {
  const { searchTerm, filters } = useLeads();

  // Filter leads based on search term and filter options
  const filteredColumns = Object.entries(columns).reduce<Record<string, LeadColumnType>>((acc, [key, column]) => {
    let filteredItems = column.items;
    
    // Apply search term filter
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Apply other filters
    if (filters.dateRange) {
      if (filters.dateRange === 'Last 7 Days') {
        // Simple simulation - in a real app, would compare actual dates
        filteredItems = filteredItems.filter(item => 
          !item.time.includes('d ago') || item.time.includes('1d ago')
        );
      }
    }
    
    if (filters.leadSource && filters.leadSource !== 'All Sources') {
      filteredItems = filteredItems.filter(item => 
        item.source.includes(filters.leadSource || '')
      );
    }
    
    if (filters.procedure && filters.procedure !== 'All Procedures') {
      filteredItems = filteredItems.filter(item => 
        Array.isArray(item.tags) && item.tags.some(tag => tag.includes(filters.procedure || ''))
      );
    }
    
    acc[key] = {
      ...column,
      items: filteredItems,
      count: filteredItems.length
    };
    
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-x-auto scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      <div className="inline-flex h-full p-4 space-x-4">
        {Object.values(filteredColumns).map((column: any) => (
          <LeadColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
