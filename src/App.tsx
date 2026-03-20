import React, { useState, useRef, useEffect, Component, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { processMedicalData, TriageReport } from './services/geminiService';
import { optimizeImage } from './utils/imageUtils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { IntakeSection } from './components/IntakeSection';
import { ProcessingSection } from './components/ProcessingSection';
import { ReportSection } from './components/ReportSection';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary Component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#151619] flex items-center justify-center p-8 text-center" role="alert">
          <div className="space-y-4">
            <AlertCircle className="text-red-500 mx-auto" size={48} aria-hidden="true" />
            <h1 className="text-white font-mono text-xl uppercase tracking-widest">System Failure</h1>
            <p className="text-gray-500 text-sm max-w-md">The neural triage engine encountered a critical error. Please restart the protocol.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Reboot system and restart protocol"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [voiceInput, setVoiceInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [report, setReport] = useState<TriageReport | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showDemoHint, setShowDemoHint] = useState(true);
  const [isHandingOver, setIsHandingOver] = useState(false);
  const [handoverComplete, setHandoverComplete] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const loadingMessages = [
    "Initializing neural triage engine...",
    "Scanning medical records for critical markers...",
    "Reconciling verbal distress with history...",
    "Cross-referencing allergies and medications...",
    "Verifying clinical data via Grounding...",
    "Finalizing triage criticality score...",
    "Generating handover protocol..."
  ];

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [isProcessing, loadingMessages.length]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      }, (err) => {
        console.warn("Geolocation access denied or failed:", err.message);
      });
    }
  }, []);

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const handleProcess = useCallback(async () => {
    setIsOptimizing(true);
    setError(null);
    
    try {
      // Optimize images before sending (Efficiency)
      const imageParts = await Promise.all(
        images.map(async (img) => ({
          inlineData: {
            data: await optimizeImage(img.file),
            mimeType: "image/jpeg"
          }
        }))
      );

      setIsOptimizing(false);
      setIsProcessing(true);
      setLoadingStep(0);

      const result = await processMedicalData(imageParts, voiceInput, location);
      setReport(result);
    } catch (err: any) {
      console.error("Triage Error:", err);
      const errorMessage = err?.message || "Unknown error occurred during analysis.";
      setError(`Triage Analysis Failed: ${errorMessage}`);
      setIsOptimizing(false);
    } finally {
      setIsProcessing(false);
    }
  }, [images, voiceInput, location]);

  const loadDemoData = useCallback(() => {
    setVoiceInput("Patient reports sudden onset of sharp chest pain radiating to left arm. History of hypertension. Patient is visibly distressed and sweating.");
    setShowDemoHint(false);
  }, []);

  const handleHandover = useCallback(() => {
    setIsHandingOver(true);
    setTimeout(() => {
      setIsHandingOver(false);
      setHandoverComplete(true);
    }, 3000);
  }, []);

  const handleReset = useCallback(() => {
    setReport(null);
    setImages([]);
    setVoiceInput('');
    setHandoverComplete(false);
    setError(null);
  }, []);

  return (
    <ErrorBoundary>
      <div className="bg-[#E6E6E6] min-h-screen flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-[#151619] rounded-2xl shadow-2xl overflow-hidden border border-white/5"
          role="main"
          aria-labelledby="app-title"
        >
          <Header />
          
          <div className="p-8 min-h-[500px]">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="text-red-400" size={16} aria-hidden="true" />
                <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                  aria-label="Dismiss error"
                >
                  <span className="text-[10px] font-mono">Dismiss</span>
                </button>
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              {!report && !isProcessing ? (
                <IntakeSection 
                  key="intake"
                  images={images}
                  voiceInput={voiceInput}
                  setVoiceInput={setVoiceInput}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                  onProcess={handleProcess}
                  onLoadDemo={loadDemoData}
                  showDemoHint={showDemoHint}
                  isOptimizing={isOptimizing}
                />
              ) : isProcessing ? (
                <ProcessingSection 
                  key="processing"
                  loadingStep={loadingStep}
                  loadingMessages={loadingMessages}
                />
              ) : (
                <ReportSection 
                  key="report"
                  report={report}
                  isHandingOver={isHandingOver}
                  handoverComplete={handoverComplete}
                  onReset={handleReset}
                  onHandover={handleHandover}
                />
              )}
            </AnimatePresence>
          </div>

          <Footer />
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}
