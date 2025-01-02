

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let level = `${ns.args[1]}`;

  let toBeProcessed = findAllServers(ns, hostname, 5)

  ns.print(`${toBeProcessed}`)

  while (toBeProcessed != []) {
    let currentHostTarget = toBeProcessed.pop()
    ns.print(currentHostTarget + "")
    if (currentHostTarget == undefined) {
      break;
    }

    try {
      switch (level) {
        case "2":
          await level2Hack(ns, currentHostTarget)
          break;
        case "1":
          await level1Hack(ns, currentHostTarget)
          break;
        default:
          await level0Hack(ns, currentHostTarget)
          break;
      }
    } catch (error) {
      ns.print("XXXXXXXXXXXX");
      ns.print("Failed to process server " + currentHostTarget);
      ns.print("XXXXXXXXXXXX");
    }
  }

}

/** @param {NS} ns **/
function findAllServers(ns, hostname, maxDepth) {
  if (maxDepth < 1) {
    return []
  }

  let servers = ns.scan(hostname)
  let toBeProcessed = new Set([])

  servers.forEach((value) => {
    toBeProcessed.add(value)
    let temp = findAllServers(ns, value, maxDepth - 1)
    temp.forEach((x) => {
      toBeProcessed.add(x)
    });
  })

  return Array.from(toBeProcessed)
}

/** @param {NS} ns **/
async function level2Hack(ns, hostname) {
  await ns.ftpcrack(hostname)
  await level1Hack(ns, hostname)
}


/** @param {NS} ns **/
async function level1Hack(ns, hostname) {
  await ns.brutessh(hostname)
  await level0Hack(ns, hostname)

}

/** @param {NS} ns **/
async function level0Hack(ns, hostname) {
  await ns.nuke(hostname)

  await copyScript(ns, hostname)
  await weakenServerExec(ns, hostname)
}

/** @param {NS} ns **/
async function copyScript(ns, hostname) {
  let path = "scripts/general/hack-host.js";
  await ns.scp(path, hostname)
}

/** @param {NS} ns **/
async function weakenServerExec(ns, hostname) {
  let weakenCost = ns.getScriptRam("scripts/general/hack-host.js", ns.getHostname()) + 0.15

  ns.killall(hostname)
  let maxPossibleThreads = Math.round(ns.getServerMaxRam(hostname) / weakenCost) - 1

  await ns.exec("scripts/general/hack-host.js", hostname, maxPossibleThreads, `${hostname}`)
}