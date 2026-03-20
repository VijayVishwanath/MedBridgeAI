import React from 'react';
import { 
  Stethoscope, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  ShieldCheck, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  Loader2,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { TriageReport } from '../services/geminiService';

interface ReportSectionProps {
  report: TriageReport | null;
  isHandingOver: boolean;
  handoverComplete: boolean;
  onReset: () => void;
  onHandover: () => void;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  report,
  isHandingOver,
  handoverComplete,
  onReset,
  onHandover
}) => {
  const criticalityBadge = (score: number) => `px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
    score >= 8 ? 'bg-red-500 text-white' : score >= 5 ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
  }`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
      role="region"
      aria-label="Triage Report Results"
    >
      <div className="bg-[#1A1B1E] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope size={16} className="text-gray-400" />
            <h2 className="text-white font-mono text-[10px] uppercase tracking-widest">Triage Report // {report?.patientName}</h2>
          </div>
          <span className={criticalityBadge(report?.criticalityScore || 0)} role="status">
            Criticality: {report?.criticalityScore}/10
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Patient</span>
              <p className="text-white text-sm font-medium">{report?.patientName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Age</span>
              <p className="text-white text-sm font-medium">{report?.age}</p>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Chief Complaint</span>
            <p className="text-emerald-400 text-sm font-medium">{report?.primaryCondition}</p>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Clinical Summary</span>
            <p className="text-gray-400 text-xs leading-relaxed">{report?.summary}</p>
          </div>

          {/* Lists */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Allergies</span>
              <ul className="space-y-1" role="list">
                {report?.allergies.map((a, i) => (
                  <li key={i} className="text-red-400 text-[11px] flex items-center gap-2" role="listitem">
                    <AlertCircle size={10} /> {a}
                  </li>
                ))}
                {report?.allergies.length === 0 && <li className="text-gray-600 text-[11px]">None detected</li>}
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Medications</span>
              <ul className="space-y-1" role="list">
                {report?.medications.map((m, i) => (
                  <li key={i} className="text-gray-300 text-[11px] flex items-center gap-2" role="listitem">
                    <FileText size={10} /> {m}
                  </li>
                ))}
                {report?.medications.length === 0 && <li className="text-gray-600 text-[11px]">None detected</li>}
              </ul>
            </div>
          </div>

          {/* Grounding Sources */}
          {report?.groundingSources && report.groundingSources.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Verified Medical Sources (Grounding)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.groundingSources.slice(0, 3).map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded text-[9px] text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    aria-label={`View source: ${source.title}`}
                  >
                    <ExternalLink size={8} />
                    {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Hospitals (Maps Grounding) */}
          {report?.nearbyHospitals && report.nearbyHospitals.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-blue-400" />
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Nearest ER Facilities (Maps Grounding)</span>
              </div>
              <div className="space-y-2">
                {report.nearbyHospitals.slice(0, 2).map((h, i) => (
                  <a 
                    key={i} 
                    href={h.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-blue-500/5 border border-blue-500/10 px-3 py-2 rounded-lg text-[10px] text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <span className="font-medium">{h.name}</span>
                    <ChevronRight size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Immediate Actions</span>
            <div className="space-y-2">
              {report?.recommendedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <ChevronRight size={14} className="text-white mt-0.5" />
                  <p className="text-white text-[11px] leading-tight">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onReset}
          className="flex-1 py-4 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
          aria-label="Reset triage protocol"
        >
          Reset Protocol
        </button>
        <button 
          onClick={onHandover}
          disabled={isHandingOver || handoverComplete}
          className={`flex-1 py-4 font-mono text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            handoverComplete 
              ? 'bg-emerald-500 text-black' 
              : 'bg-white text-black hover:bg-gray-200'
          }`}
          aria-label={handoverComplete ? "Handover verified" : "Initiate handover protocol"}
        >
          {isHandingOver ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              Syncing Handover...
            </>
          ) : handoverComplete ? (
            <>
              <CheckCircle2 size={14} />
              Handover Verified
            </>
          ) : (
            <>
              <Send size={14} />
              Initiate Handover
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
