import { NS } from "@ns";
import { findAllServers } from "../../util/FindAllServers";
import { solveStockTrader } from "./stocktrader-4";
import { buildConnectScript } from "/util/connect";
import { solveShortParthGrid } from "./shortestPathGrid";

export async function main(ns: NS) {
    ns.clearLog();
    const servers = findAllServers(ns, true, false)
    const contracts = servers.flatMap((server) => {
        let files = ns.ls(server.host)
        let tempContracts = files.filter((file) => file.endsWith(".cct"))

        return tempContracts.map((file) => {
            return {
                file: file,
                host: server.host,
                connect: buildConnectScript(server) + ";./"+file,
                contractType: ns.codingcontract.getContractType(file, server.host)
            }
        })
    });

    contracts.forEach(x => {
        solveStockTrader(ns, x.file, x.host)
        // solveSubArraySum(ns, x.file, x.host)
        // solveShortParthGrid(ns, x.file, x.host)
    })

    // ns.print(ns.codingcontract.getContractTypes())
    ns.tprint("INFO \n", JSON.stringify(contracts, null, 2))
}

/*
[
"Find Largest Prime Factor",
"Subarray with Maximum Sum",
"Total Ways to Sum","Total Ways to Sum II",
"Spiralize Matrix",
"Array Jumping Game","Array Jumping Game II",
"Merge Overlapping Intervals",
"Generate IP Addresses",
"Algorithmic Stock Trader I","Algorithmic Stock Trader II","Algorithmic Stock Trader III","Algorithmic Stock Trader IV", /// DONE!
"Minimum Path Sum in a Triangle",
"Unique Paths in a Grid I","Unique Paths in a Grid II",
"Shortest Path in a Grid",
"Sanitize Parentheses in Expression",
"Find All Valid Math Expressions",
"HammingCodes: Integer to Encoded Binary","HammingCodes: Encoded Binary to Integer",
"Proper 2-Coloring of a Graph",
"Compression I: RLE Compression","Compression II: LZ Decompression","Compression III: LZ Compression",
"Encryption I: Caesar Cipher","Encryption II: Vigenère Cipher",
"Square Root"
]
*/
