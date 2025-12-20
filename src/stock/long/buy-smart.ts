import { NS } from "@ns";

const RESERVE_MONEY = 10_000_000;

// Stability thresholds (BN8-friendly)
export function buyLongStocks(ns: NS, sym: string) {
  if (ns.stock.getForecast(sym) < 0.6) {
    return;
  }

  const shares = calculatePurchaseAmount(ns, sym);

  if (shares === 0) return;

  const priceBoughtAt = ns.stock.buyStock(sym, shares);

  if (priceBoughtAt === 0) return;

  ns.print(`✅ BOUGHT ${shares} | ${sym} @ ${priceBoughtAt.toFixed(2)}`);
}

function calculatePurchaseAmount(ns: NS, symbol: string): number {
  const [longShares] = ns.stock.getPosition(symbol);
  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + currentPrice;

  if (playerMoney <= minimumRequired) {
    return 0;
  }

  const affordableShares = Math.floor(playerMoney / currentPrice);

  const shares = Math.min(affordableShares, maxShares - longShares);

  if (currentPrice * shares < RESERVE_MONEY) {
    return 0;
  }

  return shares;
}
