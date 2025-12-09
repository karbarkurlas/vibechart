import React from 'react';
import { Activity, BarChart3 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg ring-1 ring-indigo-500/50">
              <Activity className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-50 tracking-tight text-glow">Akademik Vibe</h1>
              <p className="text-xs text-slate-400 font-medium">Software Realization Analysis Tool</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <BarChart3 className="w-3 h-3 mr-1.5" />
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};