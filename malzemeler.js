// Malzeme sözlüğü: id -> [ad, grup, mevsim]
// mevsim: i=ilkbahar, y=yaz, s=sonbahar, k=kış; "" = yıl boyu.
// "Temel" grubundakiler evde hep var sayılır: kilerde ve alışveriş listesinde gösterilmez.
var MALZEMELER = {
  // Temel
  tuz: ["Tuz", "Temel", ""], karabiber: ["Karabiber", "Temel", ""], pulbiber: ["Pul biber", "Temel", ""],
  sivi_yag: ["Sıvı yağ", "Temel", ""], zeytinyagi: ["Zeytinyağı", "Temel", ""], tereyagi: ["Tereyağı", "Temel", ""],
  salca: ["Salça", "Temel", ""], un: ["Un", "Temel", ""], sogan: ["Kuru soğan", "Temel", ""],
  sarimsak: ["Sarımsak", "Temel", ""], seker: ["Şeker", "Temel", ""], kuru_nane: ["Kuru nane", "Temel", ""],
  kimyon: ["Kimyon", "Temel", ""], sirke: ["Sirke", "Temel", ""],

  // Sebze
  domates: ["Domates", "Sebze", "ys"], sivri_biber: ["Sivri biber", "Sebze", "ys"], dolmalik_biber: ["Dolmalık biber", "Sebze", "ys"],
  kapya_biber: ["Kapya biber", "Sebze", "ys"], patlican: ["Patlıcan", "Sebze", "ys"], kabak: ["Kabak", "Sebze", "ys"],
  taze_fasulye: ["Taze fasulye", "Sebze", "y"], bamya: ["Bamya", "Sebze", "y"], misir: ["Mısır", "Sebze", "y"],
  salatalik: ["Salatalık", "Sebze", "iy"], borulce: ["Taze börülce", "Sebze", "y"], semizotu: ["Semizotu", "Sebze", "iy"],
  barbunya_taze: ["Taze barbunya", "Sebze", "y"], asma_yapragi: ["Asma yaprağı", "Sebze", "iy"],
  enginar: ["Enginar", "Sebze", "i"], bakla: ["Taze bakla", "Sebze", "i"], bezelye: ["Bezelye", "Sebze", ""],
  taze_sogan: ["Taze soğan", "Sebze", ""], marul: ["Marul", "Sebze", "ik"], roka: ["Roka", "Sebze", "isk"],
  ispanak: ["Ispanak", "Sebze", "ik"], pirasa: ["Pırasa", "Sebze", "sk"], kereviz: ["Kereviz", "Sebze", "sk"],
  lahana: ["Lahana", "Sebze", "sk"], kara_lahana: ["Kara lahana", "Sebze", "k"], karnabahar: ["Karnabahar", "Sebze", "sk"],
  brokoli: ["Brokoli", "Sebze", "sk"], bal_kabagi: ["Bal kabağı", "Sebze", "sk"], pancar: ["Pancar", "Sebze", "sk"],
  turp: ["Turp", "Sebze", "k"], mantar: ["Mantar", "Sebze", ""], patates: ["Patates", "Sebze", ""],
  havuc: ["Havuç", "Sebze", ""], maydanoz: ["Maydanoz", "Sebze", ""], dereotu: ["Dereotu", "Sebze", ""],
  taze_nane: ["Taze nane", "Sebze", ""], limon: ["Limon", "Sebze", ""], kirmizi_lahana: ["Kırmızı lahana", "Sebze", "sk"],
  yer_elmasi: ["Yer elması", "Sebze", "k"], sarimsak_taze: ["Taze sarımsak", "Sebze", "i"], isirgan: ["Isırgan", "Sebze", "i"],
  karisik_yesillik: ["Yeşillik (tere, roka vb.)", "Sebze", ""], kuskonmaz: ["Kuşkonmaz", "Sebze", "i"],

  // Bakliyat
  kirmizi_mercimek: ["Kırmızı mercimek", "Bakliyat", ""], yesil_mercimek: ["Yeşil mercimek", "Bakliyat", ""],
  nohut: ["Nohut", "Bakliyat", ""], kuru_fasulye: ["Kuru fasulye", "Bakliyat", ""], barbunya: ["Kuru barbunya", "Bakliyat", ""],
  kuru_borulce: ["Kuru börülce", "Bakliyat", ""], kuru_bakla: ["Kuru bakla", "Bakliyat", ""], mas: ["Maş fasulyesi", "Bakliyat", ""],

  // Et, tavuk, balık
  kiyma: ["Kıyma", "Et & Balık", ""], kusbasi: ["Kuşbaşı et", "Et & Balık", ""], kuzu: ["Kuzu eti", "Et & Balık", "i"],
  tavuk: ["Tavuk", "Et & Balık", ""], tavuk_gogsu: ["Tavuk göğsü", "Et & Balık", ""], tavuk_but: ["Tavuk but", "Et & Balık", ""],
  ciger: ["Ciğer", "Et & Balık", ""], sucuk: ["Sucuk", "Et & Balık", ""], pastirma: ["Pastırma", "Et & Balık", ""],
  kemik: ["Kemik / et suyu", "Et & Balık", ""], paca: ["Paça", "Et & Balık", "k"], iskembe: ["İşkembe", "Et & Balık", ""],
  hamsi: ["Hamsi", "Et & Balık", "k"], palamut: ["Palamut", "Et & Balık", "s"], levrek: ["Levrek", "Et & Balık", ""],
  cipura: ["Çipura", "Et & Balık", ""], somon: ["Somon", "Et & Balık", "sk"], uskumru: ["Uskumru", "Et & Balık", "s"],
  sardalya: ["Sardalya", "Et & Balık", "sk"], mezgit: ["Mezgit", "Et & Balık", "k"], ton: ["Ton balığı (konserve)", "Et & Balık", ""],
  karides: ["Karides", "Et & Balık", ""], midye: ["Midye", "Et & Balık", "sk"], kalamar: ["Kalamar", "Et & Balık", ""],

  // Süt ve yumurta
  yogurt: ["Yoğurt", "Süt & Yumurta", ""], sut: ["Süt", "Süt & Yumurta", ""], yumurta: ["Yumurta", "Süt & Yumurta", ""],
  beyaz_peynir: ["Beyaz peynir", "Süt & Yumurta", ""], kasar: ["Kaşar peyniri", "Süt & Yumurta", ""], lor: ["Lor peyniri", "Süt & Yumurta", ""],
  krema: ["Krema", "Süt & Yumurta", ""], suzme_yogurt: ["Süzme yoğurt", "Süt & Yumurta", ""], ayran: ["Ayran", "Süt & Yumurta", ""],

  // Tahıl ve hamur
  pirinc: ["Pirinç", "Tahıl & Hamur", ""], bulgur: ["Pilavlık bulgur", "Tahıl & Hamur", ""], ince_bulgur: ["Köftelik bulgur", "Tahıl & Hamur", ""],
  sehriye: ["Şehriye", "Tahıl & Hamur", ""], arpa_sehriye: ["Arpa şehriye", "Tahıl & Hamur", ""], makarna: ["Makarna", "Tahıl & Hamur", ""],
  eriste: ["Erişte", "Tahıl & Hamur", ""], yufka: ["Yufka", "Tahıl & Hamur", ""], manti: ["Mantı", "Tahıl & Hamur", ""],
  ekmek: ["Bayat ekmek", "Tahıl & Hamur", ""], bugday: ["Aşurelik buğday", "Tahıl & Hamur", ""], firik: ["Firik", "Tahıl & Hamur", ""],
  kuskus: ["Kuskus", "Tahıl & Hamur", ""], tarhana: ["Tarhana", "Tahıl & Hamur", ""], irmik: ["İrmik", "Tahıl & Hamur", ""],
  galeta_unu: ["Galeta unu", "Tahıl & Hamur", ""], kinoa: ["Kinoa", "Tahıl & Hamur", ""], misir_unu: ["Mısır unu", "Tahıl & Hamur", ""],

  // Meyve, kuruyemiş, diğer
  ceviz: ["Ceviz", "Kuruyemiş & Diğer", ""], cam_fistigi: ["Çam fıstığı", "Kuruyemiş & Diğer", ""], kus_uzumu: ["Kuş üzümü", "Kuruyemiş & Diğer", ""],
  badem: ["Badem", "Kuruyemiş & Diğer", ""], nar: ["Nar", "Kuruyemiş & Diğer", "sk"], nar_eksisi: ["Nar ekşisi", "Kuruyemiş & Diğer", ""],
  ayva: ["Ayva", "Kuruyemiş & Diğer", "sk"], erik: ["Yeşil erik", "Kuruyemiş & Diğer", "i"], kuru_erik: ["Kuru erik", "Kuruyemiş & Diğer", ""],
  kuru_kayisi: ["Kuru kayısı", "Kuruyemiş & Diğer", ""], elma: ["Elma", "Kuruyemiş & Diğer", "sk"], portakal: ["Portakal", "Kuruyemiş & Diğer", "k"],
  zeytin: ["Zeytin", "Kuruyemiş & Diğer", ""], tahin: ["Tahin", "Kuruyemiş & Diğer", ""], tursu: ["Turşu", "Kuruyemiş & Diğer", ""],
  hardal: ["Hardal", "Kuruyemiş & Diğer", ""], mayonez: ["Mayonez", "Kuruyemiş & Diğer", ""], misir_konserve: ["Konserve mısır", "Kuruyemiş & Diğer", ""],
  kuru_patlican: ["Kuru patlıcan", "Kuruyemiş & Diğer", ""], kuru_biber: ["Kuru biber", "Kuruyemiş & Diğer", ""], kuru_domates: ["Kuru domates", "Kuruyemiş & Diğer", ""]
};

if (typeof module !== "undefined") module.exports = MALZEMELER;
