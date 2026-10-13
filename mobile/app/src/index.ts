import { DEFAULT_LOCALE, type Locale } from "@genia/i18n";

export interface AppConfig {
  apiBaseUrl: string;
  locale: Locale;
  realMoneyEnabled: boolean;
}

/** Real-money features stay off unless explicitly enabled for the user's country. */
export function defaultConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    apiBaseUrl: "http://localhost:4000",
    locale: DEFAULT_LOCALE,
    realMoneyEnabled: false,
    ...overrides,
  };
}
