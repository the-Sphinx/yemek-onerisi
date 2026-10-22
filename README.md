# Ne Pişirsem?

A private PWA for an iPhone 6 (iOS 12). It suggests a Turkish dinner of çorba + ana yemek + yan yemek, can build a weekly plan with a shopping list, and keeps a pantry. There is no build step and no dependencies.

| File | What |
|---|---|
| `index.html` | UI and app state (localStorage) |
| `oneri.js` | suggestion logic |
| `yemekler.js` | 412 dishes: name, category, type, variation family, ingredients |
| `fotolar.js` | dish → yemek.com photo id; photos are loaded from yemek.com and cached on the phone the first time they are seen |
| `tarifler.json` | recipes (ingredients with amounts, steps, time, yield) compiled from yemek.com, shown in the app's own recipe page |
| `resimler.js`, `resim/` | fallback Wikimedia Commons photos (36), shown if a yemek.com photo can't load; credits in `resim/KAYNAKLAR.md` |
| `malzemeler.js` | ingredient vocabulary with seasons; "Temel" items are assumed to be at home |
| `sw.js` | offline support (network first, cache fallback) |
| `test.js` | `node test.js`: data integrity and logic checks |

## Deploy (GitHub Pages)
Live at **https://the-sphinx.github.io/yemek-onerisi/** (repo `the-Sphinx/yemek-onerisi`, Pages from `main` /).
Push to `main` and Pages republishes in a minute or two; the phone picks it up on the next launch with internet.

## Installing on the phone
1. Open https://the-sphinx.github.io/yemek-onerisi/ in **Safari**. It has to be Safari; Chrome cannot add apps to the home screen on iOS.
2. Tap the **Paylaş** (share) button, then **Ana Ekrana Ekle**, then **Ekle**.
3. Open the app from the 🍲 icon. After the first launch it also works without internet.

## Editing
- **Add a dish:** add a line to `yemekler.js` using ingredient ids from `malzemeler.js`. Dishes that share `a` count as variations of each other, which is what the "Benzeri" button uses. Then run `node test.js`.
- **Change a photo:** set the dish's id in `fotolar.js` (the number in `imgrosetta.yemek.com/file/<id>/…`). A dish missing from both photo files shows an emoji placeholder.
- **Tune the suggestions:** `MEVSIM_DISI` (how often off-season dishes still show up) and `KILER_BONUS` (how much the pantry counts) are at the top of `oneri.js`.
- **After changing a file:** the phone gets the new version the next time the app is opened with an internet connection.
