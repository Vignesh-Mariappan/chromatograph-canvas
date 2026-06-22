import { useRef, useEffect, useCallback } from 'react';
import { getPlotArea } from '../utils/chartConfig';
import { drawTrace } from '../utils/drawTrace';
import { drawAnnotations } from '../utils/drawAnnotations';
import { drawXAxis, drawYAxis } from '../utils/drawAxes';
import { X_AXIS, Y_AXIS, TRACE_DATA, PEAKS } from '../data/chromatogramData';
import { PEAK_ANNOTATIONS } from '../data/peakAnnotations';

export function useGasChromatogram(bgColor: string = '#ffffff') {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the container's actual pixel dimensions
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Size the canvas to match the container at retina resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Compute the plot area (inside the axis margins)
    const plotArea = getPlotArea(rect.width, rect.height);

    // Draw the chromatogram trace (sharp triangular peaks);
    drawTrace(ctx, plotArea, TRACE_DATA, X_AXIS.min, X_AXIS.max, Y_AXIS.min, Y_AXIS.max);

    // Draw peak annotation labels (colored bars with compound names)
    drawAnnotations(ctx, plotArea, PEAK_ANNOTATIONS, PEAKS, X_AXIS.min, X_AXIS.max, Y_AXIS.min, Y_AXIS.max);

    // Draw plot area border (solid frame around the graph)
    ctx.save();
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
    ctx.restore();

    // Draw axes with tick marks and labels
    drawXAxis(ctx, plotArea, X_AXIS);
    drawYAxis(ctx, plotArea, Y_AXIS);
  }, [bgColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial draw
    draw(canvas);

    // Redraw on resize
    const observer = new ResizeObserver(() => {
      draw(canvas);
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [draw]);

  return { canvasRef, containerRef };
}
