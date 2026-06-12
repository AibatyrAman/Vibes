/**
 * Espresso cup, paper-cut style. Thick ink outlines, a liquid that fills in
 * choppy steps, lazy steam, a drop that falls in and scatters typewriter stars.
 * Pure SVG + CSS — no client JS needed.
 */
export default function LiquidCup({ className = "" }: { className?: string }) {
  const fillStyle = {
    transformBox: "fill-box",
    transformOrigin: "bottom",
  } as const;

  return (
    <svg
      viewBox="0 0 200 230"
      className={className}
      role="img"
      aria-label="Espresso fincanı"
    >
      <defs>
        <clipPath id="cupInner">
          <path d="M60 86 L140 86 L132 150 C132 161 68 161 68 150 Z" />
        </clipPath>
      </defs>

      {/* steam */}
      <g
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path
          className="animate-steam"
          style={{ transformBox: "fill-box", transformOrigin: "bottom", animationDelay: "0s" }}
          d="M86 60 C80 50 92 44 86 32"
        />
        <path
          className="animate-steam"
          style={{ transformBox: "fill-box", transformOrigin: "bottom", animationDelay: "0.8s" }}
          d="M114 60 C108 50 120 44 114 30"
        />
      </g>

      {/* falling drop + scattered typewriter stars */}
      <path
        className="animate-drop"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        d="M100 64 C103 70 106 73 106 77 A6 6 0 1 1 94 77 C94 73 97 70 100 64 Z"
        fill="var(--color-ink)"
      />
      {[
        { x: 70, y: 74, d: "0.1s" },
        { x: 130, y: 70, d: "0.5s" },
        { x: 112, y: 90, d: "0.9s" },
      ].map((s, i) => (
        <g
          key={i}
          className="animate-star"
          style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: s.d }}
          stroke="var(--color-red)"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`translate(${s.x} ${s.y})`}
        >
          <line x1="0" y1="-6" x2="0" y2="6" />
          <line x1="-5" y1="-3" x2="5" y2="3" />
          <line x1="-5" y1="3" x2="5" y2="-3" />
        </g>
      ))}

      {/* saucer */}
      <ellipse
        cx="100"
        cy="196"
        rx="74"
        ry="13"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="6"
      />

      {/* cup body */}
      <path
        d="M55 84 L62 150 C62 166 138 166 138 150 L145 84 Z"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* liquid (clipped to the cup interior, fills upward in steps) */}
      <g clipPath="url(#cupInner)">
        <rect
          className="animate-fill"
          style={fillStyle}
          x="58"
          y="86"
          width="84"
          height="78"
          fill="var(--color-espresso)"
        />
        {/* crema line */}
        <rect x="58" y="92" width="84" height="6" fill="var(--color-red)" opacity="0.55" />
      </g>

      {/* rim */}
      <ellipse
        cx="100"
        cy="84"
        rx="45"
        ry="9"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="6"
      />

      {/* handle */}
      <path
        d="M146 98 C176 98 176 138 146 134"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
