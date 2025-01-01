

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = "BLANK";
  let level = 0
  hostname = `${ns.args[0]}`
  level = `${ns.args[1]}`

  switch (level) {
    case "1":
      level1Hack(ns, hostname)
      break;
    default:
      level0Hack(ns, hostname)
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

  await copyScript(ns)

  await weakenServerExec(ns)

}

/** @param {NS} ns **/
async function level0Hack(ns, hostname) {

  ns.print("target host: " + hostname)
  ns.print("nuking: " + hostname)
  await ns.nuke(hostname)

  await copyScript(ns)

  await weakenServerExec(ns)

}

/** @param {NS} ns **/
async function copyScript(ns) {
  ns.print("Copying update.js to location " + hostname)

  if (!ns.fileExists("update.js", hostname)) {
    await ns.scp("update.js", hostname)
  }
  await ns.sleep(100)

  ns.print("running update.js to get scripts " + hostname)
  await ns.exec("update.js", hostname)

  await ns.sleep(5000)
}

/** @param {NS} ns **/
async function weakenServerExec(ns) {
  var weakenCost = 3
  var maxPossibleThreads = ns.getServerMaxRam() / weakenCost

  ns.print(`Weaking server with ${maxPossibleThreads}`)
  await ns.exec("/scripts/general/weaken-host.js", hostname, maxPossibleThreads, `"${hostname}"`)
}