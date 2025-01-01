

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let level = `${ns.args[1]}`

  switch (level) {
    case "1":
      await level1Hack(ns, hostname)
      break;
    default:
      await level0Hack(ns, hostname)
      break;
  }


}

/** @param {NS} ns **/
async function level1Hack(ns, hostname) {

  ns.print("target host: " + hostname)
  ns.print("brutessh: " + hostname)
  await ns.brutessh(hostname)
  ns.print("nuking: " + hostname)
  await ns.nuke(hostname)

  await copyScript(ns,hostname)

  await weakenServerExec(ns,hostname)

}

/** @param {NS} ns **/
async function level0Hack(ns, hostname) {

  ns.print("target host: " + hostname)
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