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
  groundingSources: { uri: string; title: string }[];
  nearbyHospitals?: { name: string; uri: string }[];
}

export async function processMedicalData(
  imageParts: { inlineData: { data: string; mimeType: string } }[],
  voiceText: string,
  location?: { latitude: number; longitude: number }
): Promise<TriageReport> {
  const reportModel = "gemini-3-flash-preview";
  const mapsModel = "gemini-2.5-flash";
  
  const reportPrompt = `
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
    
    CRITICAL: 
    - Use Google Search to verify any medications or conditions found in the unstructured data.
    
    Output MUST be valid JSON.
  `;

  // Step 1: Generate the structured report
  const reportResponse = await ai.models.generateContent({
    model: reportModel,
    contents: {
      parts: [
        ...imageParts,
        { text: reportPrompt }
      ]
    },
    config: {
      tools: [{ googleSearch: {} }],
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

  const report = JSON.parse(reportResponse.text || "{}");
  
  // Extract grounding sources from report generation (Search)
  const reportGroundingChunks = reportResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources = reportGroundingChunks?.map(chunk => {
    if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
    return null;
  }).filter((s): s is { uri: string; title: string } => s !== null) || [];

  let nearbyHospitals: { name: string; uri: string }[] = [];

  // Step 2: If criticality is high and location is available, find nearby hospitals
  if (report.criticalityScore >= 5 && location) {
    try {
      const mapsResponse = await ai.models.generateContent({
        model: mapsModel,
        contents: "Find the nearest emergency rooms or hospitals for a patient with a critical condition.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude
              }
            }
          }
        }
      });

      const mapsGroundingChunks = mapsResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      nearbyHospitals = mapsGroundingChunks?.map(chunk => {
        if (chunk.maps) return { name: chunk.maps.title, uri: chunk.maps.uri };
        return null;
      }).filter((h): h is { name: string; uri: string } => h !== null) || [];

      // Add maps sources to grounding sources
      mapsGroundingChunks?.forEach(chunk => {
        if (chunk.maps) {
          sources.push({ uri: chunk.maps.uri, title: chunk.maps.title });
        }
      });
    } catch (error) {
      console.error("Maps Grounding Error:", error);
      // Non-fatal, continue without hospitals
    }
  }

  return { ...report, groundingSources: sources, nearbyHospitals };
}
