
import React from 'react';
import type { Scores } from '../types';
import { useI18n } from '../hooks/useI18n';

interface TernaryPlotProps {
  scores: Scores;
}

const TernaryPlot: React.FC<TernaryPlotProps> = ({ scores }) => {
  const { t } = useI18n();
  const width = 300;
  const height = (Math.sqrt(3) / 2) * width;
  const total = 45;

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
  
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`-20 -20 ${width + 40} ${height + 40}`} className="w-full h-auto max-w-sm">
        <defs>
            <linearGradient id="red-to-mix" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="blue-to-mix" x1="0" y1="1" x2="1" y2="0.5">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="yellow-to-mix" x1="1" y1="1" x2="0" y2="0.5">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            <pattern id="triangles" patternUnits="userSpaceOnUse" width="20" height="17.32" >
                <path d="M0 0 L10 17.32 L20 0 Z" fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
                <path d="M10 17.32 L20 17.32 L20 0 Z" fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
            </pattern>
        </defs>

        <polygon
          points={`${vertices.red.x},${vertices.red.y} ${vertices.blue.x},${vertices.blue.y} ${vertices.yellow.x},${vertices.yellow.y}`}
          className="fill-purple-200"
        />
        <polygon
          points={`${vertices.red.x},${vertices.red.y} ${vertices.blue.x},${vertices.blue.y} ${vertices.yellow.x},${vertices.yellow.y}`}
          fill="url(#triangles)"
        />

        <circle cx={cx} cy={cy} r="6" className="fill-gray-900" stroke="white" strokeWidth="2" />

        <text x={vertices.red.x} y={-8} textAnchor="middle" className="font-bold text-sm fill-red-600">
            {t('ternary_plot.catholic')}
        </text>
        <text x={vertices.blue.x - 8} y={height + 15} textAnchor="end" className="font-bold text-sm fill-blue-600">
            {t('ternary_plot.protestant')}
        </text>
        <text x={vertices.yellow.x + 8} y={height + 15} textAnchor="start" className="font-bold text-sm fill-yellow-600">
            {t('ternary_plot.liberal')}
        </text>
      </svg>
    </div>
  );
};

export default TernaryPlot;