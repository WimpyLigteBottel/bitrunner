/** @param {import(".").NS } ns */
var gNS;
var hostName;

let startingRecursion = 0;
let maxRecursionDepth = 30;
let args = [];

export async function main(ns) {
  gNS = ns;
  args = arguments["0"].args;
  hostName = args[0];

  await weakenServer(startingRecursion);
}

/** @param {NS} ns **/
async function weakenServer(limitDeep) {
  let before = await getSecurityLevel(hostName);
  let thresholdExceeded = await isAboveThreshold();

  if (thresholdExceeded) {
    await gNS.weaken(hostName);
    let after = await getSecurityLevel(hostName);
    gNS.print(`Security level [before=${before};after=${after}]`);

    if (before == after) {
      gNS.print(`Its not getting weaker, breaking early`);

      return 1;
    }

    if (limitDeep < maxRecursionDepth) {
      await weakenServer(limitDeep + 1);
    }
  }

  return 1;
}

async function getSecurityLevel() {
  let value = await gNS.getServerSecurityLevel(hostName);
  return value.toFixed(3) * 100;
}

async function isAboveThreshold() {
  let value = await getSecurityLevel(hostName);
  gNS.print(`Security level=${value} [value=${value} > threshhold=105`);

  return value >= 105;
}
