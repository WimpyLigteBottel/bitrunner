import { NS, CodingContractObject } from "@ns";
import { solve as findLargestPrimeFactor } from "./solvers/find-largest-prime-factor";
import { solve as squareRoot } from "./solvers/sqaure-root";
import { solve as totalWaysToSum } from "./solvers/total-ways-to-sum";
import { solve } from "./solvers/subarray-with-maximum-sum";

export function solveContract(
  ns: NS,
  contract: CodingContractObject,
  filename: string,
  host: string
) {
  let reward = "";
  switch (contract.type) {
    case "Find Largest Prime Factor":
      reward = ns.codingcontract.attempt(
        findLargestPrimeFactor(contract.data),
        filename,
        host
      );
      break;
    case "Square Root":
      reward = ns.codingcontract.attempt(
        squareRoot(contract.data),
        filename,
        host
      );
      break;
    case "Total Ways to Sum":
      reward = ns.codingcontract.attempt(
        totalWaysToSum(contract.data),
        filename,
        host
      );
      break;
    case "Subarray with Maximum Sum":
      reward = ns.codingcontract.attempt(
        solve(contract.data),
        filename,
        host
      );
      break;
    default:
      break;
  }

  return reward;
}
