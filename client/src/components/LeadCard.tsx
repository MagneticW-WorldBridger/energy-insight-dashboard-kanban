import React, { useState } from 'react';
import { Lead, Assessment } from '@/types/leads';
import { MessageSquare, Clipboard, MoreHorizontal, Calendar, TrendingUp } from 'lucide-react';
import QuestionnaireModal from './QuestionnaireModal';

interface LeadCardProps {
  lead: Lead;
  onDragStart?: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onDragStart }) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  
  // Parse assessment if it's a string representation of an object
  const getAssessment = (): Assessment | undefined => {
    if (typeof lead.assessment === 'string') {
      if (lead.assessment === 'Pending' || lead.assessment === 'Incomplete') {
        return undefined;
      }
      
      try {
        return JSON.parse(lead.assessment) as Assessment;
      } catch (e) {
        console.error('Error parsing assessment:', e);
        return undefined;
      }
    }
    
    return lead.assessment;
  };
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Service category colors
  const getServiceColor = (category: string) => {
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Procedure colors
  const getProcedureColor = () => {
    return 'bg-blue-50 text-blue-900 border border-blue-100';
  };

  // Intent colors
  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      'High Intent': 'bg-amber-400 text-gray-900',
      'Medium Intent': 'bg-gray-400 text-white',
      'Low Intent': 'bg-gray-600 text-white'
    };
    
    return colors[intent] || 'bg-gray-200 text-gray-800';
  };

  // Render assessment badge
  const renderAssessmentBadge = (assessment: Lead['assessment']) => {
    if (assessment === "Pending" || assessment === "Incomplete") {
      return (
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-sm">
          {assessment}
        </span>
      );
    }
    
    return (
      <span className={`text-xs px-3 py-0.5 rounded-sm font-medium ${getIntentColor(assessment.overall)}`}>
        {assessment.overall}
      </span>
    );
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer) {
      // Set the dragged data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', lead.id.toString());
      
      console.log(`Started dragging lead ${lead.id}: ${lead.name} (Column ID: ${lead.columnId || 'undefined'})`);
      
      // Add a visual feedback for the drag operation
      const dragImage = new Image();
      dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      // Add a class to show we're dragging
      e.currentTarget.classList.add('opacity-70');
    }
    
    // Call the parent component's onDragStart handler
    if (onDragStart) {
      onDragStart();
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Remove the dragging class
    e.currentTarget.classList.remove('opacity-70');
  };

  return (
    <>
      <div 
        className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow transition-shadow duration-200"
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        data-lead-id={lead.id}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-2 text-xs">
                {getInitials(lead.name)}
              </div>
              <div>
                <h4 className="font-medium text-sm">{lead.name}</h4>
                <div className="text-xs text-gray-500">{lead.username}</div>
              </div>
            </div>
            <span className="text-xs text-gray-500">{lead.time}</span>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center">
              <span className="inline-block w-20 text-xs text-gray-500 truncate">Interest:</span>
              <span className="text-xs font-medium text-gray-700">{lead.source}</span>
            </div>
            
            {lead.smsStatus && (
              <div className="flex items-center">
                <span className="inline-block w-20 text-xs text-gray-500 truncate">SMS:</span>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                    lead.smsStatus === 'Delivered' ? 'bg-green-500' : 
                    lead.smsStatus === 'Sent' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></span>
                  <span className={`text-xs font-medium ${
                    lead.smsStatus === 'Delivered' ? 'text-green-600' : 
                    lead.smsStatus === 'Sent' ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {lead.smsStatus}
                  </span>
                  <span className="ml-2 text-gray-400 text-xs">{lead.sendTime}</span>
                </div>
              </div>
            )}

            {lead.verifiedTime && (
              <div className="flex items-center">
                <span className="inline-block w-20 text-xs text-gray-500 truncate">Verified:</span>
                <span className="text-xs font-medium text-green-600">{lead.verifiedTime}</span>
              </div>
            )}

            {lead.consultDate && (
              <div className="flex items-center">
                <span className="inline-block w-20 text-xs text-gray-500 truncate">Consult:</span>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 text-amber-400 mr-1" />
                  <span className="text-xs font-medium text-gray-900">{lead.consultDate}</span>
                </div>
              </div>
            )}

            {lead.financing && (
              <div className="flex items-center">
                <span className="inline-block w-20 text-xs text-gray-500 truncate">Financing:</span>
                <span className="text-xs font-medium text-gray-700">{lead.financing}</span>
              </div>
            )}

            {lead.reason && (
              <div className="flex items-center">
                <span className="inline-block w-20 text-xs text-gray-500 truncate">Issue:</span>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full mr-1 bg-red-500"></span>
                  <span className="text-xs font-medium text-red-600">{lead.reason}</span>
                </div>
              </div>
            )}
          </div>
          
          {lead.tags && lead.tags.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 mt-3 ${(lead.score || typeof lead.assessment !== 'string') ? 'justify-between items-center' : ''}`}>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`px-2 py-0.5 rounded-sm text-xs ${
                      index === 0 ? getServiceColor(tag) : getProcedureColor()
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {lead.score && (
                <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded">
                  <TrendingUp className="h-3 w-3 text-gray-700 mr-1" />
                  <span className="text-xs font-medium">{lead.score}</span>
                </div>
              )}
            </div>
          )}
          
          {typeof lead.assessment !== 'string' && lead.assessment.likelihood !== undefined && lead.assessment.benefits !== undefined && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Likelihood:</span>
                <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full" 
                    style={{ width: `${(lead.assessment.likelihood / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{lead.assessment.likelihood}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Benefits:</span>
                <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full" 
                    style={{ width: `${(lead.assessment.benefits / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{lead.assessment.benefits}</span>
              </div>
            </div>
          )}

          {lead.notes && (
            <div className="bg-gray-50 p-2 mt-3 text-xs text-gray-700 rounded border border-gray-200">
              <p>{lead.notes}</p>
            </div>
          )}
          
          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
            {renderAssessmentBadge(lead.assessment)}
            
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <MessageSquare className="h-4 w-4 text-gray-500" />
              </button>
              <button 
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => setShowQuestionnaire(true)}
                title="View questionnaire responses"
              >
                <Clipboard className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        questionnaire={lead.questionnaire}
        assessment={getAssessment()}
      />
    </>
  );
};

export default LeadCard;
