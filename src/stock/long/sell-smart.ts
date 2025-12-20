import { NS } from "@ns";

export function sellLongStocks(ns: NS, sym: string) {
  if (ns.stock.getForecast(sym) > 0.5) {
    return;
  }

  const [longShares, avgBuyPrice] = ns.stock.getPosition(sym);

  const currentPrice = ns.stock.getPrice(sym);

  // Don't try to sell if we don't own any shares
  if (longShares === 0) {
    return;
  }

  const profitPercent = (currentPrice - avgBuyPrice) / avgBuyPrice;

  const salePrice = ns.stock.sellStock(sym, longShares);

  if (salePrice === 0) {
    return; // Failed to sell
  }

  const totalProfit = (salePrice - avgBuyPrice) * longShares;
  const pProfitPercent = (profitPercent * 100).toFixed(2);

  ns.print(`\n=== SOLD ${sym} ===`);
  ns.print(`  Shares: ${ns.formatNumber(longShares)}`);
  ns.print(`  Bought at: $${ns.formatNumber(avgBuyPrice)}`);
  ns.print(`  Sold at: $${ns.formatNumber(salePrice)}`);
  ns.print(`  Profit: $${ns.formatNumber(totalProfit)} (${pProfitPercent}%)`);
}
