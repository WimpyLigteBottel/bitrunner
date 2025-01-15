import { NS } from "@ns"

function createStockTraderAlgo(ns: NS) {
    let contractsToCreate = ["Algorithmic Stock Trader I", "Algorithmic Stock Trader II", "Algorithmic Stock Trader III", "Algorithmic Stock Trader IV"]
    let contracts: string[] = []

    contractsToCreate.forEach((x: string) => {
        contracts.push(ns.codingcontract.createDummyContract(x))
    })

    ns.print(contracts)

    for (const contract of contracts) {
        solveStockTrader(ns, contract)
    }
}

export function solveStockTrader(ns: NS, fileName: string) {
    let contractType = ns.codingcontract.getContractType(fileName)
    let data = ns.codingcontract.getData(fileName)

    switch (contractType) {
        case "Algorithmic Stock Trader I":
            ns.codingcontract.attempt(maxProfitWithKTransactions(1, data), fileName)
            break;
        case "Algorithmic Stock Trader II":
            ns.codingcontract.attempt(maxProfitWithKTransactions(data.length, data), fileName)
            break;
        case "Algorithmic Stock Trader III":
            ns.codingcontract.attempt(maxProfitWithKTransactions(2, data), fileName)
            break;
        case "Algorithmic Stock Trader IV":
            ns.codingcontract.attempt(maxProfitWithKTransactions(data[0], data[1]), fileName)
            break;
        default:
            ns.print("CANT SOLVE")
            break;
    }
}



export function maxProfitWithKTransactions(k: number, prices: number[]): number {
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


export async function main(ns: NS): Promise<void> {
    let numbers = (await ns.prompt("numbers", { "type": "text" })).toString().split(",").map(x=>Number.parseInt(x))
    numbers = numbers
    let kTransactions = await ns.prompt("amount of transactions", { "type": "text" })
    ns.tprint(maxProfitWithKTransactions(3, [166, 180, 36, 64, 33]))
}
