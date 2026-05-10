'use client'

import React from 'react'
import InlineSVG, { type SVGTheme } from './InlineSVG'
import { type LayerNode } from '../types'

// ── Props ───────────────────────────────────────────────────
interface DesignProps {
  onLayersExtracted?: (layers: LayerNode[]) => void
  hiddenElementIds?: Set<string>
  theme: SVGTheme
}

// ── Design Component ────────────────────────────────────────
const Design = ({ onLayersExtracted, hiddenElementIds, theme }: DesignProps) => {
  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* ── SVG Canvas ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <InlineSVG
          src="/FullPreview.svg"
          theme={theme}
          className="w-full"
          hiddenElementIds={hiddenElementIds}
          onLayersExtracted={onLayersExtracted}
        />
      </div>
    </div>
  )
}

export default Design
