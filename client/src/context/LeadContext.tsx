import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LeadState, FilterOptions } from '@/types/leads';

const initialLeadState: LeadState = {
  columns: {
    newLeads: {
      id: 'newLeads', // Este id debe coincidir exactamente con el valor en la base de datos
      title: 'New Leads',
      count: 28,
      items: [
        { 
          id: 1, 
          name: 'Sarah Johnson', 
          username: '@sarahj', 
          time: '5m ago', 
          source: 'Botox Story Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Injectables', 'Botox/Daxxify'],
          assessment: "Pending"
        },
        { 
          id: 2, 
          name: 'Michael Chen', 
          username: '@mike_c', 
          time: '12m ago', 
          source: 'Clinic Profile Visit', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'Rhinoplasty'],
          assessment: "Pending"
        },
        { 
          id: 3, 
          name: 'Emily Roberts', 
          username: '@em_roberts', 
          time: '25m ago', 
          source: 'Before/After Post', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'Dermal Fillers'],
          assessment: "Pending"
        },
        { 
          id: 4, 
          name: 'David Williams', 
          username: '@davewill', 
          time: '32m ago', 
          source: 'Facial Treatment Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Aesthetics', 'Scar Revision'],
          assessment: "Pending"
        },
        { 
          id: 5, 
          name: 'Lina Ahmed', 
          username: '@lina_a', 
          time: '40m ago', 
          source: 'Profile Visit', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Body', 'Awake VASER Lipo'],
          assessment: "Pending"
        }
      ]
    },
    phoneVerified: {
      id: 'phoneVerified', // Nombre correcto según la base de datos
      title: 'SMS Sent',
      count: 14,
      items: [
        { 
          id: 6, 
          name: 'James Wilson', 
          username: '@jamwilson', 
          time: '1h ago', 
          source: 'Aveli Cellulite Post', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Aesthetics', 'Aveli Treatment'], 
          smsStatus: 'Delivered', 
          sendTime: '10:22 AM',
          assessment: "Pending"
        },
        { 
          id: 7, 
          name: 'Sophia Garcia', 
          username: '@sophiag', 
          time: '1h ago', 
          source: 'Facelift Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'Facelift'], 
          smsStatus: 'Sent', 
          sendTime: '10:25 AM',
          assessment: "Pending"
        },
        { 
          id: 8, 
          name: 'Alex Thompson', 
          username: '@alexthom', 
          time: '2h ago', 
          source: 'Profile Visit', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Breast', 'Fat Transfer'], 
          smsStatus: 'Delivered', 
          sendTime: '9:45 AM',
          assessment: "Pending"
        },
        { 
          id: 9, 
          name: 'Jessica Lee', 
          username: '@jesslee', 
          time: '3h ago', 
          source: 'PDO Thread Post', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'PDO Thread Lift'], 
          smsStatus: 'Pending', 
          sendTime: '9:15 AM',
          assessment: "Pending"
        }
      ]
    },
    questionnaireStarted: {
      id: 'questionnaireStarted', // Nombre correcto según la base de datos
      title: 'Identity Verified',
      count: 32,
      items: [
        { 
          id: 10, 
          name: 'Robert Brown', 
          username: '@robbrown', 
          time: '4h ago', 
          source: 'Male HD Lipo Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Body', 'HD VASER Lipo'], 
          verifiedTime: '11:32 AM', 
          score: 85,
          assessment: {
            likelihood: 6.2,
            benefits: 5.8,
            overall: "High Intent"
          }
        },
        { 
          id: 11, 
          name: 'Olivia Kim', 
          username: '@oliviak', 
          time: '5h ago', 
          source: 'Profile Visit', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Injectables', 'Dermal Fillers'], 
          verifiedTime: '10:47 AM', 
          score: 92,
          assessment: {
            likelihood: 5.9,
            benefits: 6.4,
            overall: "High Intent"
          }
        },
        { 
          id: 12, 
          name: 'Carlos Mendez', 
          username: '@carlosm', 
          time: '6h ago', 
          source: 'Chin Contouring Post', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'Jawline Chin Contouring'], 
          verifiedTime: '9:20 AM', 
          score: 78,
          assessment: {
            likelihood: 4.1,
            benefits: 5.3,
            overall: "Medium Intent"
          }
        },
        { 
          id: 13, 
          name: 'Hannah Park', 
          username: '@hannahp', 
          time: '6h ago', 
          source: 'Non-Surgical Nose Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'Non-surgical Rhinoplasty'], 
          verifiedTime: '9:05 AM', 
          score: 88,
          assessment: {
            likelihood: 5.6,
            benefits: 5.1,
            overall: "Medium Intent"
          }
        }
      ]
    },
    questionnaireComplete: {
      id: 'questionnaireComplete', // Nombre correcto según la base de datos
      title: 'Consultation Ready',
      count: 18,
      items: [
        { 
          id: 14, 
          name: 'Daniel Martinez', 
          username: '@daniel_m', 
          time: '1d ago', 
          source: 'BBL Post Engagement', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Butt', 'HD BBL'], 
          qualScore: 95, 
          priority: 'High Intent', 
          consultDate: 'Mar 21',
          assessment: {
            likelihood: 6.8,
            benefits: 6.5,
            overall: "High Intent"
          },
          financing: "Care Credit"
        },
        { 
          id: 15, 
          name: 'Natalie Wong', 
          username: '@nataliew', 
          time: '1d ago', 
          source: 'Story Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Body', 'Traditional Lipo'], 
          qualScore: 82, 
          priority: 'Medium Intent', 
          consultDate: 'Mar 22',
          assessment: {
            likelihood: 4.5,
            benefits: 5.8,
            overall: "Medium Intent"
          },
          financing: "Payment Plan"
        },
        { 
          id: 16, 
          name: 'Ryan Jackson', 
          username: '@ryanj', 
          time: '1d ago', 
          source: 'Before/After Post', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'Eyelid Surgery'], 
          qualScore: 88, 
          priority: 'High Intent', 
          consultDate: 'Mar 20',
          assessment: {
            likelihood: 6.3,
            benefits: 6.7,
            overall: "High Intent"
          },
          financing: "Self-Pay"
        }
      ]
    },
    inProgress: {
      id: 'inProgress', // Nombre correcto según la base de datos
      title: 'In Progress',
      count: 5,
      items: [
        { 
          id: 20, 
          name: 'Jennifer Adams', 
          username: '@jennadams', 
          time: '1d ago', 
          source: 'Facebook Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Breast', 'Consultation'],
          assessment: {
            likelihood: 8.1,
            benefits: 7.4,
            overall: "High Intent"
          },
          consultDate: 'Apr 5',
          notes: "Scheduled for consultation next week"
        }
      ]
    },
    closed: {
      id: 'closed', // Nombre correcto según la base de datos
      title: 'Closed',
      count: 3,
      items: [
        { 
          id: 21, 
          name: 'Michael Davis', 
          username: '@mdavis', 
          time: '3d ago', 
          source: 'Referral', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Face', 'Rhinoplasty'],
          assessment: {
            likelihood: 9.2,
            benefits: 8.8,
            overall: "High Intent"
          },
          consultDate: 'Mar 15',
          notes: "Completed surgery on March 29"
        }
      ]
    },
    notInterested: {
      id: 'notInterested', // Nombre correcto según la base de datos
      title: 'Failed Verification',
      count: 8,
      items: [
        { 
          id: 17, 
          name: 'Taylor Smith', 
          username: '@taylors', 
          time: '1d ago', 
          source: 'Profile Visit', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Failed', 'SMS'],
          reason: 'SMS undeliverable',
          assessment: "Incomplete"
        },
        { 
          id: 18, 
          name: 'Kevin Zhang', 
          username: '@kevinz', 
          time: '2d ago', 
          source: 'Story Ad', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Failed', 'Timeout'],
          reason: 'Verification timeout',
          assessment: "Incomplete"
        },
        { 
          id: 19, 
          name: 'Mia Johnson', 
          username: '@miaj', 
          time: '2d ago', 
          source: 'Before/After Post', 
          avatar: '/api/placeholder/40/40', 
          tags: ['Failed', 'Out of Area'],
          reason: 'Out of service area',
          assessment: {
            likelihood: 2.1,
            benefits: 3.4,
            overall: "Low Intent"
          },
          notes: "Outside CA, OR, WA, AZ, NV, UT, CO, NM regions"
        }
      ]
    }
  },
  stats: {
    totalLeads: 100,
    newLeadsToday: 32,
    consultsBooked: 18,
    smsResponseRate: 67
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
}

const LeadContext = createContext<LeadContextProps | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leadState] = useState<LeadState>(initialLeadState);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  return (
    <LeadContext.Provider value={{ 
      leadState, 
      filters, 
      setFilters,
      searchTerm,
      setSearchTerm,
      view,
      setView
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
