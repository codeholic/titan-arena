export const MYTHIC_DECIMALS = 9;
export const SOL_DECIMALS = 9;

export const FEE_THRESHOLDS = [
    { threshold: 0, fee: BigInt('10000000') },
    { threshold: 10, fee: BigInt('5000000') },
    { threshold: 20, fee: BigInt('1000000') },
    { threshold: Infinity, fee: BigInt(0) },
];
