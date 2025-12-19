import { NS } from "@ns";
import { TrendType } from "../Models";

export function sellShortStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  const [longShares, avgBuyPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(sym);

  // Don't try to sell if we don't have any short shares
  if (sharesShort === 0) {
    return;
  }

  if (short == "STRONG" || short == "VERY_STRONG") {
    sellShares(ns, sym, `Losing money`);
    return;
  }

  if (
    (short == "SAME" && mid == "WEAK" && long == "WEAK") ||
    (short == "SAME" && mid == "VERY_WEAK" && long == "VERY_WEAK") // double check this line
  ) {
    sellShares(ns, sym, `Losing money`);
    return;
  }

  if (mid == "VERY_STRONG" && long == "VERY_STRONG") {
    sellShares(ns, sym, `Losing money FAST`);
    return;
  }
}

function sellShares(ns: NS, sym: string, reason?: string) {
  const [, , sharesShort, avgShortPrice] = ns.stock.getPosition(sym);
  const currentPrice = ns.stock.getPrice(sym);

  const salePrice = ns.stock.sellShort(sym, sharesShort);

  if (salePrice === 0) {
    return;
  }

  // For shorts: profit = (short price - current price) * shares
  const totalProfit = (avgShortPrice - salePrice) * sharesShort;
  const pShortShares = ns.formatNumber(sharesShort);
  const pProfitPercent = (
    ((avgShortPrice - currentPrice) / avgShortPrice) *
    100
  ).toFixed(2);
  const pTotalProfit = ns.formatNumber(totalProfit);

  ns.print(`\n=== CLOSED SHORT ${sym} ===`);
  ns.print(`  Shares: ${pShortShares}`);
  ns.print(`  Shorted at: $${ns.formatNumber(avgShortPrice)}`);
  ns.print(`  Covered at: $${ns.formatNumber(salePrice)}`);
  ns.print(`  Profit: $${pTotalProfit} (${pProfitPercent}%)`);
  ns.print(`  REASON: ${reason}`);
}
