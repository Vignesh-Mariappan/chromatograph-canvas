import { useGasChromatogram } from '../hooks/useGasChromatogram';

interface GasChromatogramProps {
  bgColor?: string;
}

const GasChromatogram: React.FC<GasChromatogramProps> = ({ bgColor = '#ffffff' }) => {
  const { canvasRef, containerRef } = useGasChromatogram(bgColor);

  return (
    <div ref={containerRef} className="canvas-area">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default GasChromatogram;


