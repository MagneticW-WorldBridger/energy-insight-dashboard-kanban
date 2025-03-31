import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useLeads } from '@/context/LeadContext';
import { queryClient } from '@/lib/queryClient';

interface QuestionnaireGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number;
}

const questions = [
  "It makes sense to have cosmetic surgery rather than spending years feeling bad about the way I look.",
  "Cosmetic surgery is a good thing because it can help me feel better about myself.",
  "Within next 2 months, I will end up having some cosmetic surgery.",
  "I am very unhappy with my physical appearance, and I am considering cosmetic surgery.",
  "I think cosmetic surgery can make me happier with the way I look, and I am willing to go for it.",
  "If I could have a cosmetic surgery done for a fair price, I would consider cosmetic surgery.",
  "If I knew there would be no negative side effects such as pain, I would like to try cosmetic surgery.",
  "I am constantly thinking about having cosmetic surgery.",
  "I would seriously consider having cosmetic surgery if my partner thought it, was a good idea.",
  "I would never have any kind of cosmetic surgery (R).",
  "I would have cosmetic surgery to keep looking young.",
  "It would benefit my career, I will have cosmetic surgery.",
  "I am considering having cosmetic surgery as I think my partner would find me more attractive.",
  "Cosmetic surgery can be a big benefit to my self-image.",
  "I think Cosmetic procedure would make me more attractive to others, and that's why I will go for it."
];

const QuestionnaireGenerator: React.FC<QuestionnaireGeneratorProps> = ({ 
  open, 
  onOpenChange,
  leadId 
}) => {
  const { reloadLeads } = useLeads();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scores, setScores] = useState<Record<string, string>>({
    q1: '4',
    q2: '5',
    q3: '4',
    q4: '5',
    q5: '6',
    q6: '5',
    q7: '6',
    q8: '3',
    q9: '4',
    q10: '2', // Reversed question - low score means high likelihood
    q11: '5',
    q12: '4',
    q13: '3',
    q14: '6',
    q15: '5'
  });

  const handleScoreChange = (question: string) => (value: string) => {
    setScores(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send the questionnaire data to the server
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionnaire: scores,
          // Move the lead to "questionnaireComplete" column
          columnId: 'questionnaireComplete'
        })
      });

      if (!response.ok) {
        throw new Error(`Error updating lead: ${response.statusText}`);
      }

      toast({
        title: 'Questionnaire Submitted',
        description: 'The questionnaire has been submitted and the AI will analyze the responses'
      });

      // Reload data
      reloadLeads();
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit questionnaire',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            Complete Questionnaire for Lead #{leadId}
          </DialogTitle>
          <Button 
            variant="ghost" 
            className="absolute right-4 top-4 h-6 w-6 p-0" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Rate each statement from 1 (strongly disagree) to 7 (strongly agree).
              <br />
              Note: Question 10 is reverse-scored. 
            </p>

            {questions.map((question, index) => {
              const questionId = `q${index + 1}`;
              return (
                <div key={questionId} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex mb-2">
                    <span className="font-medium text-gray-700 mr-2">{index + 1}.</span>
                    <p className="text-gray-800">{question}</p>
                  </div>
                  
                  <div className="flex items-center ml-6">
                    <Label htmlFor={questionId} className="w-32 text-sm">
                      Score (1-7):
                    </Label>
                    <Select 
                      value={scores[questionId]} 
                      onValueChange={handleScoreChange(questionId)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Strongly Disagree</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4 - Neutral</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7 - Strongly Agree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Questionnaire'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionnaireGenerator;