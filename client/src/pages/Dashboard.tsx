import React, { useEffect } from 'react';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import KanbanBoard from '@/components/KanbanBoard';
import { useLeads } from '@/context/LeadContext';

const Dashboard: React.FC = () => {
  const { leadState } = useLeads();

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

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <StatsBar stats={leadState.stats} />
      <FilterBar />
      <KanbanBoard columns={leadState.columns} />
    </div>
  );
};

export default Dashboard;
