
import React, { useState } from 'react';
import { SummaryResult, SummaryView } from '../types';

interface SummaryDisplayProps {
  result: SummaryResult;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<SummaryView>(SummaryView.NARRATIVE);

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Very basic markdown-like list detection for the technical manifest
      if (line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
        return (
          <div key={i} className="pl-4 mb-2 text-slate-700 dark:text-slate-300 flex items-start gap-2 text-sm md:text-base">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
            <span>{line.replace(/^[\*\-\d\.]+\s*/, '')}</span>
          </div>
        );
      }
      return (
        <p key={i} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900/50">
        <button
          onClick={() => setActiveTab(SummaryView.NARRATIVE)}
          className={`flex-1 py-4 text-xs md:text-sm font-semibold transition-all ${
            activeTab === SummaryView.NARRATIVE
              ? 'bg-white dark:bg-dark-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700'
          }`}
        >
          📖 Narrative Handover
        </button>
        <button
          onClick={() => setActiveTab(SummaryView.TECHNICAL)}
          className={`flex-1 py-4 text-xs md:text-sm font-semibold transition-all ${
            activeTab === SummaryView.TECHNICAL
              ? 'bg-white dark:bg-dark-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700'
          }`}
        >
          ⚙️ Technical Manifest
        </button>
      </div>

      <div className="p-5 md:p-8 max-h-[500px] md:max-h-[600px] overflow-y-auto">
        {activeTab === SummaryView.NARRATIVE ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">The Human Story</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {formatText(result.narrative)}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Hard Technical Data</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {formatText(result.technical)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryDisplay;
