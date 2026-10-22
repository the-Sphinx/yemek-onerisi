# Tasks

## 1. Data — `malzemeler.js`, `yemekler.js`
Ingredient vocabulary written first; dishes reference only its ids.
- [x] malzemeler.js
- [x] çorbalar, ana yemekler, yan yemekler (generated in parallel, merged into yemekler.js)
- [x] integrity checks in test.js (unique names, known ingredient ids, families)

## 2. Logic — `oneri.js`, `test.js`
- [x] weights: season, pantry
- [x] menu, replace ("Başka"), variation ("Benzeri") with fallback by ingredient similarity
- [x] weekly plan without repeats, shopping list
- [x] tests pass

## 3. UI + PWA — `index.html`, `sw.js`, `manifest.json`, `ikon.png`
- [x] three tabs, big touch targets, Safari 12-safe CSS/JS
- [x] offline via service worker
- [x] smoke test 375×667 WebKit

## 4. Docs — `README.md`
- [x] deploy + home-screen install
