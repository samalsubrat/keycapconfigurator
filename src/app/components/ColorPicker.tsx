'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Eye, EyeOff, Minus } from 'lucide-react'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { ButtonGroup } from '@/components/ui/button-group'

// ─── Color conversion utilities ─────────────────────────────────────────

function hexToHSV(hex: string): { h: number; s: number; v: number } {
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + 6) % 6
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h *= 60
    }
    const s = max === 0 ? 0 : d / max
    return { h, s, v: max }
}

function hsvToHex(h: number, s: number, v: number): string {
    const c = v * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = v - c
    let r = 0, g = 0, b = 0
    if (h < 60) { r = c; g = x }
    else if (h < 120) { r = x; g = c }
    else if (h < 180) { g = c; b = x }
    else if (h < 240) { g = x; b = c }
    else if (h < 300) { r = x; b = c }
    else { r = c; b = x }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
    return (toHex(r) + toHex(g) + toHex(b)).toUpperCase()
}

function hueToRGB(h: number): string {
    return '#' + hsvToHex(h, 1, 1)
}

// ─── Draggable hook ─────────────────────────────────────────────────────

function useDrag(
    onDrag: (x: number, y: number, rect: DOMRect) => void,
) {
    const ref = useRef<HTMLDivElement>(null)

    const handlePointer = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        const el = ref.current
        if (!el) return
        el.setPointerCapture(e.pointerId)
        const rect = el.getBoundingClientRect()
        onDrag(e.clientX - rect.left, e.clientY - rect.top, rect)
    }, [onDrag])

    const handleMove = useCallback((e: React.PointerEvent) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        onDrag(e.clientX - rect.left, e.clientY - rect.top, rect)
    }, [onDrag])

    return { ref, onPointerDown: handlePointer, onPointerMove: handleMove }
}

// ─── Checkerboard pattern for opacity backgrounds ───────────────────────

const checkerStyle: React.CSSProperties = {
    backgroundImage: `
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%)
    `,
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
}

// ─── ColorPicker ───────────────────────────────────────────────────

interface ColorPickerProps {
    hex: string
    opacity: number
    onChange: (hex: string, opacity: number) => void
    className?: string
    hideOpacity?: boolean
}

const ColorPicker: React.FC<ColorPickerProps> = ({ hex, opacity, onChange, className, hideOpacity }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [hsv, setHsv] = useState(() => hexToHSV(hex))
    const popoverRef = useRef<HTMLDivElement>(null)

    // Sync hsv when hex prop changes externally
    useEffect(() => {
        setHsv(hexToHSV(hex))
    }, [hex])

    // Close popover on outside click
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    const updateFromHSV = useCallback((h: number, s: number, v: number) => {
        setHsv({ h, s, v })
        onChange(hsvToHex(h, s, v), opacity)
    }, [onChange, opacity])

    // ── Saturation/Value gradient drag ──
    const svDrag = useDrag(useCallback((x: number, y: number, rect: DOMRect) => {
        const s = Math.max(0, Math.min(1, x / rect.width))
        const v = Math.max(0, Math.min(1, 1 - y / rect.height))
        updateFromHSV(hsv.h, s, v)
    }, [hsv.h, updateFromHSV]))

    // ── Hue slider drag ──
    const hueDrag = useDrag(useCallback((x: number, _y: number, rect: DOMRect) => {
        const h = Math.max(0, Math.min(360, (x / rect.width) * 360))
        updateFromHSV(h, hsv.s, hsv.v)
    }, [hsv.s, hsv.v, updateFromHSV]))

    // ── Opacity slider drag ──
    const opacityDrag = useDrag(useCallback((x: number, _y: number, rect: DOMRect) => {
        const o = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)))
        onChange(hsvToHex(hsv.h, hsv.s, hsv.v), o)
    }, [hsv, onChange]))

    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v)
    const hueColor = hueToRGB(hsv.h)

    return (
        <div className={`relative ${className ?? ''}`} ref={popoverRef}>
            {/* ── Inline swatch + inputs row ──────────────────── */}
            <ButtonGroup className="h-8 flex w-full">
                {/* Hex input with color swatch */}
                <InputGroup className="h-8 flex-3 min-w-0">
                    <InputGroupAddon align="inline-start">
                        <button
                            type="button"
                            className="w-4 h-4 rounded-sm border border-gray-300 cursor-pointer shrink-0"
                            style={{ backgroundColor: `#${currentHex}`, opacity: opacity / 100 }}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Open color picker"
                        />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={currentHex}
                        onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
                            if (v.length === 6) onChange(v.toUpperCase(), opacity)
                        }}
                        className="font-mono text-xs"
                        maxLength={6}
                    />
                </InputGroup>

                {/* Opacity input */}
                {!hideOpacity && (
                <InputGroup className="h-8 flex-2 min-w-[60px]">
                    <InputGroupInput
                        value={opacity}
                        onChange={(e) => {
                            const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            onChange(currentHex, v)
                        }}
                        className="text-xs text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        type="number"
                        min={0}
                        max={100}
                    />
                    <InputGroupAddon align="inline-end" className="text-xs">%</InputGroupAddon>
                </InputGroup>
                )}
            </ButtonGroup>

            {/* ── Popover color picker ────────────────────────── */}
            {isOpen && (
                <div className="absolute top-10 right-0 z-50 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-3 space-y-2.5">

                    {/* Saturation/Value gradient */}
                    <div
                        {...svDrag}
                        ref={svDrag.ref}
                        className="relative w-full h-36 rounded cursor-crosshair select-none touch-none"
                        style={{
                            background: `
                                linear-gradient(to top, #000, transparent),
                                linear-gradient(to right, #fff, ${hueColor})
                            `,
                        }}
                    >
                        {/* Picker circle */}
                        <div
                            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none"
                            style={{
                                left: `${hsv.s * 100}%`,
                                top: `${(1 - hsv.v) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: `#${currentHex}`,
                            }}
                        />
                    </div>

                    {/* Hue slider */}
                    <div
                        {...hueDrag}
                        ref={hueDrag.ref}
                        className="relative w-full h-3 rounded-full cursor-pointer select-none touch-none"
                        style={{
                            background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                        }}
                    >
                        <div
                            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none top-1/2"
                            style={{
                                left: `${(hsv.h / 360) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: hueColor,
                            }}
                        />
                    </div>

                    {/* Opacity slider */}
                    <div className="relative w-full h-3 rounded-full overflow-hidden select-none touch-none" style={checkerStyle}>
                        <div
                            {...opacityDrag}
                            ref={opacityDrag.ref}
                            className="absolute inset-0 rounded-full cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, transparent, #${currentHex})`,
                            }}
                        >
                            <div
                                className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none top-1/2"
                                style={{
                                    left: `${opacity}%`,
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: `#${currentHex}`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Bottom hex + opacity row */}
                    <div className="flex gap-1.5 items-center">
                        <ButtonGroup className="h-8 flex w-full">
                            <InputGroup className="max-h-8 flex-3">
                                <InputGroupAddon align="inline-start" className="text-[10px] pl-2 pr-0">Hex</InputGroupAddon>
                                <InputGroupInput
                                    value={currentHex}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
                                        if (v.length === 6) onChange(v.toUpperCase(), opacity)
                                    }}
                                    className="font-mono text-xs"
                                    maxLength={6}
                                />
                            </InputGroup>
                            <InputGroup className="max-h-8 flex-2">
                                <InputGroupInput
                                    value={opacity}
                                    onChange={(e) => {
                                        const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                        onChange(currentHex, v)
                                    }}
                                    className="text-xs text-left pr-0"
                                    type="number"
                                    min={0}
                                    max={100}
                                />
                                <InputGroupAddon align="inline-end" className="pr-1.5 text-[10px]">%</InputGroupAddon>
                            </InputGroup>
                        </ButtonGroup>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ColorPicker
