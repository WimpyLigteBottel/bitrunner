/** @param {NS} ns */
export async function main(ns) {

  var hostname = ns.getHostname()

  ns.print("Hostname: "+ hostname)

  var analyze = ns.hackAnalyzeSecurity(1,hostname)

  ns.print("Security: "+ analyze)

}