let args = [];
/** @param {import("./scripts").NS } ns */
export async function main(ns) {
  args = arguments["0"].args;

  if (args.includes("--lite")) {
    ns.print("it contains it");
  }
}
