import { NS } from "@ns";
import { StockMarketSimplified } from "./Models";

export function recordPrice(
  ns: NS,
  symbol: string,
  state: Record<string, StockMarketSimplified[]>,
  limit = 200
) {
  const newValue = current(ns, symbol);
  const prev = state[symbol] ?? [];

  state[symbol] = [newValue, ...prev].toSorted((a,b)=> a.date - b.date).slice(-limit);
}

function current(ns: NS, symbol: string) {
  const newValue: StockMarketSimplified = {
    price: ns.stock.getPrice(symbol),
    date: Date.now(),
  };

  return newValue;
}
