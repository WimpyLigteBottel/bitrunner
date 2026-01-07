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

    ns.print(`longs ${JSON.stringify(longs.slice(0, 3), null, 0)}`);
    ns.print(`shorts ${JSON.stringify(shorts.slice(0, 3), null, 0)}`);

    for (const sym of ns.stock.getSymbols()) {
      sellLongStocks(ns, sym);
      sellShortStocks(ns, sym);
    }

    while (longs.length > 1 && shorts.length > 1) {
      let long = longs.shift()!;
      let short = shorts.shift()!;

      if (long.forecast > 1 - short.forecast) {
        if (buyLongStocks(ns, long!.sym)) {
          shorts.unshift(short);
          break;
        }
      }
      if (buyShortStocks(ns, short!.sym)) {
        longs.unshift(long);
        break;
      }
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
        sym,
        forecast: parseFloat(ns.stock.getForecast(sym).toFixed(3)),
      } as SymWithForecast;
    })
    .filter((x) => x.forecast > 0.6 || x.forecast < 0.4)
    .toSorted((a, b) => {
      if (type == "LONG") {
        // biggest to smallest for longs
        return expectedReturn(ns, b) - expectedReturn(ns, a);
      }

      // smallest to biggest for shorts
      return expectedReturn(ns, a) - expectedReturn(ns, b);
    });
}

function expectedReturn(ns: NS, stock: SymWithForecast) {
  const f = ns.stock.getForecast(stock.sym);
  const v = ns.stock.getVolatility(stock.sym);
  return (2 * f - 1) * (v / 2);
}
