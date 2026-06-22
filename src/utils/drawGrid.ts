import type { PlotArea } from './chartConfig';

/**
 * Grid rendering configuration.
 */
export interface GridOptions {
  /** Number of horizontal grid lines (excluding the axis line itself) */
  horizontalLines: number;
  /** Number of vertical grid lines (excluding the axis line itself) */
  verticalLines: number;
  /** Grid line color */
  lineColor: string;
  /** Grid line width */
  lineWidth: number;
  /** Dash pattern for grid lines [dashLength, gapLength] */
  dashPattern: number[];
}

const DEFAULT_GRID_OPTIONS: GridOptions = {
  horizontalLines: 14,
  verticalLines: 20,
  lineColor: '#e2e2e2',
  lineWidth: 0.5,
  dashPattern: [3, 3],
};

/**
 * Draw dashed horizontal and vertical grid lines within the plot area.
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  plotArea: PlotArea,
  options: Partial<GridOptions> = {}
): void {
  const opts = { ...DEFAULT_GRID_OPTIONS, ...options };

  ctx.save();

  ctx.strokeStyle = opts.lineColor;
  ctx.lineWidth = opts.lineWidth;
  ctx.setLineDash(opts.dashPattern);

  // --- Horizontal grid lines ---
  for (let i = 1; i <= opts.horizontalLines; i++) {
    const y = plotArea.y + (plotArea.height / (opts.horizontalLines + 1)) * i;
    ctx.beginPath();
    ctx.moveTo(plotArea.x, y);
    ctx.lineTo(plotArea.x + plotArea.width, y);
    ctx.stroke();
  }

  // --- Vertical grid lines ---
  for (let i = 1; i <= opts.verticalLines; i++) {
    const x = plotArea.x + (plotArea.width / (opts.verticalLines + 1)) * i;
    ctx.beginPath();
    ctx.moveTo(x, plotArea.y);
    ctx.lineTo(x, plotArea.y + plotArea.height);
    ctx.stroke();
  }

  ctx.restore();
}
