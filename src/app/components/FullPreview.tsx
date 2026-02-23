'use client'

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { namespaceSvgClasses } from '@/lib/svg-utils'

export interface FullPreviewHandle {
  /** Returns the live SVG element for direct manipulation */
  getSvgElement: () => SVGSVGElement | null
  /** Serializes the current (possibly modified) SVG to a string */
  exportSvgString: () => string | null
  /** Triggers a download of the current SVG as a .svg file */
  downloadSvg: (filename?: string) => void
}

const FullPreview = forwardRef<FullPreviewHandle, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => {
    const svgContainerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch the SVG once and inject it into a separate DOM node
    useEffect(() => {
      let cancelled = false
      const container = svgContainerRef.current
      if (!container) return

      fetch('/FullPreview.svg')
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load SVG: ${res.status}`)
          return res.text()
        })
        .then((svgText) => {
          if (cancelled || !container) return

          // Parse & inject
          const parser = new DOMParser()
          const doc = parser.parseFromString(svgText, 'image/svg+xml')
          const svgEl = doc.querySelector('svg')

          if (!svgEl) {
            setError('Invalid SVG file')
            return
          }

          // Namespace classes to avoid collisions with other inline SVGs
          namespaceSvgClasses(svgEl, 'fp_')

          // Inject into the dedicated (non-React-managed) container
          container.innerHTML = ''
          container.appendChild(document.importNode(svgEl, true))
          setLoading(false)
        })
        .catch((err) => {
          if (!cancelled) setError(err.message)
        })

      return () => {
        cancelled = true
        if (container) container.innerHTML = ''
      }
    }, [])

    // --- imperative API ---------------------------------------------------

    const getSvgElement = useCallback((): SVGSVGElement | null => {
      return svgContainerRef.current?.querySelector('svg') ?? null
    }, [])

    const exportSvgString = useCallback((): string | null => {
      const svg = getSvgElement()
      if (!svg) return null
      const serializer = new XMLSerializer()
      return serializer.serializeToString(svg)
    }, [getSvgElement])

    const downloadSvg = useCallback(
      (filename = 'keycap-export.svg') => {
        const str = exportSvgString()
        if (!str) return
        const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },
      [exportSvgString],
    )

    useImperativeHandle(ref, () => ({ getSvgElement, exportSvgString, downloadSvg }), [
      getSvgElement,
      exportSvgString,
      downloadSvg,
    ])

    // --- render -----------------------------------------------------------

    if (error) return <div className={className}>Error: {error}</div>

    return (
      <div
        className={className}
        {...rest}
      >
        {loading && <span className="text-sm text-muted-foreground">Loading SVG...</span>}
        <div ref={svgContainerRef} className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain" />
      </div>
    )
  },
)

FullPreview.displayName = 'FullPreview'

export default FullPreview
