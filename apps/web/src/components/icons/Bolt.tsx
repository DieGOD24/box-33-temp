/** The BOX33 lightning bolt used as bullet/divider throughout the design. */
export function Bolt({
  width = 10,
  height = 16,
  fill = '#5C662F',
  className,
}: {
  width?: number
  height?: number
  fill?: string
  className?: string
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 22"
      fill={fill}
      aria-hidden="true"
      className={className}
    >
      <path d="M8.8 0 0 12.6h4.4L3.2 22 14 8.4H8.6L11.4 0Z" />
    </svg>
  )
}

/** Triple chevron ornament used next to section kickers. */
export function TripleChevron({ fill = '#5C662F' }: { fill?: string }) {
  return (
    <svg width="46" height="14" viewBox="0 0 46 14" aria-hidden="true">
      <path
        d="M1 1 L8 7 L1 13 H6 L13 7 L6 1 Z M17 1 L24 7 L17 13 H22 L29 7 L22 1 Z M33 1 L40 7 L33 13 H38 L45 7 L38 1 Z"
        fill={fill}
      />
    </svg>
  )
}
