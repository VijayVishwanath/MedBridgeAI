import React, { useEffect, Component } from 'react';
import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { IntakeSection } from './components/IntakeSection';
import { ProcessingSection } from './components/ProcessingSection';
import { ReportSection } from './components/ReportSection';
import { useTriage } from './hooks/useTriage';
import { LOADING_MESSAGES } from './constants';

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
  const {
    images,
    voiceInput,
    setVoiceInput,
    isProcessing,
    isOptimizing,
    report,
    loadingStep,
    setLoadingStep,
    showDemoHint,
    isHandingOver,
    handoverComplete,
    error,
    setError,
    handleImageUpload,
    removeImage,
    handleProcess,
    loadDemoData,
    handleHandover,
    handleReset
  } = useTriage();

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [isProcessing, setLoadingStep]);

  return (
    <ErrorBoundary>
      <div className="bg-[#E6E6E6] min-h-screen flex items-center justify-center p-4 font-sans">
        {/* Skip to Content Link (Accessibility) */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest"
        >
          Skip to Content
        </a>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-[#151619] rounded-2xl shadow-2xl overflow-hidden border border-white/5"
          role="main"
          id="main-content"
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
                  loadingMessages={LOADING_MESSAGES}
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
