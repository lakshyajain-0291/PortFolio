/**
 * Template 1 keeps its alternating left/right section rhythm: the side is
 * derived from the section's SECTION_NUMBERS value (0 = centred, odd = left,
 * even = right). Class names are spelled out in full for Tailwind's scanner.
 */
export type Side = 'center' | 'left' | 'right';

export const sideOf = (n: number): Side => (n === 0 ? 'center' : n % 2 === 0 ? 'right' : 'left');

export function align(n: number) {
  const side = sideOf(n);
  return {
    side,
    /** Positions the 80%-wide content column */
    block: side === 'center' ? 'mx-auto' : side === 'right' ? 'ml-auto mr-0' : 'mr-auto ml-0',
    /** Pushes an inline-sized element to the section's side */
    push: side === 'center' ? 'mx-auto' : side === 'right' ? 'ml-auto' : 'mr-auto',
    text: side === 'center' ? 'text-center' : side === 'right' ? 'text-right' : 'text-left',
    justify: side === 'center' ? 'justify-center' : side === 'right' ? 'justify-end' : 'justify-start',
    items: side === 'center' ? 'items-center' : side === 'right' ? 'items-end' : 'items-start',
    /** Direction content should slide in from */
    from: side === 'right' ? 'right' : side === 'left' ? 'left' : 'up',
  } as const;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
