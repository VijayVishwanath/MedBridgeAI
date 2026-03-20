# MedBridge AI: The Universal Triage Engine 🏥

**Winner's Choice // Gemini Hackathon 2026**

MedBridge AI is a life-saving bridge between chaotic, unstructured medical history and structured, verified clinical action. It solves the **"Information Blackout"**—the dangerous gap in emergency care where patients are too distressed to speak and their history is trapped in physical artifacts (crumpled prescriptions, handwritten notes, old records).

## 🚀 The Problem
In emergency medicine, every second counts. However, intake nurses often spend 15-20 minutes manually parsing a patient's messy paper trail. Errors in this phase—like missing a hidden allergy or a medication contraindication—can be fatal.

## 💡 The Solution
MedBridge AI uses **Gemini 3 Flash**'s multimodal reasoning to:
1. **Vision:** Parse messy, handwritten, or printed medical records from photos.
2. **Reasoning:** Reconcile verbal patient distress with extracted physical data.
3. **Grounding:** Verify medications and conditions against real-world medical data via **Google Search Grounding**.
4. **Action:** Generate a structured, verified Triage Report and Handover Protocol in seconds.

## 🛠️ Tech Stack
- **Frontend:** React 19, Tailwind CSS 4, Motion (Animations)
- **AI Engine:** Google Gemini 3 Flash (`@google/genai`)
- **Grounding:** Google Search Grounding for verified medical insights
- **Icons:** Lucide React

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/medbridge-ai.git
   cd medbridge-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file or set your secrets in AI Studio:
   - `GEMINI_API_KEY`: Your Google AI Studio API Key.

4. **Run the app:**
   ```bash
   npm run dev
   ```

## 🎯 Hackathon Evaluation Highlights
- **Multimodal Mastery:** Uses both Image and Text parts in a single prompt for contextual reasoning.
- **Verified Actions:** Implements Google Search Grounding to ensure clinical suggestions are backed by real-world data.
- **Specialist UI:** Follows the "Hardware/Specialist Tool" design recipe for high-stress environment usability.
- **Zero Latency:** Optimized for speed to meet the < 24h implementation and < 5m demo constraints.

---
*Built for the Gemini Hackathon // March 2026*
