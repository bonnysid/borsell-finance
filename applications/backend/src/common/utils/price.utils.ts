import Big from 'big.js';

export const convertBigToNumberString = (big: Big.Big, fixed = 8) => {
  return big.toFixed(fixed);
};
