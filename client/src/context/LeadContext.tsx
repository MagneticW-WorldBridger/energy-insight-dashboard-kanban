import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LeadState, FilterOptions, Lead, LeadColumn } from '@/types/leads';
import { useQuery } from '@tanstack/react-query';

// Tipos específicos para las columnas de leads
type ColumnKeys = 'newLeads' | 'phoneVerified' | 'questionnaireStarted' | 'questionnaireComplete' | 'inProgress' | 'closed' | 'notInterested';

// Estructura inicial vacía de columnas con tipos correctos
const emptyColumns: Record<ColumnKeys, LeadColumn> = {
  newLeads: {
    id: 'newLeads',
    title: 'New Leads',
    count: 0,
    items: []
  },
  phoneVerified: {
    id: 'phoneVerified',
    title: 'Phone Verified',
    count: 0,
    items: []
  },
  questionnaireStarted: {
    id: 'questionnaireStarted',
    title: 'Questionnaire Started',
    count: 0,
    items: []
  },
  questionnaireComplete: {
    id: 'questionnaireComplete',
    title: 'Questionnaire Complete',
    count: 0,
    items: []
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    count: 0,
    items: []
  },
  closed: {
    id: 'closed',
    title: 'Closed',
    count: 0,
    items: []
  },
  notInterested: {
    id: 'notInterested',
    title: 'Not Interested',
    count: 0,
    items: []
  }
};

// Estado inicial
const initialLeadState: LeadState = {
  columns: emptyColumns,
  stats: {
    totalLeads: 0,
    newLeadsToday: 0,
    consultsBooked: 0,
    smsResponseRate: 0
  }
};

interface LeadContextProps {
  leadState: LeadState;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  view: 'kanban' | 'list';
  setView: React.Dispatch<React.SetStateAction<'kanban' | 'list'>>;
  isLoading: boolean;
  reloadLeads: () => void;
  updateLeadColumn: (leadId: number, columnId: string) => Promise<void>;
}

const LeadContext = createContext<LeadContextProps | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leadState, setLeadState] = useState<LeadState>(initialLeadState);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  // Consulta para obtener todas las columnas
  const columnsQuery = useQuery({
    queryKey: ['/api/columns'],
    staleTime: 10000,
  });

  // Consulta para obtener todos los leads
  const leadsQuery = useQuery({
    queryKey: ['/api/leads'],
    staleTime: 10000,
  });

  // Consulta para obtener estadísticas
  const statsQuery = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 30000,
  });

  const isLoading = leadsQuery.isLoading || columnsQuery.isLoading || statsQuery.isLoading;

  const reloadLeads = () => {
    leadsQuery.refetch();
    columnsQuery.refetch();
    statsQuery.refetch();
  };

  // Efecto para actualizar el estado cuando se cargan los datos
  useEffect(() => {
    if (leadsQuery.data && columnsQuery.data) {
      const leads = leadsQuery.data as Lead[];
      const columns = columnsQuery.data || [];
      
      // Creamos una copia de la estructura de columnas vacías
      const updatedColumns: Record<string, LeadColumn> = { ...emptyColumns };
      
      // Limpiamos cualquier lead anterior
      Object.keys(updatedColumns).forEach((key) => {
        const columnKey = key as keyof typeof updatedColumns;
        updatedColumns[columnKey].items = [];
        updatedColumns[columnKey].count = 0;
      });
      
      // Organizamos los leads en sus columnas correspondientes
      leads.forEach(lead => {
        const columnId = lead.columnId || 'newLeads';
        
        if (columnId in updatedColumns) {
          updatedColumns[columnId].items.push(lead);
          updatedColumns[columnId].count = updatedColumns[columnId].items.length;
        } else {
          console.warn(`No se encontró la columna con id: ${columnId}`);
        }
      });
      
      // Obtenemos estadísticas del servidor o usamos las actuales
      const statsData = statsQuery.data as { totalLeads: number; newLeadsToday: number; consultsBooked: number; smsResponseRate: number } | undefined;
      const stats = statsData ? {
        totalLeads: statsData.totalLeads || 0,
        newLeadsToday: statsData.newLeadsToday || 0,
        consultsBooked: statsData.consultsBooked || 0,
        smsResponseRate: statsData.smsResponseRate || 0
      } : leadState.stats;
      
      // Actualizamos el estado con las columnas y leads
      setLeadState({
        columns: updatedColumns,
        stats: stats
      });
    }
  }, [leadsQuery.data, columnsQuery.data, statsQuery.data, leadState.stats]);

  // Function to update a lead's column via API
  const updateLeadColumn = async (leadId: number, columnId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/column`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ columnId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update lead column: ${response.statusText}`);
      }
      
      // Reload leads after updating
      reloadLeads();
    } catch (error) {
      console.error('Error updating lead column:', error);
    }
  };
  
  return (
    <LeadContext.Provider value={{ 
      leadState, 
      filters, 
      setFilters,
      searchTerm,
      setSearchTerm,
      view,
      setView,
      isLoading,
      reloadLeads,
      updateLeadColumn
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
