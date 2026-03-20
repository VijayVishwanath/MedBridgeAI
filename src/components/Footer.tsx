import React from 'react';
import { Clock } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="p-4 bg-[#1A1B1E] border-t border-white/10 flex items-center justify-between" role="contentinfo">
    <div className="flex items-center gap-2">
      <Clock size={12} className="text-gray-600" />
      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
        Last Sync: {new Date().toLocaleTimeString()}
      </span>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Encrypted // HIPAA Compliant</span>
      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">v2.0.4-stable</span>
    </div>
  </footer>
);
