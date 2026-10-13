import type { ReactNode } from 'react';

const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS = ['1', '2', '3', '4'];

/** Zone ticks along one edge; on phones every other zone hides so labels keep their room. */
function Zones({ side, items }: { side: 'top' | 'bottom' | 'left' | 'right'; items: string[] }) {
  return (
    <div className={`a-zones a-zones-${side}`} aria-hidden="true">
      {items.map((z, i) => (
        <span key={z} className={i >= 4 ? 'a-zones-hide' : undefined}>
          {z}
        </span>
      ))}
    </div>
  );
}

export interface SheetInfo {
  id: string;
  no: string;
  title: string;
  /** Right-hand cell of the header strip, e.g. drawing type and sources. */
  meta?: ReactNode;
}

/** One drawing sheet: a frame with zone ticks, a header strip and the sheet body. */
export function Sheet({ sheet, children, header = true }: { sheet: SheetInfo; children: ReactNode; header?: boolean }) {
  return (
    <section
      className="a-sheet"
      id={sheet.id}
      aria-labelledby={header ? `${sheet.id}-h` : undefined}
      aria-label={header ? undefined : sheet.title}
      data-sheet={sheet.no}
    >
      <Zones side="top" items={COLUMNS} />
      <Zones side="left" items={ROWS} />
      <div className="a-sheet-body">
        {header && (
          <div className="a-strip">
            <span className="a-strip-no a-mono">{sheet.no}</span>
            <h2 className="a-strip-title" id={`${sheet.id}-h`}>
              {sheet.title}
            </h2>
            {sheet.meta && <div className="a-strip-meta a-label">{sheet.meta}</div>}
          </div>
        )}
        {children}
      </div>
      <Zones side="right" items={ROWS} />
      <Zones side="bottom" items={COLUMNS} />
    </section>
  );
}
