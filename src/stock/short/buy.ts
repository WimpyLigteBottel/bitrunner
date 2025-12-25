import { NS } from "@ns";
import { RESERVE_MONEY, TrendType } from "../Models";

export function buyShortStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
): boolean {
  if (short == "VERY_WEAK" && mid == "VERY_WEAK" && long == "VERY_WEAK") {
    return buy(ns, sym);
  }
  return false;
}

function buy(ns: NS, sym: string) {
  const shares = calculateShortPurchaseAmount(ns, sym);

  if (shares === 0) return false;

  const priceBoughtAt = ns.stock.buyShort(sym, shares);
  if (priceBoughtAt === 0) return false;

  ns.print(`✅ BOUGHT ${shares} | ${sym} | SHORTS`);

  return true;
}

function calculateShortPurchaseAmount(ns: NS, symbol: string): number {
  const [sharesLong, , sharesShort] = ns.stock.getPosition(symbol);

  const playerMoney = ns.getServerMoneyAvailable("home") - 100_000;
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const availableMoney = playerMoney - RESERVE_MONEY;
  const affordableShares = Math.floor(availableMoney / currentPrice);

  const remainingShares = maxShares - sharesShort - sharesLong;
  const shares = Math.min(affordableShares, remainingShares);

    if (currentPrice * shares < RESERVE_MONEY) {
    return 0;
  }

  return shares;
}
