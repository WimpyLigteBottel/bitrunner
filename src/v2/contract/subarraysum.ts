import { NS } from "@ns"

export function createSumSubArrayContracts(ns: NS) {
    let contractsToCreate: string[] = ["Subarray with Maximum Sum"]
    let contracts: string[] = []

    contractsToCreate.forEach((x: string) => {
        contracts.push(ns.codingcontract.createDummyContract(x))
    })

    ns.print(contracts)

    for (const contract of contracts) {
        solveSubArraySum(ns, contract, "home")
    }
}


export function solveSubArraySum(ns: NS, fileName: string, host: string) {
    let contractType = ns.codingcontract.getContractType(fileName, host)
    let data = ns.codingcontract.getData(fileName, host)

    switch (contractType) {
        case "Subarray with Maximum Sum":
            ns.codingcontract.attempt(maxSubArray(data), fileName, host)
            break;
        default:
            break;
    }
}

// nums = [9, 0, -2, -7, 6, -8, -3, -4, 5, 2, -2, 0, 4, 5, 10, 1, 5, 9, -10]
// ans = 39
function maxSubArray(nums: number[]): number {
    let maxSum = nums[0]; // Initialize maxSum with the first element
    let currentSum = nums[0]; // Initialize currentSum with the first element

    for (let i = 1; i < nums.length; i++) {
        // Compare current number and sum of the subarray ending at this number
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        // Update maxSum if currentSum is larger
        maxSum = Math.max(maxSum, currentSum);
    }

    return maxSum;
}