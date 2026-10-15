import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";

export interface NormalizedPhone {
  e164: string;
  country: string;
}

/** Normalises user input to E.164. Local numbers (e.g. 0788123456) use the default country. */
export function normalizePhone(input: string, defaultCountry = "RW"): NormalizedPhone | null {
  const parsed = parsePhoneNumberFromString(input.trim(), defaultCountry as CountryCode);
  if (!parsed || !parsed.isValid() || !parsed.country) return null;
  return { e164: parsed.number, country: parsed.country };
}

/** Masks a phone number for logs: +250788***456 */
export function maskPhone(e164: string): string {
  if (e164.length <= 8) return "***";
  return `${e164.slice(0, 7)}***${e164.slice(-3)}`;
}
