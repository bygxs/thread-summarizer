import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";
import { getActiveInstruction } from "./dbService";

export const generateChatSummaries = async (chatText: string): Promise<SummaryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activeInstruction = await getActiveInstruction();
  const protocolInstruction = activeInstruction?.content || "Summarize the following chat thread into a narrative and technical report.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
    ${protocolInstruction}
    
    Analyze the following chat history and strictly follow the protocol above:
    
    Chat History:
    ${chatText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: {
            type: Type.STRING,
            description: "A narrative report following the provided protocol instructions."
          },
          technical: {
            type: Type.STRING,
            description: "A technical report following the provided protocol instructions."
          }
        },
        required: ["narrative", "technical"]
      }
    }
  });

  const text = response.text || "";
  try {
    return JSON.parse(text) as SummaryResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {
      narrative: "Error parsing narrative handover. The AI response did not match the expected JSON format.",
      technical: "Error parsing technical manifest. The AI response did not match the expected JSON format."
    };
  }
};