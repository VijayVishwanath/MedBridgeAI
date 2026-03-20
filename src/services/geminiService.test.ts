import { processMedicalData } from './geminiService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('geminiService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls /api/triage with correct payload and returns report', async () => {
    const mockReport = {
      patientName: "John Doe",
      age: "45",
      criticalityScore: 8,
      primaryCondition: "Chest Pain",
      allergies: [],
      medications: [],
      summary: "Patient has chest pain.",
      recommendedActions: ["Give Aspirin"],
      groundingSources: []
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReport
    });

    const result = await processMedicalData([], "My chest hurts");
    
    expect(fetch).toHaveBeenCalledWith('/api/triage', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageParts: [], voiceText: "My chest hurts" })
    });
    expect(result).toEqual(mockReport);
  });

  it('throws an error if API response is not ok', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error"
    });

    await expect(processMedicalData([], "Help")).rejects.toThrow("API error: Internal Server Error");
  });
});
