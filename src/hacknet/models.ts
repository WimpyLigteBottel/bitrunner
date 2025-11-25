export const Upgrades = {
  "Sell for Money": {
    name: "Sell for Money",
    cost: 4, // hashes
    receive: 1000000,
  },
  1: "Sell for Corporation Funds",
  2: "Reduce Minimum Security",
  3: "Increase Maximum Money",
  4: "Improve Studying",
  5: "Improve Gym Training",
  6: "Exchange for Corporation Research",
  7: "Exchange for Bladeburner Rank",
  8: "Exchange for Bladeburner SP",
  9: "Generate Coding Contract",
  10: "Company Favor",
};

export type UpgradeCost = {
  nodeIndex: number;
  cost: number;
  action: "level" | "ram" | "core" | "node" | "none";
  execute: () => void;
  payback?: number;
};
