/** @param {NS} ns */

import { NS } from "@ns";
import { openTail } from "/models/debug";
import { waitForStockTick } from "./stock-utils";
import { sellLongStocks } from "./long/sell-smart";
import { buyLongStocks } from "./long/buy-smart";
import { sellShortStocks } from "./short/sell-smart";
import { buyShortStocks } from "./short/buy-smart";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  openTail(ns, true);
  ns.clearLog();

  while (true) {
    await waitForStockTick(ns);

    let longs = getHighest(ns, "LONG");
    let shorts = getHighest(ns, "SHORT");

    for (let i = 0; i < longs.length; i++) {
      // Try to buy the best stocks first
      buyLongStocks(ns, longs[i].sym);
      buyShortStocks(ns, shorts[i].sym);

      // Then sell stocks if not profitable anymore
      sellLongStocks(ns, longs[i].sym);
      sellShortStocks(ns, shorts[i].sym);
    }
  }
}

type SymWithForecast = {
  sym: string;
  forecast: number;
};

function getHighest(ns: NS, type: "LONG" | "SHORT"): SymWithForecast[] {
  return ns.stock
    .getSymbols()
    .map((sym) => {
      return {
        sym: sym,
        forecast: ns.stock.getForecast(sym),
      } as SymWithForecast;
    })
    .toSorted((a, b) => {
      if (type == "LONG") {
        // biggest to smallest for longs
        return b.forecast - a.forecast;
      }

      // smallest to biggest for shorts
      return a.forecast - b.forecast;
    });
}
