import React, { useRef, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LeadCard from './LeadCard';
import { LeadColumn as LeadColumnType } from '@/types/leads';
import { useLeads } from '@/context/LeadContext';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface ColumnWrapperProps {
  columnId: string;
  column: LeadColumnType;
}

// Column wrapper component to handle the collapse/expand functionality with drag and drop
const ColumnWrapper: React.FC<ColumnWrapperProps> = ({ columnId, column }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <Droppable key={columnId} droppableId={columnId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`transition-all duration-300
            ${collapsed ? 'bg-gray-900' : snapshot.isDraggingOver ? 'bg-amber-50' : 'bg-gray-50'} 
            rounded-md shadow-sm
            ${collapsed ? 'min-w-[60px] max-w-[60px]' : 'min-w-[320px] max-w-[320px]'}`}
          style={{ height: "calc(100vh - 200px)" }}
        >
          <div className={`${collapsed ? 'h-full' : 'p-3'} bg-gray-900 text-amber-300 ${collapsed ? 'rounded-md' : 'rounded-t-md'} flex items-center justify-between`}>
            {collapsed ? (
              <div 
                className="h-full w-full flex items-center justify-center cursor-pointer"
                onClick={() => setCollapsed(false)}
              >
                <span className="block transform rotate-180 whitespace-nowrap font-medium py-4" style={{ writingMode: 'vertical-rl' }}>
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
                      <LeadCard lead={lead} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

interface KanbanBoardProps {
  columns: {
    [key: string]: LeadColumnType;
  };
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns }) => {
  const { searchTerm, filters, updateLeadColumn } = useLeads();
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
    if (!destination) {
      console.log("Lead dropped outside of a droppable area");
      return;
    }

    // Drop in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log("Lead dropped in the same position");
      return;
    }
    
    // Find the lead being dragged
    // Remove any prefix (like 'lead-') in case the draggableId has one
    const draggedLeadId = parseInt(draggableId.replace('lead-', ''));
    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    
    console.log(`Parsed draggableId: ${draggableId} to leadId: ${draggedLeadId}`);
    
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
      toast({
        title: 'Error',
        description: 'Could not find the dragged lead. Please try again.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log(`Moving lead ${draggedLeadId} from column ${sourceColumnId} to column ${destinationColumnId}`);
    
    // Show a loading toast that we'll dismiss later
    const loadingToastId = toast({
      title: 'Moving lead...',
      description: `Moving ${draggedLead.name} to ${localColumns[destinationColumnId].title}`,
    }).id;
    
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
    
    // Use context function to update lead column
    try {
      console.log(`Updating lead ${draggedLeadId} column to ${destinationColumnId}`);
      
      // Call the updateLeadColumn function from the context
      await updateLeadColumn(draggedLeadId, destinationColumnId);
      
      toast({
        title: 'Lead moved',
        description: `${draggedLead.name} moved to ${localColumns[destinationColumnId].title}`,
      });
    } catch (error) {
      console.error('Error moving lead:', error);
      
      // Revert the optimistic update if the API call fails
      setLocalColumns(columns);
      
      toast({
        title: 'Error',
        description: 'Failed to move lead. Changes have been reverted.',
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
              <ColumnWrapper
                key={columnId}
                columnId={columnId}
                column={column}
              />
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
