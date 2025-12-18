import { NS } from "@ns";
import { StockMarketSimplified, TrendType } from "./Models";
import { readState } from "./state";

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
  symbol: string,
  stats: Record<string, StockMarketSimplified[]>
) {
  const prices = stats[symbol].map((x) => x.price);

  if (prices.length < 2) return 0;

  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDiffs = prices.map((price) => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  // Return as percentage of mean
  return (stdDev / mean) * 100;
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
  up: number;
  down: number;
} {
  const recent = priceHistory.slice(-slice);
  let inc = 0;
  let dec = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i - 1]) inc++;
    if (recent[i] < recent[i - 1]) dec++;
  }
  return { up: inc, down: dec };
}

export function simpleForecastPricePoint(
  ns: NS,
  sym: string,
  slice: number,
  stats: Record<string, StockMarketSimplified[]> | undefined
): {
  up: number;
  down: number;
  trend: TrendType;
} {
  let state = stats ?? readState(ns);

  const priceHistory = state[sym].map((x) => x.price);

  const result = simpleForecast(priceHistory, slice);

  let trendType: TrendType = "SAME";

  if (result.up > result.down) {
    if (result.up > result.down * 2) {
      trendType = "VERY_STRONG";
    } else if (result.up - result.down > 5) {
      trendType = "STRONG";
    } else {
      trendType = "SAME";
    }
  } else {
    if (result.down > result.up * 2) {
      trendType = "VERY_WEAK";
    } else if (result.down - result.up > 5) {
      trendType = "WEAK";
    } else {
      trendType = "SAME";
    }
  }

  return { ...result, trend: trendType };
}
