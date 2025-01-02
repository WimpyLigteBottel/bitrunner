

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let killAll = `${ns.args[1]}`;


  let toBeProcessed = ns.scan("home").filter((value) => {
    return value.includes("weaken")
  })

  toBeProcessed.push("weaken")

  ns.print("toBeProcessed:" + toBeProcessed)


  while (toBeProcessed.length > 0) {
    let current = toBeProcessed.pop()

    ns.print("current:" + current)

    await ns.scp("scripts/general/weaken-host.js", current)

    if (killAll == "true") {
      ns.killall(current)
    }

    let weakenCost = ns.getScriptRam("scripts/general/weaken-host.js", current) + 0.15
    let maxPossibleThreads = Math.round(ns.getServerMaxRam(current) / weakenCost) - 1

    await ns.exec("scripts/general/weaken-host.js", current, maxPossibleThreads, `${hostname}`)

  }

}