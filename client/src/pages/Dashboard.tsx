import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import KanbanBoard from '@/components/KanbanBoard';
import AddLeadModal from '@/components/AddLeadModal';
import { useLeads } from '@/context/LeadContext';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { leadState, isLoading, reloadLeads } = useLeads();
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Cargar datos al inicio
  useEffect(() => {
    reloadLeads();
  }, []);

  // Set the correct column heights on load and resize
  useEffect(() => {
    const setColumnHeight = () => {
      const viewportHeight = window.innerHeight;
      const headerElement = document.querySelector('header');
      const statsBarElement = document.querySelector('[data-component="stats-bar"]');
      const filterBarElement = document.querySelector('[data-component="filter-bar"]');
      
      if (!headerElement || !statsBarElement || !filterBarElement) return;
      
      const headerHeight = headerElement.clientHeight;
      const statsBarHeight = statsBarElement.clientHeight;
      const filterBarHeight = filterBarElement.clientHeight;
      
      const columns = document.querySelectorAll('[data-component="lead-column"]');
      const availableHeight = viewportHeight - headerHeight - statsBarHeight - filterBarHeight - 32; // 32px for padding
      
      columns.forEach(column => {
        (column as HTMLElement).style.height = `${availableHeight}px`;
      });
    };
    
    window.addEventListener('load', setColumnHeight);
    window.addEventListener('resize', setColumnHeight);
    
    // Initial call
    setColumnHeight();
    
    return () => {
      window.removeEventListener('load', setColumnHeight);
      window.removeEventListener('resize', setColumnHeight);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
            <p className="text-lg text-gray-700">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';

  return (
    <div className="flex flex-col h-screen">
      {!isEmbed && <Header />}
      {!isEmbed && (
        <div className="bg-[color:hsl(var(--rk-muted))] border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-[color:hsl(var(--rk-text))]">Rural King Lead Pipeline</h1>
              <span className="inline-flex items-center text-[11px] mt-1 px-2 py-0.5 rounded bg-white border text-gray-700">Phase 1 Demo</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-white border">Live Data</span>
              <span className="px-2 py-0.5 rounded bg-white border">Data Wiring In Progress</span>
            </div>
          </div>
        </div>
      )}
      {!isEmbed && <StatsBar stats={leadState.stats} />}
      {!isEmbed && (
        <div className="flex items-center justify-between px-4 py-3">
          <FilterBar />
          <Button 
            onClick={() => setShowAddLeadModal(true)}
            className="ml-4 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      )}
      <div className="flex-1">
        <KanbanBoard columns={leadState.columns} />
      </div>
      <AddLeadModal 
        open={showAddLeadModal} 
        onOpenChange={setShowAddLeadModal} 
      />
    </div>
  );
};

export default Dashboard;
