import { NS } from "@ns";

export const canBuyNextNode = (ns: NS) => ns.hacknet.getPurchaseNodeCost() < ns.getPlayer().money &&
  ns.hacknet.maxNumNodes() > ns.hacknet.numNodes();
