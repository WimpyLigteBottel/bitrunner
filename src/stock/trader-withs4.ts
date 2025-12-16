/** @param {NS} ns */

import { NS } from "@ns";
import { initState, readState } from "./state";
import { openTail } from "/models/debug";
import {
  simpleForecast,
  simpleForecastPricePoint,
  waitForStockTick,
} from "./stock-utils";
import { sellLongStocks } from "./long/sell";
import { buyLongStocks } from "./long/buy";
import { buyShortStocks } from "./short/buy";
import { sellShortStocks } from "./short/sell";
import { PricePoint, StockMarketSimplified } from "./Models";

const MIN_HISTORY = 30; // Need at least 30 data points before trading

export async function main(ns: NS) {
  ns.disableLog("ALL");
  openTail(ns, true);
  ns.clearLog();
  initState(ns);

  while (true) {
    getStockFocus(ns);
    await waitForStockTick(ns);

    // Trading logic
    for (const sym of ns.stock.getSymbols()) {
      let state = readState(ns);
      if (!state[sym] || state[sym].length < MIN_HISTORY) {
        ns.print(
          `${sym}: Insufficient data (${
            state[sym]?.length || 0
          }/${MIN_HISTORY})`
        );
        continue;
      }

      sellLongStocks(ns, sym, state);
      buyLongStocks(ns, sym, state);

      buyShortStocks(ns, sym, state);
      sellShortStocks(ns, sym, state);
    }
  }
}

function getStockFocus(ns: NS) {
  let result: Record<string, PricePoint[]> = {};
  for (const sym of ns.stock.getSymbols()) {
    let state = readState(ns);

    let pricePoint: PricePoint[] = state[sym].map((x) => {
      return {
        symbol: sym,
        ...x,
      };
    });

    result[sym] = pricePoint;
  }

  let focus = [] as any[];

  Object.values(result)
    .filter(
      (x) =>
        simpleForecastPricePoint(x).increases >
        simpleForecastPricePoint(x).decreases
    )
    .toSorted((b, a) => {
      let aV =
        simpleForecastPricePoint(a).increases -
        simpleForecastPricePoint(a).decreases;

      let bV =
        simpleForecastPricePoint(b).increases 
        simpleForecastPricePoint(b).decreases;

      return aV - bV;
    })
    .forEach((x) => {
      focus.push(simpleForecastPricePoint(x));
    });

  for (const stock of focus.slice(0, 5)) {
    ns.print(JSON.stringify(stock) +"  VS   " + JSON.stringify(stock));
  }

  ns.print("XXXXX")
}
