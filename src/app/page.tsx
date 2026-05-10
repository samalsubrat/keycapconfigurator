'use client'

import { useState, useCallback } from "react";
import LeftBar from "./components/LeftBar";
import MainArea from "./components/MainArea";
import { type LayerNode } from "./types";
import RightBar from "./components/RightBar";
import { defaultTheme, type SVGTheme } from "./components/InlineSVG";

export type PageId = 'design' | 'r1-r2' | 'r3-r4';

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('design');
  const [svgLayers, setSvgLayers] = useState<LayerNode[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<SVGTheme>({ ...defaultTheme });

  const handleLayersExtracted = useCallback((layers: LayerNode[]) => {
    setSvgLayers(layers);
  }, []);

  const handleHiddenIdsChange = useCallback((ids: Set<string>) => {
    setHiddenIds(ids);
  }, []);

  const handleThemeChange = useCallback((updated: SVGTheme) => {
    setTheme(updated);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftBar
        activePage={activePage}
        onPageChange={setActivePage}
        svgLayers={svgLayers}
        hiddenIds={hiddenIds}
        onHiddenIdsChange={handleHiddenIdsChange}
      />
      <MainArea
        activePage={activePage}
        onLayersExtracted={handleLayersExtracted}
        hiddenElementIds={hiddenIds}
        theme={theme}
      />
      <RightBar
        theme={theme}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}
