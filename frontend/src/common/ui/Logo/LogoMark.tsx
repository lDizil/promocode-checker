import mark from './mark.json'

export function LogoMark() {
  return (
    <svg
      width={mark.width}
      height={mark.height}
      viewBox={`0 0 ${mark.width} ${mark.height}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={mark.mark} fill="var(--color-primary)" />
      <path
        d={mark.check}
        fill="none"
        stroke="var(--color-highlight)"
        strokeWidth={mark.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
