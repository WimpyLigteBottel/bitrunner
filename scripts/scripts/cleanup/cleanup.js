/** @param {NS} ns **/
export async function main(ns) {
    ns.clearLog();
    ns.tail();

    // Argument: Minimum RAM threshold
    const minRam = ns.args[0];
    if (!minRam || isNaN(minRam)) {
        ns.tprint("ERROR: Please specify a valid minimum RAM threshold as an argument.");
        return;
    }

    // Function to recursively find all servers
    function getAllServers(ns, server = "home", visited = new Set()) {
        if (visited.has(server)) return [];
        visited.add(server);
        const neighbors = ns.scan(server);
        return [server, ...neighbors.flatMap(s => getAllServers(ns, s, visited))];
    }

    // Find all servers
    const servers = getAllServers(ns).filter((value)=> value.includes("home") || value.includes("grown") || value.includes("weaken"));

    for (const server of servers) {
        const maxRam = ns.getServerMaxRam(server);

        // Skip "home" and servers above the threshold
        if (server === "home" || maxRam >= minRam) continue;

        try {
            // Attempt to delete the server
            ns.killall(server); // Kill all running scripts first
            ns.deleteServer(server); // Delete the server
            ns.print(`Deleted server: ${server} (RAM: ${maxRam} GB)`);
        } catch (error) {
            ns.print(`ERROR: Could not delete server: ${server}. ${error.message}`);
        }
    }

    ns.print(`Cleanup complete. Deleted servers with RAM below ${minRam} GB.`);
}
