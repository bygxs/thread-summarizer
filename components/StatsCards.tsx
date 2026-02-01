import React from 'react';
import { Stats } from '../types';

interface StatsCardsProps {
  stats: Stats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 hover:shadow-md transition-all">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Word Count</div>
        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.wordCount.toLocaleString()}</div>
      </div>
      <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 hover:shadow-md transition-all">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Est. Token Count</div>
        <div className="text-3xl font-bold text-amber-500 dark:text-amber-400">{stats.tokenCountEstimate.toLocaleString()}</div>
      </div>
      <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 hover:shadow-md transition-all">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Characters</div>
        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.charCount.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default StatsCards;