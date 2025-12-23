import { NS } from "@ns";

const RESERVE_MONEY = 10_000_000;

// Stability thresholds (BN8-friendly)
export function buyLongStocks(ns: NS, sym: string) {
  if (ns.stock.getForecast(sym) < 0.6) {
    return false;
  }

  const shares = calculatePurchaseAmount(ns, sym);

  if (shares === 0) return false;

  const priceBoughtAt = ns.stock.buyStock(sym, shares);

  if (priceBoughtAt === 0) return false;

  ns.print(`✅📈 BOUGHT longs ${shares} # ${sym}`);
  return true;
}

function calculatePurchaseAmount(ns: NS, symbol: string): number {
  const [longShares, avgLongPrice, sharesShort, avgShortPrice] =
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
    maxShares - (longShares + sharesShort)
  );

  if (currentPrice * shares < RESERVE_MONEY) {
    return 0;
  }

  return shares;
}
