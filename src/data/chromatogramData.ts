/**
 * Chromatogram data constants — axis ranges, tick intervals, and sample data.
 * Uses realistic gas chromatography values.
 */

/** X-axis: Retention time in minutes */
export const X_AXIS = {
  label: 'Retention Time (min)',
  min: 0,
  max: 30,
  /** Major tick interval */
  majorTick: 2,
  /** Minor tick interval */
  minorTick: 1,
};

/** Y-axis: Signal intensity (arbitrary units / millivolts) */
export const Y_AXIS = {
  label: 'Signal (mV)',
  min: 0,
  max: 100,
  /** Major tick interval */
  majorTick: 10,
  /** Minor tick interval */
  minorTick: 5,
};

/**
 * Peak definition — each peak is a Gaussian centered at a retention time.
 */
export interface PeakDefinition {
  /** Retention time (minutes) */
  rt: number;
  /** Peak height (mV) — signal intensity at the apex */
  height: number;
  /** Peak width (sigma in minutes) — controls how broad the peak is */
  sigma: number;
  /** Compound name */
  name: string;
}

/**
 * Peak definitions matching the reference image layout.
 * Peaks are clustered in the 8–24 min range with varying heights.
 */
export const PEAKS: PeakDefinition[] = [
  { rt: 5.2, height: 8, sigma: 0.08, name: 'Methane' },
  { rt: 8.1, height: 12, sigma: 0.08, name: 'Ethane' },
  { rt: 10.5, height: 25, sigma: 0.09, name: 'Propane' },
  { rt: 12.0, height: 35, sigma: 0.09, name: 'Isobutane' },
  { rt: 13.2, height: 55, sigma: 0.10, name: 'n-Butane' },
  { rt: 14.5, height: 42, sigma: 0.09, name: 'Isopentane' },
  { rt: 15.8, height: 70, sigma: 0.10, name: 'n-Pentane' },
  { rt: 16.5, height: 62, sigma: 0.09, name: 'Hexane' },
  { rt: 17.8, height: 85, sigma: 0.11, name: 'Benzene' },
  { rt: 19.0, height: 45, sigma: 0.10, name: 'Cyclohexane' },
  { rt: 20.5, height: 30, sigma: 0.09, name: 'Toluene' },
  { rt: 22.0, height: 55, sigma: 0.10, name: 'Ethylbenzene' },
  { rt: 23.5, height: 40, sigma: 0.09, name: 'Xylene' },
  { rt: 25.0, height: 20, sigma: 0.08, name: 'Styrene' },
  { rt: 27.0, height: 10, sigma: 0.08, name: 'Naphthalene' },
];

/**
 * A single data point on the chromatogram trace.
 */
export interface TracePoint {
  /** Retention time (minutes) */
  x: number;
  /** Signal intensity (mV) */
  y: number;
}

/**
 * Generate a triangular (sharp spike) chromatogram trace.
 *
 * Each peak is rendered as an explicit triangle:
 *   baseline → left-foot → apex → right-foot → baseline
 *
 * This produces the sharp vertical spike appearance seen in real GC outputs,
 * as opposed to broad Gaussian bell curves.
 *
 * The `sigma` field on PeakDefinition is reused as the half-width of the
 * triangle base (in minutes).
 */
export function generateTrace(
  peaks: PeakDefinition[],
  xMin: number,
  xMax: number,
): TracePoint[] {
  const BASELINE = 0.5;

  // Sort peaks by retention time so we draw left-to-right
  const sorted = [...peaks].sort((a, b) => a.rt - b.rt);

  // Build an ordered list of key points:
  // start, then for each peak: left-foot, apex, right-foot, then end
  const keyPoints: TracePoint[] = [];

  keyPoints.push({ x: xMin, y: BASELINE });

  for (const peak of sorted) {
    const halfWidth = peak.sigma; // sigma reused as half-base-width
    const leftFoot = Math.max(xMin, peak.rt - halfWidth);
    const rightFoot = Math.min(xMax, peak.rt + halfWidth);

    // Flat baseline just before peak starts
    keyPoints.push({ x: leftFoot, y: BASELINE });
    // Peak apex
    keyPoints.push({ x: peak.rt, y: BASELINE + peak.height });
    // Flat baseline just after peak ends
    keyPoints.push({ x: rightFoot, y: BASELINE });
  }

  keyPoints.push({ x: xMax, y: BASELINE });

  return keyPoints;
}

/** Pre-computed trace data for rendering */
export const TRACE_DATA = generateTrace(PEAKS, X_AXIS.min, X_AXIS.max);
