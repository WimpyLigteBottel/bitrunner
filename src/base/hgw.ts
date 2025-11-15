import { NS } from "@ns";


let hackCost = 1.7
let weakenCost = 1.75
let growCost = 1.75

export async function main(ns: NS): Promise<void> {
  let host = ns.args[0] as string

  let G = ns.getGrowTime(host)
  let W = ns.getWeakenTime(host)
  let H = ns.getHackTime(host)
  let buffer = 100


  // Delay calculations
  const growTime = 0;            // grow is the baseline
  const weakenTime = G - W - buffer;
  const hackTime = G - H - buffer - buffer;


  let totalCost = hackCost + weakenCost + growCost

  let remainingRam = ns.getServerMaxRam(ns.getHostname()) - ns.getScriptRam("hgw.js")


  let countToExecute = Math.floor(remainingRam / totalCost) -1 


  await ns.run("./hack.js", countToExecute, host, hackTime)
  await ns.run("./weaken.js", countToExecute, host, weakenTime)
  await ns.run("./grow.js", countToExecute, host, growTime)
}