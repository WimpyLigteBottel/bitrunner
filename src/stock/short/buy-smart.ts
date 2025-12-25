import { NS } from "@ns";
import { RESERVE_MONEY } from "../Models";

export function buyShortStocks(ns: NS, sym: string): boolean {
  const shares = calculateShortPurchaseAmount(ns, sym);

  if (shares === 0) return false;

  const priceBoughtAt = ns.stock.buyShort(sym, shares);
  if (priceBoughtAt === 0) return false;
  ns.print(`✅📉 BOUGHT short ${shares}  # ${sym}`);

  return true;
}

function calculateShortPurchaseAmount(ns: NS, symbol: string): number {
  const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(symbol);

  if (sharesShort > 0 || sharesLong > 0) return 0;

  const playerMoney = ns.getServerMoneyAvailable("home") - 100_000;

  if (playerMoney <= 0) return 0;

  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const affordableShares = Math.floor(playerMoney / currentPrice);

  const shares = Math.min(
    affordableShares,
    maxShares - (sharesLong + sharesShort)
  );

  if (currentPrice * shares < RESERVE_MONEY) {
    return 0;
  }

  return shares;
}
