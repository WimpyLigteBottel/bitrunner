/** @param {NS} ns */

import { NS } from "@ns";
import { initState, readState } from "./state";
import { openTail } from "/models/debug";
import { getVolatility, simpleForecastPricePoint, waitForStockTick } from "./stock-utils";
import { sellLongStocks } from "./long/sell";
import { buyLongStocks } from "./long/buy";
import { buyShortStocks } from "./short/buy";
import { sellShortStocks } from "./short/sell";

const MIN_HISTORY = 30; // Need at least 30 data points before trading

export async function main(ns: NS) {
  ns.disableLog("ALL");
  openTail(ns, true);
  ns.clearLog();
  initState(ns);

  while (true) {
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

      // Short window trend = stability check, NOT direction
      const shortTrend = simpleForecastPricePoint(ns, sym, 20, state);
      const midTrend = simpleForecastPricePoint(ns, sym, 50, state);
      const longTrend = simpleForecastPricePoint(ns, sym, 100, state);

      const spread = getVolatility(sym,state)

      sellLongStocks(ns, sym, shortTrend.trend, midTrend.trend, longTrend.trend);
      buyLongStocks(ns, sym, shortTrend.trend, midTrend.trend, longTrend.trend);
      // buyShortStocks(ns, sym, shortTrend.trend, midTrend.trend, longTrend.trend);
      // sellShortStocks(ns, sym, state);
    }
  }
}
