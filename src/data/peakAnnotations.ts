/**
 * Peak annotation data — colored label definitions for each chromatogram peak.
 */

export type AnnotationStatus = 'identified' | 'flagged' | 'calibration';

export interface PeakAnnotation {
  /** Retention time — must match a peak in PEAKS */
  rt: number;
  /** Main compound name (line 1 of label) */
  compoundName: string;
  /** Secondary info shown below compound name */
  info: string;
  /** Numeric value shown (percentage or area) */
  value: string;
  /** Visual status — controls label color */
  status: AnnotationStatus;
}

/** Color scheme per annotation status */
export const ANNOTATION_COLORS: Record<AnnotationStatus, { bg: string; border: string; text: string }> = {
  identified: {
    bg:     '#1e5c2e',   // Dark green
    border: '#2d7a40',
    text:   '#ffffff',
  },
  flagged: {
    bg:     '#7a2020',   // Dark red / brown
    border: '#9e2b2b',
    text:   '#ffffff',
  },
  calibration: {
    bg:     '#7a6010',   // Gold / olive
    border: '#9e7d14',
    text:   '#ffffff',
  },
};

/**
 * Annotation definitions — one per annotated peak.
 * Using same retention times as PEAKS in chromatogramData.ts.
 */
export const PEAK_ANNOTATIONS: PeakAnnotation[] = [
  {
    rt: 5.2,
    compoundName: 'Methane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 8.1,
    compoundName: 'Ethane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 10.5,
    compoundName: 'Propane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 13.2,
    compoundName: 'n-Butane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 14.5,
    compoundName: 'Isopentane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'flagged',
  },
  {
    rt: 15.8,
    compoundName: 'n-Pentane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'flagged',
  },
  {
    rt: 16.5,
    compoundName: 'Hexane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'calibration',
  },
  {
    rt: 17.8,
    compoundName: 'Benzene',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 19.0,
    compoundName: 'Cyclohexane',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 22.0,
    compoundName: 'Ethylbenzene',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 23.5,
    compoundName: 'Xylene',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'calibration',
  },
  {
    rt: 25.0,
    compoundName: 'Styrene',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'identified',
  },
  {
    rt: 27.0,
    compoundName: 'Naphthalene',
    info: 'Compound Name',
    value: 'XX.XX%',
    status: 'calibration',
  },
];
