var hostName;
let args = [];

let hackScript = "/scripts/hack.js";
let hackFullyScript = "/scripts/hackFully.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  args = arguments["0"].args;
  hostName = ns.getHostname();

  ns.print(`Starting hacking calculations ${hostName}`);
  let maxServerRam = ns.getServerMaxRam(hostName);
  let hackCost = ns.getScriptRam(hackScript, hostName);
  let currentRunningScript = ns.getScriptRam(hackFullyScript);

  let maxAmount = maxServerRam - currentRunningScript;

  maxAmount = (maxAmount / hackCost).toFixed(0) - 1;

  ns.print(
    `Calculations [maxServerRam=${maxServerRam};hackCost=${hackCost};maxAmount=${maxAmount};hostName=${hostName}]`
  );

  if (maxAmount <= 0) {
    ns.print(`Could not run on ${hostName} no ram avail ()`);
    return -1;
  }

  await ns.run(hackScript, maxAmount, hostName);
}
