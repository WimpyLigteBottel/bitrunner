import { NS } from "@ns";
import { StockMarketRecord, symbols } from "./Models";

export let stats: Record<string, StockMarketRecord> = {};
const stateFile = "stockStats.txt";

export function recordPrice(ns: NS, symbol: string) {
  let price = ns.stock.getPrice(symbol);
  let s = stats[symbol];

  // Update trend
  s.trend = price - s.lastPrice;

  // Update last, min, max, average
  s.lastPrice = price;
  s.minPrice = Math.min(s.minPrice, price);
  s.maxPrice = Math.max(s.maxPrice, price);
  s.sumPrice += price;
  s.count += 1;
}

export function initState(ns: NS) {
  try {
    ns.read(stateFile);
  } catch (error) {
    ns.print("State file empty. Creating new state.");
    stats = {};
    ns.write(stateFile, JSON.stringify(stats), "w");
  }

  try {
    stats = JSON.parse(ns.read(stateFile));
    ns.print("Loaded state from file.");
  } catch {
    ns.print("Failed to parse state file. Creating new state.");
    stats = {};
  }

  // Initialize missing symbols
  symbols.forEach((symbol) => {
    if (!stats[symbol]) {
      const price = ns.stock.getPrice(symbol);
      stats[symbol] = {
        name: ns.stock.getOrganization(symbol),
        symbol: symbol,
        lastPrice: price,
        minPrice: price,
        maxPrice: price,
        sumPrice: price,
        count: 1,
        trend: 0,
      };
    }
  });
}

export function saveState(ns: NS) {
  ns.write(stateFile, JSON.stringify(stats), "w");
}
