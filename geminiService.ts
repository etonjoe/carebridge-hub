
import { GoogleGenAI } from "@google/genai";

// Initialize AI client lazily to prevent crashes during initial module load if key is missing
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please check your environment configuration.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const generateCarePlan = async (clientName: string, serviceType: string, healthNotes: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a structured healthcare care plan for a client in Nigeria named ${clientName}. 
      Service Type: ${serviceType}. 
      Health Context: ${healthNotes}. 
      Include consideration for local Nigerian nutritional preferences and family involvement. 
      Provide 3-5 key focus areas and a daily schedule. Format it as a professional summary.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return { text: response.text || "No response from AI.", sources: [] };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { text: "Failed to generate care plan. Please manually enter details.", sources: [] };
  }
};

export const verifyStaffBio = async (name: string, cadre: string, registrationNumber: string, bio: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a professional council registration check for the following professional in Nigeria.
      
      Name: ${name}
      Applied Role: ${cadre}
      Registration Number: ${registrationNumber}
      Bio/Credentials provided: ${bio}
      
      INSTRUCTION:
      Use Google Search to verify if this professional exists in the Medical and Dental Council of Nigeria (MDCN) database (if Doctor) or the Nursing and Midwifery Council of Nigeria (NMCN) database (if Nurse). 
      If they are a Carer/Cook, verify general professional standing if possible.
      
      State clearly:
      1. Verification Status (Confirmed / Unverified / Suspended)
      2. Match confidence for the registration number
      3. Any disciplinary records or public mentions found.
      
      Be concise and clinical in your summary.`,
      config: {
        temperature: 0.1,
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Council Resource',
      uri: chunk.web?.uri || '#'
    })) || [];

    return {
      text: response.text || "Verification summary unavailable.",
      sources
    };
  } catch (error) {
    console.error("AI Verification Error:", error);
    return { text: "Verification service currently unavailable. Please verify manually via council portals.", sources: [] };
  }
};

export const generateShiftSummary = async (staffName: string, clientName: string, tasks: any[]) => {
  const taskDetails = tasks.map(t => `- ${t.title}: ${t.status} (${t.comments || 'No specific notes'})`).join('\n');
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a professional clinical shift summary for a healthcare worker in Nigeria.
      Staff Name: ${staffName}
      Client Name: ${clientName}
      Tasks Completed/Notes:
      ${taskDetails}
      
      Write a cohesive 2-paragraph summary highlighting patient stability, key interventions, and any recommendations for the next shift. Use a professional tone suitable for a medical record.`,
      config: {
        temperature: 0.6,
      }
    });
    return response.text || "Summary generation failed.";
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "Manual entry required.";
  }
};
