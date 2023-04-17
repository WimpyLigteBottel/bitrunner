export async function main(ns) {
  let args = arguments["0"].args;
  ns.tprint(`arguments ${args}`);

  while (true) {
    await ns.hack("n00dles");
  }
}
