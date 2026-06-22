import type { PlotArea } from './chartConfig';
import type { TracePoint } from '../data/chromatogramData';

/**
 * Trace rendering options.
 */
export interface TraceStyle {
  /** Stroke color for the curve line */
  strokeColor: string;
  /** Fill color for the area under the curve */
  fillColor: string;
  /** Line width for the curve stroke */
  lineWidth: number;
}

const DEFAULT_TRACE_STYLE: TraceStyle = {
  strokeColor: 'rgba(59, 130, 246, 0.8)',   // Blue
  fillColor: 'rgba(59, 130, 246, 0.12)',     // Light blue, semi-transparent
  lineWidth: 1.5,
};

/**
 * Convert a data point (x in data units, y in data units) to canvas pixel coordinates.
 */
function dataToPixel(
  point: TracePoint,
  plotArea: PlotArea,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): { px: number; py: number } {
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const px = plotArea.x + ((point.x - xMin) / xRange) * plotArea.width;
  // Y is inverted: data min maps to bottom (plotArea.y + height)
  const py = plotArea.y + plotArea.height - ((point.y - yMin) / yRange) * plotArea.height;

  return { px, py };
}

/**
 * Draw the chromatogram trace as a filled area chart.
 *
 * Renders straight line segments through all data points (sharp peaks) with a
 * semi-transparent fill from the trace down to the baseline (y=0).
 */
export function drawTrace(
  ctx: CanvasRenderingContext2D,
  plotArea: PlotArea,
  data: TracePoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  style: Partial<TraceStyle> = {}
): void {
  if (data.length < 2) return;

  const s = { ...DEFAULT_TRACE_STYLE, ...style };

  ctx.save();

  // Clip to the plot area so the trace doesn't bleed into margins
  ctx.beginPath();
  ctx.rect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
  ctx.clip();

  // --- Build the curve path ---
  const first = dataToPixel(data[0], plotArea, xMin, xMax, yMin, yMax);

  // Start the filled area from the baseline at the first x
  const baselineY = plotArea.y + plotArea.height;

  ctx.beginPath();
  ctx.moveTo(first.px, baselineY);
  ctx.lineTo(first.px, first.py);

  // Draw sharp straight lines through each data point
  for (let i = 1; i < data.length; i++) {
    const curr = dataToPixel(data[i], plotArea, xMin, xMax, yMin, yMax);
    ctx.lineTo(curr.px, curr.py);
  }

  // End at the last data point
  const last = dataToPixel(data[data.length - 1], plotArea, xMin, xMax, yMin, yMax);

  // Close the path back to the baseline for fill
  ctx.lineTo(last.px, baselineY);
  ctx.closePath();

  // Fill the area under the curve
  ctx.fillStyle = s.fillColor;
  ctx.fill();

  // --- Stroke the trace line (sharp segments, no baseline) ---
  ctx.beginPath();
  ctx.moveTo(first.px, first.py);

  for (let i = 1; i < data.length; i++) {
    const curr = dataToPixel(data[i], plotArea, xMin, xMax, yMin, yMax);
    ctx.lineTo(curr.px, curr.py);
  }

  ctx.lineTo(last.px, last.py);

  ctx.strokeStyle = s.strokeColor;
  ctx.lineWidth = s.lineWidth;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.restore();
}
