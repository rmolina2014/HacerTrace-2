import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Projects
  projects: string[];
  onAddProject: (name: string) => void;
  onDeleteProject: (name: string) => void;
  // Modules
  modulesByProject: Record<string, string[]>;
  onAddModule: (project: string, name: string) => void;
  onDeleteModule: (project: string, name: string) => void;
  // Users
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, onClose, 
  projects, onAddProject, onDeleteProject,
  modulesByProject, onAddModule, onDeleteModule,
  users, onAddUser, onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'modules' | 'users'>('projects');
  
  // Local state for inputs
  const [newProjectName, setNewProjectName] = useState('');
  
  const [selectedProjectForModule, setSelectedProjectForModule] = useState(projects[0] || '');
  const [newModuleName, setNewModuleName] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Desarrollador');

  if (!isOpen) return null;

  // Handlers
  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const handleAddModule = () => {
    if (newModuleName.trim() && selectedProjectForModule) {
      onAddModule(selectedProjectForModule, newModuleName.trim());
      setNewModuleName('');
    }
  };

  const handleAddUser = () => {
    if (newUserName.trim()) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: newUserName.trim(),
        role: newUserRole
      };
      onAddUser(newUser);
      setNewUserName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Configuración y Administración
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button onClick={() => setActiveTab('projects')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'projects' ? 'bg-white border-t-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
            Proyectos
          </button>
          <button onClick={() => setActiveTab('modules')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'modules' ? 'bg-white border-t-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
            Módulos
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'users' ? 'bg-white border-t-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
            Usuarios
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          
          {/* --- PROJECTS TAB --- */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Nuevo Proyecto</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Nombre del proyecto (ej: Rentas-2025)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button onClick={handleAddProject} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Agregar</button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Proyecto</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projects.map(p => (
                      <tr key={p}>
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">{p}</td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => onDeleteProject(p)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- MODULES TAB --- */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Nuevo Módulo</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <select 
                        value={selectedProjectForModule}
                        onChange={(e) => setSelectedProjectForModule(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {projects.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                        <input 
                          type="text" 
                          value={newModuleName}
                          onChange={(e) => setNewModuleName(e.target.value)}
                          placeholder="Nombre del Módulo (ej: Auditoría)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button onClick={handleAddModule} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Agregar</button>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 bg-gray-100 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase">Viendo módulos de: <span className="text-indigo-600">{selectedProjectForModule}</span></span>
                </div>
                <ul className="divide-y divide-gray-200">
                  {(modulesByProject[selectedProjectForModule] || []).length > 0 ? (
                    (modulesByProject[selectedProjectForModule] || []).map(module => (
                      <li key={module} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                        <span className="text-sm text-gray-900">{module}</span>
                        <button onClick={() => onDeleteModule(selectedProjectForModule, module)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                      </li>
                    ))
                  ) : (
                     <li className="px-6 py-4 text-sm text-gray-500 italic text-center">No hay módulos registrados para este proyecto.</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === 'users' && (
             <div className="space-y-6">
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Nuevo Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                   <div className="md:col-span-2">
                      <input 
                        type="text" 
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                   </div>
                   <div className="md:col-span-1">
                      <select 
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Desarrollador">Desarrollador</option>
                        <option value="Funcional">Funcional</option>
                      </select>
                   </div>
                   <div className="md:col-span-1">
                      <button onClick={handleAddUser} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Agregar</button>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">{u.name}</td>
                        <td className="px-6 py-3">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.role === 'Desarrollador' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                             {u.role}
                           </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => onDeleteUser(u.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminModal;