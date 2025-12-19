import { NS } from "@ns";
import { disableLogs } from "/models/debug";

let memo: any = {};

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);

  let choice = (await ns.prompt(`What is the input?`, {
    type: "text",
  })) as string;

  ns.tprint(solve(parseInt(choice!)));
}

export function solve(target: number) {
  return partition(target, target - 1);
}

function partition(remaining: number, maxNum: number) {
  // Base cases
  if (remaining === 0) return 1; // Found a valid partition
  if (remaining < 0 || maxNum === 0) return 0; // Invalid

  // Check memo
  const key = `${remaining},${maxNum}`;
  if (memo[key] !== undefined) return memo[key];

  // Recursive case: either use maxNum or don't
  const withMax = partition(remaining - maxNum, maxNum); // Use maxNum
  const withoutMax = partition(remaining, maxNum - 1); // Skip maxNum

  memo[key] = withMax + withoutMax;
  return memo[key];
}
