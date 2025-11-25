import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Ticket, Status } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, tickets }) => {
  if (!isOpen) return null;

  // Helper to parse dates like "Feb-25" or "15/11/2025" into a comparable object
  const processData = () => {
    const monthMap: Record<string, number> = {
      'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'mayo': 4, 'jun': 5, 
      'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };

    const groupedData: Record<string, any> = {};

    tickets.forEach(ticket => {
      let dateKey = '';
      let sortValue = 0;

      // Detect format
      if (ticket.createdAt.includes('/')) {
        // Format: DD/MM/YYYY
        const parts = ticket.createdAt.split('/');
        if (parts.length === 3) {
           const monthIndex = parseInt(parts[1]) - 1;
           const year = parseInt(parts[2]);
           const monthName = Object.keys(monthMap).find(key => monthMap[key] === monthIndex);
           const shortYear = year.toString().slice(-2);
           dateKey = `${monthName?.charAt(0).toUpperCase()}${monthName?.slice(1)}-${shortYear}`;
           sortValue = year * 100 + monthIndex;
        }
      } else {
        // Format: Month-YY (e.g. Feb-25)
        const parts = ticket.createdAt.split('-');
        if (parts.length === 2) {
          const monthStr = parts[0].toLowerCase();
          const yearStr = parts[1];
          const monthIndex = monthMap[monthStr] !== undefined ? monthMap[monthStr] : 0;
          dateKey = ticket.createdAt; // Use as is
          sortValue = parseInt(`20${yearStr}`) * 100 + monthIndex;
        }
      }

      if (!dateKey) dateKey = 'Desconocido';

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          name: dateKey,
          sortValue: sortValue,
          [Status.Pending]: 0,
          [Status.InProgress]: 0,
          [Status.Testing]: 0,
          [Status.Done]: 0,
          [Status.Future]: 0,
          total: 0
        };
      }

      groupedData[dateKey][ticket.status] = (groupedData[dateKey][ticket.status] || 0) + 1;
      groupedData[dateKey].total += 1;
    });

    return Object.values(groupedData).sort((a: any, b: any) => a.sortValue - b.sortValue);
  };

  const data = useMemo(() => processData(), [tickets]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col">
        <div className="bg-gray-800 px-6 py-4 rounded-t-xl flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Estadísticas Mensuales
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6 flex-1 bg-gray-50 overflow-hidden flex flex-col">
            <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
               <h3 className="text-sm font-semibold text-gray-700 mb-1">Resumen de Incidencias por Mes</h3>
               <p className="text-xs text-gray-500">Visualización de la carga de trabajo y progreso a lo largo del tiempo.</p>
            </div>

            <div className="flex-1 w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f3f4f6' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey={Status.Done} name="Terminado" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                        <Bar dataKey={Status.Testing} name="Testing" stackId="a" fill="#eab308" />
                        <Bar dataKey={Status.InProgress} name="En Desarrollo" stackId="a" fill="#3b82f6" />
                        <Bar dataKey={Status.Pending} name="Pendiente" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;