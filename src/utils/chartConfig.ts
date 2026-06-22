/**
 * Chart layout and rendering configuration.
 * These margins define the plot area within the canvas.
 */

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Default margins (in CSS pixels) to reserve space for axes and labels */
export const CHART_MARGINS: ChartMargins = {
  top: 10,    // extra room for annotation labels above peaks
  right: 10,
  bottom: 50,
  left: 65,
};

/**
 * Compute the drawable plot area given the full canvas size and margins.
 */
export function getPlotArea(
  canvasWidth: number,
  canvasHeight: number,
  margins: ChartMargins = CHART_MARGINS
): PlotArea {
  return {
    x: margins.left,
    y: margins.top,
    width: canvasWidth - margins.left - margins.right,
    height: canvasHeight - margins.top - margins.bottom,
  };
}
