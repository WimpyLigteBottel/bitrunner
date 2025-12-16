import { NS } from "@ns";
import { getTrend, getVolatility, isPriceLow } from "../stock-utils";
import { StockMarketSimplified } from "../Models";

const RESERVE_MONEY = 100_000;
const PRICE_LOW_THRESHOLD = 0.92; // was 0.97 — too high
const COMMISSION = 100_000;

// Stability thresholds (BN8-friendly)
const MAX_STABLE_TREND = 0.02; // +/- 2% short-term movement
export function buyLongStocks(
  ns: NS,
  sym: string,
  state: Record<string, StockMarketSimplified[]>
) {
  const [longShares] = ns.stock.getPosition(sym);

  // Short window trend = stability check, NOT direction
  const shortTrend = getTrend(ns, sym, 100, state);
  const volatility = getVolatility(ns, sym, state);
  const priceLow = isPriceLow(ns, sym, PRICE_LOW_THRESHOLD, state);

  // BUY LOGIC (range-bound)
  const stable = Math.abs(shortTrend) < MAX_STABLE_TREND;
  const isGoodBuy = priceLow && stable && volatility > 0;

  if (!isGoodBuy) return;

  const maxShares = ns.stock.getMaxShares(sym);
  if (longShares >= maxShares * 0.9) return;

  const { shares, canAfford } = calculatePurchaseAmount(ns, sym, longShares);
  if (!canAfford || shares === 0) return;

  const priceBoughtAt = ns.stock.buyStock(sym, shares);
  if (priceBoughtAt === 0) return;

  const [finalPosition] = ns.stock.getPosition(sym);
  ns.print(
    `✅ BOUGHT ${finalPosition - longShares} ${sym} @ ${priceBoughtAt.toFixed(
      2
    )}`
  );
}

function calculatePurchaseAmount(
  ns: NS,
  symbol: string,
  currentShares: number
): { shares: number; canAfford: boolean } {
  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + COMMISSION + currentPrice;

  if (playerMoney <= minimumRequired) {
    return {
      shares: 0,
      canAfford: false,
    };
  }

  const availableMoney = playerMoney - RESERVE_MONEY - COMMISSION;
  const affordableShares = Math.floor(availableMoney / currentPrice);

  const remainingShares = maxShares - currentShares;
  const sharesToBuy = Math.min(affordableShares, remainingShares);

  return {
    shares: sharesToBuy,
    canAfford: sharesToBuy > 0,
  };
}
