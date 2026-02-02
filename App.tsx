import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { generateChatSummaries } from './services/geminiService';
import { calculateStats } from './utils/counters';
import { SummaryResult, Stats, AppView, SavedSummary } from './types';
import StatsCards from './components/StatsCards';
import SummaryDisplay from './components/SummaryDisplay';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import { getAllSummaries, saveSummary } from './services/dbService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('HOME');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getAllSummaries();
      setSavedSummaries(data);
    } catch (err) {
      console.error("DB Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const stats: Stats = useMemo(() => calculateStats(inputText), [inputText]);

  const handleSummarize = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Input is empty.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const summaryResult = await generateChatSummaries(inputText);
      setResults(summaryResult);
      
      const title = inputText.split('\n')[0].substring(0, 50).trim() || "Untitled Thread";
      await saveSummary({
        ...summaryResult,
        timestamp: Date.now(),
        stats: calculateStats(inputText),
        title: title.length < 5 ? "Chat Analysis " + new Date().toLocaleTimeString() : title,
        originalText: inputText
      });
      fetchHistory();
    } catch (err: any) {
      setError(err.message || "Execution failed.");
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, fetchHistory]);

  const handleSelectFromHistory = (summary: SavedSummary) => {
    setInputText(summary.originalText);
    setResults({ narrative: summary.narrative, technical: summary.technical });
    setView('HOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setInputText('');
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 pb-20 transition-colors duration-300 font-sans">
      <header className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-dark-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('HOME')}>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">Σ</div>
            <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 hidden sm:block">
              THREAD<span className="text-indigo-600 dark:text-indigo-400">IQ</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-1">
            {(['HOME', 'HISTORY', 'SETTINGS'] as AppView[]).map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === v ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'}`}
              >
                {v}
              </button>
            ))}
            <div className="w-px h-6 bg-slate-200 dark:bg-dark-700 mx-2"></div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700 transition-all"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4-9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {view === 'HOME' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <section className="bg-white dark:bg-dark-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-dark-800 overflow-hidden group focus-within:ring-2 ring-indigo-500/20 transition-all">
                  <div className="p-1">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your chat history thread here..."
                      className="w-full h-80 p-6 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed dark:text-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="px-6 py-4 bg-slate-50/50 dark:bg-dark-950/50 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between">
                    <div className="flex gap-4">
                       <button
                        onClick={handleClear}
                        disabled={!inputText || isProcessing}
                        className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest disabled:opacity-30"
                      >
                        Clear Input
                      </button>
                    </div>
                    <button
                      onClick={handleSummarize}
                      disabled={!inputText || isProcessing}
                      className={`px-8 py-3 text-sm font-black text-white rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 ${
                        isProcessing 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                      }`}
                    >
                      {isProcessing ? 'ANALYZING...' : 'RUN PROTOCOL'}
                    </button>
                  </div>
                </section>

                {error && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span className="text-sm font-bold uppercase tracking-tight">{error}</span>
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 shrink-0">
                <StatsCards stats={stats} />
              </div>
            </div>

            {(results || isProcessing) && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isProcessing && !results ? (
                   <div className="h-64 bg-white dark:bg-dark-900 rounded-[2rem] border border-slate-200 dark:border-dark-800 flex flex-col items-center justify-center text-slate-400 gap-4">
                     <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                     <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Executing Intelligence Extraction...</p>
                   </div>
                ) : (
                  results && <SummaryDisplay result={results} />
                )}
              </div>
            )}
          </div>
        )}

        {view === 'HISTORY' && (
          <HistoryView summaries={savedSummaries} onSelect={handleSelectFromHistory} onRefresh={fetchHistory} />
        )}
        {view === 'SETTINGS' && <SettingsView />}
      </main>
    </div>
  );
};

export default App;