import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TriageReport {
  patientName: string;
  age: string;
  criticalityScore: number; // 1-10
  primaryCondition: string;
  allergies: string[];
  medications: string[];
  summary: string;
  recommendedActions: string[];
}

export async function processMedicalData(
  imageParts: { inlineData: { data: string; mimeType: string } }[],
  voiceText: string
): Promise<TriageReport> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert ER Triage AI. 
    Analyze the provided images (medical records, handwritten notes, prescriptions) and the patient's verbal description of symptoms.
    
    Patient's verbal description: "${voiceText}"
    
    Extract and structure the following information:
    1. Patient Name (if available, else "Unknown")
    2. Age (if available, else "Unknown")
    3. Criticality Score (1-10, where 10 is immediate life-threatening)
    4. Primary Condition / Chief Complaint
    5. Allergies (list)
    6. Current Medications (list)
    7. Clinical Summary (concise, professional)
    8. Recommended Immediate Actions for ER staff
    
    Output MUST be valid JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...imageParts,
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patientName: { type: Type.STRING },
          age: { type: Type.STRING },
          criticalityScore: { type: Type.NUMBER },
          primaryCondition: { type: Type.STRING },
          allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
          medications: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["patientName", "age", "criticalityScore", "primaryCondition", "allergies", "medications", "summary", "recommendedActions"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
