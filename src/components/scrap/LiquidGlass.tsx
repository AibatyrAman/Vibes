/**
 * Aperitivo / spritz glass, paper-cut style. Red liquid (think Aperol/Campari)
 * fills the bowl in choppy steps; orange wheel + ice cube + straw on top.
 * Pure SVG + CSS.
 */
export default function LiquidGlass({ className = "" }: { className?: string }) {
  const fillStyle = {
    transformBox: "fill-box",
    transformOrigin: "bottom",
  } as const;

  return (
    <svg
      viewBox="0 0 200 230"
      className={className}
      role="img"
      aria-label="Aperitivo kadehi"
    >
      <defs>
        <clipPath id="bowlInner">
          <path d="M58 44 C58 104 142 104 142 44 Z" />
        </clipPath>
      </defs>

      {/* stem + foot */}
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="168"
        stroke="var(--color-ink)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <ellipse
        cx="100"
        cy="172"
        rx="36"
        ry="10"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="6"
      />

      {/* bowl fill (paper) */}
      <path d="M58 44 C58 104 142 104 142 44 Z" fill="var(--color-paper)" />

      {/* liquid */}
      <g clipPath="url(#bowlInner)">
        <rect
          className="animate-fill"
          style={fillStyle}
          x="56"
          y="44"
          width="88"
          height="62"
          fill="var(--color-red)"
        />
        {/* surface shimmer */}
        <rect x="56" y="50" width="88" height="5" fill="var(--color-red-pop)" />
      </g>

      {/* ice cube floating on top */}
      <rect
        x="80"
        y="52"
        width="22"
        height="22"
        rx="3"
        fill="var(--color-paper)"
        fillOpacity="0.55"
        stroke="var(--color-ink)"
        strokeWidth="3"
        style={{ rotate: "12deg", transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* bowl outline + rim (drawn over the liquid) */}
      <path
        d="M58 44 C58 104 142 104 142 44"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <ellipse
        cx="100"
        cy="44"
        rx="42"
        ry="9"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="6"
      />

      {/* straw */}
      <line
        x1="116"
        y1="58"
        x2="150"
        y2="14"
        stroke="var(--color-navy)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* orange wheel garnish on the rim */}
      <g style={{ rotate: "-10deg", transformBox: "fill-box", transformOrigin: "center" }}>
        <circle
          cx="132"
          cy="38"
          r="14"
          fill="var(--color-red-pop)"
          stroke="var(--color-ink)"
          strokeWidth="3"
        />
        <g stroke="var(--color-paper)" strokeWidth="2" strokeLinecap="round">
          <line x1="132" y1="38" x2="132" y2="26" />
          <line x1="132" y1="38" x2="142" y2="44" />
          <line x1="132" y1="38" x2="122" y2="44" />
        </g>
      </g>
    </svg>
  );
}
