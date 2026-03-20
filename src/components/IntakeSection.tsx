import React, { useRef } from 'react';
import { Upload, Mic, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface IntakeSectionProps {
  images: { file: File; preview: string }[];
  voiceInput: string;
  setVoiceInput: (val: string) => void;
  onImageUpload: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onProcess: () => void;
  onLoadDemo: () => void;
  showDemoHint: boolean;
  isOptimizing: boolean;
}

export const IntakeSection: React.FC<IntakeSectionProps> = React.memo(({
  images,
  voiceInput,
  setVoiceInput,
  onImageUpload,
  onRemoveImage,
  onProcess,
  onLoadDemo,
  showDemoHint,
  isOptimizing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      role="region"
      aria-label="Patient Triage Intake"
    >
      {showDemoHint && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-emerald-400" size={16} aria-hidden="true" />
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Hackathon Demo Mode Available</p>
          </div>
          <button 
            onClick={onLoadDemo}
            className="text-[10px] font-mono text-white bg-emerald-500 px-3 py-1 rounded-full hover:bg-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="Load Sample Case Data"
          >
            Load Sample Case
          </button>
        </motion.div>
      )}

      {/* Image Upload */}
      <div className="space-y-4">
        <label id="artifacts-label" className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">[01] Medical Records / Physical Artifacts</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleKeyDown}
          className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group focus:border-emerald-500 focus:outline-none"
          role="button"
          tabIndex={0}
          aria-labelledby="artifacts-label"
          aria-describedby="artifacts-desc"
        >
          <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform" aria-hidden="true">
            <Upload className="text-gray-400" size={24} />
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">Drop artifacts here or click to scan</p>
            <p id="artifacts-desc" className="text-gray-500 text-xs mt-1">Supports JPG, PNG, PDF (Max 10MB)</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => onImageUpload(e.target.files)}
            multiple 
            accept="image/*"
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4" role="list" aria-label="Uploaded images">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group" role="listitem">
                <img src={img.preview} alt={`Medical record ${i + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveImage(i); }}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-white"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice/Text Input */}
      <div className="space-y-4">
        <label id="symptoms-label" className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">[02] Patient Verbal Description / Symptoms</label>
        <div className="bg-[#1A1B1E] rounded-xl p-6 border border-white/5 flex items-center gap-4 focus-within:border-emerald-500 transition-colors">
          <div className="p-3 bg-white/5 rounded-full" aria-hidden="true">
            <Mic className="text-gray-400" size={18} />
          </div>
          <textarea 
            value={voiceInput}
            onChange={(e) => setVoiceInput(e.target.value)}
            placeholder="Describe symptoms, duration, and intensity..."
            className="bg-transparent border-none focus:ring-0 text-white text-sm w-full placeholder:text-gray-600 resize-none h-20"
            aria-labelledby="symptoms-label"
          />
        </div>
      </div>

      <button 
        onClick={onProcess}
        disabled={(images.length === 0 && !voiceInput) || isOptimizing}
        className="w-full py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-white focus:outline-none"
        aria-label={isOptimizing ? "Optimizing images..." : "Initiate neural triage analysis"}
      >
        {isOptimizing ? "Optimizing Assets..." : "Initiate Triage Analysis"}
      </button>
    </motion.div>
  );
});

IntakeSection.displayName = 'IntakeSection';
