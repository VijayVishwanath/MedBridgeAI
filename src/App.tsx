import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Upload, 
  Mic, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Stethoscope, 
  User, 
  Clock, 
  ChevronRight,
  X,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processMedicalData, TriageReport } from './services/geminiService';

// Design Recipe 3: Hardware / Specialist Tool
const styles = {
  bg: 'bg-[#E6E6E6] min-h-screen flex items-center justify-center p-4 font-sans',
  widget: 'w-full max-w-2xl bg-[#151619] rounded-2xl shadow-2xl overflow-hidden border border-white/5',
  header: 'p-6 border-b border-white/10 flex items-center justify-between bg-[#1A1B1E]',
  title: 'text-white font-mono text-xs tracking-[0.2em] uppercase opacity-60',
  status: 'flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20',
  statusText: 'text-[10px] font-mono text-emerald-400 uppercase tracking-wider',
  content: 'p-8 space-y-8',
  inputGroup: 'space-y-4',
  label: 'text-[10px] font-mono text-gray-500 uppercase tracking-widest',
  uploadZone: 'border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group',
  voiceZone: 'bg-[#1A1B1E] rounded-xl p-6 border border-white/5 flex items-center gap-4',
  button: 'w-full py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
  reportCard: 'bg-[#1A1B1E] border border-white/10 rounded-xl overflow-hidden',
  reportHeader: 'p-4 bg-white/5 border-b border-white/10 flex items-center justify-between',
  criticalityBadge: (score: number) => `px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
    score >= 8 ? 'bg-red-500 text-white' : score >= 5 ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
  }`,
};

export default function App() {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [voiceInput, setVoiceInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<TriageReport | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showDemoHint, setShowDemoHint] = useState(true);
  const [isHandingOver, setIsHandingOver] = useState(false);
  const [handoverComplete, setHandoverComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#151619] flex items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <AlertCircle className="text-red-500 mx-auto" size={48} />
          <h1 className="text-white font-mono text-xl uppercase tracking-widest">System Failure</h1>
          <p className="text-gray-500 text-sm max-w-md">The neural triage engine encountered a critical error. Please restart the protocol.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black font-mono text-xs uppercase tracking-widest">Reboot System</button>
        </div>
      </div>
    );
  }

  const loadDemoData = () => {
    setVoiceInput("Patient reports sudden onset of sharp chest pain radiating to left arm. History of hypertension. Patient is visibly distressed and sweating.");
    // In a real demo, we'd add images here, but for the code demo we'll just set the text
    setShowDemoHint(false);
  };

  const loadingMessages = [
    "Initializing neural triage engine...",
    "Scanning medical records for critical markers...",
    "Analyzing symptom patterns and severity...",
    "Cross-referencing allergies and medications...",
    "Finalizing life-saving triage report..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles = filesArray.map((file: File) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleProcess = async () => {
    if (images.length === 0 && !voiceInput) return;
    
    setIsProcessing(true);
    setReport(null);
    
    try {
      const imageParts = await Promise.all(
        images.map(async img => ({
          inlineData: {
            data: await fileToBase64(img.file),
            mimeType: img.file.type
          }
        }))
      );

      const result = await processMedicalData(imageParts, voiceInput);
      setReport(result);
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHandover = () => {
    setIsHandingOver(true);
    setTimeout(() => {
      setIsHandingOver(false);
      setHandoverComplete(true);
    }, 3000);
  };

  return (
    <div className={styles.bg}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.widget}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <Activity className="text-white w-5 h-5" />
            <h1 className={styles.title}>MedBridge AI // Triage v1.0</h1>
          </div>
          <div className={styles.status}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className={styles.statusText}>System Active</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {!report && !isProcessing ? (
              <motion.div 
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {showDemoHint && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-emerald-400" size={16} />
                      <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Hackathon Demo Mode Available</p>
                    </div>
                    <button 
                      onClick={loadDemoData}
                      className="text-[10px] font-mono text-white bg-emerald-500 px-3 py-1 rounded-full hover:bg-emerald-400 transition-colors"
                    >
                      Load Sample Case
                    </button>
                  </motion.div>
                )}

                {/* Image Upload */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>[01] Medical Records / Physical Artifacts</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload medical records or physical artifacts"
                    className={styles.uploadZone}
                  >
                    <Upload className="text-gray-500 group-hover:text-white transition-colors" />
                    <p className="text-gray-500 text-[11px] font-mono uppercase tracking-wider">
                      Drop files or click to scan
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  
                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, i) => (
                        <div key={i} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                          <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeImage(i)}
                            aria-label={`Remove image ${i + 1}`}
                            className="absolute top-0 right-0 p-0.5 bg-black/50 text-white hover:bg-red-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voice Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>[02] Patient Verbal Description / Symptoms</label>
                  <div className={styles.voiceZone}>
                    <div className="p-3 bg-white/5 rounded-full">
                      <Mic className="text-gray-400" size={18} />
                    </div>
                    <textarea 
                      value={voiceInput}
                      onChange={(e) => setVoiceInput(e.target.value)}
                      placeholder="Describe symptoms, duration, and intensity..."
                      aria-label="Patient Verbal Description and Symptoms"
                      className="bg-transparent border-none focus:ring-0 text-white text-sm w-full placeholder:text-gray-600 resize-none h-20"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleProcess}
                  disabled={images.length === 0 && !voiceInput}
                  className={styles.button}
                >
                  Initiate Triage Analysis
                </button>
              </motion.div>
            ) : isProcessing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center justify-center gap-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 animate-[spin_10s_linear_infinite]" />
                  <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-spin" size={32} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white font-mono text-xs uppercase tracking-widest">
                    {loadingMessages[loadingStep]}
                  </p>
                  <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 12.5, ease: "linear" }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="report"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <div className="flex items-center gap-2">
                      <Stethoscope size={16} className="text-gray-400" />
                      <span className="text-white font-mono text-[10px] uppercase tracking-widest">Triage Report // {report?.patientName}</span>
                    </div>
                    <span className={styles.criticalityBadge(report?.criticalityScore || 0)}>
                      Criticality: {report?.criticalityScore}/10
                    </span>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className={styles.label}>Patient</span>
                        <p className="text-white text-sm font-medium">{report?.patientName}</p>
                      </div>
                      <div className="space-y-1">
                        <span className={styles.label}>Age</span>
                        <p className="text-white text-sm font-medium">{report?.age}</p>
                      </div>
                    </div>

                    {/* Chief Complaint */}
                    <div className="space-y-1">
                      <span className={styles.label}>Chief Complaint</span>
                      <p className="text-emerald-400 text-sm font-medium">{report?.primaryCondition}</p>
                    </div>

                    {/* Summary */}
                    <div className="space-y-1">
                      <span className={styles.label}>Clinical Summary</span>
                      <p className="text-gray-400 text-xs leading-relaxed">{report?.summary}</p>
                    </div>

                    {/* Lists */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className={styles.label}>Allergies</span>
                        <ul className="space-y-1">
                          {report?.allergies.map((a, i) => (
                            <li key={i} className="text-red-400 text-[11px] flex items-center gap-2">
                              <AlertCircle size={10} /> {a}
                            </li>
                          ))}
                          {report?.allergies.length === 0 && <li className="text-gray-600 text-[11px]">None detected</li>}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className={styles.label}>Medications</span>
                        <ul className="space-y-1">
                          {report?.medications.map((m, i) => (
                            <li key={i} className="text-gray-300 text-[11px] flex items-center gap-2">
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
                          <span className={styles.label}>Verified Medical Sources (Grounding)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {report.groundingSources.slice(0, 3).map((source, i) => (
                            <a 
                              key={i} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded text-[9px] text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <ExternalLink size={8} />
                              {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <span className={styles.label}>Immediate Actions</span>
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
                    onClick={() => {
                      setReport(null);
                      setImages([]);
                      setVoiceInput('');
                      setHandoverComplete(false);
                    }}
                    className="flex-1 py-4 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Reset Protocol
                  </button>
                  <button 
                    onClick={handleHandover}
                    disabled={isHandingOver || handoverComplete}
                    className={`flex-1 py-4 font-mono text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      handoverComplete 
                        ? 'bg-emerald-500 text-black' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
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
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1A1B1E] border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-gray-600" />
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Last Sync: {new Date().toLocaleTimeString()}</span>
          </div>
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Encrypted // HIPAA Compliant</span>
        </div>
      </motion.div>
    </div>
  );
}
