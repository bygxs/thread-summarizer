import { SavedSummary, AIInstruction } from "../types";

const DB_NAME = "SummarizerProDB";
const SUMMARIES_STORE = "summaries";
const INSTRUCTIONS_STORE = "instructions";
const DB_VERSION = 3; // Bumped to 3 to force update of default instructions

const DEFAULT_INSTRUCTION = `Protocol: The Dual-Report Handover (V3 - Comprehensive)

Part 1: The Narrative Handover (The "Human Story")
- Goal: Create a high-fidelity, long-form chronological account (approx. 400-600 words).
- Format: A candid, professional story. STRICTLY NO BULLET POINTS in this section.
- Narrative Beats:
    1. The Initial Spark: What was the user trying to achieve at the start? What was the "vibe" of the request?
    2. The Logic Blockers: What specific errors, misunderstandings, or technical hurdles were encountered? Be exhaustive about what went wrong.
    3. The Pivot Points: When and why did the direction change? Capture the moments of frustration or realization.
    4. The Breakthroughs: Detailed explanation of how the problems were solved.
    5. The Current Vibe: What is the emotional and technical state of the project right now?
    6. Warning to Successor: What traps, circular logic loops, or "ghosts in the machine" should the next AI agent be wary of?

Part 2: The Technical Manifest (The "Hard Data")
- Goal: A granular, high-density blueprint for immediate resumption.
- Format: Structured sections with precise detail.
- Requirements:
    1. Project Architecture: Specific file structures, patterns, and state management used.
    2. Tech Stack: All libraries, versions, and API nuances mentioned.
    3. Logic Flow: Describe complex algorithms or specific functional chains implemented.
    4. State of Play: A definitive list of what is 100% working, what is buggy, and what is missing.
    5. Immediate Backlog: The next 5 concrete, atomic steps required to progress.
    6. Constraints: Any hardware, environment, or API limits identified during the session.`;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(SUMMARIES_STORE)) {
        db.createObjectStore(SUMMARIES_STORE, { keyPath: "id", autoIncrement: true });
      }
      
      // If store exists but we bumped version, we might want to refresh default instruction
      if (!db.objectStoreNames.contains(INSTRUCTIONS_STORE)) {
        const instructionStore = db.createObjectStore(INSTRUCTIONS_STORE, { keyPath: "id", autoIncrement: true });
        instructionStore.add({
          name: "Dual-Report Handover (v3)",
          content: DEFAULT_INSTRUCTION,
          isActive: true,
          isDefault: true
        });
      } else {
        // Update the default instruction if it already exists during a version bump
        const transaction = request.transaction!;
        const store = transaction.objectStore(INSTRUCTIONS_STORE);
        const getAllReq = store.getAll();
        
        getAllReq.onsuccess = () => {
          const instructions = getAllReq.result as AIInstruction[];
          const defaultInst = instructions.find(i => i.isDefault);
          if (defaultInst) {
            defaultInst.content = DEFAULT_INSTRUCTION;
            defaultInst.name = "Dual-Report Handover (v3)";
            store.put(defaultInst);
          }
        };
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Summary Methods
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

// Instruction Methods
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
  // If none active, find default
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