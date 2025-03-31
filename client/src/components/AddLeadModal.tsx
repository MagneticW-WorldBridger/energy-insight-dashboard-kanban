import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useLeads } from '@/context/LeadContext';
import { queryClient } from '@/lib/queryClient';

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ open, onOpenChange }) => {
  const { reloadLeads } = useLeads();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    time: '',
    source: '',
    avatar: '',
    tags: '',
    columnId: 'newLeads',
    assessment: 'Pending',
    smsStatus: 'none',
    sendTime: '',
    verifiedTime: '',
    priority: 'none',
    consultDate: '',
    financing: 'none',
    reason: '',
    notes: '',
    contactInfo: {
      email: '',
      phone: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'email' || name === 'phone') {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [name]: value
        }
      }));
    } else if (['sendTime', 'verifiedTime', 'consultDate'].includes(name)) {
      // Special handling for date/time fields - prevent invalid dates
      try {
        // If value is empty, just use empty string
        if (!value.trim()) {
          setFormData(prev => ({
            ...prev,
            [name]: ''
          }));
        } else {
          // Try to parse the date to validate it
          const dateObj = new Date(value);
          // Check if date is valid
          if (!isNaN(dateObj.getTime())) {
            setFormData(prev => ({
              ...prev,
              [name]: value // Store original formatted value
            }));
          } else {
            console.warn(`Invalid date format for ${name}: ${value}`);
            // Keep previous value if new one is invalid
            setFormData(prev => prev);
          }
        }
      } catch (error) {
        console.warn(`Date parsing error for ${name}: ${error}`);
        // Keep previous value if there's an error
        setFormData(prev => prev);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data to send with proper timestamp handling
      const now = new Date().toISOString();
      const leadData = {
        name: formData.name,
        username: formData.username || `@${formData.name.toLowerCase().replace(/\s+/g, '_')}`,
        time: now, // Always use ISO format for time
        source: formData.source || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        avatar: formData.avatar || null,
        assessment: formData.assessment,
        columnId: formData.columnId,
        
        // Handle optional fields
        smsStatus: formData.smsStatus === 'none' ? null : formData.smsStatus,
        sendTime: formData.sendTime ? new Date(formData.sendTime).toISOString() : null,
        verifiedTime: formData.verifiedTime ? new Date(formData.verifiedTime).toISOString() : null,
        priority: formData.priority === 'none' ? null : formData.priority,
        consultDate: formData.consultDate ? new Date(formData.consultDate).toISOString() : null,
        financing: formData.financing === 'none' ? null : formData.financing,
        reason: formData.reason || null,
        notes: formData.notes || null,
        
        // Contact info is required
        contactInfo: {
          email: formData.contactInfo.email || null,
          phone: formData.contactInfo.phone || null
        }
      };

      // Make POST request
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error creating lead: ${errorText}`);
      }

      const result = await response.json();

      // Show success notification
      toast({
        title: 'Lead Created',
        description: `${formData.name} has been added successfully`
      });

      // Reload data and close modal
      reloadLeads();
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });

      // Clear form
      setFormData({
        name: '',
        username: '',
        time: '',
        source: '',
        avatar: '',
        tags: '',
        columnId: 'newLeads',
        assessment: 'Pending',
        smsStatus: 'none',
        sendTime: '',
        verifiedTime: '',
        priority: 'none',
        consultDate: '',
        financing: 'none',
        reason: '',
        notes: '',
        contactInfo: {
          email: '',
          phone: ''
        }
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error creating lead',
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
            Add New Lead
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-2 border-b pb-1">Basic Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Lead's name" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="@username" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange} 
                placeholder="5m ago, 2h ago, etc." 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input 
                id="source" 
                name="source" 
                value={formData.source} 
                onChange={handleChange} 
                placeholder="Facebook, Instagram, etc." 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input 
                id="tags" 
                name="tags" 
                value={formData.tags} 
                onChange={handleChange} 
                placeholder="Botox, Fillers, Face, etc." 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL (optional)</Label>
              <Input 
                id="avatar" 
                name="avatar" 
                value={formData.avatar} 
                onChange={handleChange} 
                placeholder="https://example.com/avatar.jpg" 
              />
            </div>

            {/* Contact Information Section */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-lg font-medium mb-2 border-b pb-1">Contact Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                value={formData.contactInfo.email} 
                onChange={handleChange} 
                type="email" 
                placeholder="email@example.com" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.contactInfo.phone} 
                onChange={handleChange} 
                placeholder="+1 (555) 123-4567" 
              />
            </div>

            {/* Status and Progress Section */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-lg font-medium mb-2 border-b pb-1">Status and Progress</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="columnId">Column (Status)</Label>
              <Select name="columnId" value={formData.columnId} onValueChange={handleSelectChange('columnId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newLeads">New Leads</SelectItem>
                  <SelectItem value="phoneVerified">Phone Verified</SelectItem>
                  <SelectItem value="questionnaireStarted">Questionnaire Started</SelectItem>
                  <SelectItem value="questionnaireComplete">Questionnaire Complete</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="notInterested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smsStatus">SMS Status</Label>
              <Select name="smsStatus" value={formData.smsStatus} onValueChange={handleSelectChange('smsStatus')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select SMS status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Applicable</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sendTime">SMS Send Time</Label>
              <Input 
                id="sendTime" 
                name="sendTime" 
                type="datetime-local"
                value={formData.sendTime} 
                onChange={handleChange} 
                placeholder="10:30 AM" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verifiedTime">Verification Time</Label>
              <Input 
                id="verifiedTime" 
                name="verifiedTime" 
                type="datetime-local"
                value={formData.verifiedTime} 
                onChange={handleChange} 
                placeholder="11:45 AM" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" value={formData.priority} onValueChange={handleSelectChange('priority')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Defined</SelectItem>
                  <SelectItem value="High Intent">High Intent</SelectItem>
                  <SelectItem value="Medium Intent">Medium Intent</SelectItem>
                  <SelectItem value="Low Intent">Low Intent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultDate">Consultation Date</Label>
              <Input 
                id="consultDate" 
                name="consultDate" 
                type="date"
                value={formData.consultDate} 
                onChange={handleChange} 
                placeholder="Mar 15, 2023" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="financing">Financing</Label>
              <Select name="financing" value={formData.financing} onValueChange={handleSelectChange('financing')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select financing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Defined</SelectItem>
                  <SelectItem value="Self-Pay">Self-Pay</SelectItem>
                  <SelectItem value="Care Credit">Care Credit</SelectItem>
                  <SelectItem value="Payment Plan">Payment Plan</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Reason (if applicable)</Label>
              <Input 
                id="reason" 
                name="reason" 
                value={formData.reason} 
                onChange={handleChange} 
                placeholder="Reason for not proceeding, cancellation, etc." 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Additional notes about the lead" 
                rows={4}
              />
            </div>
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
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadModal;