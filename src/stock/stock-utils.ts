import { NS } from "@ns";
import { PricePoint, StockMarketSimplified } from "./Models";

export function getAveragePrice(
  ns: NS,
  symbol: string,
  stats: Record<string, StockMarketSimplified[]>
) {
  if (!stats[symbol] || stats[symbol].length === 0) return 0;

  const sum = stats[symbol].reduce((acc, point) => acc + point.price, 0);
  return sum / stats[symbol].length;
}

// Detect if stock is trending up or down
export function getTrend(
  ns: NS,
  symbol: string,
  lookback = 20,
  stats: Record<string, StockMarketSimplified[]>
) {
  const recent = stats[symbol].slice(-lookback);
  const firstHalf = recent.slice(0, lookback / 2);
  const secondHalf = recent.slice(lookback / 2);

  const firstAvg =
    firstHalf.reduce((a, b) => a + b.price, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((a, b) => a + b.price, 0) / secondHalf.length;

  return (secondAvg - firstAvg) / firstAvg; // Return trend as percentage
}

export function getVolatility(
  ns: NS,
  symbol: string,
  stats: Record<string, StockMarketSimplified[]>
) {
  const avg = getAveragePrice(ns, symbol, stats);
  const squaredDiffs = stats[symbol].map((point) =>
    Math.pow(point.price - avg, 2)
  );
  const variance =
    squaredDiffs.reduce((a, b) => a + b, 0) / stats[symbol].length;
  return Math.sqrt(variance);
}

// Check if current price is high (near historical high)
export function isPriceHigh(
  ns: NS,
  symbol: string,
  threshold = 1.05,
  stats: Record<string, StockMarketSimplified[]>
) {
  const currentPrice = stats[symbol][stats[symbol].length - 1].price;
  const avgPrice = getAveragePrice(ns, symbol, stats);

  return currentPrice > avgPrice * threshold;
}

export function isPriceHighStock(
  ns: NS,
  sym: string,
  threshold: number,
  state: Record<string, StockMarketSimplified[]>
): boolean {
  const history = state[sym];

  const prices = history.map((s) => s.price);
  const maxPrice = Math.max(...prices);
  const currentPrice = ns.stock.getPrice(sym);

  // True if current price is >= threshold times the max (e.g., at 103% of peak)
  return currentPrice >= maxPrice * threshold;
}

export function isPriceLow(
  ns: NS,
  symbol: string,
  threshold = 0.95,
  stats: Record<string, StockMarketSimplified[]>
) {
  const currentPrice = stats[symbol][stats[symbol].length - 1].price;
  const avgPrice = getAveragePrice(ns, symbol, stats);

  return currentPrice < avgPrice * threshold;
}

export async function waitForStockTick(ns: NS, symbol = "WDS") {
  let lastPrice = ns.stock.getPrice(symbol);

  while (true) {
    await ns.sleep(200);
    const price = ns.stock.getPrice(symbol);

    if (price !== lastPrice) {
      return;
    }
  }
}

export function simpleForecast(
  priceHistory: number[],
  slice = 100
): {
  increases: number;
  decreases: number;
} {
  const recent = priceHistory.slice(-slice);
  let increases = 0;
  let decreases = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i - 1]) increases++;
    if (recent[i] < recent[i - 1]) decreases++;
  }
  return { increases, decreases };
}

export function simpleForecastPricePoint(
  priceHistory: PricePoint[],
  slice: number = 101
): {
  symbol: string;
  increases: number;
  decreases: number;
} {
  return {
    ...simpleForecast(
      priceHistory.map((x) => x.price),
      slice
    ),
    symbol: priceHistory[0].symbol,
  };
}
