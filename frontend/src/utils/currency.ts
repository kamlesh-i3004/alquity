/**
 * Formats a price value with the appropriate currency symbol based on the stock ticker.
 * - Indian stocks (.NS for NSE, .BO for BSE) use ₹ (Rupee)
 * - All other stocks default to $ (USD)
 * 
 * @param value - The numeric price value to format
 * @param ticker - The stock ticker symbol (e.g., 'AAPL', 'TCS.NS', 'RELIANCE.BO')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with currency symbol
 */
export function formatPrice(value: number | undefined | null, ticker: string, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00';
  }
  
  const isIndianStock = ticker.endsWith('.NS') || ticker.endsWith('.BO');
  const symbol = isIndianStock ? '₹' : '$';
  const formatted = value.toLocaleString(isIndianStock ? 'en-IN' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

/**
 * Returns the currency symbol for a given stock ticker.
 * 
 * @param ticker - The stock ticker symbol
 * @returns Currency symbol (₹ for Indian stocks, $ for others)
 */
export function getCurrencySymbol(ticker: string): string {
  return ticker.endsWith('.NS') || ticker.endsWith('.BO') ? '₹' : '$';
}

/**
 * Formats a large number (like market cap) with appropriate suffix and currency.
 * 
 * @param value - The numeric value to format
 * @param ticker - The stock ticker symbol
 * @returns Formatted string with currency symbol and suffix (e.g., ₹2.5T, $1.2B)
 */
export function formatMarketCap(value: number, ticker: string): string {
  const symbol = getCurrencySymbol(ticker);
  
  if (value >= 1_000_000_000_000) {
    return `${symbol}${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  } else {
    return formatPrice(value, ticker);
  }
}