import { NS } from "@ns";
import { getTrend, isPriceLow } from "../stock-utils";
import { StockMarketSimplified } from "../Models";

export function sellShortStocks(
  ns: NS,
  sym: string,
  state: Record<string, StockMarketSimplified[]>
) {
  const [longShares, avgBuyPrice, sharesShort, avgShortPrice] =
    ns.stock.getPosition(sym);

  // Don't try to sell if we don't have any short shares
  if (sharesShort === 0) {
    return;
  }

  const currentPrice = ns.stock.getPrice(sym);
  const trend = getTrend(ns, sym, 20, state);
  
  // INVERTED: For shorts, profit when price DROPS
  // If we shorted at $100 and price is now $95, that's +5% profit
  const profitPercent = (avgShortPrice - currentPrice) / avgShortPrice;
  const isLow = isPriceLow(ns, sym, 0.97, state);

  // INVERTED sell conditions for shorts:
  const shouldSell =
    (profitPercent >= 0.05 && (trend > 0.01 || isLow)) || // Take profit: 5%+ gain AND (trend turning positive OR price is low)
    profitPercent < -0.03 || // Stop loss: Cut losses at -3% (price went UP instead of down)
    (profitPercent > 0.02 && trend > 0.02); // Protect gains: Have some profit but trend clearly reversing upward

  if (!shouldSell) {
    return;
  }

  // Sell short position (closes the short)
  const salePrice = ns.stock.sellShort(sym, sharesShort);

  if (salePrice === 0) {
    ns.print(`❌ Failed to sell short ${sym}`);
    return;
  }

  // For shorts: profit = (short price - current price) * shares
  const totalProfit = (avgShortPrice - salePrice) * sharesShort;
  const pShortShares = ns.formatNumber(sharesShort);
  const pProfitPercent = (profitPercent * 100).toFixed(2);
  const pTotalProfit = ns.formatNumber(totalProfit);

  ns.print(`\n=== CLOSED SHORT ${sym} ===`);
  ns.print(`  Shares: ${pShortShares}`);
  ns.print(`  Shorted at: $${ns.formatNumber(avgShortPrice)}`);
  ns.print(`  Covered at: $${ns.formatNumber(salePrice)}`);
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