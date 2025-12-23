/** @param {NS} ns */

import { NS } from "@ns";
import { initState, readState } from "./state";
import { DEBUG, openTail } from "/models/debug";
import { simpleForecastPricePoint, waitForStockTick } from "./stock-utils";
import { sellLongStocks } from "./long/sell";
import { buyLongStocks } from "./long/buy";
import { buyShortStocks } from "./short/buy";
import { sellShortStocks } from "./short/sell";
import { StockMarketSimplified, Trend } from "./Models";

const MIN_HISTORY = 30; // Need at least 30 data points before trading

export async function main(ns: NS) {
  ns.disableLog("ALL");
  openTail(ns, true);
  ns.clearLog();
  initState(ns);

  while (true) {
    await waitForStockTick(ns);

    let state = readState(ns);

    let longs = getHighest(ns, "LONG", state);
    let shorts = getHighest(ns, "SHORT", state);

    let first = state[longs[0].sym];

    if (first.length < MIN_HISTORY) {
      ns.print(`Insufficient data (${first.length || 0}/${MIN_HISTORY})`);
      continue;
    }

    for (let i = 0; i < longs.length; i++) {
      let symLong = longs[i].sym;
      let symShort = shorts[i].sym;
      sellLongStocks(
        ns,
        symLong,
        simpleForecastPricePoint(ns, symLong, 20, state).trend,
        simpleForecastPricePoint(ns, symLong, 50, state).trend,
        simpleForecastPricePoint(ns, symLong, 100, state).trend
      );
      sellShortStocks(
        ns,
        symShort,
        simpleForecastPricePoint(ns, symShort, 20, state).trend,
        simpleForecastPricePoint(ns, symShort, 50, state).trend,
        simpleForecastPricePoint(ns, symShort, 100, state).trend
      );
    }

    for (let i = 0; i < longs.length; i++) {
      let symLong = longs[i].sym;
      let symShort = shorts[i].sym;

      if (DEBUG) {
        if (i == 0) {
          ns.print(`Maybe the best! long: ${symLong} | short: ${symShort}`);
        }
      }

      let bought = buyLongStocks(
        ns,
        symLong,
        simpleForecastPricePoint(ns, symLong, 20, state).trend,
        simpleForecastPricePoint(ns, symLong, 50, state).trend,
        simpleForecastPricePoint(ns, symLong, 100, state).trend
      );

      if (bought) break;
      bought = buyShortStocks(
        ns,
        symShort,
        simpleForecastPricePoint(ns, symShort, 20, state).trend,
        simpleForecastPricePoint(ns, symShort, 50, state).trend,
        simpleForecastPricePoint(ns, symShort, 100, state).trend
      );
      if (bought) break;
    }
  }
}

type SymWithForecast = {
  sym: string;
  forecast: Trend;
};

function getHighest(
  ns: NS,
  type: "LONG" | "SHORT",
  state: Record<string, StockMarketSimplified[]>
): SymWithForecast[] {
  return ns.stock
    .getSymbols()
    .map((sym) => {
      return {
        sym: sym,
        forecast: simpleForecastPricePoint(ns, sym, 20, state),
      } as SymWithForecast;
    })
    .toSorted((a, b) => {
      if (type == "LONG") {
        // biggest to smallest for longs
        return b.forecast.up - a.forecast.up;
      }

      // smallest to biggest for shorts
      return a.forecast.up - b.forecast.up;
    });
}
