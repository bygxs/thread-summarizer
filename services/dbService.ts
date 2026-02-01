import { SavedSummary, AIInstruction } from "../types";

const DB_NAME = "SummarizerProDB";
const SUMMARIES_STORE = "summaries";
const INSTRUCTIONS_STORE = "instructions";
const DB_VERSION = 2; // Bumped version for new store

const DEFAULT_INSTRUCTION = `Protocol: The Dual-Report Handover

Part 1: The Narrative Handover (The "Human Story")
- Format: A candid, professional colleague-to-colleague story. NO bullet points.
- Content: Tell the full chronological story of the session. Explicitly include: The Conflict, The Journey, and The Breakthroughs. 
- Tone: Emotional, real, and unfiltered. Warn the next AI about failures.

Part 2: The Technical Manifest (The "Hard Data")
- Format: A structured, high-density technical report (Bullet points allowed).
- Content: Project Goal, Architecture, Stack Decisions, User Rules, Current Status.`;

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
        // Add initial default instruction
        instructionStore.add({
          name: "Dual-Report Handover (Default)",
          content: DEFAULT_INSTRUCTION,
          isActive: true,
          isDefault: true
        });
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
  return all.find(i => i.isActive) || all[0];
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