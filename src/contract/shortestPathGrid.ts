import { NS } from "@ns";
function shortestPathInGrid(grid: number[][]): string {
    const rows = grid.length;
    const cols = grid[0].length;

    // Directions for movement: Up, Down, Left, Right
    const directions: any = [
        [-1, 0, 'U'], // Up
        [1, 0, 'D'],  // Down
        [0, -1, 'L'], // Left
        [0, 1, 'R'],  // Right
    ];

    // Check if the start or end positions are blocked
    if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) {
        return ''; // No path exists
    }

    // BFS queue, storing [row, col, path]
    const queue: [number, number, string][] = [[0, 0, '']];
    const visited = new Set<string>();
    visited.add(`0,0`);

    while (queue.length > 0) {
        const [row, col, path] = queue.shift()!;

        // Check if we've reached the bottom-right corner
        if (row === rows - 1 && col === cols - 1) {
            return path; // Return the path
        }

        for (const [dr, dc, move] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            // Check if the new position is valid
            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols &&
                grid[newRow][newCol] === 0 &&
                !visited.has(`${newRow},${newCol}`)
            ) {
                visited.add(`${newRow},${newCol}`);
                queue.push([newRow, newCol, path + move]);
            }
        }
    }

    return ''; // No path found
}




export async function main(ns: NS): Promise<void> {
    ns.tprint(solve(ns))
}

function solve(ns: NS) {
    const grid = [
        [0, 0, 1, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 0],
    ];

    return shortestPathInGrid(grid);
}
