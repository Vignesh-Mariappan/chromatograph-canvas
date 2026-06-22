import type { PlotArea } from './chartConfig';

/**
 * Axis definition — range and tick configuration.
 */
export interface AxisConfig {
  min: number;
  max: number;
  majorTick: number;
  minorTick: number;
  label: string;
}

/**
 * Styling options for axis rendering.
 */
export interface AxisStyle {
  /** Color of axis lines and ticks */
  axisColor: string;
  /** Color of tick labels */
  labelColor: string;
  /** Font for tick labels */
  labelFont: string;
  /** Font for axis title */
  titleFont: string;
  /** Length of major tick marks (px) */
  majorTickLength: number;
  /** Length of minor tick marks (px) */
  minorTickLength: number;
  /** Tick line width */
  tickWidth: number;
}

const DEFAULT_AXIS_STYLE: AxisStyle = {
  axisColor: '#aaaaaa',
  labelColor: '#666666',
  labelFont: '10px Inter, sans-serif',
  titleFont: '11px Inter, sans-serif',
  majorTickLength: 5,
  minorTickLength: 2,
  tickWidth: 0.8,
};

/**
 * Draw the X-axis (bottom) with tick marks and labels.
 */
export function drawXAxis(
  ctx: CanvasRenderingContext2D,
  plotArea: PlotArea,
  axis: AxisConfig,
  style: Partial<AxisStyle> = {}
): void {
  const s = { ...DEFAULT_AXIS_STYLE, ...style };
  const range = axis.max - axis.min;
  const bottom = plotArea.y + plotArea.height;

  ctx.save();
  ctx.strokeStyle = s.axisColor;
  ctx.lineWidth = s.tickWidth;
  ctx.setLineDash([]);
  ctx.fillStyle = s.labelColor;
  ctx.font = s.labelFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // --- Minor ticks ---
  for (let val = axis.min; val <= axis.max; val += axis.minorTick) {
    const x = plotArea.x + ((val - axis.min) / range) * plotArea.width;
    ctx.beginPath();
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, bottom + s.minorTickLength);
    ctx.stroke();
  }

  // --- Major ticks + labels ---
  for (let val = axis.min; val <= axis.max; val += axis.majorTick) {
    const x = plotArea.x + ((val - axis.min) / range) * plotArea.width;

    // Tick mark
    ctx.beginPath();
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, bottom + s.majorTickLength);
    ctx.stroke();

    // Label
    ctx.fillText(val.toString(), x, bottom + s.majorTickLength + 4);
  }

  // --- Axis title ---
  ctx.font = s.titleFont;
  ctx.fillStyle = s.labelColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(
    axis.label,
    plotArea.x + plotArea.width / 2,
    bottom + s.majorTickLength + 22
  );

  ctx.restore();
}

/**
 * Draw the Y-axis (left) with tick marks and labels.
 */
export function drawYAxis(
  ctx: CanvasRenderingContext2D,
  plotArea: PlotArea,
  axis: AxisConfig,
  style: Partial<AxisStyle> = {}
): void {
  const s = { ...DEFAULT_AXIS_STYLE, ...style };
  const range = axis.max - axis.min;

  ctx.save();
  ctx.strokeStyle = s.axisColor;
  ctx.lineWidth = s.tickWidth;
  ctx.setLineDash([]);
  ctx.fillStyle = s.labelColor;
  ctx.font = s.labelFont;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  // --- Minor ticks ---
  for (let val = axis.min; val <= axis.max; val += axis.minorTick) {
    // Y-axis is inverted: min at bottom, max at top
    const y = plotArea.y + plotArea.height - ((val - axis.min) / range) * plotArea.height;
    ctx.beginPath();
    ctx.moveTo(plotArea.x, y);
    ctx.lineTo(plotArea.x - s.minorTickLength, y);
    ctx.stroke();
  }

  // --- Major ticks + labels ---
  for (let val = axis.min; val <= axis.max; val += axis.majorTick) {
    const y = plotArea.y + plotArea.height - ((val - axis.min) / range) * plotArea.height;

    // Tick mark
    ctx.beginPath();
    ctx.moveTo(plotArea.x, y);
    ctx.lineTo(plotArea.x - s.majorTickLength, y);
    ctx.stroke();

    // Label
    ctx.fillText(val.toString(), plotArea.x - s.majorTickLength - 4, y);
  }

  // --- Axis title (rotated 90° CCW) ---
  ctx.save();
  ctx.font = s.titleFont;
  ctx.fillStyle = s.labelColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  const titleX = plotArea.x - 50;
  const titleY = plotArea.y + plotArea.height / 2;
  ctx.translate(titleX, titleY);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(axis.label, 0, 0);
  ctx.restore();

  ctx.restore();
}
