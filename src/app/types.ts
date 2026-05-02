// ─── Shared types for the keycap configurator ──────────────

export interface LayerNode {
    id: string;
    name: string;
    type: 'group' | 'layer';
    children?: LayerNode[];
}

/** Map y-coordinate ranges (in SVG units) to row names */
const ROW_BOUNDARIES: { maxY: number; id: string; name: string }[] = [
    { maxY: 70,  id: 'fn-row',     name: 'R4 Keycaps (Function)' },
    { maxY: 155, id: 'num-row',    name: 'R4 Keycaps (Number)' },
    { maxY: 215, id: 'r3-row',     name: 'R3 Keycaps (QWERTY)' },
    { maxY: 260, id: 'r2-row',     name: 'R2 Keycaps (Caps)' },
    { maxY: 330, id: 'shift-row',  name: 'R1 Keycaps (Shift)' },
    { maxY: 500, id: 'r1-row',     name: 'R1 Keycaps (Bottom)' },
];

/** Classify a text element by its y-coordinate into a row group */
export function classifyRow(y: number): { id: string; name: string } {
    for (const b of ROW_BOUNDARIES) {
        if (y < b.maxY) return { id: b.id, name: b.name };
    }
    return { id: 'r1-row', name: 'R1 Keycaps (Bottom)' };
}

/** Extract the y-coordinate from an SVG transform="translate(x y)" string */
export function parseTranslateY(transform: string): number | null {
    // Handles: translate(123.45 67.89) or translate(123.45, 67.89)
    const m = transform.match(/translate\(\s*[\d.-]+[\s,]+([\d.-]+)\s*\)/);
    return m ? parseFloat(m[1]) : null;
}

/** Get readable text content from a <text> element */
export function getTextContent(el: Element): string {
    // Collect all text from <tspan> children or direct text
    const spans = el.querySelectorAll('tspan');
    if (spans.length > 0) {
        return Array.from(spans).map(s => s.textContent || '').join('');
    }
    return el.textContent?.trim() || '';
}

/**
 * Scan all <text> elements in an SVG, assign IDs, and build a LayerNode tree.
 * Also returns a flat map of elementId → DOM element for visibility toggling.
 */
export function extractLayersFromSVG(
    svg: SVGSVGElement
): { layers: LayerNode[]; elementMap: Map<string, Element> } {
    const texts = svg.querySelectorAll('text');
    const groups = new Map<string, { name: string; children: LayerNode[] }>();
    const elementMap = new Map<string, Element>();

    // Ensure stable row order
    for (const b of ROW_BOUNDARIES) {
        groups.set(b.id, { name: b.name, children: [] });
    }

    texts.forEach((text, idx) => {
        const transform = text.getAttribute('transform') || '';
        const y = parseTranslateY(transform);
        if (y === null) return;

        const content = getTextContent(text);
        if (!content.trim()) return;

        const row = classifyRow(y);
        const elId = `svg-text-${idx}`;

        // Tag the DOM element so we can find it later
        text.setAttribute('data-layer-id', elId);
        elementMap.set(elId, text);

        const group = groups.get(row.id);
        if (group) {
            group.children.push({
                id: elId,
                name: content,
                type: 'layer',
            });
        }
    });

    // Build layer tree (only include non-empty groups)
    const layers: LayerNode[] = [];
    for (const b of ROW_BOUNDARIES) {
        const g = groups.get(b.id);
        if (g && g.children.length > 0) {
            layers.push({
                id: b.id,
                name: g.name,
                type: 'group',
                children: g.children,
            });
        }
    }

    return { layers, elementMap };
}
