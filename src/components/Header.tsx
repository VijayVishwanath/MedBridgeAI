import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Header component for MedBridge AI.
 * Displays the application title, version, and current system status.
 */
export const Header: React.FC = React.memo(() => (
  <header 
    className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1A1B1E]" 
    role="banner"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/5 rounded-lg" aria-hidden="true">
        <Activity className="text-white" size={20} />
      </div>
      <div>
        <h1 className="text-white font-mono text-xs tracking-[0.2em] uppercase opacity-60">MedBridge AI</h1>
        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Universal Triage Engine v2.0.4-stable</p>
      </div>
    </div>
    <div 
      className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20" 
      role="status"
      aria-label="System Status: Neural Engine Active"
    >
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Neural Engine Active</span>
    </div>
  </header>
));

Header.displayName = 'Header';
