/**
 * Stop-motion ticker-tape. Two identical lines slide left and loop seamlessly;
 * the steps() marquee makes it clack along like a label printer.
 */
const ITEMS = [
  "KAHVEDEN KOKTEYLE",
  "GOLDEN HOURS",
  "ŞARAP",
  "BİRA",
  "ESPRESSO",
  "APERİTİVO",
  "08:00 — 20:00",
];

function Line() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden>
      {ITEMS.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-5 text-lg">{t}</span>
          <span className="text-red-pop">✶</span>
        </span>
      ))}
    </div>
  );
}

export default function Ticker({
  tone = "navy",
}: {
  tone?: "navy" | "red" | "ink";
}) {
  const tones = {
    navy: "bg-navy text-paper",
    red: "bg-red text-paper",
    ink: "bg-ink text-paper",
  };
  return (
    <div
      className={`overflow-hidden border-y-2 border-ink py-1.5 font-display uppercase tracking-wide ${tones[tone]}`}
    >
      <div className="flex w-max animate-marquee">
        <Line />
        <Line />
      </div>
    </div>
  );
}
