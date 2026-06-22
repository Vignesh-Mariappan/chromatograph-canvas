import '../styles/Header.css';

/** Zigzag/waveform logo SVG matching the reference image */
const LogoIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline
      points="0,10 3,4 6,10 9,2 12,10 15,5 18,8"
      stroke="#2563eb"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/** Lock icon */
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** Info icon */
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 6.5V10M7 4.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** Grid/table icon */
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** Expand/fullscreen icon */
const ExpandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="header" role="banner">
      {/* Left: logo + title */}
      <div className="header-left">
        <div className="header-logo" aria-hidden="true">
          <LogoIcon />
        </div>
        <h1 className="header-title">VAL123456</h1>
      </div>

      {/* Right: controls */}
      <div className="header-right" role="toolbar" aria-label="Chart controls">
        {/* Lock button */}
        <button className="header-icon-btn" title="Lock" aria-label="Lock chart" id="btn-lock">
          <LockIcon />
        </button>

        {/* Toggle switch */}
        <div
          className="header-toggle"
          role="switch"
          aria-checked="true"
          aria-label="Enable overlay"
          title="Toggle overlay"
          id="toggle-overlay"
        />

        {/* Info button with badge */}
        <button className="header-icon-btn" title="Information" aria-label="Show information" id="btn-info">
          <InfoIcon />
        </button>
        <span className="header-badge" aria-label="0 notifications">0</span>

        {/* Grid view button with badge */}
        <button className="header-icon-btn" title="Grid view" aria-label="Grid view" id="btn-grid">
          <GridIcon />
        </button>
        <span className="header-badge" aria-label="0 items">0</span>

        <div className="header-divider" />

        {/* Expand button */}
        <button className="header-icon-btn" title="Expand" aria-label="Expand chart" id="btn-expand">
          <ExpandIcon />
        </button>

        {/* Manage button */}
        <button className="header-manage-btn" id="btn-manage" aria-label="Manage chart">
          Manage
        </button>
      </div>
    </header>
  );
};

export default Header;
