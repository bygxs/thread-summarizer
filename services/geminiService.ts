import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";
import { getActiveInstruction } from "./dbService";

export const generateChatSummaries = async (chatText: string): Promise<SummaryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activeInstruction = await getActiveInstruction();
  const protocolInstruction = activeInstruction?.content || "Summarize the following chat thread into an exhaustive narrative and technical report.";

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
    SYSTEM INSTRUCTION:
    ${protocolInstruction}
    
    TASK:
    Examine the provided chat history with extreme scrutiny. 
    1. For the 'Narrative Handover': Produce a minimum of 600 words (up to 1000) of high-fidelity prose. No brevity allowed.
    2. For the 'Technical Manifest': Provide an exhaustive blueprint of the current state, logic, and future path.
    
    CHAT HISTORY:
    ${chatText}`,
    config: {
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
  try {
    const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(jsonStr) as SummaryResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {
      narrative: `Analysis failed to parse as JSON. Raw output below:\n\n${text}`,
      technical: "Parsing error. See narrative field for raw data."
    };
  }
};