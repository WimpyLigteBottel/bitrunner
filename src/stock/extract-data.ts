import { NS } from "@ns";
import { disableLogs, openTail } from "/models/debug";
import { readState } from "./state";
import { StockMarketSimplified } from "./Models";
import { simpleForecastPricePoint, waitForStockTick } from "./stock-utils";

let choice: string;

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  ns.ui.closeTail();
  ns.clearLog();

  let symbols = ns.stock.getSymbols().toSorted();

  choice = (await ns.prompt("What stock are you looking for? " + symbols, {
    type: "text",
  })) as string;

  choice = choice.trim();

  openTail(ns, true);
  ns.ui.resizeTail(1010, 600, ns.getRunningScript()?.pid);

  while (true) {
    await waitForStockTick(ns, "FNS");
    ns.clearLog();
    const data = readState(ns)[choice];
    asciiGraph(ns, data, {});
    // asciiGraphToFile(ns, data, { height: 50, width: 1000, showValues: true });
  }
}

interface AsciiGraphOptions {
  width?: number;
  height?: number;
  showValues?: boolean;
}
/** @param ns Bitburner NS object */
export function asciiGraph(
  ns: NS,
  data: StockMarketSimplified[],
  options: AsciiGraphOptions = {}
): void {
  const width = options.width ?? 101;
  const height = options.height ?? 20;
  const showValues = options.showValues ?? true;

  if (data.length < 2) {
    ns.print("Not enough data to plot.");
    return;
  }

  // Sort oldest → newest
  const sorted = [...data].sort((a, b) => a.date - b.date);
  const prices = sorted.map((d) => d.price);

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  // Initialize grid
  const rows: string[][] = Array.from({ length: height }, () =>
    Array(width).fill(" ")
  );

  // Plot points
  sorted.forEach((point, i) => {
    const x = Math.floor((i / (sorted.length - 1)) * (width - 1));
    const y = Math.floor(((point.price - min) / range) * (height - 1));
    rows[height - 1 - y][x] = "*";
  });
  let state = readState(ns);

  // Header
  ns.print("ASCII Stock Price Graph");

  ns.print(`Symbol: ${choice}`);
  let spread = ns.stock.getAskPrice(choice) - ns.stock.getBidPrice(choice);
  ns.print(`Spread: $` + ns.formatNumber(spread));

  printTrends(ns, state);

  ns.print("─".repeat(width + (showValues ? 10 : 0)));

  // Graph body
  rows.forEach((row, i) => {
    let label = "";
    if (showValues) {
      const value = max - (i / (height - 1)) * range;
      label = value.toFixed(2).padStart(7) + " | ";
    }
    ns.print(label + row.join(""));
  });
}

function printTrends(ns: NS, state: Record<string, StockMarketSimplified[]>) {
  ns.print(
    `Possible cast (200): ${JSON.stringify(
      simpleForecastPricePoint(ns, choice, 200, state)
    )}`
  );
  ns.print(
    `Possible cast (150): ${JSON.stringify(
      simpleForecastPricePoint(ns, choice, 150, state)
    )}`
  );
  ns.print(
    `Possible cast (100): ${JSON.stringify(
      simpleForecastPricePoint(ns, choice, 100, state)
    )}`
  );
  ns.print(
    `Possible cast  (50): ${JSON.stringify(
      simpleForecastPricePoint(ns, choice, 50, state)
    )}`
  );
  ns.print(
    `Possible cast  (20): ${JSON.stringify(
      simpleForecastPricePoint(ns, choice, 20, state)
    )}`
  );
}
