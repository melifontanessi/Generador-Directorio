/**
 * Utility functions for detecting and formatting WhatsApp links.
 */

export function isWhatsAppPhone(phoneText: string): boolean {
  if (!phoneText) return false;
  // Match keywords related to mobile phones or WhatsApp in Argentina
  return /celular|express20|whatsapp|cel|wa\.me|\+54\s*9/i.test(phoneText);
}

export function getWhatsAppUrl(phoneText: string): string | null {
  if (!phoneText) return null;
  if (!isWhatsAppPhone(phoneText)) return null;

  // Keep only digits
  let digits = phoneText.replace(/[^0-9]/g, "");
  if (!digits) return null;

  // Argentina format: 54 + 9 + 10-digit cell phone number (area code + mobile number)
  // For example, if digits is "3412500806" (10 digits), we prepend "549" -> "5493412500806"
  // If digits is "5493412500806" (13 digits), it's already correct.
  // If digits is "543412500806" (12 digits), we need to insert the "9" -> "5493412500806"
  // If digits is "93412500806" (11 digits), we prepend "54" -> "5493412500806"
  
  if (digits.length === 10) {
    return `https://wa.me/549${digits}`;
  } else if (digits.length === 11 && digits.startsWith("9")) {
    return `https://wa.me/54${digits}`;
  } else if (digits.length === 12 && digits.startsWith("54")) {
    return `https://wa.me/549${digits.substring(2)}`;
  } else if (digits.length === 13 && digits.startsWith("549")) {
    return `https://wa.me/${digits}`;
  } else {
    // If it's something else but has enough digits, take the last 10 digits and format as Argentine cell
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      return `https://wa.me/549${last10}`;
    }
    // Generic fallback
    return `https://wa.me/${digits}`;
  }
}
