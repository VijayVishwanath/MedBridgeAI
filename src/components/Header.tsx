import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => (
  <header className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1A1B1E]" role="banner">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/5 rounded-lg">
        <Activity className="text-white" size={20} />
      </div>
      <div>
        <h1 className="text-white font-mono text-xs tracking-[0.2em] uppercase opacity-60">MedBridge AI</h1>
        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Universal Triage Engine v2.0</p>
      </div>
    </div>
    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20" aria-label="System Status: Online">
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Neural Engine Active</span>
    </div>
  </header>
);
