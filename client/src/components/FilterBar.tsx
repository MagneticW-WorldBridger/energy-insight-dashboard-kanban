import React from 'react';
import { Filter, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useLeads } from '@/context/LeadContext';

const FilterBar: React.FC = () => {
  const { filters, setFilters, view, setView } = useLeads();

  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4" data-component="filter-bar">
      <div className="container mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-sm">
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-1.5" />
              Filter
            </button>
            
            <button 
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200"
              onClick={() => setFilters({ ...filters, dateRange: filters.dateRange === 'Last 7 Days' ? 'Last 30 Days' : 'Last 7 Days' })}
            >
              <span>Date Range</span>
              <ChevronDown className="h-4 w-4 ml-1.5" />
            </button>
            
            <button 
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200"
              onClick={() => setFilters({ ...filters, leadSource: filters.leadSource === 'All Sources' ? 'Social Media' : 'All Sources' })}
            >
              <span>Lead Source</span>
              <ChevronDown className="h-4 w-4 ml-1.5" />
            </button>
            
            <button 
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200"
              onClick={() => setFilters({ ...filters, procedure: filters.procedure === 'All Procedures' ? 'Face' : 'All Procedures' })}
            >
              <span>Procedure</span>
              <ChevronDown className="h-4 w-4 ml-1.5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">View:</span>
            <button 
              className={`p-1.5 rounded-md ${view === 'kanban' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              className={`p-1.5 rounded-md ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
