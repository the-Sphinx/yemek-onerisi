// node test.js — veri bütünlüğü + öneri mantığı
var assert = require("assert");
var fs = require("fs");
var M = require("./malzemeler.js");
var Y = require("./yemekler.js");
var O = require("./oneri.js");

function rng(seed) { // mulberry32
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var T = { ana: ["et", "tavuk", "balik", "sebze", "bakliyat", "yumurta", "hamur"], yan: ["pilav", "makarna", "salata", "zeytinyagli", "meze"] };

// --- veri ---
var adlar = {};
Y.forEach(function (y) {
  assert(!adlar[y.ad], "tekrar eden ad: " + y.ad); adlar[y.ad] = 1;
  assert(O.KATEGORILER.indexOf(y.k) >= 0, y.ad + ": k");
  if (y.k !== "corba") assert(T[y.k].indexOf(y.t) >= 0, y.ad + ": t=" + y.t);
  assert(/^[a-z0-9-]+$/.test(y.a), y.ad + ": a=" + y.a);
  assert(y.z.length >= 2, y.ad + ": z kısa");
  y.z.forEach(function (id) { assert(M[id], y.ad + ": bilinmeyen malzeme " + id); });
  if (y.y) { assert(y.k === "ana" && y.y.length); y.y.forEach(function (t) { assert(T.yan.indexOf(t) >= 0, y.ad + ": y=" + t); }); }
});
var sayi = {}; Y.forEach(function (y) { sayi[y.k] = (sayi[y.k] || 0) + 1; });
assert(Y.length >= 300 && sayi.corba >= 60 && sayi.ana >= 120 && sayi.yan >= 100, JSON.stringify(sayi));

// --- mevsim ---
assert.strictEqual(O.mevsim(new Date(2026, 0, 15)), "k");
assert.strictEqual(O.mevsim(new Date(2026, 3, 15)), "i");
assert.strictEqual(O.mevsim(new Date(2026, 6, 15)), "y");
assert.strictEqual(O.mevsim(new Date(2026, 9, 15)), "s");
assert.strictEqual(O.mevsim(new Date(2026, 11, 15)), "k");

// Her mevsimde her kategoride yeterince mevsimlik yemek olsun
["i", "y", "s", "k"].forEach(function (ms) {
  O.KATEGORILER.forEach(function (k) {
    var n = Y.filter(function (y) { return y.k === k && O.mevsimde(y, ms); }).length;
    assert(n >= 20, ms + "/" + k + " mevsimlik yemek az: " + n);
  });
});

// Mevsim yumuşak kısıt: kışın mevsim dışı yemekler seyrek ama sıfır değil
var r = rng(1), disi = 0, N = 3000;
for (var i = 0; i < N; i++) { if (!O.mevsimde(O.menu({ mevsim: "k", rnd: r }).ana, "k")) disi++; }
var anaDisiOran = Y.filter(function (y) { return y.k === "ana" && !O.mevsimde(y, "k"); }).length / sayi.ana;
assert(disi > 0, "mevsim dışı hiç çıkmadı (kısıt fazla sert)");
assert(disi / N < anaDisiOran * 0.6, "mevsim dışı çok sık: " + disi / N + " vs veri " + anaDisiOran);

// Kiler: patlıcan varken yazın patlıcanlı ana yemek daha sık
function patlicanli(kiler) {
  var r = rng(2), n = 0;
  for (var i = 0; i < N; i++) if (O.menu({ mevsim: "y", kiler: kiler, rnd: r }).ana.z.indexOf("patlican") >= 0) n++;
  return n;
}
assert(patlicanli({ patlican: true }) > patlicanli({}) * 1.5, "kiler etkisi yok");

// --- menü, başka, benzeri ---
r = rng(3);
for (i = 0; i < 300; i++) {
  var m = O.menu({ rnd: r });
  O.KATEGORILER.forEach(function (k) { assert(m[k] && m[k].k === k); });
  if (m.ana.y) assert(m.ana.y.indexOf(m.yan.t) >= 0, "uyumsuz yan: " + m.ana.ad + " + " + m.yan.ad);

  O.KATEGORILER.forEach(function (k) {
    var b = O.baska(m, k, { rnd: r });
    assert(b.k === k && b.ad !== m[k].ad);
    var v = O.benzeri(m, k, { rnd: r });
    var aile = Y.filter(function (y) { return y.k === k && y.a === m[k].a && y.ad !== m[k].ad; });
    if (aile.length) assert.strictEqual(v.a, m[k].a, "benzeri aileden çıkmadı: " + m[k].ad + " -> " + (v && v.ad));
    if (v) assert(v.k === k && v.ad !== m[k].ad);
  });
  var yeniYan = O.baska(m, "yan", { rnd: r });
  if (m.ana.y) assert(m.ana.y.indexOf(yeniYan.t) >= 0);
}

// Benzeri sistematik: aynı kartta art arda basınca tekrar yok, önce ailenin tamamı, aynı durumda aynı sıra
var pilav = Y.filter(function (y) { return y.ad === "Pirinç Pilavı"; })[0];
assert(pilav, "Pirinç Pilavı yok");
function zincir() {
  var m = { corba: Y[0], ana: O.adla["Kuru Fasulye"], yan: pilav }, gorulen = {}, sira = [];
  gorulen[pilav.ad] = true;
  for (var v; (v = O.benzeri(m, "yan", { mevsim: "k" }, gorulen)); ) { assert(!gorulen[v.ad], "tekrar: " + v.ad); gorulen[v.ad] = true; sira.push(v); m.yan = v; }
  return sira;
}
var z = zincir(), aileN = Y.filter(function (y) { return y.k === "yan" && y.a === pilav.a; }).length - 1;
assert(aileN >= 2 && z.length > aileN, "zincir kısa: " + z.length);
z.slice(0, aileN).forEach(function (v) { assert.strictEqual(v.a, pilav.a, "aile önce gelmeli: " + v.ad); });
assert.deepStrictEqual(zincir().map(function (v) { return v.ad; }), z.map(function (v) { return v.ad; }), "sıra rastgele");

// --- Eldekilerle ---
var E = function (kiler, rnd) { return { kiler: kiler, eldekiler: true, rnd: rnd || rng(7) }; };
// Bir çorbanın tüm malzemeleri evdeyse: eldekilerle çorba hep eksiksiz çıkar
var hedefCorba = O.adla["Mercimek Çorbası"], kilerC = {};
hedefCorba.z.forEach(function (id) { kilerC[id] = true; });
for (i = 0; i < 50; i++) assert.strictEqual(O.eksikler(O.menu(E(kilerC, rng(i))).corba, kilerC).length, 0, "eldekilerle eksiksiz çorba çıkmadı");
// Kiler boşken: en az eksikli kademe; Başka kademeyi sırayla tüketir (eksik sayısı hiç azalmaz)
var bos = {}, mE = O.menu(E(bos)), gor = {}, onceki = O.eksikler(mE.ana, bos).length;
var enAzAna = Math.min.apply(null, Y.filter(function (y) { return y.k === "ana"; }).map(function (y) { return O.eksikler(y, bos).length; }));
assert.strictEqual(onceki, enAzAna, "kiler boşken en az eksikli ana gelmedi");
gor[mE.ana.ad] = true;
for (i = 0; i < 40; i++) {
  var b2 = O.baska(mE, "ana", E(bos, rng(100 + i)), gor);
  var n2 = O.eksikler(b2, bos).length;
  assert(n2 >= onceki, "Başka eksik sayısını düşürdü: kademe atlandı");
  onceki = n2; gor[b2.ad] = true; mE.ana = b2;
}
// Benzeri eldekilerle: önerilen benzer, benzerler içinde en az eksikli olanlardan
var kilerB = { pirinc: true, sehriye: true };
var mB = { corba: Y[0], ana: O.adla["Kuru Fasulye"], yan: O.adla["Şehriyeli Pirinç Pilavı"] };
var vB = O.benzeri(mB, "yan", E(kilerB));
assert(vB && O.eksikler(vB, kilerB).length === 0, "eldekilerle benzeri eksiksiz değil: " + (vB && vB.ad));

// Hariç listesi saygı görür
var m0 = O.menu({ rnd: rng(4) });
var corbalar = Y.filter(function (y) { return y.k === "corba"; });
var kalan = corbalar.filter(function (c) { return c.ad !== m0.corba.ad; })[0];
var haric = {}; corbalar.forEach(function (c) { if (c !== kalan) haric[c.ad] = true; });
assert.strictEqual(O.baska(m0, "corba", { rnd: rng(5) }, haric).ad, kalan.ad);

// --- hafta + alışveriş ---
var kiler = { patates: true, nohut: true };
var plan = O.hafta({ rnd: rng(6), kiler: kiler });
assert.strictEqual(plan.length, 7);
var hepsi = {};
plan.forEach(function (m) { O.KATEGORILER.forEach(function (k) { assert(!hepsi[m[k].ad], "haftada tekrar: " + m[k].ad); hepsi[m[k].ad] = 1; }); });

var liste = O.alisveris(plan, kiler);
var listede = {}; liste.forEach(function (x) { listede[x.id] = 1; assert(!O.temelMi(x.id) && !kiler[x.id], x.id); assert(x.yemekler.length); });
plan.forEach(function (m) { O.KATEGORILER.forEach(function (k) { m[k].z.forEach(function (id) {
  if (!O.temelMi(id) && !kiler[id]) assert(listede[id], "listede eksik: " + id);
}); }); });

// --- fotoğraflar ---
var R = require("./resimler.js"), dosyalar = {};
Object.keys(R).forEach(function (ad) {
  assert(O.adla[ad], "resimler.js: bilinmeyen yemek " + ad);
  var f = __dirname + "/resim/" + R[ad];
  assert(fs.existsSync(f), "fotoğraf yok: " + R[ad]);
  assert(fs.statSync(f).size < 80 * 1024, "fotoğraf büyük: " + R[ad]);
  dosyalar[R[ad]] = 1;
});
if (fs.existsSync(__dirname + "/resim")) fs.readdirSync(__dirname + "/resim").forEach(function (f) {
  if (/\.jpg$/.test(f)) assert(dosyalar[f], "kullanılmayan fotoğraf: " + f);
});

var F = require("./fotolar.js");
Object.keys(F).forEach(function (ad) {
  assert(O.adla[ad], "fotolar.js: bilinmeyen yemek " + ad);
  assert(F[ad][0] > 0 && F[ad][0] % 1 === 0 && /^[a-z0-9-]+$/.test(F[ad][1]), "fotolar.js: " + ad);
});

// --- tarifler ---
var TR = JSON.parse(fs.readFileSync(__dirname + "/tarifler.json", "utf8"));
Object.keys(F).forEach(function (ad) {
  var t = TR[ad];
  assert(t && t.m.length && t.a.length, "tarif eksik: " + ad);
  t.m.concat(t.a).forEach(function (x) { assert(typeof x === "string" && x.length && !/<|&nbsp;|\(\(/.test(x), "tarif metni kirli: " + ad + ": " + x); });
});

// --- Safari 12: ?. ve ?? yok ---
["oneri.js", "index.html", "sw.js"].forEach(function (f) {
  if (!fs.existsSync(__dirname + "/" + f)) return;
  var s = fs.readFileSync(__dirname + "/" + f, "utf8");
  assert(!/\?\.[^\d]/.test(s) && s.indexOf("??") < 0, f + ": Safari 12 desteklemiyor (?. / ??)");
  assert(!/[^-]gap\s*:/.test(s), f + ": flex gap Safari 12'de yok");
});

console.log("OK", Y.length, "yemek", JSON.stringify(sayi), Object.keys(R).length, "yerel +", Object.keys(F).length, "yemek.com fotoğraflı");
