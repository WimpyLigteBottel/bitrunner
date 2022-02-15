/** @param {import(".").NS } ns */
var hostName = "";
var args = [];

export async function main(ns) {
  args = arguments["0"].args;

  if (args.length <= 0) {
    return -1;
  }

  hostName = args[0];
  for (let x = 0; x < 1; x++) {
    await ns.grow(hostName);
  }
}
