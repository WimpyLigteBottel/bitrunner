import { NS } from "@ns";
import { getTrend, getVolatility } from "../stock-utils";
import { StockMarketSimplified } from "../Models";

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
  state: Record<string, StockMarketSimplified[]>
) {
  const [, avgBuyPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(sym);
  const currentPrice = ns.stock.getPrice(sym);
  const trend = getTrend(ns, sym, 20, state);
  const volatility = getVolatility(ns, sym, state);
  const priceHigh = isPriceHigh(ns, sym, PRICE_HIGH_THRESHOLD, state);

  // Inverted logic: want HIGH price, NEGATIVE trend, positive volatility
  const isGoodShort = priceHigh && trend < MAX_TREND && volatility > 0;

  // Silently skip bad shorts
  if (!isGoodShort) {
    return;
  }

  const maxShares = ns.stock.getMaxShares(sym);

  // Check if we already have a large short position
  if (sharesShort >= maxShares * 0.9) {
    return;
  }

  const { shares, canAfford, debugInfo } = calculateShortPurchaseAmount(
    ns,
    sym,
    sharesShort
  );

  if (!canAfford) {
    return;
  }

  // Buy short position
  const shortPrice = ns.stock.buyShort(sym, shares);

  if (shortPrice === 0) {
    return;
  }

  const finalPosition = ns.stock.getPosition(sym);
  ns.print(
    `  ✅ SHORTED ${finalPosition[2]} shares @ avg $${ns.formatNumber(
      finalPosition[3]
    )}`
  );
  ns.print(
    `  📉 Betting on decline from $${ns.formatNumber(currentPrice)} (trend: ${(
      trend * 100
    ).toFixed(2)}%)`
  );
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
