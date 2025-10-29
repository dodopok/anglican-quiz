import React from 'react';
import type { Scores } from '../types';
import { useI18n } from '../hooks/useI18n';

interface TernaryPlotProps {
  scores: Scores;
}

const TernaryPlot: React.FC<TernaryPlotProps> = ({ scores }) => {
  const { t } = useI18n();
  // Slightly reduce the size of the triangle to create more space for labels
  const width = 280;
  const height = (Math.sqrt(3) / 2) * width;
  const total = 48;

  const { catholic: red, liberal: yellow, protestant: blue } = scores;

  const r = red / total;
  const y = yellow / total;
  const b = blue / total;

  const vertices = {
    red: { x: width / 2, y: 0 },
    blue: { x: 0, y: height },
    yellow: { x: width, y: height },
  };

  const cx = b * vertices.blue.x + y * vertices.yellow.x + r * vertices.red.x;
  const cy = b * vertices.blue.y + y * vertices.yellow.y + r * vertices.red.y;
  
  const polygonPoints = `${vertices.red.x},${vertices.red.y} ${vertices.blue.x},${vertices.blue.y} ${vertices.yellow.x},${vertices.yellow.y}`;

  // Expand the viewBox to give labels more room, preventing them from being cut off.
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`-100 -40 ${width + 200} ${height + 90}`} className="w-full h-auto max-w-sm">
        <defs>
            {/* Gradients for color mixing from each corner */}
            <linearGradient id="red-grad" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="blue-grad" x1="0" y1="1" x2="0.75" y2="0.5">
               <stop offset="0%" stopColor="#3b82f6" />
               <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
             <linearGradient id="yellow-grad" x1="1" y1="1" x2="0.25" y2="0.5">
               <stop offset="0%" stopColor="#eab308" />
               <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </linearGradient>

            <pattern id="triangles" patternUnits="userSpaceOnUse" width="20" height="17.32" >
                {/* Lighter pattern for visibility on the new colorful background */}
                <path d="M0 0 L10 17.32 L20 0 Z" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                <path d="M10 17.32 L20 17.32 L20 0 Z" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
            
            <clipPath id="triangle-clip">
              <polygon points={polygonPoints} />
            </clipPath>
        </defs>

        <g clipPath="url(#triangle-clip)">
          {/* Black base for screen blending to work */}
          <rect x={0} y={0} width={width} height={height} fill="black" />
          
          {/* Gradient overlays with screen blend mode for additive color mixing */}
          <rect x={0} y={0} width={width} height={height} fill="url(#red-grad)" style={{ mixBlendMode: 'screen' }} />
          <rect x={0} y={0} width={width} height={height} fill="url(#blue-grad)" style={{ mixBlendMode: 'screen' }} />
          <rect x={0} y={0} width={width} height={height} fill="url(#yellow-grad)" style={{ mixBlendMode: 'screen' }} />
        </g>

        {/* Pattern on top */}
        <polygon
          points={polygonPoints}
          fill="url(#triangles)"
        />

        <circle cx={cx} cy={cy} r="6" className="fill-gray-900" stroke="white" strokeWidth="2" />

        {/* Labels with increased font size and adjusted positions for readability */}
        <text x={vertices.red.x} y={-20} textAnchor="middle" className="font-bold text-base fill-red-600">
            {t('ternary_plot.catholic')}
        </text>
        <text x={vertices.blue.x - 20} y={height + 30} textAnchor="end" className="font-bold text-base fill-blue-600">
            {t('ternary_plot.protestant')}
        </text>
        <text x={vertices.yellow.x + 20} y={height + 30} textAnchor="start" className="font-bold text-base fill-yellow-600">
            {t('ternary_plot.liberal')}
        </text>
      </svg>
    </div>
  );
};

export default TernaryPlot;