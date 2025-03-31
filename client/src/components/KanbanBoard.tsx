import React, { useRef, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LeadColumn from './LeadColumn';
import { LeadColumn as LeadColumnType } from '@/types/leads';
import { useLeads } from '@/context/LeadContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface KanbanBoardProps {
  columns: {
    [key: string]: LeadColumnType;
  };
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns }) => {
  const { searchTerm, filters } = useLeads();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(true);
  const [localColumns, setLocalColumns] = useState(columns);
  
  // Update local columns when external columns change
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  // Filter leads based on search term and filter options
  const filteredColumns = Object.entries(localColumns).reduce<Record<string, LeadColumnType>>((acc, [key, column]) => {
    let filteredItems = column.items;
    
    // Apply search term filter
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.source && item.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
        item.source && item.source.includes(filters.leadSource || '')
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

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = direction === 'left' ? -350 : 350;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // Drop outside a valid droppable area
    if (!destination) return;

    // Drop in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Find the lead being dragged
    const draggedLeadId = parseInt(draggableId);
    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    
    let draggedLead;
    for (const colKey in localColumns) {
      const found = localColumns[colKey].items.find(lead => lead.id === draggedLeadId);
      if (found) {
        draggedLead = found;
        break;
      }
    }
    
    if (!draggedLead) {
      console.error(`Could not find lead with ID ${draggedLeadId}`);
      return;
    }
    
    console.log(`Moving lead ${draggedLeadId} from column ${sourceColumnId} to column ${destinationColumnId}`);
    
    // Optimistically update the UI
    const updatedColumns = {...localColumns};
    
    // Remove from source column
    updatedColumns[sourceColumnId].items = updatedColumns[sourceColumnId].items.filter(
      lead => lead.id !== draggedLeadId
    );
    
    // Add to destination column at the correct index
    const newItems = Array.from(updatedColumns[destinationColumnId].items);
    newItems.splice(destination.index, 0, {
      ...draggedLead,
      columnId: destinationColumnId
    });
    updatedColumns[destinationColumnId].items = newItems;
    
    // Update counts
    updatedColumns[sourceColumnId].count = updatedColumns[sourceColumnId].items.length;
    updatedColumns[destinationColumnId].count = updatedColumns[destinationColumnId].items.length;
    
    // Update local state immediately for a responsive UI
    setLocalColumns(updatedColumns);
    
    // Make API request to update the lead's column
    try {
      const response = await fetch(`/api/leads/${draggedLeadId}/column`, {
        method: 'PATCH',
        body: JSON.stringify({ columnId: destinationColumnId }),
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
        description: `${draggedLead.name} moved to ${columns[destinationColumnId].title}`,
      });
    } catch (error) {
      console.error('Error moving lead:', error);
      
      // Revert the optimistic update if the API call fails
      setLocalColumns(columns);
      
      toast({
        title: 'Error',
        description: 'Failed to move lead. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex-1 relative flex flex-col">
      {/* Mobile column navigation */}
      <div className="flex justify-between items-center px-2 md:hidden mb-2">
        <button 
          onClick={() => handleScroll('left')}
          className="p-2 bg-gray-900 text-amber-300 rounded-md shadow-sm"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-sm text-gray-600">Swipe to view columns</div>
        <button 
          onClick={() => handleScroll('right')}
          className="p-2 bg-gray-900 text-amber-300 rounded-md shadow-sm"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide relative"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          <div className="inline-flex h-full p-2 md:p-4 space-x-4">
            {Object.entries(filteredColumns).map(([columnId, column]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-w-[320px] max-w-[320px] rounded-md shadow-sm 
                      ${snapshot.isDraggingOver ? 'bg-amber-50' : 'bg-gray-50'}`}
                    style={{ height: "calc(100vh - 200px)" }}
                  >
                    <div className="bg-gray-900 text-amber-300 rounded-t-md p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <h3 className="font-medium">{column.title}</h3>
                        <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">{column.count}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 overflow-y-auto" style={{ height: "calc(100% - 48px)" }}>
                      {column.items.map((lead, index) => (
                        <Draggable 
                          key={lead.id.toString()} 
                          draggableId={lead.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 ${snapshot.isDragging ? 'opacity-70' : ''}`}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-medium text-sm mr-2">
                                      {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-gray-900">{lead.name}</h3>
                                      <div className="text-xs text-gray-500">{lead.username}</div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500">{lead.time}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {lead.tags && lead.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
      
      {/* Desktop column navigation */}
      {showScrollButtons && (
        <div className="hidden md:block">
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-900 text-amber-300 rounded-full shadow-lg z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-900 text-amber-300 rounded-full shadow-lg z-10"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
