import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";
import { getActiveInstruction } from "./dbService";

export const generateChatSummaries = async (chatText: string): Promise<SummaryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activeInstruction = await getActiveInstruction();
  const protocolInstruction = activeInstruction?.content || "Summarize the following chat thread into a narrative and technical report.";

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
    SYSTEM INSTRUCTION:
    ${protocolInstruction}
    
    TASK:
    Analyze the following chat history exhaustively. Provide high-fidelity, long-form responses for both the Narrative Handover and the Technical Manifest. Do not abbreviate or omit key logic pivots.
    
    CHAT HISTORY FOR ANALYSIS:
    ${chatText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: {
            type: Type.STRING,
            description: "An extensive, long-form narrative report (approx 400-600 words) following the provided protocol instructions."
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
    // Sometimes the model might include markdown code blocks in the response text
    const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(jsonStr) as SummaryResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {
      narrative: `Error parsing analysis. Raw output: ${text.substring(0, 500)}...`,
      technical: "Error parsing technical manifest. The AI response did not match the expected JSON format."
    };
  }
};