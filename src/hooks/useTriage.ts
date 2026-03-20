import { useState, useCallback, useEffect } from 'react';
import { TriageReport, ImageAsset, Location } from '../types';
import { processMedicalData } from '../services/geminiService';
import { optimizeImage } from '../utils/imageUtils';
import { DEMO_TEXT } from '../constants';

export function useTriage() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [voiceInput, setVoiceInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [report, setReport] = useState<TriageReport | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showDemoHint, setShowDemoHint] = useState(true);
  const [isHandingOver, setIsHandingOver] = useState(false);
  const [handoverComplete, setHandoverComplete] = useState(false);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

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
      // Parallel image optimization (Performance)
      const imageParts = await Promise.all(
        images.map(async (img) => {
          // Input Sanitization: Verify file type
          if (!img.file.type.startsWith('image/')) {
            throw new Error(`Invalid file type: ${img.file.name}`);
          }
          return {
            inlineData: {
              data: await optimizeImage(img.file),
              mimeType: "image/jpeg"
            }
          };
        })
      );

      setIsOptimizing(false);
      setIsProcessing(true);
      setLoadingStep(0);

      // Input Sanitization: Trim voice input
      const sanitizedVoice = voiceInput.trim();

      const result = await processMedicalData(imageParts, sanitizedVoice, location);
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
    setVoiceInput(DEMO_TEXT);
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
    setImages(prev => {
      prev.forEach(img => URL.revokeObjectURL(img.preview));
      return [];
    });
    setVoiceInput('');
    setHandoverComplete(false);
    setError(null);
  }, []);

  return {
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
  };
}
