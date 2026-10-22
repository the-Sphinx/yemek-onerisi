// Önce ağ, yoksa önbellek: güncellemeler hemen gelir, internet yokken de açılır.
// Fotoğraflar kurulumda önbelleğe alınır ki çevrimdışıyken de görünsün.
importScripts("resimler.js");
var ONBELLEK = "yemek-v4";
var DOSYALAR = ["./", "index.html", "malzemeler.js", "yemekler.js", "oneri.js", "resimler.js", "fotolar.js", "tarifler.json", "manifest.json", "ikon.png"];

self.addEventListener("install", function (e) {
  var resimler = {};
  Object.keys(RESIMLER).forEach(function (ad) { resimler["resim/" + RESIMLER[ad]] = true; });
  e.waitUntil(caches.open(ONBELLEK).then(function (c) {
    // Fotoğraflardan biri inmezse kurulum bozulmasın; o fotoğraf ilk görüldüğünde yine önbelleğe girer.
    var fotolar = Object.keys(resimler).map(function (u) { return c.add(u).catch(function () {}); });
    return c.addAll(DOSYALAR).then(function () { return Promise.all(fotolar); });
  }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (adlar) {
    return Promise.all(adlar.filter(function (a) { return a !== ONBELLEK; }).map(function (a) { return caches.delete(a); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // Fotoğraflar değişmez: önce önbellek. yemek.com fotoğrafları ilk görüldüklerinde saklanır.
  if (e.request.url.indexOf("/resim/") >= 0 || e.request.url.indexOf("imgrosetta.yemek.com") >= 0) {
    e.respondWith(caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (yanit) {
        var kopya = yanit.clone();
        if (yanit.ok || yanit.type === "opaque") caches.open(ONBELLEK).then(function (c) { c.put(e.request, kopya); });
        return yanit;
      });
    }));
    return;
  }
  e.respondWith(
    fetch(e.request).then(function (yanit) {
      var kopya = yanit.clone();
      if (yanit.ok) caches.open(ONBELLEK).then(function (c) { c.put(e.request, kopya); });
      return yanit;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
    })
  );
});
