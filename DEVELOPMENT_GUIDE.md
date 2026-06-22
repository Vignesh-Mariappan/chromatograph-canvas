# Step-by-Step Guide: Developing the Gas Chromatogram Web App from Scratch

This guide provides a detailed, step-by-step procedure to build the Gas Chromatogram application from scratch. It is designed to be followed sequentially, without AI assistance, explaining the directory structure, data structures, math, layout styling, and canvas rendering logic.

---

## Architecture Overview

The application is structured around a central **HTML5 Canvas** element integrated into a **React (TypeScript) + Vite** application. Drawing on a canvas is done via pixel-level rendering. Rather than using external charting libraries, we write custom render functions to have absolute control over layout, typography, line styles, and annotations.

```
gas-chromatogram/
├── src/
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Core layout assembler
│   ├── App.css                 # Layout container styles
│   ├── index.css               # Global reset, typography, & variables
│   ├── components/
│   │   ├── Header.tsx          # App logo, title, settings & controls
│   │   ├── InfoBar.tsx         # Data summary strip below header
│   │   └── GasChromatogram.tsx # Canvas wrapper & main render controller
│   ├── data/
│   │   ├── chromatogramData.ts # Data structures for peaks & trace points
│   │   └── peakAnnotations.ts  # Compound labels & coloring rules
│   ├── styles/
│   │   ├── Header.css          # Styling for header buttons and toggle
│   │   └── InfoBar.css         # Styling for info bar text layout
│   └── utils/
│       ├── chartConfig.ts      # Margin calculations & plot bounds
│       ├── drawGrid.ts         # Dashed coordinate grid helper
│       ├── drawAxes.ts         # X & Y axis lines, ticks, and titles
│       ├── drawTrace.ts        # Trace coordinate transformer & fill/stroke line builder
│       └── drawAnnotations.ts  # Vertical annotations, icons & rotated labels
```

---

## Step 1: Project Setup

1. **Initialize the Project**:
   Create a new React project using Vite with TypeScript:
   ```bash
   npm create vite@latest gas-chromatogram -- --template react-ts
   cd gas-chromatogram
   npm install
   ```

2. **Clean Up Default Boilerplate**:
   - Delete unnecessary icons or sample assets from `src/assets` and `public`.
   - Clear `src/App.css` and `src/index.css`.
   - Update `index.html` to point to a clean title (e.g., `<title>Gas Chromatogram</title>`).

---

## Step 2: Design System & Styling Foundations

Setup a clean global visual environment using Vanilla CSS.

1. **Create/Update `src/index.css`**:
   Define global variables for typography, spacing, border colors, and layout resets.
   ```css
   /* src/index.css */
   *, *::before, *::after {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
   }

   :root {
     --color-bg: #f5f5f5;
     --color-surface: #ffffff;
     --color-border: #e0e0e0;
     --color-text-primary: #1a1a2e;
     --color-text-secondary: #555555;
     --color-accent: #2563eb;
     --color-accent-hover: #1d4ed8;

     --font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
   }

   html, body {
     width: 100%;
     height: 100%;
     overflow: hidden;
     font-family: var(--font-family);
     font-size: 14px;
     color: var(--color-text-primary);
     background-color: var(--color-bg);
     -webkit-font-smoothing: antialiased;
   }

   #root {
     width: 100%;
     height: 100%;
     display: flex;
     flex-direction: column;
   }
   ```

2. **Create/Update `src/App.css`**:
   Setup the full-viewport vertical layout using flexbox:
   ```css
   /* src/App.css */
   .app-container {
     display: flex;
     flex-direction: column;
     width: 100%;
     height: 100%;
     background-color: #f0f2f5;
   }

   .canvas-area {
     flex: 1;
     position: relative;
     min-height: 0;
     background-color: #ffffff;
     border: 1px solid #d0d0d0;
     margin: 6px;
     border-radius: 2px;
     box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
     overflow: hidden;
   }

   .canvas-area canvas {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
   }
   ```

---

## Step 3: Define Data & Trace Generation

To draw the chromatogram, we need coordinates. A gas chromatogram is characterized by sharp peaks indicating the presence of chemical compounds.

1. **Create `src/data/chromatogramData.ts`**:
   - Define axis ranges: retention time (X) from 0 to 30 mins, and signal intensity (Y) from 0 to 100 mV.
   - Reuse the `sigma` parameter of standard Gaussian distributions as the half-width of a triangle's base.
   - Write `generateTrace()` to build a list of points: flat baseline (0.5 mV) -> left foot -> peak apex -> right foot -> flat baseline. This shapes the peaks as sharp triangles.

   ```typescript
   // src/data/chromatogramData.ts

   export const X_AXIS = {
     label: 'Retention Time (min)',
     min: 0,
     max: 30,
     majorTick: 2,
     minorTick: 1,
   };

   export const Y_AXIS = {
     label: 'Signal (mV)',
     min: 0,
     max: 100,
     majorTick: 10,
     minorTick: 5,
   };

   export interface PeakDefinition {
     rt: number;        // Retention Time (minutes)
     height: number;    // Peak Height (mV)
     sigma: number;     // Half-base width in minutes (used to draw sharp peak bases)
     name: string;
   }

   export const PEAKS: PeakDefinition[] = [
     { rt: 5.2, height: 8, sigma: 0.08, name: 'Methane' },
     { rt: 8.1, height: 12, sigma: 0.08, name: 'Ethane' },
     { rt: 10.5, height: 25, sigma: 0.09, name: 'Propane' },
     { rt: 13.2, height: 55, sigma: 0.10, name: 'n-Butane' },
     { rt: 14.5, height: 42, sigma: 0.09, name: 'Isopentane' },
     { rt: 15.8, height: 70, sigma: 0.10, name: 'n-Pentane' },
     { rt: 16.5, height: 62, sigma: 0.09, name: 'Hexane' },
     { rt: 17.8, height: 85, sigma: 0.11, name: 'Benzene' },
     { rt: 19.0, height: 45, sigma: 0.10, name: 'Cyclohexane' },
     { rt: 22.0, height: 55, sigma: 0.10, name: 'Ethylbenzene' },
     { rt: 23.5, height: 40, sigma: 0.09, name: 'Xylene' },
     { rt: 25.0, height: 20, sigma: 0.08, name: 'Styrene' },
     { rt: 27.0, height: 10, sigma: 0.08, name: 'Naphthalene' },
   ];

   export interface TracePoint {
     x: number; // Retention Time (min)
     y: number; // Signal intensity (mV)
   }

   export function generateTrace(
     peaks: PeakDefinition[],
     xMin: number,
     xMax: number
   ): TracePoint[] {
     const BASELINE = 0.5; // Slight baseline offset so the trace line sits visible above bottom axis
     const sorted = [...peaks].sort((a, b) => a.rt - b.rt);
     const points: TracePoint[] = [];

     // Start at xMin on baseline
     points.push({ x: xMin, y: BASELINE });

     for (const peak of sorted) {
       const leftFoot = Math.max(xMin, peak.rt - peak.sigma);
       const rightFoot = Math.min(xMax, peak.rt + peak.sigma);

       // Connect to the left base of the peak
       points.push({ x: leftFoot, y: BASELINE });
       // Shoot straight up to the peak apex
       points.push({ x: peak.rt, y: BASELINE + peak.height });
       // Drop down to the right base of the peak
       points.push({ x: rightFoot, y: BASELINE });
     }

     // End at xMax on baseline
     points.push({ x: xMax, y: BASELINE });
     return points;
   }

   export const TRACE_DATA = generateTrace(PEAKS, X_AXIS.min, X_AXIS.max);
   ```

2. **Create `src/data/peakAnnotations.ts`**:
   Set up status types and color mappings for peak identification boxes.
   ```typescript
   // src/data/peakAnnotations.ts

   export type AnnotationStatus = 'identified' | 'flagged' | 'calibration';

   export interface PeakAnnotation {
     rt: number;
     compoundName: string;
     info: string;
     value: string;
     status: AnnotationStatus;
   }

   export const ANNOTATION_COLORS: Record<AnnotationStatus, { bg: string; border: string; text: string }> = {
     identified: { bg: '#1e5c2e', border: '#2d7a40', text: '#ffffff' },
     flagged: { bg: '#7a2020', border: '#9e2b2b', text: '#ffffff' },
     calibration: { bg: '#7a6010', border: '#9e7d14', text: '#ffffff' },
   };

   export const PEAK_ANNOTATIONS: PeakAnnotation[] = [
     { rt: 5.2, compoundName: 'Methane', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 8.1, compoundName: 'Ethane', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 10.5, compoundName: 'Propane', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 13.2, compoundName: 'n-Butane', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 14.5, compoundName: 'Isopentane', info: 'Compound Name', value: 'XX.XX%', status: 'flagged' },
     { rt: 15.8, compoundName: 'n-Pentane', info: 'Compound Name', value: 'XX.XX%', status: 'flagged' },
     { rt: 16.5, compoundName: 'Hexane', info: 'Compound Name', value: 'XX.XX%', status: 'calibration' },
     { rt: 17.8, compoundName: 'Benzene', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 19.0, compoundName: 'Cyclohexane', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 22.0, compoundName: 'Ethylbenzene', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 23.5, compoundName: 'Xylene', info: 'Compound Name', value: 'XX.XX%', status: 'calibration' },
     { rt: 25.0, compoundName: 'Styrene', info: 'Compound Name', value: 'XX.XX%', status: 'identified' },
     { rt: 27.0, compoundName: 'Naphthalene', info: 'Compound Name', value: 'XX.XX%', status: 'calibration' },
   ];
   ```

---

## Step 4: Coordinate Mapping & Layout Math

To draw on the canvas, we must map data coordinates (e.g., minutes on X, mV on Y) into canvas pixel coordinates. We define margins to reserve space around the central grid for drawing axes, labels, and tick marks.

1. **Create `src/utils/chartConfig.ts`**:
   ```typescript
   // src/utils/chartConfig.ts

   export interface ChartMargins {
     top: number;
     right: number;
     bottom: number;
     left: number;
   }

   export interface PlotArea {
     x: number;      // Pixel offset of plot left boundary from canvas left edge
     y: number;      // Pixel offset of plot top boundary from canvas top edge
     width: number;  // Width of internal grid plot area in pixels
     height: number; // Height of internal grid plot area in pixels
   }

   // Margins around the chart area
   export const CHART_MARGINS: ChartMargins = {
     top: 10,
     right: 10,
     bottom: 50,
     left: 65,
   };

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
   ```

---

## Step 5: Render Utility Functions

Each drawing function takes a 2D rendering context (`CanvasRenderingContext2D`), the computed `PlotArea`, data configurations, and draws its respective layer.

### 1. Drawing the Grid
To help align peaks, draw vertical and horizontal grid lines within the boundaries of the `PlotArea`.
- **Create `src/utils/drawGrid.ts`**:
  ```typescript
  // src/utils/drawGrid.ts
  import type { PlotArea } from './chartConfig';

  export interface GridOptions {
    horizontalLines: number;
    verticalLines: number;
    lineColor: string;
    lineWidth: number;
    dashPattern: number[];
  }

  const DEFAULT_GRID_OPTIONS: GridOptions = {
    horizontalLines: 14,
    verticalLines: 20,
    lineColor: '#e2e2e2',
    lineWidth: 0.5,
    dashPattern: [3, 3],
  };

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

    // Draw horizontal grid lines
    for (let i = 1; i <= opts.horizontalLines; i++) {
      const y = plotArea.y + (plotArea.height / (opts.horizontalLines + 1)) * i;
      ctx.beginPath();
      ctx.moveTo(plotArea.x, y);
      ctx.lineTo(plotArea.x + plotArea.width, y);
      ctx.stroke();
    }

    // Draw vertical grid lines
    for (let i = 1; i <= opts.verticalLines; i++) {
      const x = plotArea.x + (plotArea.width / (opts.verticalLines + 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, plotArea.y);
      ctx.lineTo(x, plotArea.y + plotArea.height);
      ctx.stroke();
    }
    ctx.restore();
  }
  ```

### 2. Drawing the Axes
Draw ticks and numerical labels alongside titles for both X (horizontal) and Y (vertical) axes.
- **Data to Pixel Mapping Rules**:
  - Horizontal pixel: $X_{pixel} = PlotArea_{x} + \frac{X_{data} - X_{min}}{X_{max} - X_{min}} \times PlotArea_{width}$
  - Vertical pixel: $Y_{pixel} = PlotArea_{y} + PlotArea_{height} - \frac{Y_{data} - Y_{min}}{Y_{max} - Y_{min}} \times PlotArea_{height}$
- **Create `src/utils/drawAxes.ts`**:
  ```typescript
  // src/utils/drawAxes.ts
  import type { PlotArea } from './chartConfig';

  export interface AxisConfig {
    min: number;
    max: number;
    majorTick: number;
    minorTick: number;
    label: string;
  }

  export interface AxisStyle {
    axisColor: string;
    labelColor: string;
    labelFont: string;
    titleFont: string;
    majorTickLength: number;
    minorTickLength: number;
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
    ctx.fillStyle = s.labelColor;
    ctx.font = s.labelFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw minor ticks
    for (let val = axis.min; val <= axis.max; val += axis.minorTick) {
      const x = plotArea.x + ((val - axis.min) / range) * plotArea.width;
      ctx.beginPath();
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, bottom + s.minorTickLength);
      ctx.stroke();
    }

    // Draw major ticks + numbers
    for (let val = axis.min; val <= axis.max; val += axis.majorTick) {
      const x = plotArea.x + ((val - axis.min) / range) * plotArea.width;
      ctx.beginPath();
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, bottom + s.majorTickLength);
      ctx.stroke();

      ctx.fillText(val.toString(), x, bottom + s.majorTickLength + 4);
    }

    // Axis label
    ctx.font = s.titleFont;
    ctx.fillStyle = s.labelColor;
    ctx.fillText(axis.label, plotArea.x + plotArea.width / 2, bottom + s.majorTickLength + 22);
    ctx.restore();
  }

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
    ctx.fillStyle = s.labelColor;
    ctx.font = s.labelFont;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Minor ticks
    for (let val = axis.min; val <= axis.max; val += axis.minorTick) {
      const y = plotArea.y + plotArea.height - ((val - axis.min) / range) * plotArea.height;
      ctx.beginPath();
      ctx.moveTo(plotArea.x, y);
      ctx.lineTo(plotArea.x - s.minorTickLength, y);
      ctx.stroke();
    }

    // Major ticks + numbers
    for (let val = axis.min; val <= axis.max; val += axis.majorTick) {
      const y = plotArea.y + plotArea.height - ((val - axis.min) / range) * plotArea.height;
      ctx.beginPath();
      ctx.moveTo(plotArea.x, y);
      ctx.lineTo(plotArea.x - s.majorTickLength, y);
      ctx.stroke();

      ctx.fillText(val.toString(), plotArea.x - s.majorTickLength - 4, y);
    }

    // Axis label (rotated 90 degrees CCW)
    ctx.save();
    ctx.font = s.titleFont;
    ctx.fillStyle = s.labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.translate(plotArea.x - 50, plotArea.y + plotArea.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(axis.label, 0, 0);
    ctx.restore();

    ctx.restore();
  }
  ```

### 3. Drawing the Trace
Map the sharp peak coordinates, fill the space underneath, and stroke the path with a solid outline.
- **Create `src/utils/drawTrace.ts`**:
  ```typescript
  // src/utils/drawTrace.ts
  import type { PlotArea } from './chartConfig';
  import type { TracePoint } from '../data/chromatogramData';

  export interface TraceStyle {
    strokeColor: string;
    fillColor: string;
    lineWidth: number;
  }

  const DEFAULT_TRACE_STYLE: TraceStyle = {
    strokeColor: 'rgba(59, 130, 246, 0.8)',
    fillColor: 'rgba(59, 130, 246, 0.12)',
    lineWidth: 1.5,
  };

  function dataToPixel(
    point: TracePoint,
    plotArea: PlotArea,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number
  ) {
    return {
      px: plotArea.x + ((point.x - xMin) / (xMax - xMin)) * plotArea.width,
      py: plotArea.y + plotArea.height - ((point.y - yMin) / (yMax - yMin)) * plotArea.height,
    };
  }

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
    // Clip drawing inside the plot area boundaries
    ctx.beginPath();
    ctx.rect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
    ctx.clip();

    const first = dataToPixel(data[0], plotArea, xMin, xMax, yMin, yMax);
    const baselineY = plotArea.y + plotArea.height;

    // Build fill path
    ctx.beginPath();
    ctx.moveTo(first.px, baselineY);
    ctx.lineTo(first.px, first.py);

    for (let i = 1; i < data.length; i++) {
      const p = dataToPixel(data[i], plotArea, xMin, xMax, yMin, yMax);
      ctx.lineTo(p.px, p.py);
    }

    const last = dataToPixel(data[data.length - 1], plotArea, xMin, xMax, yMin, yMax);
    ctx.lineTo(last.px, baselineY);
    ctx.closePath();
    ctx.fillStyle = s.fillColor;
    ctx.fill();

    // Build stroke path
    ctx.beginPath();
    ctx.moveTo(first.px, first.py);
    for (let i = 1; i < data.length; i++) {
      const p = dataToPixel(data[i], plotArea, xMin, xMax, yMin, yMax);
      ctx.lineTo(p.px, p.py);
    }
    ctx.strokeStyle = s.strokeColor;
    ctx.lineWidth = s.lineWidth;
    ctx.stroke();

    ctx.restore();
  }
  ```

### 4. Drawing the Annotations
Each identified peak has a vertical label block sitting above the apex. This prevents the label from obscuring the peak shape itself.
- **Design Layout**:
  - A dashed guide line goes from the baseline to the peak apex.
  - The label block floats starting `4px` above the apex.
  - Inside the label block: a small circle status indicator at the top, followed by the compound name text rotated 90 degrees CCW (reading from bottom to top).
- **Create `src/utils/drawAnnotations.ts`**:
  ```typescript
  // src/utils/drawAnnotations.ts
  import type { PlotArea } from './chartConfig';
  import type { PeakAnnotation } from '../data/peakAnnotations';
  import { ANNOTATION_COLORS } from '../data/peakAnnotations';
  import type { PeakDefinition } from '../data/chromatogramData';

  const LABEL = {
    width: 14,
    height: 80,
    gapAbovePeak: 4,
    iconRadius: 5,
    fontSize: 9,
    font: 'Inter, sans-serif',
  };

  function rtToPixelX(rt: number, plotArea: PlotArea, xMin: number, xMax: number): number {
    return plotArea.x + ((rt - xMin) / (xMax - xMin)) * plotArea.width;
  }

  function signalToPixelY(signal: number, plotArea: PlotArea, yMin: number, yMax: number): number {
    return plotArea.y + plotArea.height - ((signal - yMin) / (yMax - yMin)) * plotArea.height;
  }

  function drawAnnotationLabel(
    ctx: CanvasRenderingContext2D,
    ann: PeakAnnotation,
    cx: number,
    peakApexY: number,
    baselineY: number
  ): void {
    const colors = ANNOTATION_COLORS[ann.status];
    const boxBottom = peakApexY - LABEL.gapAbovePeak;
    const boxTop = boxBottom - LABEL.height;
    const boxLeft = cx - LABEL.width / 2;

    // 1. Dashed marker line under the peak to the baseline
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.55)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, baselineY);
    ctx.lineTo(cx, peakApexY);
    ctx.stroke();
    ctx.restore();

    // 2. Colored label rectangle
    ctx.save();
    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.8;

    const r = 3; // Rounded corner radius
    ctx.beginPath();
    ctx.moveTo(boxLeft + r, boxTop);
    ctx.lineTo(boxLeft + LABEL.width - r, boxTop);
    ctx.arcTo(boxLeft + LABEL.width, boxTop, boxLeft + LABEL.width, boxTop + r, r);
    ctx.lineTo(boxLeft + LABEL.width, boxBottom);
    ctx.lineTo(boxLeft, boxBottom);
    ctx.lineTo(boxLeft, boxTop + r);
    ctx.arcTo(boxLeft, boxTop, boxLeft + r, boxTop, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Status Circle Icon at the top
    const iconCx = cx;
    const iconCy = boxTop + LABEL.iconRadius + 2;

    ctx.save();
    ctx.fillStyle = colors.border;
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, LABEL.iconRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw little circular line detail in icon
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, LABEL.iconRadius - 2, 0.4, Math.PI * 1.8);
    ctx.stroke();
    ctx.restore();

    // 4. Rotated Text (90 degrees CCW)
    const textAreaTop = iconCy + LABEL.iconRadius + 4;
    const textAreaBottom = boxBottom - 4;
    const textCenterY = (textAreaTop + textAreaBottom) / 2;

    ctx.save();
    ctx.translate(cx, textCenterY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${LABEL.fontSize}px ${LABEL.font}`;
    ctx.fillText(ann.compoundName, 0, 0);
    ctx.restore();
  }

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

    const peakHeightMap = new Map<number, number>();
    for (const p of peaks) {
      peakHeightMap.set(p.rt, p.height);
    }

    const baselineY = signalToPixelY(yMin + 0.5, plotArea, yMin, yMax);

    for (const ann of annotations) {
      const cx = rtToPixelX(ann.rt, plotArea, xMin, xMax);
      const height = peakHeightMap.get(ann.rt) ?? 10;
      const peakApexY = signalToPixelY(height + 0.5, plotArea, yMin, yMax);

      drawAnnotationLabel(ctx, ann, cx, peakApexY, baselineY);
    }

    ctx.restore();
  }
  ```

---

## Step 6: Canvas Integration Component

Create the React wrapper component around the `<canvas>` element. We need to handle:
- **Resizing**: A `ResizeObserver` detects container dimensions, triggering redrawing.
- **HDPI Display (Retina resolution)**: Canvas size is multiplied by `window.devicePixelRatio` for razor-sharp lines, and coordinates are scaled accordingly.

1. **Create `src/components/GasChromatogram.tsx`**:
   ```typescript
   // src/components/GasChromatogram.tsx
   import { useRef, useEffect, useCallback } from 'react';
   import { getPlotArea } from '../utils/chartConfig';
   import { drawTrace } from '../utils/drawTrace';
   import { drawAnnotations } from '../utils/drawAnnotations';
   import { drawXAxis, drawYAxis } from '../utils/drawAxes';
   import { X_AXIS, Y_AXIS, TRACE_DATA, PEAKS } from '../data/chromatogramData';
   import { PEAK_ANNOTATIONS } from '../data/peakAnnotations';

   const GasChromatogram: React.FC = () => {
     const canvasRef = useRef<HTMLCanvasElement>(null);
     const containerRef = useRef<HTMLDivElement>(null);

     const draw = useCallback((canvas: HTMLCanvasElement) => {
       const ctx = canvas.getContext('2d');
       if (!ctx) return;

       const container = containerRef.current;
       if (!container) return;
       const rect = container.getBoundingClientRect();
       const dpr = window.devicePixelRatio || 1;

       // Configure internal coordinates for high-DPI
       canvas.width = rect.width * dpr;
       canvas.height = rect.height * dpr;
       ctx.scale(dpr, dpr);

       // Clear and draw white canvas surface
       ctx.clearRect(0, 0, rect.width, rect.height);
       ctx.fillStyle = '#ffffff';
       ctx.fillRect(0, 0, rect.width, rect.height);

       const plotArea = getPlotArea(rect.width, rect.height);

       // Draw Chromatogram Curve
       drawTrace(ctx, plotArea, TRACE_DATA, X_AXIS.min, X_AXIS.max, Y_AXIS.min, Y_AXIS.max);

       // Draw Annotations
       drawAnnotations(ctx, plotArea, PEAK_ANNOTATIONS, PEAKS, X_AXIS.min, X_AXIS.max, Y_AXIS.min, Y_AXIS.max);

       // Draw boundary frame line
       ctx.save();
       ctx.strokeStyle = '#999999';
       ctx.lineWidth = 1;
       ctx.strokeRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
       ctx.restore();

       // Draw axes labels and tick marks
       drawXAxis(ctx, plotArea, X_AXIS);
       drawYAxis(ctx, plotArea, Y_AXIS);
     }, []);

     useEffect(() => {
       const canvas = canvasRef.current;
       if (!canvas) return;

       // Initial render
       draw(canvas);

       // Observe browser resizes and redraw
       const observer = new ResizeObserver(() => draw(canvas));
       if (containerRef.current) {
         observer.observe(containerRef.current);
       }
       return () => observer.disconnect();
     }, [draw]);

     return (
       <div ref={containerRef} className="canvas-area">
         <canvas ref={canvasRef} />
       </div>
     );
   };

   export default GasChromatogram;
   ```

---

## Step 7: Header & Info Panel UI Chrome

We need header bars for controls, badges, and readouts matching the aesthetics of chromatographic software.

1. **Create `src/styles/Header.css`**:
   ```css
   /* src/styles/Header.css */
   .header {
     display: flex;
     align-items: center;
     justify-content: space-between;
     height: 40px;
     padding: 0 12px;
     background-color: #ffffff;
     border-bottom: 1px solid #e0e0e0;
     flex-shrink: 0;
   }

   .header-left {
     display: flex;
     align-items: center;
     gap: 8px;
   }

   .header-logo {
     display: flex;
     align-items: center;
     color: #2563eb;
   }

   .header-title {
     font-family: 'Inter', sans-serif;
     font-size: 14px;
     font-weight: 600;
     color: #1a1a2e;
     letter-spacing: 0.3px;
   }

   .header-right {
     display: flex;
     align-items: center;
     gap: 6px;
   }

   .header-icon-btn {
     display: flex;
     align-items: center;
     justify-content: center;
     width: 26px;
     height: 26px;
     border: none;
     background: transparent;
     border-radius: 4px;
     cursor: pointer;
     color: #666;
     transition: background 0.15s, color 0.15s;
     padding: 0;
   }

   .header-icon-btn:hover {
     background: #f0f4f8;
     color: #1a1a2e;
   }

   .header-toggle {
     display: inline-flex;
     align-items: center;
     width: 32px;
     height: 18px;
     background: #2563eb;
     border-radius: 9px;
     position: relative;
     cursor: pointer;
   }

   .header-toggle::after {
     content: '';
     position: absolute;
     right: 3px;
     width: 12px;
     height: 12px;
     background: #ffffff;
     border-radius: 50%;
   }

   .header-badge {
     display: flex;
     align-items: center;
     justify-content: center;
     min-width: 18px;
     height: 18px;
     padding: 0 4px;
     background: #e5e7eb;
     border-radius: 9px;
     font-size: 10px;
     font-weight: 600;
     color: #374151;
     font-family: 'Inter', sans-serif;
   }

   .header-manage-btn {
     display: flex;
     align-items: center;
     height: 28px;
     padding: 0 12px;
     background: #2563eb;
     color: #ffffff;
     border: none;
     border-radius: 5px;
     font-family: 'Inter', sans-serif;
     font-size: 12px;
     font-weight: 600;
     cursor: pointer;
     transition: background 0.15s;
   }

   .header-manage-btn:hover {
     background: #1d4ed8;
   }

   .header-divider {
     width: 1px;
     height: 18px;
     background: #e0e0e0;
     margin: 0 2px;
   }
   ```

2. **Create `src/components/Header.tsx`**:
   ```typescript
   // src/components/Header.tsx
   import '../styles/Header.css';

   const LogoIcon = () => (
     <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
       <polyline points="0,10 3,4 6,10 9,2 12,10 15,5 18,8" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
     </svg>
   );

   const LockIcon = () => (
     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
       <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
       <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
     </svg>
   );

   const InfoIcon = () => (
     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
       <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
       <path d="M7 6.5V10M7 4.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
     </svg>
   );

   const GridIcon = () => (
     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
       <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
       <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
     </svg>
   );

   const ExpandIcon = () => (
     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
     </svg>
   );

   const Header: React.FC = () => {
     return (
       <header className="header" role="banner">
         <div className="header-left">
           <div className="header-logo"><LogoIcon /></div>
           <h1 className="header-title">VAL123456</h1>
         </div>
         <div className="header-right" role="toolbar">
           <button className="header-icon-btn" title="Lock" id="btn-lock"><LockIcon /></button>
           <div className="header-toggle" title="Toggle overlay" id="toggle-overlay" />
           <button className="header-icon-btn" title="Information" id="btn-info"><InfoIcon /></button>
           <span className="header-badge">0</span>
           <button className="header-icon-btn" title="Grid view" id="btn-grid"><GridIcon /></button>
           <span className="header-badge">0</span>
           <div className="header-divider" />
           <button className="header-icon-btn" title="Expand" id="btn-expand"><ExpandIcon /></button>
           <button className="header-manage-btn" id="btn-manage">Manage</button>
         </div>
       </header>
     );
   };

   export default Header;
   ```

3. **Create `src/styles/InfoBar.css`**:
   ```css
   /* src/styles/InfoBar.css */
   .info-bar {
     display: flex;
     align-items: center;
     justify-content: flex-end;
     height: 28px;
     padding: 0 12px;
     background-color: #fafafa;
     border-bottom: 1px solid #e8e8e8;
     flex-shrink: 0;
     gap: 24px;
   }

   .info-bar-item {
     display: flex;
     align-items: center;
     gap: 4px;
     font-family: 'Inter', sans-serif;
     font-size: 11px;
     color: #555555;
     white-space: nowrap;
   }

   .info-bar-label {
     font-weight: 600;
     color: #333333;
   }

   .info-bar-value {
     font-weight: 400;
     color: #666666;
     font-variant-numeric: tabular-nums;
     letter-spacing: 0.2px;
   }

   .info-bar-gear {
     display: flex;
     align-items: center;
     justify-content: center;
     width: 22px;
     height: 22px;
     border: none;
     background: transparent;
     border-radius: 4px;
     cursor: pointer;
     color: #888;
     padding: 0;
     transition: color 0.15s, background 0.15s;
   }

   .info-bar-gear:hover {
     color: #333;
     background: #f0f0f0;
   }
   ```

4. **Create `src/components/InfoBar.tsx`**:
   ```typescript
   // src/components/InfoBar.tsx
   import '../styles/InfoBar.css';

   const GearIcon = () => (
     <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
       <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" />
       <path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.5 2.5l.85.85M9.65 9.65l.85.85M9.65 3.35l-.85.85M3.35 9.65l-.85.85" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
     </svg>
   );

   const InfoBar: React.FC = () => {
     return (
       <div className="info-bar" role="status">
         <div className="info-bar-item">
           <span className="info-bar-label">Peak:</span>
           <span className="info-bar-value">X.XX ,&nbsp; XXXX.XX</span>
         </div>
         <div className="info-bar-item">
           <span className="info-bar-label">Sample Area:</span>
           <span className="info-bar-value">XXXX.XXXXXXXXXXXX</span>
         </div>
         <div className="info-bar-item">
           <span className="info-bar-label">Control Area:</span>
           <span className="info-bar-value">XXXX.XXXXXXXXXXXX</span>
         </div>
         <button className="info-bar-gear" title="Settings" id="btn-chart-settings"><GearIcon /></button>
       </div>
     );
   };

   export default InfoBar;
   ```

---

## Step 8: Wire Everything Together

Update the main entry point to render the container layout.

1. **Update `src/App.tsx`**:
   ```typescript
   // src/App.tsx
   import './App.css';
   import Header from './components/Header';
   import InfoBar from './components/InfoBar';
   import GasChromatogram from './components/GasChromatogram';

   function App() {
     return (
       <div className="app-container">
         <Header />
         <InfoBar />
         <GasChromatogram />
       </div>
     );
   }

   export default App;
   ```

2. **Run and Verify**:
   Start the Vite local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser. You should see a pixel-perfect, responsive chromatogram interface with sharp peak spikes, labels floating safely above the peak apexes, axes with coordinates, and control bar panels.
