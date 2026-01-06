export function maskPhone(phone) {
  if (!phone) return "";
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  // Format: +966 5X XXX XXXX
  if (digits.length >= 9) {
    const country = digits.substring(0, digits.length - 9);
    const last4 = digits.substring(digits.length - 4);
    const middle = "X".repeat(Math.min(4, digits.length - 4 - country.length));
    return `+${country} ${digits[country.length]}${middle} ${last4}`;
  }
  return phone.replace(/(\+\d{2})\d{6}(\d{2})/, "$1****$2");
}
