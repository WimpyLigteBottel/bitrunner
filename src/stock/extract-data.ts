import { NS } from "@ns";
import { disableLogs, openTail } from "/models/debug";
import { readState } from "./state";
import { StockMarketSimplified } from "./Models";
import { simpleForecast, waitForStockTick } from "./stock-utils";

let choice: string;

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  ns.ui.closeTail();
  ns.clearLog();

  let symbols = ns.stock.getSymbols().toSorted();
  //   const choice = (await ns.prompt(
  //     "What stock are you looking for? " + symbols,
  //     {
  //       type: "select",
  //       choices: symbols,
  //     }
  //   )) as string;

  choice = (await ns.prompt("What stock are you looking for? " + symbols, {
    type: "text",
  })) as string;

  openTail(ns, true);

  while (true) {
    await waitForStockTick(ns, "FNS");
    ns.clearLog();
    const data = readState(ns)[choice];
    asciiGraph(ns, data, {});
    asciiGraphToFile(ns, data, { height: 50, width: 1000, showValues: true });
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
  const height = options.height ?? 40;
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

  // Header
  let header = "ASCII Stock Price Graph";
  ns.print(header);

  let symMsg = `Symbol: ${choice}`;
  ns.print(symMsg);

  const minAndMaxMsg = `Min: ${min.toFixed(2)}   Max: ${max.toFixed(2)}`;
  ns.print(minAndMaxMsg);

  const possibleCast = `Possible cast: ${JSON.stringify(
    simpleForecast(prices)
  )}`;
  ns.print(possibleCast);

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

function asciiGraphToFile(
  ns: NS,
  data: StockMarketSimplified[],
  options: AsciiGraphOptions
): void {
  const width = options.width!;
  const height = options.height!;

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

  let filename = "extracted.txt";

  ns.write(filename, "", "w"); // clear the text file
  // Header
  let header = "ASCII Stock Price Graph";
  ns.write(filename, header + "\n", "a");

  let symMsg = `Symbol: ${choice}`;
  ns.write(filename, symMsg + "\n", "a");

  const minAndMaxMsg = `Min: ${min.toFixed(2)}   Max: ${max.toFixed(2)}`;
  ns.write(filename, minAndMaxMsg + "\n", "a");

  const possibleCast = `Possible cast: ${JSON.stringify(
    simpleForecast(prices)
  )}`;
  ns.write(filename, possibleCast + "\n", "a");
  ns.write(filename, "─".repeat(width + (true ? 10 : 0)) + "\n", "a");

  // Graph body
  rows.forEach((row, i) => {
    let label = "";
    if (true) {
      const value = max - (i / (height - 1)) * range;
      label = value.toFixed(2).padStart(7) + " | ";
    }
    ns.write(filename, label + row.join("") + "\n", "a");
  });
}
