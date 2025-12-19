export function solve(target: number) {
  let num = target;
  let maxPrime = -1;

  // Remove factors of 2
  while (num % 2 === 0) {
    maxPrime = 2;
    num /= 2;
  }

  // Remove odd factors
  let factor = 3;
  while (factor * factor <= num) {
    while (num % factor === 0) {
      maxPrime = factor;
      num /= factor;
    }
    factor += 2;
  }

  // If remaining number > 2, it is prime
  if (num > 2) maxPrime = num;

  return maxPrime;
}
