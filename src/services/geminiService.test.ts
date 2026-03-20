import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMedicalData } from './geminiService';

// Mock the @google/genai library
vi.mock('@google/genai', () => {
  const generateContentMock = vi.fn();
  function GoogleGenAIMock() {
    return {
      models: {
        generateContent: generateContentMock,
      },
    };
  }

  return {
    GoogleGenAI: GoogleGenAIMock,
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY',
    },
  };
});

import { GoogleGenAI } from '@google/genai';

describe('geminiService', () => {
  const mockApiKey = 'test-api-key';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = mockApiKey;
  });

  it('should throw an error if API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(processMedicalData([], 'test')).rejects.toThrow('Gemini API Key is missing');
  });

  it('should process medical data and return a structured report', async () => {
    const mockReport = {
      patientName: 'John Doe',
      age: '45',
      criticalityScore: 8,
      primaryCondition: 'Chest Pain',
      allergies: ['None'],
      medications: ['Aspirin'],
      summary: 'Patient has chest pain.',
      recommendedActions: ['Call 911']
    };

    const mockResponse = {
      text: JSON.stringify(mockReport),
      candidates: [{
        groundingMetadata: {
          groundingChunks: [
            { web: { uri: 'https://example.com', title: 'Example' } }
          ]
        }
      }]
    };

    const mockMapsResponse = {
      candidates: [{
        groundingMetadata: {
          groundingChunks: [
            { maps: { title: 'General Hospital', uri: 'https://maps.google.com/hospital' } }
          ]
        }
      }]
    };

    const aiInstance = new GoogleGenAI({ apiKey: mockApiKey });
    const generateContentMock = aiInstance.models.generateContent as any;
    generateContentMock
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockMapsResponse);

    const result = await processMedicalData([], 'Chest pain', { latitude: 10, longitude: 20 });

    expect(result.patientName).toBe('John Doe');
    expect(result.criticalityScore).toBe(8);
    expect(result.groundingSources).toHaveLength(2);
    expect(result.nearbyHospitals).toHaveLength(1);
    expect(result.nearbyHospitals![0].name).toBe('General Hospital');
  });

  it('should handle JSON parsing errors', async () => {
    const mockResponse = {
      text: 'invalid json',
      candidates: []
    };

    const aiInstance = new GoogleGenAI({ apiKey: mockApiKey });
    (aiInstance.models.generateContent as any).mockResolvedValue(mockResponse);

    await expect(processMedicalData([], 'test')).rejects.toThrow('Failed to parse AI response');
  });

  it('should handle API errors gracefully', async () => {
    const aiInstance = new GoogleGenAI({ apiKey: mockApiKey });
    (aiInstance.models.generateContent as any).mockRejectedValue(new Error('API Error'));

    await expect(processMedicalData([], 'test')).rejects.toThrow('AI Analysis Failed');
  });
});
