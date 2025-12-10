import { NS } from "@ns";
import { openTail } from "/models/debug";
import { Positions, StockMarket, symbols } from "./Models";
import { initState, recordPrice, saveState, stats } from "./recordPrice";

export async function main(ns: NS): Promise<void> {
  openTail(ns, true);

  ns.clearLog();

  if (!ns.stock.hasWSEAccount()) {
    ns.stock.purchaseWseAccount();
  }

  // Initialize stats
  initState(ns);

  ns.print("XXXXXXXXXXXXXX");

  while (true) {
    symbols.forEach((symbol) => recordPrice(ns, symbol));
    saveState(ns);
    printStats(ns);
    await ns.sleep(1000 * 10); // adjust interval as desired
  }
}

function printStats(ns: NS) {
  ns.clearLog();

  Object.values(stats)
    .toSorted((b, a) => a.trend - b.trend)
    .forEach((value) => {
      const s = stats[value.symbol];
      ns.print(JSON.stringify(s, null, 1));
    });
}

const stockPositions = (ns: NS) => {
  symbols.map((symbol) => {
    let [
      ownedLongShares,
      avgPriceLongPosition,
      ownedShortShares,
      avgPriceShortPosition,
    ] = ns.stock.getPosition(symbol);

    return {
      longShares: ownedLongShares,
      avgPriceLongShares: avgPriceLongPosition,
      shortShares: ownedShortShares,
      avgPriceShortShares: avgPriceShortPosition,
    } as Positions;
  });
};

const companies = (ns: NS): StockMarket[] => {
  let stockMarkets = symbols.map((symbol) => {
    let increaseChance = "-1";
    let decreaseChance = "-1";
    if (ns.stock.has4SData()) {
      increaseChance = ns.stock.getForecast(symbol).toFixed(4);
      decreaseChance = (1 - ns.stock.getForecast(symbol)).toFixed(4);
    }

    return {
      name: ns.stock.getOrganization(symbol),
      symbol,
      askPrice: ns.stock.getAskPrice(symbol),
      bidPrice: ns.stock.getBidPrice(symbol),
      volatility: ns.stock.getVolatility(symbol),
      increaseChance: parseFloat(increaseChance),
      decreaseChance: parseFloat(decreaseChance),
    } as StockMarket;
  });

  return stockMarkets.toSorted((b, a) => a.increaseChance - b.increaseChance);
};
