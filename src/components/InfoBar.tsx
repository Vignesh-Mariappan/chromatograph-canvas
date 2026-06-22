import '../styles/InfoBar.css';

/** Gear/settings icon */
const GearIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.5 2.5l.85.85M9.65 9.65l.85.85M9.65 3.35l-.85.85M3.35 9.65l-.85.85"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const BG_COLOR_OPTIONS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Ivory', value: '#fffff0' },
  { label: 'Linen', value: '#faf0e6' },
  { label: 'Lavender', value: '#e6e6fa' },
  { label: 'Alice Blue', value: '#f0f8ff' },
  { label: 'Mint Cream', value: '#f5fffa' },
  { label: 'Honeydew', value: '#f0fff0' },
  { label: 'Seashell', value: '#fff5ee' },
  { label: 'Snow', value: '#fffafa' },
  { label: 'Ghost White', value: '#f8f8ff' },
  { label: 'Misty Rose', value: '#ffe4e1' },
  { label: 'Light Cyan', value: '#e0ffff' },
  { label: 'Light Yellow', value: '#ffffe0' },
  { label: 'Light Gray', value: '#d3d3d3' },
  { label: 'Pale Goldenrod', value: '#eee8aa' },
];

interface InfoBarProps {
  bgColor: string;
  onBgColorChange: (color: string) => void;
}

const InfoBar: React.FC<InfoBarProps> = ({ bgColor, onBgColorChange }) => {
  return (
    <div className="info-bar" role="status" aria-label="Chromatogram statistics">
      {/* Background color picker */}
      <div className="info-bar-item">
        <span className="info-bar-label">Background:</span>
        <div className="info-bar-color-picker">
          <span
            className="info-bar-color-swatch"
            style={{ backgroundColor: bgColor }}
            aria-hidden="true"
          />
          <select
            className="info-bar-select"
            id="select-bg-color"
            value={bgColor}
            onChange={(e) => onBgColorChange(e.target.value)}
            aria-label="Canvas background color"
          >
            {BG_COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Peak info */}
      <div className="info-bar-item">
        <span className="info-bar-label">Peak:</span>
        <span className="info-bar-value">X.XX ,&nbsp; XXXX.XX</span>
      </div>

      {/* Sample Area */}
      <div className="info-bar-item">
        <span className="info-bar-label">Sample Area:</span>
        <span className="info-bar-value">XXXX.XXXXXXXXXXXX</span>
      </div>

      {/* Control Area */}
      <div className="info-bar-item">
        <span className="info-bar-label">Control Area:</span>
        <span className="info-bar-value">XXXX.XXXXXXXXXXXX</span>
      </div>

      {/* Settings gear */}
      <button className="info-bar-gear" title="Settings" aria-label="Chart settings" id="btn-chart-settings">
        <GearIcon />
      </button>
    </div>
  );
};

export default InfoBar;

