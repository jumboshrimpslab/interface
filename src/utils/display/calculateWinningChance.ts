import Decimal from 'decimal.js';

function calculateWinningChance(
  userDepositAmount: Decimal,
  totalDepositAmount: Decimal
) {
  if (userDepositAmount.lessThanOrEqualTo(new Decimal(0))) {
    return '0';
  }
  if (totalDepositAmount.isZero()) {
    return '1/1';
  }
  const multiTimes = totalDepositAmount.div(userDepositAmount).toFixed(2);
  return `1/${multiTimes}`;
}

export default calculateWinningChance;
