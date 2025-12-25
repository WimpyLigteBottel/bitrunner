/** @param {NS} ns */

import { NS } from "@ns";
import { openTail } from "/models/debug";
import { getSpread, waitForStockTick } from "./stock-utils";
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

    // ns.print(`longs ${JSON.stringify(longs[0])}`)
    // ns.print(`shorts ${JSON.stringify(shorts[0])}`)
    for (let i = 0; i < longs.length && i < shorts.length; i++) {
      // Then sell stocks if not profitable anymore
      sellLongStocks(ns, longs[i].sym);
      sellShortStocks(ns, shorts[i].sym);
    }

    for (let i = 0; i < longs.length; i++) {
      if (1 - shorts[i].forecast > longs[i].forecast) {
        if (buyShortStocks(ns, shorts[i].sym)) {
          break;
        }
      } else {
        if (buyLongStocks(ns, longs[i].sym)) {
          break;
        }
      }
    }
  }
}

type SymWithForecast = {
  sym: string;
  forecast: number;
  volatility?: number;
};

function getHighest(ns: NS, type: "LONG" | "SHORT"): SymWithForecast[] {
  return ns.stock
    .getSymbols()
    .map((sym) => {
      return {
        sym: sym,
        forecast: ns.stock.getForecast(sym),
        volatility: ns.stock.getVolatility(sym),
        spread: getSpread(ns, sym),
      } as SymWithForecast;
    })
    .filter((x) => x.forecast > 0.6 || x.forecast < 0.4)
    .toSorted((a, b) => {
      if (type == "LONG") {
        // biggest to smallest for longs
        return b.forecast - a.forecast;
      }

      // smallest to biggest for shorts
      return a.forecast - b.forecast;
    });
}
