import React, { useState, useMemo } from 'react';
import { SummaryResult, SummaryView } from '../types';
import { marked } from 'marked';

interface SummaryDisplayProps {
  result: SummaryResult;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<SummaryView>(SummaryView.NARRATIVE);
  const [isCopied, setIsCopied] = useState(false);

  const activeText = useMemo(() => {
    return activeTab === SummaryView.NARRATIVE ? result.narrative : result.technical;
  }, [activeTab, result]);

  const htmlContent = useMemo(() => {
    return marked.parse(activeText);
  }, [activeText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `ThreadIQ_${activeTab.toLowerCase()}_${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      <div className="p-8 md:p-12 max-h-[75vh] overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === SummaryView.NARRATIVE ? 'High-Fidelity Context' : 'Structural Blueprint'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                title="Download as Markdown"
                className="p-3 rounded-2xl bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
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
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tight 
                prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-li:text-slate-700 dark:prose-li:text-slate-300
                prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400
                prose-code:bg-slate-100 dark:prose-code:bg-dark-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDisplay;