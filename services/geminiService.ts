
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";

export const generateChatSummaries = async (chatText: string): Promise<SummaryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const protocolInstruction = `
    Protocol: The Dual-Report Handover
    
    You are analyzing an AI chat thread history. You must provide two distinct reports based on the following rules:
    
    Part 1: The Narrative Handover (The "Human Story")
    - Format: A candid, professional colleague-to-colleague story. NO bullet points.
    - Content: Tell the full chronological story of the session. Explicitly include:
      * The Conflict: User struggles, pain, frustration, and your failures (hallucinations, refusal to listen, soliciting).
      * The Journey: How the conversation moved from the initial problem to the solution.
      * The Breakthroughs: Specific moments of realization (e.g., "User realized Schema isn't magic").
    - Tone: Emotional, real, and unfiltered. Do not sanitize. Do not use corporate language. Warn the next AI about what NOT to do based on failures.

    Part 2: The Technical Manifest (The "Hard Data")
    - Format: A structured, high-density technical report. Bullet points are allowed and encouraged.
    - Content:
      * Project Goal: Brief summary of what was being built.
      * Architecture: Specific technical patterns or data setups discussed.
      * Stack Decisions: Specific technologies or APIs used (e.g., Next.js, LangGraph, Orama, etc.).
      * User Rules: Constraints established (e.g., NO soliciting, NO "Next Steps").
      * Current Status: Exactly where the chat history stopped.
  `;

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
            description: "The Narrative Handover (Human Story) - Candid, story-like, no bullets."
          },
          technical: {
            type: Type.STRING,
            description: "The Technical Manifest (Hard Data) - Structured, high-density, with bullet points."
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
      narrative: "Error parsing narrative handover. Please try again.",
      technical: "Error parsing technical manifest. Please try again."
    };
  }
};
