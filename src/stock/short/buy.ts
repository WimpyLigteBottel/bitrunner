import { NS } from "@ns";
import { getSpread } from "../stock-utils";
import { TrendType } from "../Models";

const RESERVE_MONEY = 1_000_000;

export function buyShortStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  if (short == "VERY_WEAK" && mid == "VERY_WEAK" && long == "VERY_WEAK") {
    buy(ns, sym, `for ${sym}`);
    return;
  }
}

function buy(ns: NS, sym: string, reason?: string) {
  const spread = `${getSpread(ns, sym).toFixed(4)}%`;

  const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(sym);

  const { shares, canAfford } = calculateShortPurchaseAmount(
    ns,
    sym,
    sharesShort
  );
  if (!canAfford || shares === 0) return;

  const priceBoughtAt = ns.stock.buyShort(sym, shares);
  if (priceBoughtAt === 0) return;
  ns.print(`✅ BOUGHT ${shares} - ${reason} @ ${priceBoughtAt.toFixed(2)}`);
}

function calculateShortPurchaseAmount(
  ns: NS,
  symbol: string,
  currentShortShares: number
): { shares: number; canAfford: boolean } {
  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + currentPrice;

  if (playerMoney <= minimumRequired) {
    return {
      shares: 0,
      canAfford: false,
    };
  }

  const availableMoney = playerMoney - RESERVE_MONEY;
  const affordableShares = Math.floor(availableMoney / currentPrice);

  const remainingShares = maxShares - currentShortShares;
  const sharesToShort = Math.min(affordableShares, remainingShares);

  return {
    shares: sharesToShort,
    canAfford: sharesToShort > 0,
  };
}
