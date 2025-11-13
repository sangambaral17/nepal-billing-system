// Simplified date utils without external dependencies for now

export function toNepaliDate(date: Date): string {
  // Simple placeholder - will add proper nepali-date-converter later
  return date.toLocaleDateString('en-US');
}

export function toNepaliNumber(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)]);
}

export function getToday(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function getThisMonth(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { year: '2-digit', month: '2-digit', day: '2-digit' } :
    format === 'medium' ? { year: 'numeric', month: 'short', day: 'numeric' } :
    { year: 'numeric', month: 'long', day: 'numeric' };
  
  return date.toLocaleDateString('en-US', options);
}
