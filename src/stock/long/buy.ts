import { NS } from "@ns";
import { TrendType } from "../Models";
import { getSpread } from "../stock-utils";

const RESERVE_MONEY = 10_000_000;

const COMMISSION = 200_000; // buy + sell
const MIN_SHARE_VALUE = 5_000_000; // position size floor

// Stability thresholds (BN8-friendly)
export function buyLongStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  const spread = `${getSpread(ns, sym).toFixed(4)}%`;

  if (short == "VERY_STRONG" && mid == "VERY_STRONG" && long == "VERY_STRONG") {
    buy(ns, sym, long);
    return;
  }

  if (long == "WEAK" && mid == "STRONG" && short == "VERY_STRONG") {
    ns.print(
      `BUY -> Reason: Possibly early reversal -> ${sym} - spread ${spread}`
    );
    return;
  }
}

function buy(ns: NS, sym: string, logTrend: TrendType) {
  const [longShares] = ns.stock.getPosition(sym);

  const { shares } = calculatePurchaseAmount(ns, sym, longShares);

  if (shares === 0) return;

  if (!isTradeWorthIt(ns, sym, shares, expectedMoveByTrend(logTrend))) {
    ns.print(`SKIP -> ${sym} (position too small or move too weak)`);
    return;
  }

  const spread = `${getSpread(ns, sym).toFixed(4)}%`;
  const priceBoughtAt = ns.stock.buyStock(sym, shares);

  if (priceBoughtAt === 0) return;
  ns.print(`BUY -> Reason: VERY_STRONG -> ${sym} - spread ${spread}`);

  ns.print(`✅ BOUGHT ${shares} | ${sym} @ ${priceBoughtAt.toFixed(2)}`);
}

function calculatePurchaseAmount(
  ns: NS,
  symbol: string,
  currentShares: number
): { shares: number } {
  const playerMoney = ns.getServerMoneyAvailable("home");
  const currentPrice = ns.stock.getPrice(symbol);
  const maxShares = ns.stock.getMaxShares(symbol);

  const minimumRequired = RESERVE_MONEY + currentPrice;

  if (playerMoney <= minimumRequired) {
    return {
      shares: 0,
    };
  }

  const affordableShares = Math.floor(playerMoney / currentPrice);

  const remainingShares = maxShares - currentShares;
  const sharesToBuy = Math.min(affordableShares, remainingShares);

  if (currentPrice * sharesToBuy < RESERVE_MONEY) {
    return {
      shares: 0,
    };
  }

  return {
    shares: sharesToBuy,
  };
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
