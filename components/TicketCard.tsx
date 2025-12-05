
import React from 'react';
import { Ticket, Priority } from '../types';

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onMove: (ticket: Ticket, direction: 'next' | 'prev') => void;
  onViewImage?: (imageUrl: string) => void;
}

const getPriorityColor = (p: Priority) => {
  switch (p) {
    case Priority.Critical: return 'bg-red-100 text-red-800 border-red-200';
    case Priority.High: return 'bg-orange-100 text-orange-800 border-orange-200';
    case Priority.Medium: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case Priority.Low: return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onEdit, onMove, onViewImage }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group relative flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-gray-500 font-bold">{ticket.id}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(ticket.priority)} font-medium`}>
          {ticket.priority}
        </span>
      </div>
      
      <h3 className="text-sm font-semibold text-gray-900 leading-tight">
        {ticket.title}
      </h3>
      
      <p className="text-xs text-gray-500 line-clamp-2">
        {ticket.description}
      </p>

      {/* Attachments Preview */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="flex gap-1 mt-1 overflow-x-auto pb-1">
          {ticket.attachments.map((img, idx) => (
            <div 
              key={idx} 
              className="w-8 h-8 rounded border border-gray-200 overflow-hidden shrink-0 cursor-pointer hover:opacity-80"
              onClick={(e) => { e.stopPropagation(); onViewImage && onViewImage(img); }}
            >
              <img src={img} alt="attachment" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
            {ticket.module}
          </span>
          {ticket.assignee && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold" title={`Asignado a: ${ticket.assignee}`}>
              {ticket.assignee.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
            onClick={() => onEdit(ticket)}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          </button>
        </div>
      </div>

      {/* Quick Move Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full left-0 px-1 hidden group-hover:flex justify-between pointer-events-none">
         <button 
            onClick={(e) => { e.stopPropagation(); onMove(ticket, 'prev'); }}
            className={`pointer-events-auto p-1 bg-white shadow-md border rounded-full text-gray-600 hover:text-blue-600 ${ticket.status === 'Pendiente' ? 'invisible' : ''}`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
         </button>
         <button 
            onClick={(e) => { e.stopPropagation(); onMove(ticket, 'next'); }}
            className={`pointer-events-auto p-1 bg-white shadow-md border rounded-full text-gray-600 hover:text-blue-600 ${ticket.status === 'Terminado' ? 'invisible' : ''}`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
         </button>
      </div>
    </div>
  );
};

export default TicketCard;
