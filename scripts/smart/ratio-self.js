/** @param {NS} ns **/
export async function main(ns) {
    ns.clearLog();
    ns.disableLog("ALL")
    ns.tail();

    // Arguments
    const hostname = ns.args[0];
    const killAll = ns.args[1]?.toLowerCase() === "true";

    // Scan for servers to process
    const toBeProcessed = ["home"].concat(ns.scan("home").filter(server => {
        return ns.getServerMaxRam(server) > 0 && server.includes("home"); // Only servers with RAM
    }));


    for (const server of toBeProcessed) {
        if (killAll) {
            ns.killall(server);
        }

        try {
            let serverData = getServerData(ns, server, hostname)

            copyToServer(ns, serverData)

            await executeThreads(ns, serverData)
        } catch (error) {
            ns.print(`Failed for server ${server} ` + error)
        }
    }

    ns.print('Jobs executed')

}
/** @param {NS} ns **/
function copyToServer(ns, { weakenScript, growScript, hackScript, server, weakenThreads, growThreads, hackThreads }) {
    // Copy scripts if not already present
    ns.scp([weakenScript, growScript, hackScript], server);
    ns.print(`${server}: W: ${weakenThreads}, G: ${growThreads}, H: ${hackThreads}`);
}

/** @param {NS} ns **/
function getServerData(ns, server, hostname) {
    // Script RAM requirements
    const weakenScript = "scripts/smart/weaken.js";
    const growScript = "scripts/smart/grow.js";
    const hackScript = "scripts/smart/hack.js";

    const weakenRam = ns.getScriptRam(weakenScript);
    const growRam = ns.getScriptRam(growScript);
    const hackRam = ns.getScriptRam(hackScript);

    const maxRam = ns.getServerMaxRam(server);
    const availableRam = Math.floor(maxRam * 0.99);


    // Skip servers with insufficient RAM
    if (availableRam <= 0) {
        throw Error("Skipping ${server}, insufficient RAM.");
    }

    return {
        "hostname": hostname,
        "server": server,

        // Script RAM requirements
        "weakenScript": weakenScript,
        "growScript": growScript,
        "hackScript": hackScript,

        "weakenThreads": Math.floor(availableRam * 0.2 / weakenRam),
        "growThreads": Math.floor(availableRam * 0.5 / growRam),
        "hackThreads": Math.floor(availableRam * 0.3 / hackRam),
    }

}

/** @param {NS} ns **/
async function executeThreads(ns, { weakenScript, growScript, hackScript, weakenThreads, growThreads, hackThreads, server, hostname }) {

    const target = hostname; // Replace with your target server
    const delay = 50;
    const hackTime = ns.getHackTime(target);
    const growTime = ns.getGrowTime(target);
    const weakenTime = ns.getWeakenTime(target);

    for (let a = 0; a < weakenThreads /2; a++) {
        ns.exec(weakenScript, server, 1, hostname)
    }

    await ns.sleep(weakenTime - hackTime + delay); 

    for (let a = 0; a < growThreads; a++) {
        ns.exec(growScript, server, 1, hostname)
    }
    await ns.sleep(hackTime - growTime + delay); // Delay grow start

    for (let a = 0; a < hackThreads; a++) {
        ns.exec(hackScript, server, 1, hostname)
    }

    await ns.sleep(growTime - weakenTime + delay); // Delay weaken 2 start

    for (let a = 0; a < weakenThreads /2; a++) {
        ns.exec(weakenScript, server, 1, hostname)
    }

}