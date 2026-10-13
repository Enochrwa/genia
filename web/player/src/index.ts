import { formatMoney, money } from "@genia/types";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@genia/i18n";

/** Pick the UI locale from a URL path such as /rw/wallet; fall back to the default. */
export function localeFromPath(path: string): Locale {
  const seg = path.split("/").filter(Boolean)[0] ?? "";
  return isLocale(seg) ? seg : DEFAULT_LOCALE;
}

/** Entry levels shown as buttons, each with the prize beside it. */
export function entryOptions(
  levels: readonly number[],
  multiplierBps: number,
  currency = "RWF",
  locale = "en",
) {
  return levels.map((amount) => ({
    amount,
    label: formatMoney(money(amount, currency), locale),
    prize: formatMoney(money(Math.floor((amount * multiplierBps) / 10000), currency), locale),
  }));
}
