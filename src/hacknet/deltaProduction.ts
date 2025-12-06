import { NS } from "@ns";

export const gain = (
  ns: NS,
  node: number,
  type?: "level" | "ram" | "core" | "node"
) => {
  let nodeStat = ns.hacknet.getNodeStats(node);

  if (type === "level") nodeStat.level += 1;
  else if (type === "ram") nodeStat.ram *= 2;
  else if (type === "core") nodeStat.cores += 1;

  return ns.formulas.hacknetServers.hashGainRate(
    nodeStat.level,
    0,
    nodeStat.ram,
    nodeStat.cores,
    ns.getPlayer().mults.hacknet_node_money
  );
};

export const deltaProduction = (
  ns: NS,
  node: number,
  type: "level" | "ram" | "core" | "node" | "none"
) => {
  const nodeStat = ns.hacknet.getNodeStats(node);
  const hacknetServers = ns.formulas.hacknetServers;

  const current = gain(ns, node);

  if (type == "node" || type == "none") {
    return {
      production: hacknetServers.hashGainRate(1, 0, 1, 1),
      cost: hacknetServers.hacknetServerCost(ns.hacknet.numNodes() + 1),
    };
  }

  let level = gain(ns, node, "level");
  let ram = gain(ns, node, "ram");
  let core = gain(ns, node, "core");

  // simulate the upgrade
  if (type === "level")
    return {
      production: level - current,
      cost: hacknetServers.levelUpgradeCost(
        nodeStat.level,
        1,
        ns.getPlayer().mults.hacknet_node_level_cost
      ),
    };

  if (type === "ram")
    return {
      production: ram - current,
      cost: hacknetServers.ramUpgradeCost(
        nodeStat.ram,
        1,
        ns.getPlayer().mults.hacknet_node_ram_cost
      ),
    };

  return {
    production: core - current,
    cost: hacknetServers.coreUpgradeCost(
      nodeStat.cores,
      1,
      ns.getPlayer().mults.hacknet_node_core_cost
    ),
  };
};
