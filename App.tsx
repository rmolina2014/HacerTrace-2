import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TicketCard from './components/TicketCard';
import CreateTicketModal from './components/CreateTicketModal';
import ArchitectureModal from './components/ArchitectureModal';
import AdminModal from './components/AdminModal';
import { INITIAL_TICKETS, INITIAL_PROJECTS, INITIAL_MODULES_BY_PROJECT, INITIAL_USERS } from './constants';
import { Ticket, Status, Module, Priority, User } from './types';
import { analyzeBacklog } from './services/geminiService';

function App() {
  // Data State
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [projects, setProjects] = useState<string[]>(INITIAL_PROJECTS);
  const [modulesByProject, setModulesByProject] = useState<Record<string, string[]>>(INITIAL_MODULES_BY_PROJECT);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [filterModule, setFilterModule] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Helpers
  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.Critical: return 'bg-red-100 text-red-800';
      case Priority.High: return 'bg-orange-100 text-orange-800';
      case Priority.Medium: return 'bg-yellow-100 text-yellow-800';
      case Priority.Low: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (s: Status) => {
      switch (s) {
          case Status.Done: return 'bg-green-50 text-green-700 border-green-200';
          case Status.InProgress: return 'bg-blue-50 text-blue-700 border-blue-200';
          case Status.Testing: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          case Status.Pending: return 'bg-gray-50 text-gray-600 border-gray-200';
          default: return 'bg-gray-50 text-gray-600';
      }
  }

  // Derived State (Unique modules across all projects for the filter dropdown)
  const allModules = useMemo(() => {
    const modules = new Set<string>();
    Object.values(modulesByProject).forEach(arr => arr.forEach(m => modules.add(m)));
    return Array.from(modules);
  }, [modulesByProject]);

  // Derived State (Filtered Tickets)
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchModule = filterModule === 'All' || t.module === filterModule;
      const matchProject = filterProject === 'All' || t.project === filterProject;
      return matchModule && matchProject;
    });
  }, [tickets, filterModule, filterProject]);

  // Derived State (Kanban Columns)
  const columns = useMemo(() => {
    const cols = [
      { id: Status.Pending, title: 'Pendiente', color: 'border-red-400' },
      { id: Status.InProgress, title: 'En Desarrollo', color: 'border-blue-400' },
      { id: Status.Testing, title: 'Testing / QA', color: 'border-yellow-400' },
      { id: Status.Done, title: 'Terminado', color: 'border-green-400' },
    ];

    return cols.map(col => ({
      ...col,
      items: filteredTickets.filter(t => t.status === col.id)
    }));
  }, [filteredTickets]);

  // Derived State (Stats)
  const statsData = useMemo(() => {
    return [
      { name: 'Pendiente', value: tickets.filter(t => t.status === Status.Pending).length, color: '#ef4444' },
      { name: 'Desarrollo', value: tickets.filter(t => t.status === Status.InProgress).length, color: '#3b82f6' },
      { name: 'Testing', value: tickets.filter(t => t.status === Status.Testing).length, color: '#eab308' },
      { name: 'Terminado', value: tickets.filter(t => t.status === Status.Done).length, color: '#22c55e' },
    ];
  }, [tickets]);

  // --- Handlers: Ticket Management ---
  const handleSaveTicket = (ticketData: Partial<Ticket>) => {
    if (editingTicket) {
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? { ...t, ...ticketData } as Ticket : t));
      setEditingTicket(null);
    } else {
      const newTicket: Ticket = {
        ...ticketData as Ticket,
        id: `T-${(tickets.length + 1).toString().padStart(3, '0')}`,
        createdAt: new Date().toLocaleDateString('es-ES'),
      };
      setTickets(prev => [...prev, newTicket]);
    }
  };

  const handleMoveTicket = (ticket: Ticket, direction: 'next' | 'prev') => {
    const flow = [Status.Pending, Status.InProgress, Status.Testing, Status.Done];
    const currentIndex = flow.indexOf(ticket.status);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= flow.length) newIndex = flow.length - 1;

    const newStatus = flow[newIndex];
    if (newStatus !== ticket.status) {
       setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
    }
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeBacklog(tickets);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // --- Handlers: Admin (ABM) ---
  const handleAddProject = (name: string) => {
    if (!projects.includes(name)) {
      setProjects(prev => [...prev, name]);
      setModulesByProject(prev => ({ ...prev, [name]: [] })); // Init empty modules
    }
  };

  const handleDeleteProject = (name: string) => {
    setProjects(prev => prev.filter(p => p !== name));
    // Optional: remove from modulesByProject too, or keep it as orphan
    const newModules = { ...modulesByProject };
    delete newModules[name];
    setModulesByProject(newModules);
  };

  const handleAddModule = (project: string, name: string) => {
    const currentModules = modulesByProject[project] || [];
    if (!currentModules.includes(name)) {
       setModulesByProject(prev => ({
         ...prev,
         [project]: [...currentModules, name]
       }));
    }
  };

  const handleDeleteModule = (project: string, name: string) => {
    const currentModules = modulesByProject[project] || [];
    setModulesByProject(prev => ({
      ...prev,
      [project]: currentModules.filter(m => m !== name)
    }));
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };


  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
             </div>
             <div>
               <h1 className="text-xl font-bold text-gray-900 tracking-tight">MuniTrack</h1>
               <p className="text-xs text-gray-500 font-medium">Gestión de Desarrollo Municipal</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
               Configuración
            </button>
            <button 
                onClick={() => setIsArchModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
              Ver Propuesta
            </button>
            <button 
              onClick={() => { setEditingTicket(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nueva Incidencia
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full xl:w-auto">
            
            {/* Project Filter */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm h-10 w-full sm:w-auto">
                <span className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Proyecto:</span>
                <select 
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 py-1 pr-8 cursor-pointer h-full w-full sm:w-auto"
                >
                <option value="All">Todos</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Module Filter */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm h-10 w-full sm:w-auto">
                <span className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Módulo:</span>
                <select 
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 py-1 pr-8 cursor-pointer h-full w-full sm:w-auto"
                >
                <option value="All">Todos</option>
                {allModules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-200 p-1 rounded-lg h-10 w-full sm:w-auto shrink-0">
                <button 
                    onClick={() => setViewMode('kanban')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                    Tablero
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    Lista
                </button>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
             {/* Stats Mini Widget */}
             <div className="hidden md:flex h-10 w-64 items-end gap-1">
                {statsData.map(stat => (
                   <div key={stat.name} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className="w-full rounded-t-sm transition-all duration-500" 
                        style={{ height: `${tickets.length > 0 ? (stat.value / tickets.length) * 100 : 0}%`, backgroundColor: stat.color, minHeight: '4px' }} 
                      />
                      <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {stat.name}: {stat.value}
                      </div>
                   </div>
                ))}
             </div>
             
             <button 
               onClick={handleAIAnalysis}
               disabled={isAnalyzing}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-70 whitespace-nowrap"
             >
               {isAnalyzing ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Analizando...
                 </>
               ) : (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                   IA Assistant
                 </>
               )}
             </button>
          </div>
        </div>

        {/* AI Analysis Result */}
        {aiAnalysis && (
          <div className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-600"></div>
             <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                   <span className="text-xl">✨</span> Análisis Inteligente del Backlog
                </h3>
                <button onClick={() => setAiAnalysis(null)} className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
             </div>
             <div className="prose prose-sm prose-indigo max-w-none text-gray-700">
               {aiAnalysis.split('\n').map((line, i) => {
                 if (line.includes('**')) {
                    const parts = line.split('**');
                    return <p key={i} className="mb-1">{parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part)}</p>
                 }
                 if (line.trim().startsWith('>')) return <blockquote key={i} className="border-l-4 border-indigo-300 pl-4 italic text-indigo-700 my-2">{line.replace('>','')}</blockquote>
                 return <p key={i} className="mb-1">{line}</p>
               })}
             </div>
          </div>
        )}

        {/* Views */}
        {viewMode === 'kanban' ? (
            /* Kanban Board */
            <div className="flex overflow-x-auto pb-6 gap-6 items-start h-[calc(100vh-250px)] kanban-col">
              {columns.map(col => (
                <div key={col.id} className="min-w-[280px] w-full max-w-xs flex flex-col bg-gray-100/50 rounded-xl h-full border border-gray-200">
                   <div className={`p-4 border-t-4 ${col.color} bg-white rounded-t-xl shadow-sm z-10`}>
                     <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">{col.title}</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">{col.items.length}</span>
                     </div>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-3 space-y-3 kanban-col">
                     {col.items.map(ticket => (
                       <TicketCard 
                          key={ticket.id} 
                          ticket={ticket} 
                          onEdit={(t) => { setEditingTicket(t); setIsModalOpen(true); }}
                          onMove={handleMoveTicket}
                       />
                     ))}
                     {col.items.length === 0 && (
                       <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                         Sin tickets
                       </div>
                     )}
                   </div>
                </div>
              ))}
            </div>
        ) : (
            /* List View */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título / Descripción</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-gray-500">
                                        {ticket.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {ticket.project}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                            {ticket.module}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{ticket.title}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {ticket.assignee ? (
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                                    {ticket.assignee.charAt(0)}
                                                </span>
                                                <span className="text-sm text-gray-600">{ticket.assignee}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => { setEditingTicket(ticket); setIsModalOpen(true); }}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No se encontraron incidencias con los filtros actuales.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </main>

      {/* Modals */}
      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTicket(null); }}
        onSave={handleSaveTicket}
        initialData={editingTicket}
        projects={projects}
        modulesByProject={modulesByProject}
        users={users}
      />

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        projects={projects}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
        modulesByProject={modulesByProject}
        onAddModule={handleAddModule}
        onDeleteModule={handleDeleteModule}
        users={users}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

export default App;