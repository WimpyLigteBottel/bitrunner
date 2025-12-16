import { NS } from "@ns";
import { StockMarketSimplified } from "./Models";

export let stats: Record<string, StockMarketSimplified[]>;

const stateFile = "stockStats.txt";

export function saveState(
  ns: NS,
  stats: Record<string, StockMarketSimplified[]>
) {
  ns.write(stateFile, JSON.stringify(stats, null, 0), "w");
}

export function readState(ns: NS): Record<string, StockMarketSimplified[]> {
  try {
    const content = ns.read(stateFile);
    if (!content) {
      ns.print("State file is empty. Returning empty state.");
      return {};
    }
    const localStats = JSON.parse(content) as Record<
      string,
      StockMarketSimplified[]
    >;
    return localStats || {};
  } catch (error) {
    ns.print("Failed to parse state file. Creating new state.");
    return {};
  }
}

/**
 * Setup the state file
 * @param ns
 */
export function initState(ns: NS): Record<string, StockMarketSimplified[]> {
  const loadedStats = readState(ns);
  saveState(ns, loadedStats);
  return loadedStats;
}

export function reset(ns: NS) {
  ns.write(stateFile, JSON.stringify({}, null, 0), "w");
}
