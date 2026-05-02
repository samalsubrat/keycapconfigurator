'use client'

import React, { useState, useCallback } from 'react'
import InlineSVG, { defaultTheme, type SVGTheme } from './InlineSVG'

// ── Color swatch with label ─────────────────────────────────
interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-gray-600 truncate">{label}</span>
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
        <div
          className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
          style={{ backgroundColor: value }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[72px] text-xs font-mono px-1.5 py-1 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:border-gray-400"
      />
    </div>
  </div>
)

// ── Font selector ───────────────────────────────────────────
const fontOptions = [
  'Inter', 'Roboto', 'Noto Sans', 'Open Sans', 'Lato',
  'Poppins', 'Montserrat', 'Source Sans 3', 'Outfit', 'DM Sans',
  'IBM Plex Sans', 'Nunito', 'Rubik', 'Work Sans', 'Barlow',
]

const weightOptions = [
  { label: 'Light', value: 300 },
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'SemiBold', value: 600 },
  { label: 'Bold', value: 700 },
  { label: 'ExtraBold', value: 800 },
]

// ── Design Component ────────────────────────────────────────
const Design = () => {
  const [theme, setTheme] = useState<SVGTheme>({ ...defaultTheme })

  const updateTheme = useCallback((key: keyof SVGTheme, value: string | number) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetTheme = useCallback(() => {
    setTheme({ ...defaultTheme })
  }, [])

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* ── SVG Canvas ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <InlineSVG
          src="/FullPreview.svg"
          theme={theme}
          className="w-full"
        />
      </div>

      {/* ── Properties Panel ───────────────────────────────── */}
      <div className="w-60 bg-white border-l border-gray-300 overflow-y-auto flex-shrink-0">
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black">Properties</h2>
          <button
            onClick={resetTheme}
            className="text-xs text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Colors Section */}
        <div className="px-3 py-3 border-b border-gray-200 space-y-2.5">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Key Colors</h3>
          <ColorPicker
            label="Accent"
            value={theme.accentColor}
            onChange={(c) => updateTheme('accentColor', c)}
          />
          <ColorPicker
            label="Modifiers"
            value={theme.modifierColor}
            onChange={(c) => updateTheme('modifierColor', c)}
          />
          <ColorPicker
            label="Alphas"
            value={theme.alphaColor}
            onChange={(c) => updateTheme('alphaColor', c)}
          />
          <ColorPicker
            label="Navigation"
            value={theme.navColor}
            onChange={(c) => updateTheme('navColor', c)}
          />
        </div>

        {/* Typography Section */}
        <div className="px-3 py-3 space-y-2.5">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Typography</h3>

          {/* Font Family */}
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Font Family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme('fontFamily', e.target.value)}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {fontOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Font Weight */}
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Font Weight</label>
            <select
              value={theme.fontWeight}
              onChange={(e) => updateTheme('fontWeight', Number(e.target.value))}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {weightOptions.map((w) => (
                <option key={w.value} value={w.value}>{w.label} ({w.value})</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Design
