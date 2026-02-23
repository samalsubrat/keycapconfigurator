/**
 * Prefixes all CSS class names inside an inline SVG to prevent
 * collisions when multiple SVGs are injected into the same document.
 *
 * Rewrites both the `<style>` rules and every element's `class` attribute.
 */
export function namespaceSvgClasses(svg: SVGSVGElement, prefix: string): void {
  // 1. Rewrite <style> blocks: .cls-X  →  .{prefix}cls-X
  svg.querySelectorAll('style').forEach((styleEl) => {
    styleEl.textContent = (styleEl.textContent ?? '').replace(
      /\.cls-/g,
      `.${prefix}cls-`,
    )
  })

  // 2. Rewrite class attributes on every element
  svg.querySelectorAll('[class]').forEach((el) => {
    const original = el.getAttribute('class') ?? ''
    el.setAttribute(
      'class',
      original.replace(/\bcls-/g, `${prefix}cls-`),
    )
  })
}
