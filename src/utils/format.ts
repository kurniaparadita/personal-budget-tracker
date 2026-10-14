export const formatRupiah = (amount: number, isPrivacy: boolean = false): string => {
  if (isPrivacy) {
    return 'Rp ••••••••';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Formats a raw number or string with comma thousands separators (e.g. 1000000 -> "1,000,000")
 */
export const formatThousands = (val: string | number | undefined | null): string => {
  if (val === '' || val === null || val === undefined) return '';
  const digits = val.toString().replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Parses a comma-separated string back to a numeric value (e.g. "1,000,000" -> 1000000)
 */
export const parseThousands = (val: string | number | undefined | null): number => {
  if (!val) return 0;
  const digits = val.toString().replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

/**
 * Calculates new cursor position after re-formatting a numeric input string
 */
export const getFormattedCursorPos = (
  rawVal: string,
  cursor: number,
  formattedVal: string
): number => {
  const digitsBefore = rawVal.slice(0, cursor).replace(/\D/g, '').length;
  if (digitsBefore === 0) return 0;
  let count = 0;
  for (let i = 0; i < formattedVal.length; i++) {
    if (/\d/.test(formattedVal[i])) count++;
    if (count === digitsBefore) return i + 1;
  }
  return formattedVal.length;
};

/**
 * Handles input change with automatic thousands comma formatting and cursor management
 */
export const handleFormattedInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (val: string) => void
) => {
  const rawValue = e.target.value;
  const cursor = e.target.selectionStart || 0;
  const formatted = formatThousands(rawValue);
  const newPos = getFormattedCursorPos(rawValue, cursor, formatted);

  setValue(formatted);

  requestAnimationFrame(() => {
    if (e.target) {
      e.target.setSelectionRange(newPos, newPos);
    }
  });
};
