import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export function generateOtp(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) out += String(randomInt(0, 10));
  return out;
}

/** Keyed hash so a database leak does not reveal live codes; bound to the phone number. */
export function hashOtp(code: string, phoneE164: string, pepper: string): string {
  return createHmac("sha256", pepper).update(`${phoneE164}:${code}`).digest("hex");
}

export function verifyOtpHash(
  code: string,
  phoneE164: string,
  pepper: string,
  expectedHash: string,
): boolean {
  const actual = Buffer.from(hashOtp(code, phoneE164, pepper), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const MESSAGES = {
  rw: (code: string, minutes: number) =>
    `Kode yawe ya Genia ni ${code}. Imara iminota ${minutes}. Ntuyihe undi muntu.`,
  en: (code: string, minutes: number) =>
    `Your Genia code is ${code}. Valid for ${minutes} minutes. Never share it with anyone.`,
  fr: (code: string, minutes: number) =>
    `Votre code Genia est ${code}. Valable ${minutes} minutes. Ne le partagez avec personne.`,
} as const;

export function otpMessage(locale: "rw" | "en" | "fr", code: string, ttlSeconds: number): string {
  return MESSAGES[locale](code, Math.round(ttlSeconds / 60));
}
