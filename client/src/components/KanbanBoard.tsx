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
  const { searchTerm } = useLeads();

  // Filter leads based on search term
  const filteredColumns = Object.entries(columns).reduce((acc, [key, column]) => {
    if (searchTerm) {
      const filteredItems = column.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return {
        ...acc,
        [key]: {
          ...column,
          items: filteredItems,
          count: filteredItems.length
        }
      };
    }
    
    return { ...acc, [key]: column };
  }, {});

  return (
    <div className="flex-1 overflow-x-auto scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      <div className="inline-flex h-full p-4 space-x-4">
        {Object.values(filteredColumns).map(column => (
          <LeadColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
