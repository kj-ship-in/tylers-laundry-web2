/**
 * Formats a number as Gambian Dalasi (GMD) currency
 * @param amount - The numeric amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "D 1,234.56")
 */
export function formatToGMD(
  amount: number,
  options?: {
    showSymbol?: boolean;
    decimals?: number;
    locale?: string;
  },
): string {
  const {
    showSymbol = true,
    decimals = 2,
    locale = 'en-GM', // Gambian English locale
  } = options ?? {};

  // Format the number with commas and decimals
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  // Return with or without currency symbol
  return showSymbol ? `D ${formattedAmount}` : formattedAmount;
}

/**
 * Formats a number as Gambian Dalasi without decimals
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "D 1,235")
 */
export function formatToGMDWhole(amount: number): string {
  return formatToGMD(amount, { decimals: 0 });
}

/**
 * Parses a GMD currency string back to a number
 * @param currencyString - The currency string to parse (e.g., "D 1,234.56")
 * @returns The numeric value
 */
export function parseGMD(currencyString: string): number {
  // Remove currency symbol, spaces, and commas
  const cleanString = currencyString.replace(/[D\s,]/g, '');
  return parseFloat(cleanString) || 0;
}

export function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // Default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000; // seconds
    case 'm':
      return value * 60 * 1000; // minutes
    case 'h':
      return value * 60 * 60 * 1000; // hours
    case 'd':
      return value * 24 * 60 * 60 * 1000; // days
    default:
      return 15 * 60 * 1000; // default 15 minutes
  }
}
