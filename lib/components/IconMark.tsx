import React from "react"

type Props = React.SVGProps<SVGSVGElement>

export function IconMark(props: Props) {
  const { className, ...rest } = props
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <g shapeRendering="geometricPrecision">
        {/* Diamond outline */}
        <path d="M32 4 60 32 32 60 4 32Z" stroke="currentColor" strokeWidth="4" />
        {/* V monogram */}
        <path d="M18 20 32 44 46 20" stroke="currentColor" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
      </g>
    </svg>
  )
}

export default IconMark

