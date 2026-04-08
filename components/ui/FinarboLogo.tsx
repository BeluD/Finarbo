/**
 * FinarboLogo — isotipo + wordmark oficial
 *
 * Isotipo:
 *  - Barra vertical:   20 × 64 u  (x=0, y=0)
 *  - Barra horizontal: 26 × 20 u  (x=32, y=0)   gap = 12 u
 *  - ViewBox: 0 0 58 64
 *  - Monocromático — color pasado por prop (default #FFFFFF)
 *
 * Wordmark: Inter 300, FINARBO, letter-spacing 0.12em
 */

interface FinarboLogoProps {
  /** Altura del isotipo en px. El wordmark escala proporcionalmente. */
  isotipoHeight?: number
  color?: string
  /** Si es false solo muestra el isotipo */
  showWordmark?: boolean
}

export default function FinarboLogo({
  isotipoHeight = 28,
  color = '#FFFFFF',
  showWordmark = true,
}: FinarboLogoProps) {
  // ViewBox nativo: 58 × 64 → escalar por altura deseada
  const w = (58 / 64) * isotipoHeight

  return (
    <span
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        gap:        `${isotipoHeight * 0.45}px`,
        lineHeight: 1,
      }}
    >
      {/* ── Isotipo ── */}
      <svg
        width={w}
        height={isotipoHeight}
        viewBox="0 0 58 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0, display: 'block' }}
      >
        {/* Barra vertical: 20 × 64 */}
        <rect x="0" y="0" width="20" height="64" fill={color} />
        {/* Barra horizontal: 26 × 20, offset x=32 (gap=12) */}
        <rect x="32" y="0" width="26" height="20" fill={color} />
      </svg>

      {/* ── Wordmark ── */}
      {showWordmark && (
        <span
          style={{
            fontFamily:    'var(--sans)',
            fontWeight:    300,
            fontSize:      `${isotipoHeight * 0.54}px`,
            letterSpacing: '0.12em',
            color,
            textTransform: 'uppercase',
            lineHeight:    1,
            userSelect:    'none',
          }}
        >
          FINARBO
        </span>
      )}
    </span>
  )
}
