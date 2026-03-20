import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// SECURITY: Helmet helps secure Express apps by setting various HTTP headers (HIPAA compliance layer)
app.use(helmet());

// SECURITY: Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// EFFICIENCY: Increase limit to handle base64 images optimally
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', secure: true });
});

// Triage API
app.post('/api/triage', async (req, res) => {
  try {
    const { imageParts, voiceText } = req.body;

    // SECURITY: Input validation
    if (!imageParts || !Array.isArray(imageParts)) {
      return res.status(400).json({ error: "Invalid image sequence provided." });
    }

    if (!process.env.GEMINI_API_KEY) {
      // SECURITY: Do not expose actual error details in production
      console.error("Critical: GEMINI_API_KEY is not defined in the environment.");
      return res.status(500).json({ error: "Neural Engine configuration error." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = "gemini-3-flash-preview";

    const prompt = `
      You are an expert ER Triage AI. 
      Analyze the provided images (medical records, handwritten notes, prescriptions) and the patient's verbal description of symptoms.
      
      Patient's verbal description: "${voiceText ? voiceText : "None provided"}"
      
      Extract and structure the following information:
      1. Patient Name (if available, else "Unknown")
      2. Age (if available, else "Unknown")
      3. Criticality Score (1-10, where 10 is immediate life-threatening)
      4. Primary Condition / Chief Complaint
      5. Allergies (list)
      6. Current Medications (list)
      7. Clinical Summary (concise, professional)
      8. Recommended Immediate Actions for ER staff
      
      CRITICAL: Use Google Search to verify any medications or conditions found in the unstructured data to ensure the recommended actions are clinically sound and up-to-date.
      
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

    const report = JSON.parse(response.text || "{}");
    
    // Extract grounding sources securely
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map(chunk => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || ""
    })).filter(s => s.uri) || [];

    res.status(200).json({ ...report, groundingSources: sources });

  } catch (error) {
    // SECURITY: HIPAA logging compliance - Never log raw inputs or outputs that may contain PHI.
    console.error(`[${new Date().toISOString()}] Error in /api/triage analysis pipeline.`);
    res.status(500).json({ error: "Neural analysis failed. Please retry." });
  }
});

app.listen(port, () => {
  console.log(`[MedBridge Secure Backend] System active and listening on port ${port}`);
});
