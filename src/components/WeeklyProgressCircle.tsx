import React from 'react';
import './WeeklyProgressCircle.css';

interface WeeklyProgressCircleProps {
  salesValue: number;
  salesMax: number;
  reviewsValue: number;
  reviewsMax: number;
  salesGoalSet?: boolean;
  reviewsGoalSet?: boolean;
}

const WeeklyProgressCircle: React.FC<WeeklyProgressCircleProps> = ({ 
  salesValue, 
  salesMax, 
  reviewsValue, 
  reviewsMax,
  salesGoalSet = true,
  reviewsGoalSet = true
}) => {
  const stroke = 8; // Same thickness for both rings
  const outerRadius = 35; // Pink sales ring
  const innerRadius = outerRadius - stroke; // Green reviews ring just inside

  // Progress is always actual / target
  const salesProgress = salesMax ? salesValue / salesMax : 0;
  const reviewsProgress = reviewsMax ? reviewsValue / reviewsMax : 0;

  // Sales ring calculations
  const salesNormalizedRadius = outerRadius - stroke / 2;
  const salesCircumference = salesNormalizedRadius * 2 * Math.PI;
  const salesStrokeDashoffset = salesProgress >= 1 ? 0 : salesCircumference * (1 - salesProgress);

  // Reviews ring calculations
  const reviewsNormalizedRadius = innerRadius - stroke / 2;
  const reviewsCircumference = reviewsNormalizedRadius * 2 * Math.PI;
  const reviewsStrokeDashoffset = reviewsProgress >= 1 ? 0 : reviewsCircumference * (1 - reviewsProgress);

  // Trophy/tick logic - only show if goals are set
  const tol = 0.001;
  const salesDone = salesProgress >= 1 - tol && salesGoalSet;
  const reviewsDone = reviewsProgress >= 1 - tol && reviewsGoalSet;
  
  let tickType: 'trophy' | 'pink' | 'green' | null = null;
  if (salesGoalSet && reviewsGoalSet) {
  if (salesDone && reviewsDone) {
    tickType = 'trophy';
  } else if (salesDone && !reviewsDone) {
    tickType = 'pink';
  } else if (!salesDone && reviewsDone) {
    tickType = 'green';
    }
  }

  return (
    <svg
      height={outerRadius * 2}
      width={outerRadius * 2}
      className="weekly-progress-ring"
    >
      {/* Sales ring - background (transparent pink) - always show */}
      <circle
        stroke="#ff1493"
        fill="none"
        strokeWidth={stroke}
        strokeOpacity="0.3"
        cx={outerRadius}
        cy={outerRadius}
        r={salesNormalizedRadius}
        transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
      />
      {/* Sales ring - progress (solid pink) - only if goal is set */}
      {salesGoalSet && (
      <circle
        stroke="#ff1493"
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={salesCircumference}
        strokeDashoffset={salesStrokeDashoffset}
        cx={outerRadius}
        cy={outerRadius}
        r={salesNormalizedRadius}
        className="weekly-progress sales-progress"
        transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
      />
      )}
      {/* Reviews ring - background (transparent green) - always show */}
      <circle
        stroke="#00ff88"
        fill="none"
        strokeWidth={stroke}
        strokeOpacity="0.3"
        cx={outerRadius}
        cy={outerRadius}
        r={reviewsNormalizedRadius}
        transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
      />
      {/* Reviews ring - progress (solid green) - only if goal is set */}
      {reviewsGoalSet && (
      <circle
        stroke="#00ff88"
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={reviewsCircumference}
        strokeDashoffset={reviewsStrokeDashoffset}
        cx={outerRadius}
        cy={outerRadius}
        r={reviewsNormalizedRadius}
        className="weekly-progress reviews-progress"
        transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
      />
      )}
      {/* Trophy or tick if completed - only if goals are set */}
      {tickType === 'trophy' && (
        <g className="trophy-group" transform={`translate(${outerRadius}, ${outerRadius}) scale(0.09)`}>
          {/* Clean SVG trophy icon */}
          <rect x="-48" y="112" width="96" height="48" rx="8" fill="#463c4b" />
          <rect x="-32" y="80" width="64" height="32" rx="8" fill="#ffd700" stroke="#b8860b" strokeWidth="8" />
          <path d="M-64,-64 Q-64,64 0,64 Q64,64 64,-64" fill="#ffd700" stroke="#b8860b" strokeWidth="16" />
          <circle cx="0" cy="-32" r="32" fill="#ffd700" stroke="#b8860b" strokeWidth="8" />
          <path d="M0,-48 L8,-16 L32,-16 L12,0 L20,32 L0,16 L-20,32 L-12,0 L-32,-16 L-8,-16 Z" fill="#fff59d" stroke="#b8860b" strokeWidth="4" />
        </g>
      )}
      {tickType === 'pink' && (
        <g className="tick-group">
          <polyline
            points={
              `${outerRadius - 7},${outerRadius} ` +
              `${outerRadius - 2},${outerRadius + 6} ` +
              `${outerRadius + 8},${outerRadius - 6}`
            }
            fill="none"
            stroke="#ff1493"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="tick-mark"
          />
        </g>
      )}
      {tickType === 'green' && (
        <g className="tick-group">
          <polyline
            points={
              `${outerRadius - 7},${outerRadius} ` +
              `${outerRadius - 2},${outerRadius + 6} ` +
              `${outerRadius + 8},${outerRadius - 6}`
            }
            fill="none"
            stroke="#00ff88"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="tick-mark"
          />
        </g>
      )}
    </svg>
  );
};

export default WeeklyProgressCircle; 