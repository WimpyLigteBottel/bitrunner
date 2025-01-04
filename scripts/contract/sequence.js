function maxProfit(prices) {
    if (prices.length === 0) return 0; // No prices, no profit

    let minPrice = Infinity; // Start with an infinitely high minimum price
    let maxProfit = 0;       // Initialize maximum profit to 0

    for (let price of prices) {
        // Update the minimum price seen so far
        minPrice = Math.min(minPrice, price);
        // Calculate the profit if selling at the current price
        let profit = price - minPrice;
        // Update the maximum profit
        maxProfit = Math.max(maxProfit, profit);
    }

    return maxProfit;
}



/** @param {NS} ns */
export async function main(ns) {

  const prices = [...ns.args]
  ns.print("INFO \n", JSON.stringify(maxProfit(prices), null, 2))

}

