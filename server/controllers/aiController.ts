
import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";

// Standardized initialization of the Google GenAI client for server-side
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const aiController = {
  generatePlan: async (req: Request, res: Response) => {
    const { clientName, serviceType, healthNotes } = req.body;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Generate a professional healthcare care plan for:
        Client: ${clientName}
        Service: ${serviceType}
        Notes: ${healthNotes}
        Focus on Nigerian clinical standards and nutritional preferences.`,
        config: { temperature: 0.7 }
      });

      res.json({ carePlan: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate AI care plan" });
    }
  },

  verifyStaff: async (req: Request, res: Response) => {
    const { name, cadre, credentials } = req.body;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Review credentials for ${name} (${cadre}): ${credentials}. 
        Check MDCN/NMCN validity markers and Nigerian clinical experience.`,
        config: { temperature: 0.2 }
      });

      res.json({ verificationSummary: response.text });
    } catch (error) {
      res.status(500).json({ error: "AI verification service unavailable" });
    }
  }
};
