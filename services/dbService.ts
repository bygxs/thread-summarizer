import { SavedSummary, AIInstruction } from "../types";

const DB_NAME = "SummarizerProDB";
const SUMMARIES_STORE = "summaries";
const INSTRUCTIONS_STORE = "instructions";
const DB_VERSION = 4; // Bumped to 4 to force update of default instructions

const DEFAULT_INSTRUCTION = `Protocol: The Deep-Dive Handover (V4 - Exhaustive)

Part 1: The Narrative Handover (The "Comprehensive Story")
- Goal: Create a high-fidelity, long-form chronological account (600-1000 words).
- Format: A candid, professional, and extremely detailed narrative. 
- Constraint: NO BULLET POINTS. Use well-structured paragraphs.
- Narrative Beats (Must be addressed in depth):
    1. The Project Genesis: Exhaustively describe the user's initial prompt, the underlying intent, and the "vibe" or urgency of the request.
    2. Detailed Logic Impediments: Catalog every single error, syntax error, logic blocker, or architectural misunderstanding. Don't just list them—explain WHY they happened and the specific friction they caused.
    3. The Evolutionary Path: Describe the specific pivots. When did the user get frustrated? When did the AI fail to understand? Document the "ping-pong" of the conversation.
    4. Technical Breakthroughs: Provide a step-by-step prose explanation of the solutions implemented.
    5. The Current Technical Landscape: Describe the project's health, stability, and "feel" at this exact moment.
    6. Successor's Field Guide: An exhaustive warning for the next AI. Describe the user's specific preferences, past triggers, and the "fragile" parts of the code that need careful handling.

Part 2: The Technical Manifest (The "Granular Blueprint")
- Goal: A high-density, low-latency technical reference.
- Requirements:
    1. Exhaustive Architecture: Map out the entire component tree, state management patterns, and service interactions.
    2. Versioned Tech Stack: List every library and the specific reasons for their inclusion.
    3. Logic Chains: Deep dive into the most complex functions (e.g., the summarizing logic, the DB versioning logic).
    4. Operational Audit: A line-by-line list of what is fully functional, partially functional (buggy), and strictly missing.
    5. Immediate Strategic Backlog: The next 10 atomic, specific tasks to be performed.
    6. Environmental Context: Any browser limits, API quotas, or performance bottlenecks identified.`;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(SUMMARIES_STORE)) {
        db.createObjectStore(SUMMARIES_STORE, { keyPath: "id", autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains(INSTRUCTIONS_STORE)) {
        const instructionStore = db.createObjectStore(INSTRUCTIONS_STORE, { keyPath: "id", autoIncrement: true });
        instructionStore.add({
          name: "Deep-Dive Handover (v4)",
          content: DEFAULT_INSTRUCTION,
          isActive: true,
          isDefault: true
        });
      } else {
        const transaction = request.transaction!;
        const store = transaction.objectStore(INSTRUCTIONS_STORE);
        const getAllReq = store.getAll();
        
        getAllReq.onsuccess = () => {
          const instructions = getAllReq.result as AIInstruction[];
          const defaultInst = instructions.find(i => i.isDefault);
          if (defaultInst) {
            defaultInst.content = DEFAULT_INSTRUCTION;
            defaultInst.name = "Deep-Dive Handover (v4)";
            store.put(defaultInst);
          }
        };
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveSummary = async (summary: Omit<SavedSummary, "id">): Promise<number> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SUMMARIES_STORE, "readwrite");
    const store = transaction.objectStore(SUMMARIES_STORE);
    const request = store.add(summary);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const getAllSummaries = async (): Promise<SavedSummary[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SUMMARIES_STORE, "readonly");
    const store = transaction.objectStore(SUMMARIES_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result as SavedSummary[];
      resolve(results.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteSummary = async (id: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SUMMARIES_STORE, "readwrite");
    const store = transaction.objectStore(SUMMARIES_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getInstructions = async (): Promise<AIInstruction[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(INSTRUCTIONS_STORE, "readonly");
    const store = transaction.objectStore(INSTRUCTIONS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as AIInstruction[]);
    request.onerror = () => reject(request.error);
  });
};

export const getActiveInstruction = async (): Promise<AIInstruction> => {
  const all = await getInstructions();
  const active = all.find(i => i.isActive);
  if (active) return active;
  const def = all.find(i => i.isDefault);
  return def || all[0];
};

export const saveInstruction = async (instruction: Omit<AIInstruction, "id">): Promise<number> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(INSTRUCTIONS_STORE, "readwrite");
    const store = transaction.objectStore(INSTRUCTIONS_STORE);
    const request = store.add(instruction);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const updateInstruction = async (instruction: AIInstruction): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(INSTRUCTIONS_STORE, "readwrite");
    const store = transaction.objectStore(INSTRUCTIONS_STORE);
    const request = store.put(instruction);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const setActiveInstruction = async (id: number): Promise<void> => {
  const all = await getInstructions();
  const db = await openDB();
  const transaction = db.transaction(INSTRUCTIONS_STORE, "readwrite");
  const store = transaction.objectStore(INSTRUCTIONS_STORE);
  
  for (const item of all) {
    item.isActive = item.id === id;
    store.put(item);
  }
};

export const deleteInstruction = async (id: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(INSTRUCTIONS_STORE, "readwrite");
    const store = transaction.objectStore(INSTRUCTIONS_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};