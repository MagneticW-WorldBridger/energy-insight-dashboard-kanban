import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, LayoutGrid, List, X } from 'lucide-react';
import { useLeads } from '@/context/LeadContext';

const FilterBar: React.FC = () => {
  const { filters, setFilters, view, setView } = useLeads();
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showProcedureDropdown, setShowProcedureDropdown] = useState(false);
  
  const dateRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const procedureRef = useRef<HTMLDivElement>(null);

  const dateOptions = ['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months'];
  const sourceOptions = ['All Sources', 'Profile Visit', 'Story Ad', 'Post Engagement', 'Before/After Post'];
  const procedureOptions = ['All Procedures', 'Face', 'Body', 'Injectables', 'Breast', 'Butt'];

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
      if (sourceRef.current && !sourceRef.current.contains(event.target as Node)) {
        setShowSourceDropdown(false);
      }
      if (procedureRef.current && !procedureRef.current.contains(event.target as Node)) {
        setShowProcedureDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset all filters
  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4" data-component="filter-bar">
      <div className="container mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-sm">
            <button 
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200"
              onClick={resetFilters}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              {Object.keys(filters).length > 0 ? 'Clear Filters' : 'Filter'}
            </button>
            
            <div ref={dateRef} className="relative">
              <button 
                className={`px-3 py-1.5 ${filters.dateRange ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'} rounded-md flex items-center hover:bg-gray-200`}
                onClick={() => setShowDateDropdown(!showDateDropdown)}
              >
                <span>{filters.dateRange || 'Date Range'}</span>
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </button>
              
              {showDateDropdown && (
                <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
                  {dateOptions.map((option) => (
                    <button
                      key={option}
                      className={`w-full text-left px-3 py-2 text-sm ${filters.dateRange === option ? 'bg-amber-50 text-amber-800' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setFilters({ ...filters, dateRange: option === 'All Time' ? undefined : option });
                        setShowDateDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div ref={sourceRef} className="relative">
              <button 
                className={`px-3 py-1.5 ${filters.leadSource ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'} rounded-md flex items-center hover:bg-gray-200`}
                onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              >
                <span>{filters.leadSource || 'Lead Source'}</span>
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </button>
              
              {showSourceDropdown && (
                <div className="absolute z-10 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg">
                  {sourceOptions.map((option) => (
                    <button
                      key={option}
                      className={`w-full text-left px-3 py-2 text-sm ${filters.leadSource === option ? 'bg-amber-50 text-amber-800' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setFilters({ ...filters, leadSource: option === 'All Sources' ? undefined : option });
                        setShowSourceDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div ref={procedureRef} className="relative">
              <button 
                className={`px-3 py-1.5 ${filters.procedure ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'} rounded-md flex items-center hover:bg-gray-200`}
                onClick={() => setShowProcedureDropdown(!showProcedureDropdown)}
              >
                <span>{filters.procedure || 'Procedure'}</span>
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </button>
              
              {showProcedureDropdown && (
                <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
                  {procedureOptions.map((option) => (
                    <button
                      key={option}
                      className={`w-full text-left px-3 py-2 text-sm ${filters.procedure === option ? 'bg-amber-50 text-amber-800' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setFilters({ ...filters, procedure: option === 'All Procedures' ? undefined : option });
                        setShowProcedureDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {Object.keys(filters).length > 0 && (
              <div className="ml-2 text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-100 flex items-center">
                <span>Active filters: {Object.keys(filters).length}</span>
                <button className="ml-1.5 p-0.5 hover:bg-amber-100 rounded-sm" onClick={resetFilters}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* View options removed - only using Kanban view */}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
