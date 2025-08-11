import React from 'react';
import { X } from 'lucide-react';
import { QuestionnaireResponses, Assessment } from '@/types/leads';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire?: QuestionnaireResponses;
  assessment?: Assessment;
}

const questions = [
  "I am actively shopping for farm, ranch, or outdoor products.",
  "I have a budget in mind for my next purchase.",
  "I prefer to buy within the next 30 days.",
  "I am the decision-maker for this purchase.",
  "I am comfortable ordering online for pickup or delivery.",
  "I’m interested in deals or financing options.",
  "I want personalized recommendations for my needs."
];

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ 
  isOpen, 
  onClose, 
  questionnaire,
  assessment
}) => {
  if (!isOpen) return null;

  const isComplete = questionnaire && Object.values(questionnaire).filter(Boolean).length >= 5;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <h3 className="text-lg font-semibold">Psychological Assessment</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {!questionnaire && (
            <div className="text-center p-8">
              <p className="text-gray-500">No questionnaire data available</p>
            </div>
          )}

          {questionnaire && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">
                   Responses scored on a scale of 1-7 (Strongly Disagree to Strongly Agree)
                </p>
                
                {isComplete && assessment && typeof assessment !== 'string' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Assessment Summary</h4>
                    <div className="flex flex-col space-y-2">
                      <div>
                         <p className="text-sm text-gray-700 mb-1">Purchase intent:</p>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-amber-400 h-2.5 rounded-full" 
                              style={{ width: `${(assessment.likelihood || 0) * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{assessment.likelihood?.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div>
                         <p className="text-sm text-gray-700 mb-1">Perceived value:</p>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-amber-400 h-2.5 rounded-full" 
                              style={{ width: `${(assessment.benefits || 0) * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{assessment.benefits?.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-amber-200">
                        <p className="text-sm text-gray-700">Overall assessment:</p>
                        <p className="font-medium text-gray-900">{assessment.overall}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const questionKey = `q${index + 1}` as keyof QuestionnaireResponses;
                  const response = questionnaire[questionKey];
                  
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-md ${response ? 'bg-gray-50' : 'bg-red-50 border border-red-100'}`}
                    >
                      <div className="flex">
                        <span className="font-medium text-gray-700 mr-2">{index + 1}.</span>
                        <p className="text-gray-800">{question}</p>
                      </div>
                      
                      {response ? (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 w-28">Strongly Disagree</span>
                            <div className="flex-1 flex justify-between px-2">
                              {[1, 2, 3, 4, 5, 6, 7].map(value => (
                                <div 
                                  key={value}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                                    ${parseInt(response) === value 
                                      ? 'bg-amber-400 text-gray-900 font-medium' 
                                      : 'bg-gray-200 text-gray-500'}`}
                                >
                                  {value}
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 w-28 text-right">Strongly Agree</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 mt-1">No response</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireModal;