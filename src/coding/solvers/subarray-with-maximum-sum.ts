/*

Subarray with Maximum Sum
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
-5,8,-8,8,-8,-10,-5,6,9,10,2,2,6,-4,1,8,5,-7,3,6,8,-10,-4,-8,-9,-9,-3,6,10,2,-4,-2,-2,4,7,3


If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
*/

export function solve(input: number[]) {
  let highestTotal = 0;

  for (let i = 0; i < input.length; i++) {
    for (let x = i + 1; x < input.length; x++) {
      let sumArray = input.slice(i, x).reduce((acc, c) => acc + c, 0);
      highestTotal = Math.max(highestTotal, sumArray);
    }
  }

  return highestTotal;
}
