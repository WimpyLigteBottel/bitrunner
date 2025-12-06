import { NS } from "@ns";
import { Upgrades } from "./models";

export const totalProduction = (ns: NS) => {
  let total = 0;
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    total += ns.hacknet.getNodeStats(i).totalProduction;
  }
  return total;
};

export const paybackSeconds = (cost: number, gain: number) => {
  if (gain <= 0) return Infinity;

  return cost / hashToMoneyPerSecond(gain);
};


export const currentMoneyPerSecond = (ns: NS) =>
  (currentHashPerSecond(ns) / Upgrades["Sell for Money"].cost) *
  Upgrades["Sell for Money"].receive;

export const hashToMoneyPerSecond = (hashes: number) =>
  (hashes / Upgrades["Sell for Money"].cost) *
  Upgrades["Sell for Money"].receive;

export const currentHashPerSecond = (ns: NS) => {
  let total = 0;
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    total += ns.hacknet.getNodeStats(i).production;
  }

  return total;
};
