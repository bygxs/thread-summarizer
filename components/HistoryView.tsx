import React from 'react';
import { SavedSummary } from '../types';
import { deleteSummary } from '../services/dbService';

interface HistoryViewProps {
  summaries: SavedSummary[];
  onSelect: (summary: SavedSummary) => void;
  onRefresh: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ summaries, onSelect, onRefresh }) => {
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Delete this summary?')) {
      await deleteSummary(id);
      onRefresh();
    }
  };

  if (summaries.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-dark-700">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No history yet</h3>
        <p className="text-slate-500 dark:text-slate-400">Summaries you generate will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {summaries.map((s) => (
        <div 
          key={s.id}
          onClick={() => onSelect(s)}
          className="group relative bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
              {new Date(s.timestamp).toLocaleDateString()}
            </span>
            <button 
              onClick={(e) => handleDelete(e, s.id)}
              className="p-2 text-slate-300 hover:text-rose-500 dark:text-dark-600 dark:hover:text-rose-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <h4 className="text-slate-900 dark:text-slate-100 font-bold mb-3 line-clamp-2 leading-tight">
            {s.title || "Untitled Summary"}
          </h4>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
            {s.narrative}
          </p>

          <div className="flex items-center gap-4 border-t border-slate-100 dark:border-dark-700 pt-4 mt-auto">
            <div className="text-xs text-slate-400 dark:text-dark-400 font-medium">
              <span className="font-bold text-slate-600 dark:text-slate-300">{s.stats.wordCount}</span> w
            </div>
            <div className="text-xs text-slate-400 dark:text-dark-400 font-medium">
              <span className="font-bold text-slate-600 dark:text-slate-300">{s.stats.tokenCountEstimate}</span> t
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryView;