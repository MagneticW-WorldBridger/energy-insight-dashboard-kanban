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

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <StatsBar stats={leadState.stats} />
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
      <KanbanBoard columns={leadState.columns} />
      
      {/* Modal to add a new lead */}
      <AddLeadModal 
        open={showAddLeadModal} 
        onOpenChange={setShowAddLeadModal} 
      />
    </div>
  );
};

export default Dashboard;
