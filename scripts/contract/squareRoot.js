function bigIntSqrt(n) {
    if (n < 0n) {
        throw new Error("Square root of negative numbers is not supported.");
    }

    if (n < 2n) {
        return n; // √0 = 0 and √1 = 1
    }

    let left = 1n;
    let right = n;
    let result = 0n;

    while (left <= right) {
        const mid = (left + right) / 2n;
        const square = mid * mid;

        if (square === n) {
            return mid; // Perfect square
        } else if (square < n) {
            result = mid;
            left = mid + 1n;
        } else {
            right = mid - 1n;
        }
    }

    return result; // Floor of the square root
}

// Example usage:
const bigNumber = BigInt("102206821235387837355453262017739018472266650127569221992805439577190403982269004373964969459087514328540726423658123572672606959641819542792026717048897957117999280745479822828857294311655277794169306");
console.log(bigIntSqrt(bigNumber));
