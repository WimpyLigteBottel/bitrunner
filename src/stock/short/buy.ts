import { NS } from "@ns";
import { getSpread } from "../stock-utils";
import { TrendType } from "../Models";

const RESERVE_MONEY = 10_000_000;

const COMMISSION = 200_000; // buy + sell
const MIN_SHARE_VALUE = 5_000_000; // position size floor

export function buyShortStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  if (short == "VERY_WEAK" && mid == "VERY_WEAK" && long == "VERY_WEAK") {
    buy(ns, sym, `for ${sym}`, long);
    return;
  }
}

function buy(ns: NS, sym: string, reason: string, long: TrendType) {
  const spread = `${getSpread(ns, sym).toFixed(4)}%`;

  const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(sym);

  const { shares, canAfford } = calculateShortPurchaseAmount(
    ns,
    sym,
    sharesShort
  );

  if (!canAfford || shares === 0) return;

  if (!isTradeWorthIt(ns, sym, shares, expectedMoveByTrend(long))) {
    ns.print(`SKIP -> ${sym} (position too small or move too weak)`);
    return;
  }

  const priceBoughtAt = ns.stock.buyShort(sym, shares);
  if (priceBoughtAt === 0) return;
  ns.print(`✅ BOUGHT ${shares} - ${reason} @ ${priceBoughtAt.toFixed(2)}`);
}

function isTradeWorthIt(
  ns: NS,
  sym: string,
  shares: number,
  expectedMovePct: number // already in %
): boolean {
  const price = ns.stock.getPrice(sym);

  const positionValue = shares * price;

  const spreadPct = getSpread(ns, sym); // e.g. 0.85
  const spreadCost = positionValue * (spreadPct / 100);

  const expectedGain = positionValue * (expectedMovePct / 100);

  return (
    positionValue >= MIN_SHARE_VALUE && expectedGain > COMMISSION + spreadCost
  );
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

function expectedMoveByTrend(long: TrendType): number {
  switch (long) {
    case "VERY_STRONG":
      return 1.0; // 1.0%
    case "STRONG":
      return 0.6; // 0.6%
    case "WEAK":
      return 0.3; // 0.3%
    default:
      return 0.0;
  }
}
