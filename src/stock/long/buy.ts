import { NS } from "@ns";
import { TrendType } from "../Models";
import { getVolatility } from "../stock-utils";

const RESERVE_MONEY = 100_000;
const COMMISSION = 100_000;

// Stability thresholds (BN8-friendly)
export function buyLongStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  const [longShares] = ns.stock.getPosition(sym);

  if (short == "VERY_STRONG" && mid == "VERY_STRONG" && long == "VERY_STRONG") {
    ns.print(`BUY -> Reason: VERY_STRONG -> ${sym}`);
    return;
  }

  if (long == "WEAK" && mid == "STRONG" && short == "VERY_STRONG") {
    ns.print(`BUY -> Reason: Possibly early reversal -> ${sym}`);
    return;
  }

  // const { shares, canAfford } = calculatePurchaseAmount(ns, sym, longShares);
  // if (!canAfford || shares === 0) return;

  // const priceBoughtAt = ns.stock.buyStock(sym, shares);
  // if (priceBoughtAt === 0) return;

  // const [finalPosition] = ns.stock.getPosition(sym);
  // ns.print(
  //   `✅ BOUGHT ${finalPosition - longShares} ${sym} @ ${priceBoughtAt.toFixed(
  //     2
  //   )}`
  // );
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
