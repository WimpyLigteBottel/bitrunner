import { NS } from "@ns";

const RESERVE_MONEY = 10_000_000;

export function buyShortStocks(ns: NS, sym: string) {
  if (ns.stock.getForecast(sym) < 0.5) {
    return;
  }

  const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(sym);

  const shares = calculateShortPurchaseAmount(ns, sym, sharesShort);

  if (shares === 0) return;

  const priceBoughtAt = ns.stock.buyShort(sym, shares);
  if (priceBoughtAt === 0) return;
  ns.print(`✅ BOUGHT ${shares}  @ ${priceBoughtAt.toFixed(2)}`);
}

function calculateShortPurchaseAmount(
  ns: NS,
  symbol: string,
  currentShortShares: number
): number {
  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + currentPrice;

  if (playerMoney <= minimumRequired) {
    return 0;
  }

  const availableMoney = playerMoney - RESERVE_MONEY;
  const affordableShares = Math.floor(availableMoney / currentPrice);

  const shares = Math.min(affordableShares, maxShares - currentShortShares);

  if (currentPrice * shares < RESERVE_MONEY) {
    return 0;
  }

  return shares;
}
