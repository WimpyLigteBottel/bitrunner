/*
Algorithmic Stock Trader II
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

172,156,74,56,132,15,155,187,8,161,178,17,86,89,21,190,48,107,18,84,48,89,1,60,9,65,167,128,159,185,55,88,43,73,40,128,10,160,23,154,147,14,141,8

Determine the maximum possible profit you can earn using as many transactions as you'd like. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.

If no profit can be made, then the answer should be 0.


If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
*/

import { NS } from "@ns"


function maxProfitWithKTransactions(k: number, prices: number[]): number {
    const n = prices.length;
    if (n === 0 || k === 0) return 0;

    // If k is larger than n / 2, it's equivalent to unlimited transactions.
    if (k >= n / 2) {
        let maxProfit = 0;
        for (let i = 1; i < n; i++) {
            if (prices[i] > prices[i - 1]) {
                maxProfit += prices[i] - prices[i - 1];
            }
        }
        return maxProfit;
    }

    // DP table where dp[t][i] is the max profit using t transactions up to day i
    const dp = Array.from({ length: k + 1 }, () => Array(n).fill(0));

    for (let t = 1; t <= k; t++) {
        let maxDiff = -prices[0]; // max of dp[t-1][j] - prices[j] for all j < i
        for (let i = 1; i < n; i++) {
            dp[t][i] = Math.max(dp[t][i - 1], prices[i] + maxDiff);
            maxDiff = Math.max(maxDiff, dp[t - 1][i] - prices[i]);
        }
    }

    return dp[k][n - 1];
}

// Example usage:
const k = 3;
const prices = [166, 180, 36, 64, 33];



export async function main(ns: NS): Promise<void> {
    ns.tprint(solve())
}

function solve() {
    return maxProfitWithKTransactions(3, [166, 180, 36, 64, 33])
}