import { NS } from "@ns";
import { disableLogs, openTail } from "/models/debug";
import { readState, saveState } from "./state";
import { waitForStockTick } from "./stock-utils";
import { StockMarketSimplified } from "./Models";

export async function main(ns: NS): Promise<void> {
  openTail(ns, true);
  disableLogs(ns);

  ns.clearLog();

  while (true) {
    await waitForStockTick(ns);
    let state = readState(ns);
    ns.stock.getSymbols().forEach((symbol) => {
      recordPrice(ns, symbol, state);
    });
    saveState(ns, state);

    ns.print(`You have ${readState(ns)["WDS"].length} data points`);
  }
}

export function recordPrice(
  ns: NS,
  symbol: string,
  state: Record<string, StockMarketSimplified[]>,
  limit = 201
) {
  const newValue: StockMarketSimplified = {
    price: ns.stock.getPrice(symbol),
    date: Date.now(),
  };
  const prev = state[symbol] ?? [];

  state[symbol] = [newValue, ...prev]
    .toSorted((a, b) => a.date - b.date)
    .slice(-limit);
}
