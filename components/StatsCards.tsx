import React from 'react';
import { Stats } from '../types';

interface StatsCardsProps {
  stats: Stats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-dark-900 p-5 rounded-3xl border border-slate-200 dark:border-dark-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Metrics Dashboard</h3>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Words</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {stats.wordCount.toLocaleString()}
              </div>
            </div>
            <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">PRO</div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-dark-800"></div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Tokens</div>
            <div className="text-2xl font-black text-amber-500 tabular-nums">
              {stats.tokenCountEstimate.toLocaleString()}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-dark-800"></div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Characters</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.charCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-lg shadow-indigo-500/20">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">System Status</h4>
        <p className="text-xs font-bold leading-relaxed">
          The engine is currently using <span className="underline underline-offset-4 decoration-white/30">Gemini 3 Flash</span> for ultra-low latency thread analysis.
        </p>
      </div>
    </div>
  );
};

export default StatsCards;