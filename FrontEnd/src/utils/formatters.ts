import { toNepaliNumber } from './dateUtils';

// ==================== CURRENCY FORMATTING ====================

export function formatCurrency(amount: number, showSymbol = true, nepaliFormat = false): string {
  const formatted = amount.toFixed(2);
  
  if (nepaliFormat) {
    return showSymbol 
      ? `रू ${toNepaliNumber(formatted)}`
      : toNepaliNumber(formatted);
  }
  
  return showSymbol 
    ? `NPR ${formatted}`
    : formatted;
}

// ==================== NUMBER FORMATTING ====================

export function formatNumber(num: number, decimals = 0, nepaliFormat = false): string {
  const formatted = num.toFixed(decimals);
  
  if (nepaliFormat) {
    return toNepaliNumber(formatted);
  }
  
  return formatted;
}

// ==================== PHONE NUMBER FORMATTING ====================

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

// ==================== VALIDATION ====================

export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^(98|97)\d{8}$/.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPAN(pan: string): boolean {
  return /^\d{9}$/.test(pan);
}
