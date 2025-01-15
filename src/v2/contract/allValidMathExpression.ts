/*
Find All Valid Math Expressions
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are given the following string which contains only digits between 0 and 9:

39419229169

You are also given a target number of 8. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)

The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:

["39419229169", 8]

NOTE: The order of evaluation expects script operator precedence.
NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression.

Examples:

Input: digits = "123", target = 6
Output: ["1+2+3", "1*2*3"]

Input: digits = "105", target = 5
Output: ["1*0+5", "10-5"]


If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
*/

import { NS } from "@ns";

function findAllValidMathExpressions(digits: string, target: number): string[] {
    const results: string[] = [];

    function backtrack(index: number, expression: string, evaluated: number, lastValue: number): void {
        if (index === digits.length) {
            if (evaluated === target) {
                results.push(expression);
            }
            return;
        }

        for (let i = index; i < digits.length; i++) {
            const currentStr = digits.slice(index, i + 1);

            // Skip numbers with leading zeros
            if (currentStr.length > 1 && currentStr[0] === '0') {
                break;
            }

            const currentNum = parseInt(currentStr);

            if (index === 0) {
                // First number, start the expression
                backtrack(i + 1, currentStr, currentNum, currentNum);
            } else {
                // Add '+'
                backtrack(i + 1, `${expression}+${currentStr}`, evaluated + currentNum, currentNum);

                // Add '-'
                backtrack(i + 1, `${expression}-${currentStr}`, evaluated - currentNum, -currentNum);

                // Add '*'
                backtrack(
                    i + 1,
                    `${expression}*${currentStr}`,
                    evaluated - lastValue + lastValue * currentNum,
                    lastValue * currentNum
                );
            }
        }
    }

    backtrack(0, "", 0, 0);
    return results;
}



export async function main(ns: NS): Promise<void> {
    // Example usage
    const digits = "39419229169";
    const target = 8;
    ns.tprint(solve(digits, target, ns))
}

function solve(input: string, target: number, ns: NS) {
    return findAllValidMathExpressions(input, target).length;
}
