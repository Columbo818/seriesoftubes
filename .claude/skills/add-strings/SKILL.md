---
name: add-strings
description: Add or change player-facing text in Series of Tubes and keep every translation (site/i18n/*.js) complete.
---

# Adding or changing player-facing text

The English text is the translation key. Every string a player can see must go
through the translation helpers and have an entry in every dictionary in `site/i18n/`
(Italian `it.js`, Portuguese `pt.js`, French `fr.js`). The code is in `src/`.

## In the code

- `tr('Text with {name}', {name})`: translate now and fill placeholders.
- `trn('{n} router', '{n} routers', n, vars)`: plurals; both forms are keys.
- `N_('Text')`: marks a literal kept in a table for later `tr()` (e.g. labels stored in
  constants). Call `tr(x)` where it's shown.
- Static HTML: add `data-i18n` to the element; `aria-label` and `title` attributes are
  collected automatically.
- Text must be a string literal inside the call, or the checker can't see it.
- Keep HTML (`<b>`, `<br>`, `<small>`) and `{placeholders}` identical in translations.
- Don't build sentences by concatenating translated fragments; translate whole sentences.

## In the dictionary

`site/i18n/<lang>.js` is one object, `"English":"Translation",` per line, **sorted by the English
text**. Sorted files mean two pull requests that add strings touch different lines instead of both
appending at the end. Don't edit the lines by hand; use the script, which quotes correctly, keeps the
order and works on every dictionary at once:

```bash
cat > /tmp/strings.json <<'JSON'
{
  "it": { "New English text": "Nuovo testo italiano", "Text that was removed": null },
  "pt": { "New English text": "Novo texto em português" },
  "fr": { "New English text": "Nouveau texte en français" }
}
JSON
node scripts/i18n-add.js /tmp/strings.json        # a string adds or replaces, null removes
node scripts/i18n-add.js --rename "Old English" "New English"   # English text changed: move the key everywhere
```

If a dictionary got out of order anyway (a hand edit, a merge), `npm run i18n:fix` sorts it again;
`npm run i18n:check` fails until it is sorted.

## Italian style

Natural, friendly Italian, informal "tu". Keep networking terms that Italian engineers
use in English (peering, transit, router, POP, PNI, LAG, dark fiber). Translate puns
into an Italian joke when one fits; otherwise keep the pun name and translate the rest.

## Check

```bash
node scripts/i18n-check.js   # must say: 0 missing, 0 unused, 0 broken
npm test                     # includes tests/i18n.test.js
```
