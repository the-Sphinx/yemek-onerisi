# Yemek Önerisi — plan

Private PWA for an iPhone 6 (iOS 12.5.7, Safari 12). Turkish UI, large type, for a 69-year-old user.
Hosted on GitHub Pages, added to the home screen, works offline.

## Decisions
- PWA, not native: iOS 12 has no SwiftUI; a free-provisioned native app expires every 7 days.
- No framework, no build step. ES2017 only (no `?.`, `??`, flex `gap` — unsupported in Safari 12).
- Menu = çorba + ana yemek + yan yemek (pilav / makarna / salata / zeytinyağlı / meze).
- Seasonality comes from ingredients (each ingredient lists its seasons); off-season dishes get a low weight, not zero.
- Pantry items boost dishes that use them; shopping list = week's ingredients − pantry − staples.

## Checklist
- [x] Ingredient vocabulary (id, name, group, seasons, staple flag)
- [x] Dish database ~400 (name, category, side type, family, ingredients)
- [x] Suggestion logic `oneri.js` (season weight, pantry boost, "Başka" / "Benzeri", weekly plan without repeats, shopping list)
- [x] `test.js` (node asserts: data integrity + logic)
- [x] UI `index.html`: Bugün / Haftalık / Kiler tabs, persisted in localStorage
- [x] PWA: manifest, apple-touch-icon, service worker (network-first, offline fallback)
- [x] Smoke test at iPhone 6 viewport (375×667) in WebKit
- [x] README: GitHub Pages deploy + "Ana Ekrana Ekle" steps

## Review
- 412 dishes (90 çorba, 187 ana, 135 yan) generated in four parallel batches; cross-batch name clashes resolved on merge (meat version wins, kıymalı erişte/fırın makarna kept as mains).
- Two ingredient seasons relaxed after review: bezelye (frozen year-round) and taze soğan.
- Bugs caught by tests: "Benzeri" skipped family members that didn't fit the current side → family now outranks side compatibility.
- Verified: `node test.js` passes; all JS parses as ES2017 (acorn); WebKit smoke test at 375×667 covers every tab, replace/variation/undo, persistence, Turkish-insensitive search, weekly plan with no repeats, shopping list excluding pantry/staples, no horizontal overflow, no console errors.
- Not done: real-device test on iOS 12 (WebKit desktop ≠ Safari 12), deployment (needs the user's GitHub account).

## Round 2 (user feedback)
- [x] Shopping list collapsed by default (toggle shows remaining count)
- [x] Kiler: "Hepsini temizle" next to "Evde olanlar" at the top (was at the bottom of a long list)
- [x] "Benzeri" deterministic: family first (fits menu / in season / uses pantry first), then by ingredient similarity; each card remembers what it showed and never repeats until the list is exhausted. "Başka yemek" uses the same per-card history.
- [x] Card layout fixed-height: name and ingredient line single-line; "Evde var" is inline, so buttons no longer shift
- Verified: test.js (new chain test: no repeats, family first, same order on rerun), WebKit smoke (8× Benzeri no repeat, button positions identical with/without pantry, list collapsed, clear-all)

## Round 3: warm style + meal photos
- [x] Wikimedia photos (36, then the agents hit the session limit; kept as offline fallback, credits in `resim/KAYNAKLAR.md`)
- [x] User found Wikimedia quality too low → yemek.com studio photos: index of 30k recipes from its sitemap, 4 agents picked and eyeballed a photo per dish: 404/412 covered (`fotolar.js`)
- [x] Hotlinked, not copied (GitHub Pages is public; no redistribution of copyrighted photos); `no-referrer`; SW caches them cache-first on first view
- [x] Layers: yemek.com → local Wikimedia copy (onerror) → emoji placeholder
- [x] Card: big photo on top, fixed height, category chip; weekly rows get square thumbnails (150x150)
- [x] Warm style: cream dotted paper, terracotta / saffron / olive, Georgia serif headings, tile-pattern header
- [x] Tests: photo maps reference real dishes/files; smoke test passes; contact sheets of all 404 photos reviewed
- Bug caught in review: weekly thumbnails were hidden under the placeholder (img not absolutely positioned) → fixed and checked (21/21 visible)

## Round 4: whole menu on one iPhone 6/6s screen
- [x] Tried full-bleed photo cards with text on a dark scrim (312px): photos big, but only ~1.5 cards per screen
- [x] User wants header + 3 dishes + "Hepsini değiştir" on one screen (home-screen app: 375×647, ~577px above the tab bar)
- [x] Split card, fixed 144px: square photo left (128px, uncovered), right: label, name (max 2 lines), ingredient line, buttons pinned to bottom ("🔄 Başka" / "✨ Benzeri", 44px)
- [x] One-row header (title left, date + season right)
- Verified: fit check with the longest names + pantry line: button ends 20px above the tab bar, no text overflow; unit + smoke tests pass

## Round 5: modern look
- [x] Dropped the tile header band, dotted paper, serif and emoji icons → light neutral background, white cards with soft shadows, iOS system font, large-title header, line SVG icons (nav, buttons, list, placeholder)
- [x] Tonal buttons ("Başka" neutral, "Benzeri" accent tint), one dark primary CTA; inset rounded photos; circular checkboxes in the shopping list; dark selected chips in Kiler
- Verified: fit check (CTA 12px above the tab bar with the longest names + pantry line), unit + smoke tests, screenshots of all three screens

## Round 6: Eldekilerle, detail sheet, inline undo
- [x] "Geri al" next to a thinner (44px) "Hepsini değiştir" → always on screen
- [x] Card line is a one-line summary ("✓ 2 evde · Eksik: …" / "✓ Malzemelerin hepsi evde"); full list in the detail sheet
- [x] Tap a card (or "Malzemeler ve tarif ›" in the weekly plan) → bottom sheet: big photo, ingredients with Evde var / Eksik, staples, "Tarifi aç" (yemek.com recipe page; slug stored with the photo id in `fotolar.js`, 404/412 dishes)
- [x] "Eldekilerle" switch (Bugün only, persisted): suggestions limited to the lowest-missing tier (0 missing first); Başka walks the tier then the next; Benzeri stays inside the tier
- Verified: unit tests (tiering, Başka never lowers the missing count, Benzeri in tier), fit check with switch + undo + longest names (8px spare), smoke test 28/28

## Round 7: iOS-style navigation
- [x] Detail is a full-screen push page (slides in from the right, "‹ Bugün"/"‹ Haftalık" back, tab bar stays), not a half sheet
- [x] Edge swipe from the left closes the top page (short swipes snap back)
- [x] "Tarifi aç" opens the yemek.com recipe inside the app as a second pushed page ("‹ <dish>"); back returns to the untouched detail page (user chose the site in an iframe over our own recipe page). iOS 12 iframe scroll handled with a scrolling wrapper + width:1px/min-width:100%
- Verified: WebKit navigation test (detail → recipe → back keeps the same detail node → back), recipe iframe loads yemek.com; edge-swipe tested in Chromium (desktop WebKit can't synthesize touches); smoke 30/30

## Round 8: own recipe page
- [x] User wanted the recipe in our own design (the yemek.com-in-iframe option had been selected by mistake)
- [x] `tarifler.json`: 404/404 recipes from yemek.com's schema.org Recipe data (yield, total time, ingredients with amounts, steps); text cleaned (HTML entities, doubled/unclosed parentheses); 464 KB, loaded on first "Tarifi aç", precached by the SW (v4) so it works offline
- [x] Recipe page: pushed full-screen over the detail ("‹ <dish>"), time + yield chips, ingredient list, numbered step cards (18px); tap a step to mark it done. yemek.com iframe kept only as fallback if the data can't load
- Note: recipe text is now published on the public Pages site (user accepted)
- Verified: test.js checks every photographed dish has a clean recipe; navigation test (detail → recipe → back keeps detail → back), step toggle, edge swipe (Chromium); smoke 29/29

## Round 9: detail page tweaks
- [x] Ingredients: missing first, then at home; each group alphabetical (Turkish collation)
- [x] "Tarifi aç" right under the dish name (above the ingredient list) → visible on first load regardless of ingredient count
- Verified: detail test with the dish with the most ingredients (button bottom 413px < tab bar 588px), order check; unit, navigation and smoke tests pass

## Round 10: consistent spacing across tabs
- [x] Measured all three tabs: Bugün's title sat 14px lower (its switch row is 30px; others 16px), first content started 8px vs 4px after the header, Kiler chips at 13px vs 12px gutter
- [x] One header structure for every tab (`baslik(title, overline, right)`, the switch goes in the right slot); `.not` top margin 8px; chip container 9px + chip 3px = 12px
- Verified: overline y=20, title y=43, header bottom 82, first content y=90 and 12px card / 16px text gutters on all tabs; fit check still 8px spare; smoke 29/29

## Release: GitHub Pages
- [x] Public repo https://github.com/the-Sphinx/yemek-onerisi, Pages from `main` / → https://the-sphinx.github.io/yemek-onerisi/
- [x] Commits as Gorkem Erinc <gerinc@gmail.com> (repo-local config); `.claude/` ignored; `.nojekyll`
- Verified live: Pages build is the pushed commit, served files match local md5, 3 cards render, service worker active, recipe page opens, app and recipe still open offline
