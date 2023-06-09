import Decimal from 'decimal.js';

function calculateWinningChance(
  userDepositAmount: Decimal,
  totalDepositAmount: Decimal
) {
  if (userDepositAmount.isZero()) {
    return '0';
  }
  if (totalDepositAmount.isZero()) {
    return '1/1';
  }
  const multiTimes = totalDepositAmount
    .plus(userDepositAmount)
    .div(userDepositAmount)
    .toFixed(2);
  return `1/${multiTimes}`;
}

export default calculateWinningChance;
