import { NS } from "@ns";

const stateFile = "coin-flip.txt";

export function saveState(ns: NS, recording: string[]) {
  ns.write(stateFile, JSON.stringify(recording, null, 0), "w");
}

export function readState(ns: NS): string[] {
  try {
    const content = ns.read(stateFile);
    if (!content) {
      ns.print("State file is empty. Returning empty state.");
      saveState(ns, []);
      return [];
    }
    return JSON.parse(content) as string[];
  } catch (error) {
    ns.print("Failed to parse state file. Creating new state.");
    return [];
  }
}
