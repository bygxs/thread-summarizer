import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";
import { getActiveInstruction } from "./dbService";

export const generateChatSummaries = async (chatText: string): Promise<SummaryResult> => {
  // Use a direct check for the key. In some environments, it might be on window or process.env
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY not found. If on Vercel, set it in Environment Variables and REDEPLOY. If local, check your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const activeInstruction = await getActiveInstruction();
  const protocolInstruction = activeInstruction?.content || "Summarize the following chat thread into an exhaustive narrative and technical report.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
      TASK:
      Examine the provided chat history with extreme scrutiny and provide a JSON response. 
      1. For the 'Narrative Handover': Produce a minimum of 600 words (up to 1000) of high-fidelity prose. No brevity allowed.
      2. For the 'Technical Manifest': Provide an exhaustive blueprint of the current state, logic, and future path.
      
      CHAT HISTORY:
      ${chatText}`,
      config: {
        systemInstruction: protocolInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: {
              type: Type.STRING,
              description: "An exhaustive, long-form narrative report (600-1000 words) strictly following the provided protocol."
            },
            technical: {
              type: Type.STRING,
              description: "A highly granular, high-density technical manifest following the provided protocol instructions."
            }
          },
          required: ["narrative", "technical"]
        }
      }
    });

    const text = response.text || "";
    const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(jsonStr) as SummaryResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate summary. Check your API key and quota.");
  }
};