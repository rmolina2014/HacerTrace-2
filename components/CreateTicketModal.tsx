import React, { useState, useEffect } from 'react';
import { Ticket, Priority, Status, User } from '../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Partial<Ticket>) => void;
  initialData?: Ticket | null;
  projects: string[];
  modulesByProject: Record<string, string[]>;
  users: User[];
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  projects,
  modulesByProject,
  users
}) => {
  const [formData, setFormData] = useState<Partial<Ticket>>({
    title: '',
    description: '',
    module: '',
    priority: Priority.Medium,
    status: Status.Pending,
    assignee: '',
    project: projects[0] || ''
  });

  const [availableModules, setAvailableModules] = useState<string[]>([]);

  // Update modules when project changes
  useEffect(() => {
    if (formData.project) {
      const mods = modulesByProject[formData.project] || [];
      setAvailableModules(mods);
      
      // If current module is not in the new project list, reset it or set to first available
      if (!mods.includes(formData.module || '')) {
         setFormData(prev => ({ ...prev, module: mods[0] || '' }));
      }
    }
  }, [formData.project, modulesByProject]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaultProject = projects[0] || '';
      const defaultModules = modulesByProject[defaultProject] || [];
      setFormData({
        title: '',
        description: '',
        module: defaultModules[0] || '',
        priority: Priority.Medium,
        status: Status.Pending,
        assignee: '',
        project: defaultProject
      });
    }
  }, [initialData, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Editar Incidencia' : 'Nueva Incidencia'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ej: Error al imprimir comprobante"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
               <select 
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
                 value={formData.project}
                 onChange={e => setFormData({...formData, project: e.target.value})}
               >
                 {projects.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
                value={formData.module}
                onChange={e => setFormData({...formData, module: e.target.value})}
              >
                {availableModules.length > 0 ? (
                  availableModules.map(m => <option key={m} value={m}>{m}</option>)
                ) : (
                  <option value="">Sin módulos</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as Status})}
              >
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none bg-white text-gray-900"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Detalles técnicos del problema..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
              value={formData.assignee}
              onChange={e => setFormData({...formData, assignee: e.target.value})}
            >
              <option value="">Sin asignar</option>
              {users.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
            >
              Guardar Incidencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;