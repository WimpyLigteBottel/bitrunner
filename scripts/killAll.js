let args = [];
/** @param {import(".").NS } ns */
export async function main(ns) {
  args = arguments["0"].args;

  if (args.length <= 0) {
    return -1;
  }

  let hostName = args[0];

  let results = ns.killall(hostName);
  if (results) {
    ns.print(`Scripts killed on ${hostName}`);
  } else {
    ns.print(`Scripts not killed on ${hostName}`);
  }
}
