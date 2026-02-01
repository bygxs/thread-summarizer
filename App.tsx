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

  // Initialize Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  // Load History
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
      setError("Please paste some chat history first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const summaryResult = await generateChatSummaries(inputText);
      setResults(summaryResult);
      
      // Persist to DB
      const title = inputText.split('\n')[0].substring(0, 60) || "Chat Summary";
      await saveSummary({
        ...summaryResult,
        timestamp: Date.now(),
        stats: calculateStats(inputText),
        title,
        originalText: inputText
      });
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while generating the summary.");
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
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 pb-20 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
            <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 dark:shadow-none shadow-lg">Σ</div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 hidden sm:block">
              Summarizer Pro
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setView('HOME')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'HOME' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'}`}
            >
              Analyze
            </button>
            <button 
              onClick={() => setView('HISTORY')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'HISTORY' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'}`}
            >
              History
            </button>
            <button 
              onClick={() => setView('SETTINGS')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'SETTINGS' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'}`}
            >
              Settings
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-dark-700 hidden sm:block"></div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700 transition-all shadow-inner"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4-9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-10">
        {view === 'HOME' && (
          <>
            <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
              <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">AI Thread Intelligence</h2>
              <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
                Paste your complete chat thread below to get instant metrics and multi-perspective summaries.
              </p>
            </div>

            {/* Input Section */}
            <section className="bg-white dark:bg-dark-900 rounded-3xl shadow-xl border border-slate-200 dark:border-dark-800 p-4 md:p-8 mb-8 transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your chat history here (e.g., User: Hello, Assistant: Hi there!)..."
                className="w-full h-48 md:h-72 p-5 rounded-2xl border border-slate-200 dark:border-dark-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all resize-none font-mono text-xs md:text-sm leading-relaxed bg-slate-50/50 dark:bg-dark-950/50 dark:text-slate-300"
              />
              
              <div className="mt-6 flex flex-col md:flex-row gap-5 items-center justify-between">
                <div className="flex items-center gap-6 text-xs md:text-sm font-medium text-slate-500 dark:text-dark-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    <span className={inputText.length > 0 ? "text-indigo-600 dark:text-indigo-400" : ""}>
                      {stats.wordCount.toLocaleString()} words
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className={inputText.length > 0 ? "text-amber-600 dark:text-amber-400" : ""}>
                      ~{stats.tokenCountEstimate.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={handleClear}
                    disabled={!inputText || isProcessing}
                    className="flex-1 md:flex-none px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSummarize}
                    disabled={!inputText || isProcessing}
                    className={`flex-1 md:flex-none px-10 py-3 text-sm font-bold text-white rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                      isProcessing 
                        ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-indigo-200 dark:shadow-none'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                      </>
                    ) : 'Summarize'}
                  </button>
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-2xl mb-8 flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Results Section */}
            {(results || isProcessing) && (
              <div className="space-y-8 pb-10">
                <div className="flex items-center gap-4 py-6">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-dark-800"></div>
                  <h3 className="text-xs font-black text-slate-400 dark:text-dark-500 uppercase tracking-widest">Analytics Dashboard</h3>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-dark-800"></div>
                </div>

                <StatsCards stats={stats} />
                
                {isProcessing && !results ? (
                   <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-4 animate-pulse">
                     <div className="w-12 h-12 bg-slate-200 dark:bg-dark-800 rounded-full"></div>
                     <p className="text-sm font-medium">Extracting insights...</p>
                   </div>
                ) : (
                  results && <SummaryDisplay result={results} />
                )}
              </div>
            )}
          </>
        )}

        {view === 'HISTORY' && (
          <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Past Summaries</h2>
                 <p className="text-slate-500 dark:text-dark-400 mt-1 italic">Locally stored for your privacy.</p>
               </div>
               <button 
                onClick={() => setView('HOME')}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                 </svg>
                 New Analysis
               </button>
            </div>
            
            <HistoryView 
              summaries={savedSummaries} 
              onSelect={handleSelectFromHistory} 
              onRefresh={fetchHistory}
            />
          </div>
        )}

        {view === 'SETTINGS' && <SettingsView />}
      </main>

      {/* Footer Branding */}
      <footer className="py-10 text-center text-slate-400 dark:text-dark-600 text-[10px] md:text-xs uppercase tracking-widest font-bold">
        <p>&copy; {new Date().getFullYear()} Summarizer Pro • Privacy-First Analysis</p>
      </footer>
    </div>
  );
};

export default App;