import { NS } from "@ns";
import { getTrend, isPriceHigh } from "../stock-utils";
import { StockMarketSimplified } from "../Models";

export function sellLongStocks(
  ns: NS,
  sym: string,
  state: Record<string, StockMarketSimplified[]>
) {
  const [longShares, avgBuyPrice] = ns.stock.getPosition(sym);

  // Don't try to sell if we don't own any shares
  if (longShares === 0) {
    return;
  }

  const currentPrice = ns.stock.getPrice(sym);
  const trend = getTrend(ns, sym, 20, state);
  const profitPercent = (currentPrice - avgBuyPrice) / avgBuyPrice;
  const isHigh = isPriceHigh(ns, sym, 1.03, state);

  // Sell conditions (ANY of these should trigger a sell):
  const shouldSell =
    (profitPercent >= 0.05 && (trend < -0.01 || isHigh)) || // Take profit: 5%+ gain AND (trend turning negative OR price is high)
    profitPercent < -0.03 || // Stop loss: Cut losses at -3%
    (profitPercent > 0.02 && trend < -0.02); // Protect gains: Have some profit but trend clearly reversing

  if (!shouldSell) {
    return;
  }

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
  ns.print(
    `  Reason: ${
      profitPercent < -0.03
        ? "Stop Loss"
        : profitPercent >= 0.05
        ? "Take Profit"
        : "Trend Reversal"
    }`
  );
}
