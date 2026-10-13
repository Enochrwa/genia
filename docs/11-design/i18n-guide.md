# Internationalisation Guide

- Locales at launch: `rw` (Kinyarwanda), `en`, `fr`. Default by country with user override.
- Catalogues: `web/player/messages/{rw,en,fr}.json`, keys namespaced (`wallet.deposit.title`).
- ICU message format for plurals and numbers; no string concatenation.
- Currency and number formatting via `Intl`; currency from wallet, not locale.
- Dates in user timezone; store UTC.
- Questions and legal texts are translated content, reviewed by native speakers.
- Adding a language: add catalogue, question translations, legal texts, SMS templates, support macros; run pseudo-locale test for layout.
- RTL readiness for future Arabic: use logical CSS properties.
