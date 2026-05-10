'use client'

import { SetStateAction, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from "@/components/ui/button-group"
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { AlignCenterHorizontal, AlignCenterVertical, AlignEndVertical, AlignStartVertical, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, Bold, ChevronDown, Eye, EyeOff, FlipHorizontal2, FlipVertical2, Italic, Minus, Plus, RotateCwSquare, TextAlignCenter, TextAlignEnd, TextAlignStart, Underline, VectorSquare } from 'lucide-react'
import ColorPicker from './ColorPicker'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type SVGTheme } from './InlineSVG'

// ── Helper: strip/add # prefix for hex conversion ──────────
const stripHash = (c: string) => c.replace('#', '').toUpperCase()
const addHash = (c: string) => c.startsWith('#') ? c : `#${c.toLowerCase()}`

interface RightBarProps {
  theme: SVGTheme
  onThemeChange: (theme: SVGTheme) => void
}

const RightBar = ({ theme, onThemeChange }: RightBarProps) => {
  const [fillHex, setFillHex] = useState('000000')
  const [fillOpacity, setFillOpacity] = useState(100)
  const [fillVisible, setFillVisible] = useState(true)
  const language = ["English", "Hindi", "German", "Japanese", "Chinese"]
  const icons = ["Arrow Left", "Arrow Right", "Chevron Left", "Chevron Right", "Down"]
  const fontSize = [12, 14, 16, 20, 24, 28, 32]

  // Update a single theme key
  const updateColor = (key: keyof SVGTheme, hex: string) => {
    onThemeChange({ ...theme, [key]: addHash(hex) })
  }

  return (
    <>
      <div className='bg-white w-64 border-l border-gray-300 h-dvh rounded-lg shadow-lg'>

        <div className='space-y-2  p-3 border-b border-gray-300'>
          <h1 className='text-black font-semibold text-sm'>Position</h1>

          <div className='flex justify-between '>
            {/* Left  */}
            <ButtonGroup className='h-8'>
              <Button variant="outline" size="sm">
                <AlignStartVertical />
              </Button>
              <Button variant="outline" size="sm">
                <AlignCenterVertical />
              </Button>
              <Button variant="outline" size="sm">
                <AlignEndVertical />
              </Button>
            </ButtonGroup>

            {/* Right  */}
            <ButtonGroup className='h-8'>
              <Button variant="outline" size="sm">
                <AlignVerticalJustifyStart />
              </Button>
              <Button variant="outline" size="sm">
                <AlignCenterHorizontal />
              </Button>
              <Button variant="outline" size="sm">
                <AlignVerticalJustifyEnd />
              </Button>
            </ButtonGroup>
          </div>

          {/* X and Y  */}
          <div className='flex gap-1.5 justify-between max-w-full'>
            <InputGroup className='max-h-8'>
              <InputGroupInput id="inline-start-input" placeholder="333" />
              <InputGroupAddon align="inline-start">
                X
              </InputGroupAddon>
            </InputGroup>

            <InputGroup className='max-h-8'>
              <InputGroupInput id="inline-start-input" placeholder="666" />
              <InputGroupAddon align="inline-start">
                Y
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Radius */}
          <div className='flex gap-1.5 justify-between max-w-full items-center'>
            <InputGroup className='overflow-hidden h-8'>
              <InputGroupInput id="inline-start-input" placeholder="90" />
              <InputGroupAddon align="inline-start" className='h-5' >
                <img src="/Angle.svg" className='text-muted-foreground max-h-full' style={{ filter: 'invert(0.5)' }} />
              </InputGroupAddon>
            </InputGroup>

            <ButtonGroup className='h-full'>
              <Button variant="outline" size="sm">
                <RotateCwSquare />
              </Button>
              <Button variant="outline" size="sm">
                <FlipHorizontal2 />
              </Button>
              <Button variant="outline" size="sm">
                <FlipVertical2 />
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* Layout  */}
        <div className='space-y-2  p-3  border-b border-gray-300'>
          <h1 className='text-black font-semibold text-sm'>Layout</h1>
          {/* X and Y  */}
          <div className='flex gap-1.5 justify-between max-w-full'>
            <InputGroup className='max-h-8'>
              <InputGroupInput id="inline-start-input" placeholder="333" />
              <InputGroupAddon align="inline-start">
                W
              </InputGroupAddon>
            </InputGroup>

            <InputGroup className='max-h-8'>
              <InputGroupInput id="inline-start-input" placeholder="666" />
              <InputGroupAddon align="inline-start">
                H
              </InputGroupAddon>
            </InputGroup>

            <Button variant="ghost" size="sm">
              <VectorSquare />
            </Button>
          </div>
        </div>


        {/* Fill  */}
        <div className='space-y-2  p-3  border-b border-gray-300'>
          <div className='flex justify-between'>
            <h1 className='text-black font-semibold text-sm'>Fill</h1>
            <Button variant="ghost" size="xs">
              <Plus className="size-4" />
            </Button>
          </div>
          {/* Color and opacity */}
          <div className='flex justify-between max-w-full items-center gap-1.5 -mt-2'>
            <ColorPicker
              hex={fillHex}
              opacity={fillOpacity}
              onChange={(h: SetStateAction<string>, o: SetStateAction<number>) => { setFillHex(h); setFillOpacity(o) }}
            />
            <div className='flex shrink-0'>
              <Button variant="ghost" size="xs" onClick={() => setFillVisible(!fillVisible)}>
                {fillVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </Button>
              <Button variant="ghost" size="xs">
                <Minus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Key colors */}
          <div className="space-y-1.5">
            <h3 className="text-black font-semibold text-sm -mb-1 mt-2">Key Colors</h3>
            <div className="grid grid-cols-2 items-center">
              <p className="text-xs text-muted-foreground col-span-1">Accent</p>
              <ColorPicker
                hex={stripHash(theme.accentColor)}
                opacity={100}
                onChange={(h) => updateColor('accentColor', h)}
                className="col-span-1"
                hideOpacity
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <p className="text-xs text-muted-foreground col-span-1">Modifiers</p>
              <ColorPicker
                hex={stripHash(theme.modifierColor)}
                opacity={100}
                onChange={(h) => updateColor('modifierColor', h)}
                className="col-span-1"
                hideOpacity
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <p className="text-xs text-muted-foreground col-span-1">Alphas</p>
              <ColorPicker
                hex={stripHash(theme.alphaColor)}
                opacity={100}
                onChange={(h) => updateColor('alphaColor', h)}
                className="col-span-1"
                hideOpacity
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <p className="text-xs text-muted-foreground col-span-1">Navigation</p>
              <ColorPicker
                hex={stripHash(theme.navColor)}
                opacity={100}
                onChange={(h) => updateColor('navColor', h)}
                className="col-span-1"
                hideOpacity
              />
            </div>
          </div>

        </div>

        {/* Typography  */}
        <div className='space-y-2  p-3 border-b border-gray-300'>
          <h1 className='text-black font-semibold text-sm'>Typography</h1>

          {/* font family  */}
          <Combobox items={language} defaultValue="English">
            <div className='relative' >
              <span className='absolute top-1 left-3 text-xs text-muted-foreground z-10'>Font Family</span>
              <ComboboxInput placeholder="Select a language" className='h-12 [&_input]:pt-4 hover:bg-gray-100' />
            </div>
            <ComboboxContent >
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {/* font properties */}
          <div className='grid grid-cols-2 gap-1.5 justify-between max-w-full'>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className='font-normal text-start'>Medium <ChevronDown className='text-muted-foreground ' /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='bottom' align='start' className='w-fit'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Font weight</DropdownMenuLabel>
                  <DropdownMenuItem>Normal</DropdownMenuItem>
                  <DropdownMenuItem>Medium</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Combobox items={fontSize} defaultValue='12'>
              <ComboboxInput placeholder="28" />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className='flex justify-between '>
            {/* Left  */}
            <ButtonGroup className='h-8'>
              <Button variant="outline" size="sm">
                <Bold />
              </Button>
              <Button variant="outline" size="sm">
                <Italic />
              </Button>
              <Button variant="outline" size="sm">
                <Underline />
              </Button>
            </ButtonGroup>

            {/* Right  */}
            <ButtonGroup className='h-8'>
              <Button variant="outline" size="sm">
                <TextAlignStart />
              </Button>
              <Button variant="outline" size="sm">
                <TextAlignCenter />
              </Button>
              <Button variant="outline" size="sm">
                <TextAlignEnd />
              </Button>
            </ButtonGroup>
          </div>

        </div>

        {/* Icons  */}
        <div className='space-y-2  p-3 border-b border-gray-300'>
          <h1 className='text-black font-semibold text-sm'>Icons</h1>

          {/* icons selector  */}
          <Combobox items={icons} defaultValue="Arrow Left">
            <div className='relative' >
              <span className='absolute top-1 left-3 text-xs text-muted-foreground z-10'>Select an Icon</span>
              <ComboboxInput placeholder="Select a language" className='h-12 [&_input]:pt-4 hover:bg-gray-100' />
            </div>
            <ComboboxContent >
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>


          {/* Buttons for thickness  */}
          <ButtonGroup className='h-8 grid grid-cols-3 w-full'>
            <Button variant="outline" size="sm">
              Solid
            </Button>
            <Button variant="outline" size="sm">
              Regular
            </Button>
            <Button variant="outline" size="sm">
              Light
            </Button>
          </ButtonGroup>

          <div className='p-7 w-full rounded-sm border border-gray-300 '></div>
        </div>

        <div className='p-3'>
          <Button className='w-full'>
            Add to Cart
          </Button>
        </div>
      </div>
    </>
  )
}

export default RightBar