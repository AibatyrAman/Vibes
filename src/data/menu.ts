// NOT: Ürün isimleri PDF'ten (orijinal). Fiyatlar YAKLAŞIK/placeholder.
// ingredients/allergens/abv/kcal/story alanları admin panelinde doldurulacak;
// şimdilik birkaç üründe örnek veri var ki bilgi kutusu stilleri test edilebilsin.

export type PriceVariant = { label: string; price: number };
/** tek fiyat (number) ya da varyantlar (Tek/Double, Kadeh/Şişe) */
export type Price = number | PriceVariant[];

export type Allergen = "süt" | "gluten" | "fındık" | "yumurta" | "soya";

/** İçecek Anatomisi — bardak tipi (hangi line-art çerçeve/maske). */
export type GlassType =
  | "rocks"
  | "highball"
  | "martini"
  | "coupe"
  | "wine"
  | "mug";
/** Bardak içinde aşağıdan yukarı dizilen renkli sıvı katmanı. */
export type DrinkLayer = { name: string; percent: number; color: string };
/** Bardağın ağzına eklenen jest/süsleme. */
export type Garnish =
  | "lemon"
  | "orange-peel"
  | "olive"
  | "mint"
  | "straw"
  | "coffee-bean"
  | "cherry";

export type Product = {
  /** DB satır id'si (seed verisinde yok) */
  id?: number;
  name: string;
  /** karttaki kısa satır */
  desc?: string;
  price: Price;
  isNew?: boolean;
  /** küçük damga, ör. "Şef" */
  tag?: string;
  /** indirim */
  onSale?: boolean;
  salePrice?: number;
  // --- bilgi kutusu alanları (hepsi opsiyonel) ---
  ingredients?: string[];
  allergens?: Allergen[];
  /** alkol oranı % */
  abv?: number;
  kcal?: number;
  /** "Hikâye ▸" ile açılan metin */
  story?: string;
  // --- içecek anatomisi (hepsi opsiyonel; glassType yoksa render edilmez) ---
  glassType?: GlassType;
  layers?: DrinkLayer[];
  garnishes?: Garnish[];
  /** yüklenen dekupe foto dosya adı; /api/media/<photo> ile servis edilir */
  photo?: string;
};

export type SubGroup = { label: string; items: Product[] };

export type Category = {
  id: string;
  title: string;
  kicker: string;
  accent: "navy" | "red";
  defaultOpen?: boolean;
  items?: Product[];
  groups?: SubGroup[];
  note?: string;
  /** bilgi kutusu sunum stili (kıyas için kategoriye göre) */
  infoStyle?: "modal" | "sheet" | "inline";
};

export const MENU: Category[] = [
  {
    id: "kahve",
    title: "Kahve",
    kicker: "Gün boyu · nitelikli çekirdek",
    accent: "navy",
    defaultOpen: true,
    infoStyle: "modal",
    items: [
      {
        name: "Espresso",
        desc: "Koyu krema, sert karakter.",
        price: [
          { label: "Tek", price: 90 },
          { label: "Double", price: 120 },
        ],
        ingredients: ["%100 arabica espresso (30 ml)"],
        kcal: 5,
        story:
          "9 bar basınç, 25 saniye. Günün tek-orijin çekirdeğinden, taze öğütülmüş.",
      },
      { name: "Americano", desc: "Espresso + sıcak su.", price: 100, kcal: 10 },
      { name: "Filter Coffee", desc: "Günün demlemesi.", price: 110, kcal: 5 },
      {
        name: "Latte",
        desc: "Espresso + buharlı süt.",
        price: 130,
        ingredients: ["çift shot espresso", "buharlı süt", "ince mikroköpük"],
        allergens: ["süt"],
        kcal: 120,
      },
      {
        name: "Matcha Latte",
        desc: "Japon matcha, buharlı süt.",
        price: 150,
        isNew: true,
        ingredients: ["seremoni matcha", "buharlı süt"],
        allergens: ["süt"],
        kcal: 140,
        story: "Uji bölgesinden tören sınıfı matcha; düşük acılık, canlı yeşil.",
      },
      {
        name: "Türk Kahvesi",
        desc: "Közde, bol köpük.",
        price: [
          { label: "Tek", price: 80 },
          { label: "Double", price: 110 },
        ],
        story: "Bakır cezvede, közde pişer. Yanında lokum ile servis.",
      },
      {
        name: "White Chocolate Mocha",
        desc: "Espresso, beyaz çikolata, süt.",
        price: 160,
        allergens: ["süt", "soya"],
        kcal: 320,
      },
      { name: "Mocha", desc: "Espresso, bitter çikolata, süt.", price: 150, allergens: ["süt"], kcal: 290 },
    ],
    note: "Özelleştir — Şuruplar: vanilya · karamel · beyaz çikolata · çikolata · çilek · Madagaskar vanilya · sade. Alternatif sütler: laktozsuz · yulaf · badem · soya · hindistan cevizi. + Extra shot.",
  },
  {
    id: "kokteyl",
    title: "Kokteyl",
    kicker: "Golden Hours · imza karışımlar",
    accent: "red",
    infoStyle: "sheet",
    items: [
      {
        name: "Negroni",
        desc: "Beefeater gin · campari · sweet vermouth",
        price: 500,
        tag: "Şef",
        ingredients: ["beefeater gin", "campari", "sweet vermouth", "portakal kabuğu"],
        abv: 24,
        story:
          "1919 Floransa: Kont Negroni, Americano'sunu sodayla değil cinle ister. Efsane böyle doğar.",
      },
      {
        name: "Aperol Spritz",
        desc: "Aperol · prosecco · soda",
        price: 500,
        isNew: true,
        ingredients: ["aperol", "prosecco", "soda", "portakal dilimi"],
        abv: 11,
        story: "Venedik usulü aperitif; hafif, acımsı-tatlı, gün batımı içkisi.",
      },
      {
        name: "Margarita",
        desc: "Olmeca silver tequila · triple sec · lime",
        price: 500,
        ingredients: ["olmeca silver tequila", "triple sec", "taze lime"],
        abv: 22,
      },
      { name: "Cosmopolitan", desc: "Votka · triple sec · cranberry · lime", price: 500, ingredients: ["votka", "triple sec", "cranberry", "lime"], abv: 20 },
      { name: "Whiskey Sour", desc: "Jameson · sweet & sour", price: 500, ingredients: ["jameson", "limon", "şeker şurubu", "yumurta akı"], allergens: ["yumurta"], abv: 18 },
      { name: "Gin Fizz", desc: "Beefeater gin · limon · şeker şurubu · soda", price: 500, abv: 16 },
      { name: "Mezcalita", desc: "Ojo de tigre mezcal · triple sec · lime", price: 600, abv: 23 },
      {
        name: "Long Island",
        desc: "Votka, cin, rom, tekila, triple sec · limon · kola",
        price: 600,
        ingredients: ["votka", "cin", "rom", "tekila", "triple sec", "limon", "kola"],
        abv: 22,
        story: "Beş beyaz içki tek bardakta — göründüğünden çok daha sinsi.",
      },
      { name: "Lynchburg", desc: "Jack Daniel's · triple sec", price: 500, abv: 18 },
    ],
  },
  {
    id: "spirits",
    title: "Spirits",
    kicker: "Kadeh & şişe · seçki",
    accent: "navy",
    infoStyle: "inline",
    groups: [
      {
        label: "Gin",
        items: [
          { name: "Beefeater", price: 350, abv: 40 },
          { name: "Beefeater Pink", price: 350, abv: 37 },
          { name: "Malfy", price: 360, abv: 41, story: "Amalfi limonuyla İtalyan cini; narenciye yoğun." },
          {
            name: "Hendrick's",
            price: 400,
            abv: 41,
            ingredients: ["salatalık", "gül yaprağı", "11 botanik"],
            story: "Salatalık ve gülle damıtılan İskoç cini; ferah, çiçeksi imza.",
          },
          { name: "Tanqueray", price: 380, abv: 43 },
        ],
      },
      {
        label: "Viski",
        items: [
          { name: "Chivas Regal 12", price: 380, abv: 40 },
          { name: "Chivas Regal 18", price: 650, abv: 40, story: "85 farklı tat notası; uzun, kadifemsi final." },
          { name: "Jameson", price: 350, abv: 40 },
          { name: "Jameson B. Barrel", price: 400, abv: 40 },
          { name: "Jack Daniel's", price: 380, abv: 40 },
          { name: "Glenlivet Founder's", price: 490, abv: 40 },
        ],
      },
      {
        label: "Tekila & Mezcal",
        items: [
          { name: "Olmeca Silver", price: 300, abv: 38 },
          { name: "Olmeca Altos", price: 350, abv: 40 },
          { name: "Ojo de Tigre", price: 380, abv: 42, story: "Agave + mezcal harmanı; hafif isli." },
        ],
      },
      {
        label: "Rom",
        items: [
          { name: "Havana Club 3", price: 300, abv: 40 },
          { name: "Havana Club 7", price: 350, abv: 40 },
          { name: "Bumbu", price: 550, abv: 40, story: "Karayip baharatlı rom; vanilya & tarçın." },
        ],
      },
      { label: "Votka", items: [{ name: "Absolut", price: 300, abv: 40 }] },
      {
        label: "Likör",
        items: [
          { name: "Baileys Irish", price: 350, abv: 17, allergens: ["süt"] },
          { name: "Baileys Choco", price: 350, abv: 17, allergens: ["süt"] },
          { name: "Malibu", price: 300, abv: 21 },
          { name: "Jägermeister", price: 390, abv: 35 },
        ],
      },
    ],
  },
  {
    id: "shot",
    title: "Shot",
    kicker: "Tek yudum",
    accent: "red",
    infoStyle: "modal",
    items: [
      { name: "B-52", price: 250, ingredients: ["kahve likörü", "baileys", "triple sec"], allergens: ["süt"], abv: 30 },
      { name: "Jägermeister", price: 230, abv: 35 },
      { name: "Olmeca", price: 200, abv: 38 },
      { name: "Absolut", price: 200, abv: 40 },
      { name: "Jameson", price: 220, abv: 40 },
      { name: "Beefeater", price: 200, abv: 40 },
      { name: "Bumbu", price: 250, abv: 40 },
    ],
  },
  {
    id: "bira",
    title: "Bira",
    kicker: "Fıçı & şişe",
    accent: "navy",
    infoStyle: "modal",
    items: [
      { name: "Carlsberg", price: 350, abv: 5, allergens: ["gluten"] },
      { name: "Tuborg Gold", price: 350, abv: 5.6, allergens: ["gluten"] },
      { name: "Corona", price: 380, abv: 4.5, allergens: ["gluten"] },
      { name: "Desperados", price: 380, abv: 5.9, allergens: ["gluten"] },
      { name: "Amsterdam", price: 350, abv: 5, allergens: ["gluten"] },
    ],
  },
  {
    id: "sarap",
    title: "Şarap",
    kicker: "Kadeh & şişe",
    accent: "red",
    infoStyle: "modal",
    items: [
      {
        name: "Blanc",
        desc: "Beyaz, taze.",
        price: [
          { label: "Kadeh", price: 200 },
          { label: "Şişe", price: 750 },
        ],
        abv: 12,
      },
      {
        name: "Miller",
        desc: "Kırmızı, dengeli.",
        price: [
          { label: "Kadeh", price: 250 },
          { label: "Şişe", price: 900 },
        ],
        abv: 13.5,
      },
    ],
  },
];
