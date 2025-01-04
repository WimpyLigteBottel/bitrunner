// Compression I: RLE Compression
// You are attempting to solve a Coding Contract. You have 9 tries remaining, after which the contract will self-destruct.


// Run-length encoding (RLE) is a data compression technique which encodes data as a series of runs of a repeated single character. Runs are encoded as a length, followed by the character itself. Lengths are encoded as a single ASCII digit; runs of 10 characters or more are encoded by splitting them into multiple runs.

// You are given the following input string:
//     ddddd333333333333hcc4TXXQ6666666666WWAAtttttttttttaEEFF2iw8p
// Encode it using run-length encoding with the minimum possible output length.

// Examples:

//     aaaaabccc            ->  5a1b3c
//     aAaAaA               ->  1a1A1a1A1a1A
//     111112333            ->  511233
//     zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)


// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

// Function to perform RLE Compression
function rleCompression(input) {
    let encoded = ""; // Output string
    let count = 1;    // Counter for repeated characters

    for (let i = 1; i <= input.length; i++) {
        // Check if the current character matches the previous one
        if (input[i] === input[i - 1]) {
            count++;
        } else {
            // Encode runs of length 10 or more by splitting them into multiple runs
            while (count > 9) {
                encoded += "9" + input[i - 1];
                count -= 9;
            }
            // Add the remaining count and character
            encoded += count + input[i - 1];
            count = 1; // Reset the counter
        }
    }

    return encoded;
}




/** @param {NS} ns */
export async function main(ns) {

    ns.tail()

    // Input prices
    const input = ns.args[0]
    ns.print("INFO \n", JSON.stringify(rleCompression(input), null, 2))

}

