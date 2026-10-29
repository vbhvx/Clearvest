/**
 * Indian Number Formatting and Currency Utilities for Clearvest
 * Supports dual display: Exact Indian comma notation (e.g. ₹ 1,50,000)
 * and human-readable Lakh/Crore denominations (e.g. ₹ 1.50 Lakh).
 */

export function formatINR(
  amount: number | string,
  options: {
    showDecimals?: boolean;
    compact?: boolean;
    prefixSymbol?: boolean;
  } = {}
): string {
  const { showDecimals = false, compact = false, prefixSymbol = true } = options;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) return prefixSymbol ? '₹ 0' : '0';

  const symbol = prefixSymbol ? '₹ ' : '';
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  if (compact) {
    if (absNum >= 10000000) {
      // Crores (1 Crore = 10 Million = 100 Lakhs)
      const cr = absNum / 10000000;
      return `${isNegative ? '-' : ''}${symbol}${cr.toFixed(2)} Cr`;
    }
    if (absNum >= 100000) {
      // Lakhs (1 Lakh = 100 Thousand)
      const lk = absNum / 100000;
      return `${isNegative ? '-' : ''}${symbol}${lk.toFixed(2)} L`;
    }
    if (absNum >= 1000) {
      // Thousands
      const k = absNum / 1000;
      return `${isNegative ? '-' : ''}${symbol}${k.toFixed(1)} K`;
    }
    return `${isNegative ? '-' : ''}${symbol}${absNum.toFixed(showDecimals ? 2 : 0)}`;
  }

  // Standard Indian comma system: 12,34,567.89
  const parts = absNum.toFixed(showDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  // Extract last 3 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}${symbol}${formattedInteger}${decimalPart}`;
}

export function formatPercentage(rate: number | string, decimals: number = 2): string {
  const num = typeof rate === 'string' ? parseFloat(rate) : rate;
  if (isNaN(num)) return '0.00%';
  return `${num.toFixed(decimals)}%`;
}
