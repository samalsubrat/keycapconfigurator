'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'

// ── Color/Font configuration ────────────────────────────────
export interface SVGTheme {
  // Key group colors (maps to cls-1, cls-3, cls-6, cls-7 in the SVG)
  accentColor: string      // cls-1: ESC, arrows, Enter-area keys (default: #d92830)
  modifierColor: string    // cls-3: F-keys, Ctrl/Alt/Super, numpad top (default: #1f7cca)
  alphaColor: string       // cls-6: main alphanumeric keys (default: #ffffff)
  navColor: string         // cls-7: nav cluster - Ins/Home/PgUp etc. (default: #fdc32c)
  // Typography
  fontFamily: string       // default: 'Inter'
  fontWeight: number       // default: 600
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
// Fetches the SVG file and injects it inline so we can manipulate its styles.
interface InlineSVGProps {
  src: string
  theme: SVGTheme
  className?: string
}

const InlineSVG: React.FC<InlineSVGProps> = ({ src, theme, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string | null>(null)

  // Fetch the SVG once
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

  // Inject the SVG and apply theme whenever content or theme changes
  useEffect(() => {
    if (!containerRef.current || !svgContent) return

    // Parse the SVG
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svg = doc.querySelector('svg')
    if (!svg) return

    // Make it responsive
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.style.display = 'block'

    // Apply color overrides to keycap paths
    applyColorOverrides(svg, theme)

    // Apply font overrides to all text elements
    applyFontOverrides(svg, theme)

    // Replace container content
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(svg)
  }, [svgContent, theme])

  return <div ref={containerRef} className={className} />
}

// ── Apply color overrides to SVG elements ───────────────────
function applyColorOverrides(svg: SVGSVGElement, theme: SVGTheme) {
  // Find the <style> element and rewrite the color values
  const styleEl = svg.querySelector('style')
  if (!styleEl) return

  let css = styleEl.textContent || ''

  // Replace cls-1 fill (accent)
  css = css.replace(
    /\.cls-1\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-1 {\n            fill: ${theme.accentColor}`
  )

  // Replace cls-3 fill (modifiers)
  css = css.replace(
    /\.cls-3\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-3 {\n            fill: ${theme.modifierColor}`
  )

  // Replace cls-6 fill (alpha)
  css = css.replace(
    /\.cls-6\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-6 {\n            fill: ${theme.alphaColor}`
  )

  // Replace cls-7 fill (nav)
  css = css.replace(
    /\.cls-7\s*\{[^}]*fill:\s*#[0-9a-fA-F]+/,
    `.cls-7 {\n            fill: ${theme.navColor}`
  )

  // Replace font-family
  css = css.replace(
    /font-family:\s*[^;]+/g,
    `font-family: ${theme.fontFamily}-SemiBold, ${theme.fontFamily}`
  )

  // Replace font-weight
  css = css.replace(
    /font-weight:\s*\d+/g,
    `font-weight: ${theme.fontWeight}`
  )

  // Replace font-variation-settings weight
  css = css.replace(
    /'wght'\s*\d+/g,
    `'wght' ${theme.fontWeight}`
  )

  styleEl.textContent = css
}

// ── Apply font overrides directly to text elements ──────────
function applyFontOverrides(svg: SVGSVGElement, theme: SVGTheme) {
  const texts = svg.querySelectorAll('text')
  texts.forEach((text) => {
    text.style.fontFamily = `${theme.fontFamily}, sans-serif`
    text.style.fontWeight = String(theme.fontWeight)
  })
}

// ── Exported component ──────────────────────────────────────
export { InlineSVG }
export default InlineSVG
