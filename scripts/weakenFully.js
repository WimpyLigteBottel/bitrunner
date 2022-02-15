var hostName;
let args = [];

let weakenScript = "weaken.js";
let weakenScriptFully = "weakenFully.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  args = arguments["0"].args;
  hostName = ns.getHostname();

  ns.print("Starting weakening calucaltions");
  let maxServerRam = ns.getServerMaxRam(hostName);
  let weakenCost = ns.getScriptRam(weakenScript, hostName);
  let currentRunningScript = ns.getScriptRam(weakenScriptFully);

  let maxAmount = maxServerRam - currentRunningScript;

  maxAmount = (maxAmount / weakenCost).toFixed(0) - 1;

  if (maxAmount <= 0) {
    ns.print(`Can't execute script on ${hostName}`);
    return -1;
  }

  ns.print(
    `Calucaltions [maxServerRam=${maxServerRam};weakenCost=${weakenCost};maxAmount=${maxAmount}]`
  );
  await ns.run(weakenScript, maxAmount, hostName);
}
