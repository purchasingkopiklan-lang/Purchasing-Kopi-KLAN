export function formatIDR(value: number | undefined | null, prefix = 'Rp'): string {
  if (value === undefined || value === null || isNaN(value)) {
    return prefix ? `${prefix} 0` : '0';
  }
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return prefix ? `${prefix}${formatted}` : formatted;
}

export function parseNumber(input: string | number | undefined | null): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  // Strip out "Rp", dots, spaces
  const cleaned = input.toString().replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatDateToExcelStyle(dateStr: string): string {
  if (!dateStr) return '';
  // if already formatted like 30-Sep-2026
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(dateStr)) return dateStr;
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

export function getPeriodFromDate(dateStr: string): string {
  if (!dateStr) return 'Sep-2026';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // If format is like 30-Sep-2026
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}`;
    }
    return 'Sep-2026';
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]}-${d.getFullYear()}`;
}

export function formatPercent(numerator: number, denominator: number): string {
  if (!denominator || denominator === 0 || isNaN(denominator)) return '0.0%';
  const val = (numerator / denominator) * 100;
  return `${val.toFixed(2)}%`;
}
