import React, { useState, useEffect, useCallback } from 'react';
import LeadColumn from './LeadColumn';
import { LeadColumn as LeadColumnType, Lead } from '@/types/leads';
import { useLeads } from '@/context/LeadContext';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface KanbanBoardProps {
  columns: {
    [key: string]: LeadColumnType;
  };
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns }) => {
  const { searchTerm, filters } = useLeads();
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset dragging state when component unmounts
  useEffect(() => {
    return () => {
      setIsDragging(false);
      setDraggedLeadId(null);
    };
  }, []);

  // Handle drag start
  const handleDragStart = (leadId: number) => {
    setDraggedLeadId(leadId);
    setIsDragging(true);
  };

  // Handle drop on a column
  const handleDrop = useCallback(async (columnId: string) => {
    if (!draggedLeadId || !isDragging) {
      console.log('Drop ignored: Not dragging or no lead ID', { isDragging, draggedLeadId });
      return;
    }
    
    try {
      // Find the lead being dragged
      let draggedLead: Lead | undefined;
      let originalColumnId: string | undefined;
      
      // Search through all columns to find the dragged lead
      for (const colKey in columns) {
        const found = columns[colKey].items.find(lead => lead.id === draggedLeadId);
        if (found) {
          draggedLead = found;
          originalColumnId = colKey;
          break;
        }
      }
      
      if (!draggedLead) {
        console.error(`Could not find lead with ID ${draggedLeadId} in any column`);
        setIsDragging(false);
        setDraggedLeadId(null);
        return;
      }
      
      if (!originalColumnId) {
        console.error(`Could not determine original column for lead ${draggedLeadId}`);
        setIsDragging(false);
        setDraggedLeadId(null);
        return;
      }
      
      if (originalColumnId === columnId) {
        console.log(`Lead ${draggedLeadId} dropped in same column (${columnId}). No action needed.`);
        setIsDragging(false);
        setDraggedLeadId(null);
        return;
      }
      
      console.log(`Moving lead ${draggedLeadId} from column ${originalColumnId} to column ${columnId}`);
      
      // Make API request to update the lead's column
      const response = await fetch(`/api/leads/${draggedLeadId}/column`, {
        method: 'PATCH',
        body: JSON.stringify({ columnId }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to update lead column: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/columns'] });
      
      toast({
        title: 'Lead moved',
        description: `${draggedLead.name} moved to ${columns[columnId].title}`,
      });
      
    } catch (error) {
      console.error('Error moving lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to move lead. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDragging(false);
      setDraggedLeadId(null);
    }
  }, [draggedLeadId, isDragging, columns]);
  
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
    <div 
      className="flex-1 overflow-x-auto scrollbar-hide" 
      style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
    >
      <div className="inline-flex h-full p-4 space-x-4">
        {Object.values(filteredColumns).map((column) => (
          <LeadColumn 
            key={column.id} 
            column={column} 
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
