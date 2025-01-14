function twoColorGraph(data: [number, [number, number][]]): number[] {
    const [numVertices, edges] = data;

    // Step 1: Create adjacency list for the graph
    const adjList: number[][] = Array.from({ length: numVertices }, () => []);
    for (const [u, v] of edges) {
        adjList[u].push(v);
        adjList[v].push(u);
    }

    // Step 2: Create an array to store the color of each vertex (-1 means uncolored)
    const colors = Array(numVertices).fill(-1);

    // Step 3: Try to color the graph using BFS
    const isBipartite = (start: number): boolean => {
        const queue: number[] = [start];
        colors[start] = 0; // Start coloring the first vertex as 0

        while (queue.length > 0) {
            const node = queue.shift()!;

            for (const neighbor of adjList[node]) {
                if (colors[neighbor] === -1) {
                    // Assign the opposite color to the neighbor
                    colors[neighbor] = 1 - colors[node];
                    queue.push(neighbor);
                } else if (colors[neighbor] === colors[node]) {
                    // If a neighbor has the same color, the graph is not 2-colorable
                    return false;
                }
            }
        }

        return true;
    };

    // Step 4: Check all components of the graph
    for (let i = 0; i < numVertices; i++) {
        if (colors[i] === -1) {
            if (!isBipartite(i)) {
                return []; // Graph is not 2-colorable
            }
        }
    }

    return colors;
}

// Example Usage:
console.log(twoColorGraph([7, [[4, 6], [0, 6], [1, 4], [2, 5], [3, 5], [5, 6], [0, 2]]]));
