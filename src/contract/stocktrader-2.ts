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



export async function main(ns: NS): Promise<void> {
    let input = "172,156,74,56,132,15,155,187,8,161,178,17,86,89,21,190,48,107,18,84,48,89,1,60,9,65,167,128,159,185,55,88,43,73,40,128,10,160,23,154,147,14,141,8" // 1658
    ns.tprint(solve(input, ns))
}

function solve(input: string, ns: NS) {
    let numbers = input.split(RegExp(",")).map(x => Number.parseInt(x))
    let profit = 0
    for (let x = 0; x < numbers.length; x++) {
        if (numbers[x] > numbers[x - 1]) {
            // ns.tprint(`numbers[x] = ${numbers[x]} | numbers[x-1] ${numbers[x - 1]}`)
            profit += numbers[x] - numbers[x - 1]
        }
    }

    return profit
}