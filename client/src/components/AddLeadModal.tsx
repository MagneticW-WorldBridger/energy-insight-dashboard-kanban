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
    smsStatus: '',
    sendTime: '',
    verifiedTime: '',
    priority: '',
    consultDate: '',
    financing: '',
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
      // Preparar los datos para enviar
      const leadData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      // Hacer la petición POST
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear lead: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Mostrar notificación de éxito
      toast({
        title: 'Lead creado',
        description: `${formData.name} ha sido añadido correctamente`
      });
      
      // Recargar datos y cerrar modal
      reloadLeads();
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      // Limpiar formulario
      setFormData({
        name: '',
        username: '',
        time: '',
        source: '',
        avatar: '',
        tags: '',
        columnId: 'newLeads',
        assessment: 'Pending',
        smsStatus: '',
        sendTime: '',
        verifiedTime: '',
        priority: '',
        consultDate: '',
        financing: '',
        reason: '',
        notes: '',
        contactInfo: {
          email: '',
          phone: ''
        }
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error al crear lead:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear lead',
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
            Añadir Nuevo Lead
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
            {/* Sección de Información básica */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-2 border-b pb-1">Información básica</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Nombre del lead" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input 
                id="username" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="@username" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Tiempo</Label>
              <Input 
                id="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange} 
                placeholder="5m ago, 2h ago, etc." 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Fuente</Label>
              <Input 
                id="source" 
                name="source" 
                value={formData.source} 
                onChange={handleChange} 
                placeholder="Facebook, Instagram, etc." 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input 
                id="tags" 
                name="tags" 
                value={formData.tags} 
                onChange={handleChange} 
                placeholder="Botox, Fillers, Face, etc." 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL (opcional)</Label>
              <Input 
                id="avatar" 
                name="avatar" 
                value={formData.avatar} 
                onChange={handleChange} 
                placeholder="https://example.com/avatar.jpg" 
              />
            </div>
            
            {/* Sección de Contacto */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-lg font-medium mb-2 border-b pb-1">Información de contacto</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                value={formData.contactInfo.email} 
                onChange={handleChange} 
                type="email" 
                placeholder="email@ejemplo.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.contactInfo.phone} 
                onChange={handleChange} 
                placeholder="+1 (555) 123-4567" 
              />
            </div>
            
            {/* Sección de Estado y progreso */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-lg font-medium mb-2 border-b pb-1">Estado y Progreso</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="columnId">Columna (Estado)</Label>
              <Select name="columnId" value={formData.columnId} onValueChange={handleSelectChange('columnId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una columna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newLeads">Nuevos Leads</SelectItem>
                  <SelectItem value="phoneVerified">Verificados por Teléfono</SelectItem>
                  <SelectItem value="questionnaireStarted">Cuestionario Iniciado</SelectItem>
                  <SelectItem value="questionnaireComplete">Cuestionario Completado</SelectItem>
                  <SelectItem value="inProgress">En Progreso</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                  <SelectItem value="notInterested">No Interesado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smsStatus">Estado SMS</Label>
              <Select name="smsStatus" value={formData.smsStatus || ''} onValueChange={handleSelectChange('smsStatus')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado SMS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No aplica</SelectItem>
                  <SelectItem value="Pending">Pendiente</SelectItem>
                  <SelectItem value="Sent">Enviado</SelectItem>
                  <SelectItem value="Delivered">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sendTime">Hora de envío SMS</Label>
              <Input 
                id="sendTime" 
                name="sendTime" 
                value={formData.sendTime} 
                onChange={handleChange} 
                placeholder="10:30 AM" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verifiedTime">Hora de verificación</Label>
              <Input 
                id="verifiedTime" 
                name="verifiedTime" 
                value={formData.verifiedTime} 
                onChange={handleChange} 
                placeholder="11:45 AM" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select name="priority" value={formData.priority || ''} onValueChange={handleSelectChange('priority')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No definida</SelectItem>
                  <SelectItem value="High Intent">Intención Alta</SelectItem>
                  <SelectItem value="Medium Intent">Intención Media</SelectItem>
                  <SelectItem value="Low Intent">Intención Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="consultDate">Fecha de consulta</Label>
              <Input 
                id="consultDate" 
                name="consultDate" 
                value={formData.consultDate} 
                onChange={handleChange} 
                placeholder="Mar 15, 2023" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="financing">Financiamiento</Label>
              <Select name="financing" value={formData.financing || ''} onValueChange={handleSelectChange('financing')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de financiamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No definido</SelectItem>
                  <SelectItem value="Self-Pay">Pago propio</SelectItem>
                  <SelectItem value="Care Credit">Care Credit</SelectItem>
                  <SelectItem value="Payment Plan">Plan de pagos</SelectItem>
                  <SelectItem value="Insurance">Seguro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Razón (si aplica)</Label>
              <Input 
                id="reason" 
                name="reason" 
                value={formData.reason} 
                onChange={handleChange} 
                placeholder="Razón para no continuar, cancelar, etc." 
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Notas adicionales sobre el lead" 
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
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? 'Creando...' : 'Crear Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadModal;