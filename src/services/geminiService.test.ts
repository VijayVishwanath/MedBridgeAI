import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMedicalData } from './geminiService';
import { GoogleGenAI } from '@google/genai';

// Mock GoogleGenAI
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function() {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              patientName: "Test Patient",
              age: "30",
              criticalityScore: 8,
              primaryCondition: "Chest Pain",
              allergies: ["Penicillin"],
              medications: ["Aspirin"],
              summary: "Patient presents with acute chest pain.",
              recommendedActions: ["ECG", "Troponin"]
            }),
            candidates: [{
              groundingMetadata: {
                groundingChunks: [
                  { web: { uri: "https://example.com", title: "Medical Source" } },
                  { maps: { uri: "https://maps.example.com", title: "Hospital" } }
                ]
              }
            }]
          })
        }
      };
    }),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY'
    }
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('should process medical data and return a report', async () => {
    const report = await processMedicalData([], "Test voice input");
    
    expect(report.patientName).toBe("Test Patient");
    expect(report.criticalityScore).toBe(8);
    expect(report.groundingSources).toHaveLength(1);
    expect(report.groundingSources[0].title).toBe("Medical Source");
  });

  it('should handle missing API key', async () => {
    process.env.GEMINI_API_KEY = '';
    await expect(processMedicalData([], "Test")).rejects.toThrow("Gemini API Key is missing");
  });
});
