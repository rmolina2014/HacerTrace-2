import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ARCHITECTURE_PROPOSAL } from '../constants';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="bg-indigo-600 px-6 py-4 rounded-t-xl flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Análisis de Arquitectura
          </h2>
          <button onClick={onClose} className="text-white hover:bg-indigo-700 p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 prose prose-indigo max-w-none">
             {/* Using a simple pre-wrap for simplicity in this demo environment instead of adding heavy markdown deps, 
                 but keeping the component name logical */}
             <div className="whitespace-pre-wrap font-sans text-gray-800">
                {ARCHITECTURE_PROPOSAL.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-gray-900 mt-4 mb-2">{line.replace('# ', '')}</h1>
                    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold text-gray-800 mt-4 mb-2 border-b pb-1">{line.replace('## ', '')}</h2>
                    if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-gray-700">{line.replace('* ', '')}</li>
                    return <p key={i} className="text-gray-600 mb-2">{line}</p>
                })}
             </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureModal;