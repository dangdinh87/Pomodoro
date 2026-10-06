import { createElement, type ReactNode } from 'react';
import {
  TOMO_THEME_PALETTE,
  TOMO_TIGHT_VIEWBOX,
  TOMO_VIEWBOX,
  tomoNodes,
  type TomoFace,
  type TomoNode,
} from './tomo-art';

export type { TomoFace };

interface TomoProps {
  face?: TomoFace;
  /** Rendered square, in px. */
  size?: number;
  className?: string;
  /** Present: the mascot stands alone and carries meaning (role="img" + <title>). Absent: decorative (aria-hidden). */
  title?: string;
  /** Crop to the tomato, dropping the margin around it. For the logo and other tight spots. */
  tight?: boolean;
}

const camel = (attr: string) => attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function renderNode({ tag, attrs, children }: TomoNode, key: number): ReactNode {
  const props: Record<string, string | number> = { key };
  for (const [name, value] of Object.entries(attrs)) props[camel(name)] = value;
  return createElement(tag, props, children?.map(renderNode));
}

/**
 * Tomo, the tomato mascot. Drawn in code (see tomo-art.ts); colours come from the design tokens
 * (`--candy-tomato`, `--outline`, `--on-accent`), so it follows light and dark.
 * Reads at 24px (face and brows) up to 160px+. Outline gets heavier at small sizes.
 */
export function Tomo({ face = 'happy', size = 96, className, title, tight = false }: TomoProps) {
  const nodes = tomoNodes(face, TOMO_THEME_PALETTE, { strokeWidth: size <= 40 ? 5 : 3.5 });
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={tight ? TOMO_TIGHT_VIEWBOX : TOMO_VIEWBOX}
      width={size}
      height={size}
      className={className}
      data-face={face}
      {...(title ? { role: 'img' } : { 'aria-hidden': true, focusable: 'false' })}
    >
      {title ? <title>{title}</title> : null}
      {nodes.map(renderNode)}
    </svg>
  );
}
