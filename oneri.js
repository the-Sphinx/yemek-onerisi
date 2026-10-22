// Öneri mantığı. Tarayıcıda global, node'da require ile çalışır (test.js).
// Safari 12 (iPhone 6) uyumlu: ES2017 sözdizimi; test.js denetler.
var Oneri = (function () {
  var M = typeof MALZEMELER !== "undefined" ? MALZEMELER : require("./malzemeler.js");
  var Y = typeof YEMEKLER !== "undefined" ? YEMEKLER : require("./yemekler.js");

  var MEVSIM_DISI = 0.25;  // mevsim dışı yemek yine çıkabilir, ama daha seyrek
  var KILER_BONUS = 2;     // kilerdeki her malzeme için ağırlığa eklenen kat
  var KATEGORILER = ["corba", "ana", "yan"];

  var adla = {};
  Y.forEach(function (y) { adla[y.ad] = y; });

  function mevsim(tarih) {
    var ay = (tarih || new Date()).getMonth();
    if (ay === 11 || ay <= 1) return "k";
    if (ay <= 4) return "i";
    if (ay <= 7) return "y";
    return "s";
  }

  function temelMi(id) { return M[id][1] === "Temel"; }

  function mevsimde(y, ms) {
    return y.z.every(function (id) { var s = M[id][2]; return !s || s.indexOf(ms) >= 0; });
  }

  function kilerdekiler(y, kiler) {
    return y.z.filter(function (id) { return kiler[id] && !temelMi(id); });
  }

  function eksikler(y, kiler) {
    return y.z.filter(function (id) { return !kiler[id] && !temelMi(id); });
  }

  // "Eldekilerle": yalnızca en az eksiği olanlar (önce hiç eksiği olmayanlar). Sıra korunur.
  function kademe(liste, ctx) {
    if (!ctx.eldekiler || !liste.length) return liste;
    var n = liste.map(function (d) { return eksikler(d, ctx.kiler).length; });
    var enAz = Math.min.apply(null, n);
    return liste.filter(function (d, i) { return n[i] === enAz; });
  }

  function agirlik(y, ctx) {
    var w = mevsimde(y, ctx.mevsim) ? 1 : MEVSIM_DISI;
    return w * (1 + KILER_BONUS * kilerdekiler(y, ctx.kiler).length);
  }

  function sec(liste, ctx) {
    if (!liste.length) return null;
    var w = liste.map(function (y) { return agirlik(y, ctx); });
    var top = w.reduce(function (a, b) { return a + b; }, 0);
    var r = ctx.rnd() * top;
    for (var i = 0; i < liste.length; i++) { r -= w[i]; if (r < 0) return liste[i]; }
    return liste[liste.length - 1];
  }

  // Menüdeki diğer yemeklerle uyumlu mu? (ana yemeğin "y" alanı yan yemek türünü kısıtlar)
  function uyumlu(d, menu) {
    if (d.k === "yan" && menu.ana && menu.ana.y) return menu.ana.y.indexOf(d.t) >= 0;
    if (d.k === "ana" && d.y && menu.yan) return d.y.indexOf(menu.yan.t) >= 0;
    return true;
  }

  function adaylar(k, menu, haric, ctx) {
    var hepsi = Y.filter(function (d) { return d.k === k && !haric[d.ad]; });
    var uygun = hepsi.filter(function (d) { return uyumlu(d, menu); });
    return kademe(uygun.length ? uygun : hepsi, ctx);
  }

  function haricle(menu, haric) {
    var h = {};
    Object.keys(haric || {}).forEach(function (a) { h[a] = true; });
    KATEGORILER.forEach(function (k) { if (menu[k]) h[menu[k].ad] = true; });
    return h;
  }

  function hazirla(ctx) {
    return {
      mevsim: ctx.mevsim || mevsim(),
      kiler: ctx.kiler || {},
      eldekiler: !!ctx.eldekiler,
      rnd: ctx.rnd || Math.random
    };
  }

  // Yeni bir menü: önce ana yemek, sonra ona uyan yan yemek.
  function menu(ctx, haric) {
    ctx = hazirla(ctx);
    haric = haric || {};
    var m = {};
    m.corba = sec(adaylar("corba", m, haric, ctx), ctx);
    m.ana = sec(adaylar("ana", m, haric, ctx), ctx);
    m.yan = sec(adaylar("yan", m, haric, ctx), ctx);
    return m;
  }

  // "Başka bir şey": aynı kategoriden, menüdekilerden ve hariçtekilerden farklı bir yemek.
  function baska(m, k, ctx, haric) {
    ctx = hazirla(ctx);
    var digeri = {}; KATEGORILER.forEach(function (x) { if (x !== k) digeri[x] = m[x]; });
    return sec(adaylar(k, digeri, haricle(m, haric), ctx), ctx);
  }

  function benzerlik(a, b) {
    var ortak = a.z.filter(function (id) { return !temelMi(id) && b.z.indexOf(id) >= 0; }).length;
    var birlesim = {};
    a.z.concat(b.z).forEach(function (id) { if (!temelMi(id)) birlesim[id] = 1; });
    var n = Object.keys(birlesim).length;
    return n ? ortak / n : 0;
  }

  // "Benzeri" sırası (rastgele değil): önce aynı aileden çeşitler, sonra malzemesi en çok benzeyenler.
  // Aile içinde menüye uyan, mevsiminde olan ve kilerdekini kullanan önce gelir.
  function benzerSirasi(m, k, ctx) {
    var y = m[k];
    var digeri = {}; KATEGORILER.forEach(function (x) { if (x !== k) digeri[x] = m[x]; });
    var puan = function (d) { return (uyumlu(d, digeri) ? 10 : 1) * agirlik(d, ctx); };
    var adla = function (a, b) { return a.ad.localeCompare(b.ad, "tr"); };
    var ayni = Y.filter(function (d) { return d.k === k && d.ad !== y.ad; });
    var aile = ayni
      .filter(function (d) { return d.a === y.a; })
      .sort(function (a, b) { return puan(b) - puan(a) || adla(a, b); });
    var yakin = ayni
      .filter(function (d) { return d.a !== y.a && d.t === y.t && uyumlu(d, digeri); })  // çorbada t yok: hepsi eşleşir
      .map(function (d) { return { d: d, s: benzerlik(y, d), p: puan(d) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || b.p - a.p || adla(a.d, b.d); })
      .map(function (x) { return x.d; });
    return aile.concat(yakin);
  }

  // Sıradaki, henüz gösterilmemiş (hariçte olmayan) ilk yemek; sıra bittiyse null.
  function benzeri(m, k, ctx, haric) {
    ctx = hazirla(ctx);
    var h = haricle(m, haric);
    var sira = benzerSirasi(m, k, ctx).filter(function (d) { return !h[d.ad]; });
    return kademe(sira, ctx)[0] || null;
  }

  // 7 günlük plan; hafta içinde aynı yemek iki kez çıkmaz.
  function hafta(ctx, gun) {
    ctx = hazirla(ctx);
    var kullanilan = {};
    var plan = [];
    for (var i = 0; i < (gun || 7); i++) {
      var m = menu(ctx, kullanilan);
      KATEGORILER.forEach(function (k) { kullanilan[m[k].ad] = true; });
      plan.push(m);
    }
    return plan;
  }

  // Alışveriş listesi: plandaki malzemeler − kiler − temel malzemeler. Gruplara göre sıralı.
  function alisveris(plan, kiler) {
    kiler = kiler || {};
    var hangi = {};
    plan.forEach(function (m) {
      KATEGORILER.forEach(function (k) {
        if (!m[k]) return;
        m[k].z.forEach(function (id) {
          if (temelMi(id) || kiler[id]) return;
          (hangi[id] = hangi[id] || []).push(m[k].ad);
        });
      });
    });
    return Object.keys(hangi)
      .map(function (id) { return { id: id, ad: M[id][0], grup: M[id][1], yemekler: hangi[id] }; })
      .sort(function (a, b) { return a.grup.localeCompare(b.grup, "tr") || a.ad.localeCompare(b.ad, "tr"); });
  }

  return {
    menu: menu, baska: baska, benzeri: benzeri, hafta: hafta, alisveris: alisveris,
    mevsim: mevsim, mevsimde: mevsimde, kilerdekiler: kilerdekiler, eksikler: eksikler, temelMi: temelMi,
    adla: adla, KATEGORILER: KATEGORILER
  };
})();

if (typeof module !== "undefined") module.exports = Oneri;
