// NOT: Ürün isimleri PDF'ten (orijinal). Fiyatlar PDF metninde dağınık olduğu
// için YAKLAŞIK/placeholder — gerçek fiyatlar kullanıcı doğrulamasıyla güncellenecek.
// Her kategoride şimdilik temsilî ürünler var; tam liste sonraki turda doldurulacak.

export type PriceVariant = { label: string; price: number };
/** tek fiyat (number) ya da varyantlar (Tek/Double, Kadeh/Şişe) */
export type Price = number | PriceVariant[];

export type Product = {
  name: string;
  /** kokteyllerde malzeme listesi, kahvede kısa açıklama */
  desc?: string;
  price: Price;
  isNew?: boolean;
  /** küçük damga, ör. "Şef" */
  tag?: string;
};

/** Spirits gibi kategorilerde alt grup (Gin, Viski…) */
export type SubGroup = { label: string; items: Product[] };

export type Category = {
  id: string;
  title: string;
  kicker: string;
  accent: "navy" | "red";
  /** accordion başlangıçta açık mı */
  defaultOpen?: boolean;
  /** düz liste kategorileri */
  items?: Product[];
  /** alt-gruplu kategoriler (Spirits) */
  groups?: SubGroup[];
  /** kategori altı serbest not (Kahve "Özelleştir") */
  note?: string;
};

export const MENU: Category[] = [
  {
    id: "kahve",
    title: "Kahve",
    kicker: "Gün boyu · nitelikli çekirdek",
    accent: "navy",
    defaultOpen: true,
    items: [
      {
        name: "Espresso",
        desc: "Koyu krema, sert karakter.",
        price: [
          { label: "Tek", price: 90 },
          { label: "Double", price: 120 },
        ],
      },
      { name: "Americano", desc: "Espresso + sıcak su.", price: 100 },
      { name: "Filter Coffee", desc: "Günün demlemesi.", price: 110 },
      { name: "Latte", desc: "Espresso + buharlı süt.", price: 130 },
      { name: "Matcha Latte", desc: "Japon matcha, buharlı süt.", price: 150, isNew: true },
      {
        name: "Türk Kahvesi",
        desc: "Közde, bol köpük.",
        price: [
          { label: "Tek", price: 80 },
          { label: "Double", price: 110 },
        ],
      },
      { name: "White Chocolate Mocha", desc: "Espresso, beyaz çikolata, süt.", price: 160 },
      { name: "Mocha", desc: "Espresso, bitter çikolata, süt.", price: 150 },
    ],
    note: "Özelleştir — Şuruplar: vanilya · karamel · beyaz çikolata · çikolata · çilek · Madagaskar vanilya · sade. Alternatif sütler: laktozsuz · yulaf · badem · soya · hindistan cevizi. + Extra shot.",
  },
  {
    id: "kokteyl",
    title: "Kokteyl",
    kicker: "Golden Hours · imza karışımlar",
    accent: "red",
    items: [
      { name: "Negroni", desc: "Beefeater gin · campari · sweet vermouth", price: 500, tag: "Şef" },
      { name: "Aperol Spritz", desc: "Aperol · prosecco · soda", price: 500, isNew: true },
      { name: "Margarita", desc: "Olmeca silver tequila · triple sec · lime", price: 500 },
      { name: "Cosmopolitan", desc: "Votka · triple sec · cranberry · lime", price: 500 },
      { name: "Whiskey Sour", desc: "Jameson · sweet & sour", price: 500 },
      { name: "Gin Fizz", desc: "Beefeater gin · limon · şeker şurubu · soda", price: 500 },
      { name: "Mezcalita", desc: "Ojo de tigre mezcal · triple sec · lime", price: 600 },
      { name: "Long Island", desc: "Votka, cin, rom, tekila, triple sec · limon · kola", price: 600 },
      { name: "Lynchburg", desc: "Jack Daniel's · triple sec", price: 500 },
    ],
  },
  {
    id: "spirits",
    title: "Spirits",
    kicker: "Kadeh & şişe · seçki",
    accent: "navy",
    groups: [
      {
        label: "Gin",
        items: [
          { name: "Beefeater", price: 350 },
          { name: "Beefeater Pink", price: 350 },
          { name: "Malfy", price: 360 },
          { name: "Hendrick's", price: 400 },
          { name: "Tanqueray", price: 380 },
        ],
      },
      {
        label: "Viski",
        items: [
          { name: "Chivas Regal 12", price: 380 },
          { name: "Chivas Regal 18", price: 650 },
          { name: "Jameson", price: 350 },
          { name: "Jameson B. Barrel", price: 400 },
          { name: "Jack Daniel's", price: 380 },
          { name: "Glenlivet Founder's", price: 490 },
        ],
      },
      {
        label: "Tekila & Mezcal",
        items: [
          { name: "Olmeca Silver", price: 300 },
          { name: "Olmeca Altos", price: 350 },
          { name: "Ojo de Tigre", price: 380 },
        ],
      },
      {
        label: "Rom",
        items: [
          { name: "Havana Club 3", price: 300 },
          { name: "Havana Club 7", price: 350 },
          { name: "Bumbu", price: 550 },
        ],
      },
      { label: "Votka", items: [{ name: "Absolut", price: 300 }] },
      {
        label: "Likör",
        items: [
          { name: "Baileys Irish", price: 350 },
          { name: "Baileys Choco", price: 350 },
          { name: "Malibu", price: 300 },
          { name: "Jägermeister", price: 390 },
        ],
      },
    ],
  },
  {
    id: "shot",
    title: "Shot",
    kicker: "Tek yudum",
    accent: "red",
    items: [
      { name: "B-52", price: 250 },
      { name: "Jägermeister", price: 230 },
      { name: "Olmeca", price: 200 },
      { name: "Absolut", price: 200 },
      { name: "Jameson", price: 220 },
      { name: "Beefeater", price: 200 },
      { name: "Bumbu", price: 250 },
    ],
  },
  {
    id: "bira",
    title: "Bira",
    kicker: "Fıçı & şişe",
    accent: "navy",
    items: [
      { name: "Carlsberg", price: 350 },
      { name: "Tuborg Gold", price: 350 },
      { name: "Corona", price: 380 },
      { name: "Desperados", price: 380 },
      { name: "Amsterdam", price: 350 },
    ],
  },
  {
    id: "sarap",
    title: "Şarap",
    kicker: "Kadeh & şişe",
    accent: "red",
    items: [
      {
        name: "Blanc",
        desc: "Beyaz, taze.",
        price: [
          { label: "Kadeh", price: 200 },
          { label: "Şişe", price: 750 },
        ],
      },
      {
        name: "Miller",
        desc: "Kırmızı, dengeli.",
        price: [
          { label: "Kadeh", price: 250 },
          { label: "Şişe", price: 900 },
        ],
      },
    ],
  },
];
