// Pop-art / soyut malzeme renk paleti — içecek anatomisinde her malzeme her
// üründe hep aynı karakteristik renkle çizilsin diye (gerçekçi değil,
// illüstratif: "Votka neden camgöbeği?" sorusu bu tarzda sorun değil).
export type IngredientColor = { name: string; color: string };

export const INGREDIENT_COLORS: IngredientColor[] = [
  // --- Berrak / beyaz spiritler ---
  { name: "Votka", color: "#8FEAE3" }, // buzlu camgöbeği
  { name: "Cin", color: "#2F6FFB" }, // elektrik mavisi
  { name: "Tekila", color: "#D6FF3D" }, // fosforlu limon yeşili
  { name: "Mezcal", color: "#A8C97A" }, // dumanlı adaçayı yeşili
  { name: "Rom", color: "#D9A066" }, // açık karamel
  { name: "Beyaz Rom", color: "#D9A066" },
  { name: "Triple Sec", color: "#FF8A3D" }, // portakal

  // --- Koyu spiritler ---
  { name: "Viski", color: "#B5651D" },
  { name: "Burbon", color: "#B5651D" },
  { name: "Konyak", color: "#8B4513" },
  { name: "Brendi", color: "#8B4513" },

  // --- Likörler ---
  { name: "Likör", color: "#D63384" },
  { name: "Baileys", color: "#F0DCC0" },
  { name: "Amaretto", color: "#C9862F" },
  { name: "Jägermeister", color: "#4A2E17" },
  { name: "Malibu", color: "#F5EFE0" },
  { name: "Çikolata", color: "#5C3A21" },

  // --- Şarap / bira ---
  { name: "Şarap", color: "#7A1030" },
  { name: "Beyaz Şarap", color: "#E8DFA0" },
  { name: "Bira", color: "#E8A33D" },

  // --- Kahve / süt ---
  { name: "Espresso", color: "#3B2317" },
  { name: "Kahve", color: "#3B2317" },
  { name: "Süt", color: "#FFF6E5" },
  { name: "Krema", color: "#FFF1D6" },

  // --- Su bazlı / mikserler ---
  { name: "Su", color: "#CFE8FF" },
  { name: "Soda", color: "#E8F6FF" },
  { name: "Maden Suyu", color: "#E8F6FF" },
  { name: "Tonik", color: "#CFEFE0" },
  { name: "Kola", color: "#3B2317" },

  // --- Meyve / şurup ---
  { name: "Portakal Suyu", color: "#FFA53D" },
  { name: "Limon", color: "#D4F229" },
  { name: "Limon Suyu", color: "#D4F229" },
  { name: "Nane", color: "#3DDC84" },
  { name: "Grenadin", color: "#E0264F" },
  { name: "Şurup", color: "#E0457B" },
];

const TR_FOLD: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (c) => TR_FOLD[c] ?? c)
    .trim();

/** Malzeme adına göre kanonik renk — önce tam eşleşme, sonra alt dize. */
export function matchIngredientColor(name: string): string | null {
  const n = norm(name);
  if (!n) return null;
  const exact = INGREDIENT_COLORS.find((i) => norm(i.name) === n);
  if (exact) return exact.color;
  const partial = INGREDIENT_COLORS.find(
    (i) => n.includes(norm(i.name)) || norm(i.name).includes(n),
  );
  return partial?.color ?? null;
}
