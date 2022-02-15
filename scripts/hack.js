/** @param {import(".").NS } ns */

var gNS;
var hostName;
let args = [];
/** @param {NS} ns **/
export async function main(ns) {
  gNS = ns;
  args = arguments["0"].args;
  hostName = args[0];

  let sleepTime = 100;

  while (true) {
    gNS.print("Starting with hacking flow");

    await hackLogic();

    await gNS.sleep(sleepTime);
    gNS.print("Finished with hacking flow");
  }
}

/** @param {NS} ns **/
async function hackLogic() {
  // Starting the flow
  await gNS.hack(hostName);

  gNS.print("Hacking done");
  return 1;
}
