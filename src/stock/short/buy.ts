import { NS } from "@ns";
import {
  getTrend,
  getVolatility,
  simpleForecastPricePoint,
} from "../stock-utils";
import { StockMarketSimplified, TrendType } from "../Models";

const RESERVE_MONEY = 100_000;
const MAX_TREND = -0.01; // Negative trend (stock declining)
const PRICE_HIGH_THRESHOLD = 1.03; // Price is high relative to history
const COMMISSION = 100_000;

export function isPriceHigh(
  ns: NS,
  sym: string,
  threshold: number,
  state: Record<string, StockMarketSimplified[]>
): boolean {
  const history = state[sym];
  if (!history || history.length < 20) return false;

  const prices = history.map((s) => s.price);
  const maxPrice = Math.max(...prices);
  const currentPrice = ns.stock.getPrice(sym);

  // True if current price is >= threshold times the max (e.g., at 103% of peak)
  return currentPrice >= maxPrice * threshold;
}

export function buyShortStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  if (short == "VERY_WEAK" && mid == "VERY_WEAK" && long == "VERY_WEAK") {
    ns.print("VERY STRONG WEAK should SHORT!!!! -> " + sym);
    return;
  }
}

function calculateShortPurchaseAmount(
  ns: NS,
  symbol: string,
  currentShortShares: number
): { shares: number; canAfford: boolean; debugInfo: any } {
  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + COMMISSION + currentPrice;

  if (playerMoney <= minimumRequired) {
    return {
      shares: 0,
      canAfford: false,
      debugInfo: {
        playerMoney,
        availableMoney: 0,
        affordableShares: 0,
        maxShares,
      },
    };
  }

  const availableMoney = playerMoney - RESERVE_MONEY - COMMISSION;
  const affordableShares = Math.floor(availableMoney / currentPrice);

  const remainingShares = maxShares - currentShortShares;
  const sharesToShort = Math.min(affordableShares, remainingShares);

  return {
    shares: sharesToShort,
    canAfford: sharesToShort > 0,
    debugInfo: {
      playerMoney,
      availableMoney,
      affordableShares,
      remainingShares,
      maxShares,
    },
  };
}
