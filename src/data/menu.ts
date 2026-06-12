export type Product = {
  name: string;
  desc: string;
  /** Turkish Lira */
  price: number;
  isNew?: boolean;
  /** tiny stamp, e.g. "ŞEF" */
  tag?: string;
};

export type Category = {
  id: string;
  title: string;
  kicker: string;
  accent: "navy" | "red";
  items: Product[];
};

export const MENU: Category[] = [
  {
    id: "kahve",
    title: "Kahve",
    kicker: "Gün boyu · nitelikli çekirdek",
    accent: "navy",
    items: [
      { name: "Espresso", desc: "Tek shot, koyu krema, sert karakter.", price: 70 },
      { name: "Cortado", desc: "Espresso + az buharlı süt, dengeli.", price: 85 },
      {
        name: "Flat White",
        desc: "Çift shot, kadifemsi mikroköpük.",
        price: 110,
        isNew: true,
      },
      { name: "V60 Filtre", desc: "Elde demleme, günün tek-orijin çekirdeği.", price: 95 },
      { name: "Mocha", desc: "Espresso, bitter çikolata, buharlı süt.", price: 120 },
    ],
  },
  {
    id: "bira",
    title: "Bira",
    kicker: "Golden Hours · fıçı & şişe",
    accent: "red",
    items: [
      { name: "Taze Lager", desc: "Bol köpük, ferah, fıçıdan.", price: 130 },
      {
        name: "Sahibinden IPA",
        desc: "Tropik hop bombası, yüksek aroma.",
        price: 160,
        tag: "Şef",
      },
      { name: "Ekşi Sour", desc: "Meyveli, canlı, hafif ekşi final.", price: 150 },
      { name: "Koyu Stout", desc: "Kavrulmuş malt, kakao & kahve notası.", price: 155 },
    ],
  },
  {
    id: "aperitivo",
    title: "Aperitivo",
    kicker: "17:00 — 20:00 · İtalyan usulü",
    accent: "red",
    items: [
      {
        name: "Aperol Spritz",
        desc: "Aperol, prosecco, soda, portakal dilimi.",
        price: 180,
        isNew: true,
      },
      {
        name: "Negroni",
        desc: "Cin, kırmızı vermut, Campari. Klasik.",
        price: 200,
        tag: "Şef",
      },
      { name: "Americano", desc: "Campari, kırmızı vermut, soda.", price: 175 },
      { name: "Kadeh Şarap", desc: "Kırmızı / beyaz — günün seçkisi.", price: 160 },
      { name: "Vermouth Tonik", desc: "Kırmızı vermut, tonik, limon kabuğu.", price: 165 },
    ],
  },
];
