import { NS } from "@ns";
import { TrendType } from "../Models";

export function sellLongStocks(
  ns: NS,
  sym: string,
  short: TrendType,
  mid: TrendType,
  long: TrendType
) {
  const [longShares] = ns.stock.getPosition(sym);

  // Don't try to sell if we don't own any shares
  if (longShares === 0) {
    return;
  }

  if (
    short == "WEAK" ||
    (short == "SAME" && mid == "WEAK" && long == "WEAK") ||
    (short == "SAME" && mid == "STRONG" && long == "STRONG") // double check this line
  ) {
    sellShares(ns, sym, `Losing money`);
    return;
  }

  if (short == "VERY_WEAK") {
    sellShares(ns, sym, `Losing money FAST`);
    return;
  }
}

function sellShares(ns: NS, sym: string, reason?: string) {
  const [longShares, avgBuyPrice] = ns.stock.getPosition(sym);

  const currentPrice = ns.stock.getPrice(sym);
  const profitPercent = (currentPrice - avgBuyPrice) / avgBuyPrice;

  const salePrice = ns.stock.sellStock(sym, longShares);

  if (salePrice === 0) {
    return; // Failed to sell
  }

  const totalProfit = (salePrice - avgBuyPrice) * longShares;
  const pLongShares = ns.formatNumber(longShares);
  const pProfitPercent = (profitPercent * 100).toFixed(2);
  const pTotalProfit = ns.formatNumber(totalProfit);

  ns.print(`\n=== SOLD ${sym} ===`);
  ns.print(`  Shares: ${pLongShares}`);
  ns.print(`  Bought at: $${ns.formatNumber(avgBuyPrice)}`);
  ns.print(`  Sold at: $${ns.formatNumber(salePrice)}`);
  ns.print(`  Profit: $${pTotalProfit} (${pProfitPercent}%)`);
  ns.print(`  Reason: ${reason}`);
}
