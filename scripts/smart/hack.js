

/** @param {NS} ns **/
export async function main(ns) {
  ns.clearLog()

  let hostname = `${ns.args[0]}`;
  let delay = `${ns.args[1]}` ?? 50;
  let shouldRecord = `${ns.args[2]}` ?? "false";

  let result = await ns.hack(hostname ,{stock: true})

  updateLog(ns, hostname, result, shouldRecord)

  await ns.sleep(delay)

}

/** @param {NS} ns **/
function updateLog(ns, hostname, result, shouldRecord) {
  if (shouldRecord != "true") {
    return
  }

  let fileName = `logs/hack-${hostname}.txt`

  let line = ns.read(fileName) ?? "0"

  try {
    let total = BigInt(line) + BigInt(Math.ceil(result))
    ns.write(fileName, total.toString(), "w")
    ns.print(total)
  } catch (err) {
    ns.print("ERROR", err)
    ns.write(fileName, "0", "w")
  }
}