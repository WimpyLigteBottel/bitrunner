/** @param {NS} ns */
export async function main(ns) {
  ns.print("Starting script here");
  await ns.hack("n00dles"); //Use Netscript hack function
  ns.print(ns.args); //The script arguments must be prefaced with ns as well
}
