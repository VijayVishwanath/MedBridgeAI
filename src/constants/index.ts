export const LOADING_MESSAGES = [
  "Initializing neural triage engine...",
  "Scanning medical records for critical markers...",
  "Reconciling verbal distress with history...",
  "Cross-referencing allergies and medications...",
  "Verifying clinical data via Grounding...",
  "Finalizing triage criticality score...",
  "Generating handover protocol..."
];

export const DEMO_TEXT = "Patient reports sudden onset of sharp chest pain radiating to left arm. History of hypertension. Patient is visibly distressed and sweating.";

export const MODELS = {
  REPORT: "gemini-3-flash-preview",
  MAPS: "gemini-2.5-flash"
};

export const MAX_IMAGE_DIMENSION = 1024;
export const IMAGE_QUALITY = 0.8;
