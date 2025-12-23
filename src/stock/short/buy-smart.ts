import { NS } from "@ns";

const RESERVE_MONEY = 10_000_000;

export function buyShortStocks(ns: NS, sym: string): boolean {
  if (ns.stock.getForecast(sym) > 0.4) {
    return false;
  }

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

  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + currentPrice;

  if (playerMoney <= minimumRequired) {
    return 0;
  }

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
