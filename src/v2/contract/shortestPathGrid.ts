import { NS } from "@ns";


export function createShortPathContracts(ns: NS) {
    let contractsToCreate: string[] = ["Shortest Path in a Grid"]
    let contracts: string[] = []

    contractsToCreate.forEach((x: string) => {
        contracts.push(ns.codingcontract.createDummyContract(x))
    })

    ns.print(contracts)

    for (const contract of contracts) {
        solveShortParthGrid(ns, contract, "home")
    }
}


export function solveShortParthGrid(ns: NS, fileName: string, host: string) {
    let contractType = ns.codingcontract.getContractType(fileName, host)
    let data = ns.codingcontract.getData(fileName, host)

    switch (contractType) {
        case "Shortest Path in a Grid":
            let answer = findShortestPath(data)
            ns.codingcontract.attempt(answer, fileName, host)
            break;
        default:
            break;
    }
}


function findShortestPath(grid: number[][]): string {
    const rows = grid.length;
    const cols = grid[0].length;

    // Direction vectors for Up, Down, Left, Right
    const directions: any = [
        [-1, 0, 'U'], // Up
        [1, 0, 'D'],  // Down
        [0, -1, 'L'], // Left
        [0, 1, 'R']   // Right
    ];

    // Check if a cell is within bounds and not blocked
    const isValid = (x: number, y: number) =>
        x >= 0 && y >= 0 && x < rows && y < cols && grid[x][y] === 0;

    // Queue for BFS: [x, y, path]
    const queue: [number, number, string][] = [[0, 0, '']];
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    visited[0][0] = true;

    while (queue.length > 0) {
        const [x, y, path] = queue.shift()!;

        // If we reach the bottom-right corner, return the path
        if (x === rows - 1 && y === cols - 1) {
            return path;
        }

        // Explore all valid neighbors
        for (const [dx, dy, move] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (isValid(newX, newY) && !visited[newX][newY]) {
                visited[newX][newY] = true;
                queue.push([newX, newY, path + move]);
            }
        }
    }

    // If no path exists, return an empty string
    return '';
}
