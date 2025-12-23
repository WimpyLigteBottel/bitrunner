import { NS } from "@ns";
import { TrendType } from "../Models";

const RESERVE_MONEY = 10_000_000;

// Stability thresholds (BN8-friendly)
export function buyLongStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  if (short == "VERY_STRONG" && mid == "VERY_STRONG" && long == "VERY_STRONG") {
    buy(ns, sym);
    return true;
  }

  if (long == "WEAK" && mid == "STRONG" && short == "VERY_STRONG") {
    ns.print(`BUY -> Reason: Possibly early reversal -> ${sym}`);
    return false;
  }

  return false;
}

function buy(ns: NS, sym: string) {
  const shares = calculatePurchaseAmount(ns, sym);

  if (shares === 0) return;

  const priceBoughtAt = ns.stock.buyStock(sym, shares);

  if (priceBoughtAt === 0) return;
  ns.print(`✅ BOUGHT ${shares} | ${sym} | LONGS `);
}

function calculatePurchaseAmount(ns: NS, symbol: string): number {
  const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(symbol);

  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + currentPrice;

  if (playerMoney <= minimumRequired) {
    return 0;
  }

  const affordableShares = Math.floor(playerMoney / currentPrice);

  const remainingShares = maxShares - sharesLong - sharesShort;
  const sharesToBuy = Math.min(affordableShares, remainingShares);

  if (currentPrice * sharesToBuy < RESERVE_MONEY) {
    return 0;
  }

  return 0;
}
