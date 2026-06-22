import type { PlotArea } from './chartConfig';
import type { PeakAnnotation } from '../data/peakAnnotations';
import { ANNOTATION_COLORS } from '../data/peakAnnotations';
import type { PeakDefinition } from '../data/chromatogramData';

/** Label box dimensions (in CSS pixels) */
const LABEL = {
  width: 14,        // rectangle width (thin bar)
  height: 80,       // fixed label height — always drawn above the peak apex
  gapAbovePeak: 4,  // gap between peak apex and bottom of the label
  fontSize: 9,
  font: 'Inter, sans-serif',
};

/**
 * Convert retention time → canvas pixel x.
 */
function rtToPixelX(rt: number, plotArea: PlotArea, xMin: number, xMax: number): number {
  return plotArea.x + ((rt - xMin) / (xMax - xMin)) * plotArea.width;
}

/**
 * Convert signal value → canvas pixel y (inverted — low signal = bottom).
 */
function signalToPixelY(signal: number, plotArea: PlotArea, yMin: number, yMax: number): number {
  return plotArea.y + plotArea.height - ((signal - yMin) / (yMax - yMin)) * plotArea.height;
}

/**
 * Draw a single annotation label ABOVE the peak apex.
 *
 * Layout (top → bottom):
 *   [ circle icon ]
 *   [ ─────────── ]  ← top of colored rectangle
 *   [ rotated     ]
 *   [ compound    ]  ← compound name only
 *   [ name text   ]
 *   [ ─────────── ]  ← bottom of rectangle (sits just above peak apex)
 *   ↕ gapAbovePeak
 *   ★ peak apex
 *   |               ← dashed line continues down to baseline
 *   ─ baseline
 */
function drawAnnotationLabel(
  ctx: CanvasRenderingContext2D,
  ann: PeakAnnotation,
  cx: number,
  peakApexY: number,
  baselineY: number,
): void {
  const colors = ANNOTATION_COLORS[ann.status];

  // The label sits ABOVE the peak apex
  const boxBottom = peakApexY - LABEL.gapAbovePeak;
  const boxTop = boxBottom - LABEL.height;
  const boxLeft = cx - LABEL.width / 2;

  // --- Colored rectangle ---
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 0.8;

  const r = 3;
  ctx.beginPath();
  // top-left → top-right (rounded top corners)
  ctx.moveTo(boxLeft + r, boxTop);
  ctx.lineTo(boxLeft + LABEL.width - r, boxTop);
  ctx.arcTo(boxLeft + LABEL.width, boxTop, boxLeft + LABEL.width, boxTop + r, r);
  // right side → bottom-right → bottom-left → left side
  ctx.lineTo(boxLeft + LABEL.width, boxBottom);
  ctx.lineTo(boxLeft, boxBottom);
  ctx.lineTo(boxLeft, boxTop + r);
  ctx.arcTo(boxLeft, boxTop, boxLeft + r, boxTop, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- Compound name only — rotated 90° CCW inside the rectangle ---
  const textCenterY = (boxTop + boxBottom) / 2;

  ctx.save();
  ctx.translate(cx, textCenterY);
  ctx.rotate(-Math.PI / 2); // text reads upward (bottom-to-top)

  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${LABEL.fontSize}px ${LABEL.font}`;
  ctx.fillText(ann.compoundName, 0, 0);

  ctx.restore();
}

/**
 * Draw all peak annotation labels on the chromatogram.
 *
 * Labels are drawn above each annotated peak — the peak triangle itself
 * remains fully visible below the label.
 */
export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  plotArea: PlotArea,
  annotations: PeakAnnotation[],
  peaks: PeakDefinition[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): void {
  ctx.save();

  // Build a lookup of rt → peak height
  const peakHeightMap = new Map<number, number>();
  for (const p of peaks) {
    peakHeightMap.set(p.rt, p.height);
  }

  const baselineY = signalToPixelY(yMin + 0.5, plotArea, yMin, yMax);

  const sorted = [...annotations].sort((a, b) => a.rt - b.rt);

  for (const ann of sorted) {
    const cx = rtToPixelX(ann.rt, plotArea, xMin, xMax);
    const peakHeight = peakHeightMap.get(ann.rt) ?? 10;
    // Peak apex pixel y — the very tip of the triangular spike
    const peakApexY = signalToPixelY(peakHeight + 0.5, plotArea, yMin, yMax);

    console.log('ann ', ann, cx, peakApexY, baselineY)
    drawAnnotationLabel(ctx, ann, cx, peakApexY, baselineY);
  }

  ctx.restore();
}
