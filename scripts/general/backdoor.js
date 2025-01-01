

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let level = `${ns.args[1]}`

  let servers = ns.scan(hostname)
  let toBeProcessed = []
  let wasProcessed = ["home", "home-1", "home-2", "home-2-0"]

  servers.forEach((value) => {
    toBeProcessed.push(value)
  })

  while (toBeProcessed.length > 1) {
    let currentHostTarget = toBeProcessed.pop()

    ns.scan(currentHostTarget).forEach((value) => {
      if (!wasProcessed.includes(value)) {
        ns.print("adding " + value)
        toBeProcessed.push(value)
      }
    })

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


    wasProcessed.push(currentHostTarget)
  }

}

/** @param {NS} ns **/
async function level2Hack(ns, hostname) {
  // ns.print("ftpcrack: " + hostname)
  await ns.ftpcrack(hostname)
  await level1Hack(ns, hostname)
}


/** @param {NS} ns **/
async function level1Hack(ns, hostname) {
  // ns.print("brutessh: " + hostname)
  await ns.brutessh(hostname)
  await level0Hack(ns, hostname)

}

/** @param {NS} ns **/
async function level0Hack(ns, hostname) {
  // ns.print("nuking: " + hostname)
  await ns.nuke(hostname)

  await copyScript(ns, hostname)

  await weakenServerExec(ns, hostname)

}

/** @param {NS} ns **/
async function copyScript(ns, hostname) {
  // ns.print("Copying weaken script to location " + hostname)

  let path = "scripts/general/weaken-host.js";
  await ns.scp(path, hostname)
}

/** @param {NS} ns **/
async function weakenServerExec(ns, hostname) {
  let weakenCost = 2

  ns.killall(hostname)
  let maxPossibleThreads = Math.round(ns.getServerMaxRam(hostname) / weakenCost) - 1

  // ns.print(`Weakening server with ${maxPossibleThreads}`)
  await ns.exec("scripts/general/weaken-host.js", hostname, maxPossibleThreads, `${hostname}`)
}