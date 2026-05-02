'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { extractLayersFromSVG, type LayerNode } from '../types'

// ── Color/Font configuration ────────────────────────────────
export interface SVGTheme {
  accentColor: string      // cls-1: ESC, arrows, Enter-area keys
  modifierColor: string    // cls-3: F-keys, Ctrl/Alt/Super, numpad top
  alphaColor: string       // cls-6: main alphanumeric keys
  navColor: string         // cls-7: nav cluster - Ins/Home/PgUp etc.
  fontFamily: string
  fontWeight: number
}

export const defaultTheme: SVGTheme = {
  accentColor: '#d92830',
  modifierColor: '#1f7cca',
  alphaColor: '#ffffff',
  navColor: '#fdc32c',
  fontFamily: 'Inter',
  fontWeight: 600,
}

// ── InlineSVG component ─────────────────────────────────────
interface InlineSVGProps {
  src: string
  theme: SVGTheme
  className?: string
  hiddenElementIds?: Set<string>
  onLayersExtracted?: (layers: LayerNode[]) => void
}

const InlineSVG: React.FC<InlineSVGProps> = ({
  src, theme, className, hiddenElementIds, onLayersExtracted,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const elementMapRef = useRef<Map<string, Element>>(new Map())
  const layersExtractedRef = useRef(false)

  // Fetch SVG once
  useEffect(() => {
    let cancelled = false
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setSvgContent(text)
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [src])

  // Inject SVG and apply theme
  useEffect(() => {
    if (!containerRef.current || !svgContent) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svg = doc.querySelector('svg')
    if (!svg) return

    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.style.display = 'block'

    applyColorOverrides(svg, theme)
    applyFontOverrides(svg, theme)

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(svg)

    // Extract layers only once after first injection
    if (!layersExtractedRef.current && onLayersExtracted) {
      const { layers, elementMap } = extractLayersFromSVG(svg)
      elementMapRef.current = elementMap
      onLayersExtracted(layers)
      layersExtractedRef.current = true
    } else {
      // Re-tag elements for the new DOM
      retagElements(svg, elementMapRef.current)
    }
  }, [svgContent, theme, onLayersExtracted])

  // Apply visibility whenever hiddenElementIds changes
  useEffect(() => {
    if (!containerRef.current) return
    const svg = containerRef.current.querySelector('svg')
    if (!svg) return

    const allTagged = svg.querySelectorAll('[data-layer-id]')
    allTagged.forEach((el) => {
      const id = el.getAttribute('data-layer-id')
      if (!id) return
      const htmlEl = el as SVGElement
      if (hiddenElementIds?.has(id)) {
        htmlEl.style.display = 'none'
      } else {
        htmlEl.style.display = ''
      }
    })
  }, [hiddenElementIds])

  return <div ref={containerRef} className={className} />
}

// Re-tag elements after SVG re-injection (theme change)
function retagElements(svg: SVGSVGElement, oldMap: Map<string, Element>) {
  const texts = svg.querySelectorAll('text')
  const newMap = new Map<string, Element>()

  texts.forEach((text, idx) => {
    const elId = `svg-text-${idx}`
    text.setAttribute('data-layer-id', elId)
    newMap.set(elId, text)
  })

  // Update the ref in-place
  oldMap.clear()
  for (const [k, v] of newMap) oldMap.set(k, v)
}

function applyColorOverrides(svg: SVGSVGElement, theme: SVGTheme) {
  const styleEl = svg.querySelector('style')
  if (!styleEl) return
  let css = styleEl.textContent || ''

  css = css.replace(
    /\.cls-1\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-1 {\n            fill: ${theme.accentColor}`
  )
  css = css.replace(
    /\.cls-3\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-3 {\n            fill: ${theme.modifierColor}`
  )
  css = css.replace(
    /\.cls-6\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-6 {\n            fill: ${theme.alphaColor}`
  )
  css = css.replace(
    /\.cls-7\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-7 {\n            fill: ${theme.navColor}`
  )
  css = css.replace(
    /font-family:\s*[^;]+/g,
    `font-family: ${theme.fontFamily}-SemiBold, ${theme.fontFamily}`
  )
  css = css.replace(
    /font-weight:\s*\d+/g,
    `font-weight: ${theme.fontWeight}`
  )
  css = css.replace(
    /'wght'\s*\d+/g,
    `'wght' ${theme.fontWeight}`
  )
  styleEl.textContent = css
}

function applyFontOverrides(svg: SVGSVGElement, theme: SVGTheme) {
  const texts = svg.querySelectorAll('text')
  texts.forEach((text) => {
    text.style.fontFamily = `${theme.fontFamily}, sans-serif`
    text.style.fontWeight = String(theme.fontWeight)
  })
}

export { InlineSVG }
export default InlineSVG
