import { NS } from "@ns";

export function sellShortStocks(ns: NS, sym: string) {
  const [, , sharesShort] = ns.stock.getPosition(sym);

  // Don't try to sell if we don't have any short shares
  if (sharesShort === 0) {
    return;
  }

  if (ns.stock.getForecast(sym) > 0.5) {
    sellShares(ns, sym, "Losing money");
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
