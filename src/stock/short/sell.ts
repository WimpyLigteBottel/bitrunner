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

  // // Don't try to sell if we don't have any short shares
  // if (sharesShort === 0) {
  //   return;
  // }

  // const currentPrice = ns.stock.getPrice(sym);

  // // INVERTED: For shorts, profit when price DROPS
  // // If we shorted at $100 and price is now $95, that's +5% profit
  // const profitPercent = (avgShortPrice - currentPrice) / avgShortPrice;

  // // Sell short position (closes the short)
  // const salePrice = ns.stock.sellShort(sym, sharesShort);

  // if (salePrice === 0) {
  //   ns.print(`❌ Failed to sell short ${sym}`);
  //   return;
  // }

  // // For shorts: profit = (short price - current price) * shares
  // const totalProfit = (avgShortPrice - salePrice) * sharesShort;
  // const pShortShares = ns.formatNumber(sharesShort);
  // const pProfitPercent = (profitPercent * 100).toFixed(2);
  // const pTotalProfit = ns.formatNumber(totalProfit);

  // ns.print(`\n=== CLOSED SHORT ${sym} ===`);
  // ns.print(`  Shares: ${pShortShares}`);
  // ns.print(`  Shorted at: $${ns.formatNumber(avgShortPrice)}`);
  // ns.print(`  Covered at: $${ns.formatNumber(salePrice)}`);
  // ns.print(`  Profit: $${pTotalProfit} (${pProfitPercent}%)`);
  // ns.print(
  //   `  Reason: ${
  //     profitPercent < -0.03
  //       ? "Stop Loss"
  //       : profitPercent >= 0.05
  //       ? "Take Profit"
  //       : "Trend Reversal"
  //   }`
  // );
}
