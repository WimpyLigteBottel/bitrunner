

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let killAll = `${ns.args[1]}`;


  let toBeProcessed = ns.scan("grow").filter((value) => {
    return value.includes("grow")
  })

  toBeProcessed.push("grow")

  ns.print("toBeProcessed:" + toBeProcessed)


  while (toBeProcessed.length > 0) {
    let current = toBeProcessed.pop()

    ns.print("current:" + current)

    await ns.scp("scripts/general/grow-host.js", current)

    if (killAll == "true") {
      ns.killall(current)
    }

    let weakenCost = ns.getScriptRam("scripts/general/grow-host.js", current) + 0.15
    let maxPossibleThreads = Math.round(ns.getServerMaxRam(current) / weakenCost) - 1

    await ns.exec("scripts/general/grow-host.js", current, maxPossibleThreads, `${hostname}`)

  }

}