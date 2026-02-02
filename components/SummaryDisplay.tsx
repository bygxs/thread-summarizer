import React, { useState } from 'react';
import { SummaryResult, SummaryView } from '../types';

interface SummaryDisplayProps {
  result: SummaryResult;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<SummaryView>(SummaryView.NARRATIVE);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = activeTab === SummaryView.NARRATIVE ? result.narrative : result.technical;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').filter(line => line.trim().length > 0).map((line, i) => {
      if (line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
        return (
          <div key={i} className="pl-4 mb-3 text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="text-base leading-relaxed">{line.replace(/^[\*\-\d\.]+\s*/, '')}</span>
          </div>
        );
      }
      return (
        <p key={i} className="mb-5 text-slate-700 dark:text-slate-300 leading-relaxed text-base">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-dark-800 overflow-hidden flex flex-col">
      <div className="flex border-b border-slate-100 dark:border-dark-800 p-2 gap-2 bg-slate-50/50 dark:bg-dark-950/50">
        <button
          onClick={() => setActiveTab(SummaryView.NARRATIVE)}
          className={`flex-1 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === SummaryView.NARRATIVE
              ? 'bg-white dark:bg-dark-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Narrative Handover
        </button>
        <button
          onClick={() => setActiveTab(SummaryView.TECHNICAL)}
          className={`flex-1 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === SummaryView.TECHNICAL
              ? 'bg-white dark:bg-dark-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Technical Manifest
        </button>
      </div>

      <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === SummaryView.NARRATIVE ? 'High-Fidelity Context' : 'Structural Blueprint'}
            </h3>
            <button
              onClick={handleCopy}
              className={`p-3 rounded-2xl transition-all active:scale-90 ${
                isCopied ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              {isCopied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              )}
            </button>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {formatText(activeTab === SummaryView.NARRATIVE ? result.narrative : result.technical)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDisplay;