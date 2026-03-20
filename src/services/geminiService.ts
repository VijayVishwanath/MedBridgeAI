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
}

export async function processMedicalData(
  imageParts: { inlineData: { data: string; mimeType: string } }[],
  voiceText: string
): Promise<TriageReport> {
  const response = await fetch('/api/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageParts, voiceText })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return await response.json();
}
