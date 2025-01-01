

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let level = `${ns.args[1]}`

  let servers = ns.scan(hostname)

  for(let index in servers){
    switch (level) {
      case "1":
        await level1Hack(ns, servers[index])
        break;
      default:
        await level0Hack(ns, servers[index])
        break;
    }
  }

}

/** @param {NS} ns **/
async function level1Hack(ns, hostname) {
  ns.print("brutessh: " + hostname)
  await ns.brutessh(hostname)
  await level0Hack(ns, hostname)

}

/** @param {NS} ns **/
async function level0Hack(ns, hostname) {
  ns.print("nuking: " + hostname)
  await ns.nuke(hostname)

  await copyScript(ns,hostname)

  await weakenServerExec(ns,hostname)

}

/** @param {NS} ns **/
async function copyScript(ns,hostname) {
  ns.print("Copying weaken script to location " + hostname)

  let path = "scripts/general/weaken-host.js"  ;
  await ns.scp(path, hostname)
}

/** @param {NS} ns **/
async function weakenServerExec(ns,hostname) {
  let weakenCost = 2
  let maxPossibleThreads = Math.round(ns.getServerMaxRam(hostname) / weakenCost) -1

  ns.print(`Weakening server with ${maxPossibleThreads}`)
  await ns.exec("scripts/general/weaken-host.js", hostname, maxPossibleThreads, `${hostname}`)
}