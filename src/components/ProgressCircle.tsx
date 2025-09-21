import React, { useEffect, useRef, useState } from 'react';
import './ProgressCircle.css';

interface ProgressCircleProps {
  salesValue: number;
  salesMax: number;
  reviewsValue: number;
  reviewsMax: number;
  microGoalValue?: number;
  microGoalMax?: number;
  showMicroGoal?: boolean;
  salesGoalSet?: boolean;
  reviewsGoalSet?: boolean;
  microGoalSet?: boolean;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ 
  salesValue, 
  salesMax, 
  reviewsValue, 
  reviewsMax, 
  microGoalValue = 0, 
  microGoalMax = 1,
  showMicroGoal = true,
  salesGoalSet = true,
  reviewsGoalSet = true,
  microGoalSet = true
}) => {
  const outerRadius = 90; // Larger pink sales ring
  const innerRadius = 74; // Green reviews ring
  const microRadius = 58; // Orange micro goal ring (74 - 16)
  const stroke = 16;
  
  // Refs for animated circles
  const salesRef = useRef<SVGCircleElement>(null);
  const reviewsRef = useRef<SVGCircleElement>(null);
  const microRef = useRef<SVGCircleElement>(null);
  
  // State to track when animations are complete
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [showBigHappy, setShowBigHappy] = useState(false);
  const [shrinkHappy, setShrinkHappy] = useState(false);
  
  // Add a state to force re-mounting the animated circles on every progress change
  // const [animationKey, setAnimationKey] = useState(0);

  // Sales ring calculations
  const salesNormalizedRadius = outerRadius - stroke / 2;
  const salesCircumference = salesNormalizedRadius * 2 * Math.PI;
  const salesProgress = salesMax ? Math.min(salesValue / salesMax, 1) : 0;
  const salesStrokeDashoffset = salesCircumference * (1 - Math.min(salesProgress, 1));
  
  // Reviews ring calculations
  const reviewsNormalizedRadius = innerRadius - stroke / 2;
  const reviewsCircumference = reviewsNormalizedRadius * 2 * Math.PI;
  const reviewsProgress = reviewsMax ? Math.min(reviewsValue / reviewsMax, 1) : 0;
  const reviewsStrokeDashoffset = reviewsCircumference * (1 - Math.min(reviewsProgress, 1));

  // Micro goal ring calculations
  const microNormalizedRadius = microRadius - stroke / 2;
  const microCircumference = microNormalizedRadius * 2 * Math.PI;
  const microProgress = microGoalMax ? Math.min(microGoalValue / microGoalMax, 1) : 0;
  const microStrokeDashoffset = microCircumference * (1 - Math.min(microProgress, 1));

  // Add animated dashoffset state for each ring
  const [animatedSalesDashoffset, setAnimatedSalesDashoffset] = useState(salesCircumference);
  const [animatedReviewsDashoffset, setAnimatedReviewsDashoffset] = useState(reviewsCircumference);
  const [animatedMicroDashoffset, setAnimatedMicroDashoffset] = useState(microCircumference);

  // Animate sales ring
  useEffect(() => {
    setAnimatedSalesDashoffset(salesCircumference);
    requestAnimationFrame(() => {
      setAnimatedSalesDashoffset(salesStrokeDashoffset);
    });
  }, [salesStrokeDashoffset, salesCircumference]);

  // Animate reviews ring
  useEffect(() => {
    setAnimatedReviewsDashoffset(reviewsCircumference);
    requestAnimationFrame(() => {
      setAnimatedReviewsDashoffset(reviewsStrokeDashoffset);
    });
  }, [reviewsStrokeDashoffset, reviewsCircumference]);

  // Animate micro ring
  useEffect(() => {
    setAnimatedMicroDashoffset(microCircumference);
    requestAnimationFrame(() => {
      setAnimatedMicroDashoffset(microStrokeDashoffset);
    });
  }, [microStrokeDashoffset, microCircumference]);

  // Set animations complete after the animation duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsComplete(true);
    }, 1200); // Match the CSS transition duration

    return () => clearTimeout(timer);
  }, [salesProgress, reviewsProgress, microProgress]);

  // Robust tick/trophy logic - only show if animations are complete and all goals are set
  const tol = 0.001;
  const salesDone = salesProgress >= 1 - tol && salesGoalSet;
  const reviewsDone = reviewsProgress >= 1 - tol && reviewsGoalSet;
  const microDone = microProgress >= 1 - tol && microGoalSet;
  
  let tickType: 'trophy' | 'pink' | 'green' | 'orange' | null = null;
  if (animationsComplete && salesGoalSet && reviewsGoalSet && (!showMicroGoal || microGoalSet)) {
    if (showMicroGoal) {
      if (salesDone && reviewsDone && microDone) {
        tickType = 'trophy';
      } else if (salesDone && !reviewsDone && !microDone) {
        tickType = 'pink';
      } else if (!salesDone && reviewsDone && !microDone) {
        tickType = 'green';
      } else if (!salesDone && !reviewsDone && microDone) {
        tickType = 'orange';
      }
    } else {
      if (salesDone && reviewsDone) {
        tickType = 'trophy';
      } else if (salesDone && !reviewsDone) {
        tickType = 'pink';
      } else if (!salesDone && reviewsDone) {
        tickType = 'green';
      }
    }
  }

  // When trophy condition is met, trigger the big image animation
  useEffect(() => {
    if (tickType === 'trophy' && animationsComplete) {
      setShowBigHappy(true);
      setShrinkHappy(false);
      // Start shrink after a short delay
      setTimeout(() => setShrinkHappy(true), 600);
      // Hide after animation
      setTimeout(() => setShowBigHappy(false), 1600);
    }
  }, [tickType, animationsComplete]);

  // 1. Make the happy image 30% smaller in both animation and final state
  const happyScale = 0.7; // 70% of previous size

  return (
    <div style={{ position: 'relative', width: outerRadius * 2, height: outerRadius * 2 }}>
      {/* Animated happy image for trophy, absolutely positioned */}
      {showBigHappy && (
        <img
          src={process.env.PUBLIC_URL + '/nic-malta-happy.png'}
          alt="nic-malta-happy"
          style={{
            position: 'absolute',
            left: shrinkHappy ? outerRadius - microRadius * happyScale : outerRadius - outerRadius * 3 * happyScale,
            top: shrinkHappy ? outerRadius - microRadius * happyScale : outerRadius - outerRadius * 3 * happyScale,
            width: shrinkHappy ? microRadius * 2 * happyScale : outerRadius * 6 * happyScale,
            height: shrinkHappy ? microRadius * 2 * happyScale : outerRadius * 6 * happyScale,
            pointerEvents: 'none',
            transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
            zIndex: 10,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      )}
      {/* Static happy image after animation completes and if still trophy */}
      {!showBigHappy && tickType === 'trophy' && (
        <img
          src={process.env.PUBLIC_URL + '/nic-malta-happy.png'}
          alt="nic-malta-happy"
          style={{
            position: 'absolute',
            left: outerRadius - microRadius * happyScale,
            top: outerRadius - microRadius * happyScale,
            width: microRadius * 2 * happyScale,
            height: microRadius * 2 * happyScale,
            pointerEvents: 'none',
            zIndex: 10,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      )}
      <svg
        height={outerRadius * 2}
        width={outerRadius * 2}
        className="progress-ring"
        style={{ position: 'absolute', left: 0, top: 0 }}
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
            ref={salesRef}
            stroke="#ff1493"
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={salesCircumference}
            strokeDashoffset={animatedSalesDashoffset}
            cx={outerRadius}
            cy={outerRadius}
            r={salesNormalizedRadius}
            className="progress sales-progress"
            transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
          />
        )}
        {/* Sales ring starting arrow - only if goal is set */}
        {salesGoalSet && (
          <g transform={`translate(${outerRadius}, ${outerRadius - salesNormalizedRadius}) rotate(90)`}>
            <polygon
              points="0,-8 4,-2 0,2 -4,-2"
              fill="#c71585"
              className="start-arrow"
            />
          </g>
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
            ref={reviewsRef}
            stroke="#00ff88"
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={reviewsCircumference}
            strokeDashoffset={animatedReviewsDashoffset}
            cx={outerRadius}
            cy={outerRadius}
            r={reviewsNormalizedRadius}
            className="progress reviews-progress"
            transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
          />
        )}
        {/* Reviews ring starting arrow - only if goal is set */}
        {reviewsGoalSet && (
          <g transform={`translate(${outerRadius}, ${outerRadius - reviewsNormalizedRadius}) rotate(90)`}>
            <polygon
              points="0,-6 3,-1.5 0,1.5 -3,-1.5"
              fill="#00cc6a"
              className="start-arrow"
            />
          </g>
        )}
        {/* Micro goal ring - only show if showMicroGoal is true */}
        {showMicroGoal && (
          <>
            {/* Micro goal ring - background (transparent orange) - always show */}
            <circle
              stroke="#ff8c00"
              fill="none"
              strokeWidth={stroke}
              strokeOpacity="0.3"
              cx={outerRadius}
              cy={outerRadius}
              r={microNormalizedRadius}
              transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
            />
            {/* Micro goal ring - progress (solid orange) - only if goal is set */}
            {microGoalSet && (
              <circle
                ref={microRef}
                stroke="#ff8c00"
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={microCircumference}
                strokeDashoffset={animatedMicroDashoffset}
                cx={outerRadius}
                cy={outerRadius}
                r={microNormalizedRadius}
                className="progress micro-progress"
                transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
              />
            )}
            {/* Micro goal ring starting arrow - only if goal is set */}
            {microGoalSet && (
              <g transform={`translate(${outerRadius}, ${outerRadius - microNormalizedRadius}) rotate(90)`}>
                <polygon
                  points="0,-5 2.5,-1.25 0,1.25 -2.5,-1.25"
                  fill="#e67e00"
                  className="start-arrow"
                />
              </g>
            )}
          </>
        )}
        {/* Trophy or tick if completed - only show after animation and if all goals are set */}
        {tickType === 'trophy' && (
          <>
            {/* Static happy image after animation completes and if still trophy */}
            {!showBigHappy && tickType === 'trophy' && (
              <img
                src={process.env.PUBLIC_URL + '/nic-malta-happy.png'}
                alt="nic-malta-happy"
                style={{
                  position: 'absolute',
                  left: outerRadius - microRadius * happyScale,
                  top: outerRadius - microRadius * happyScale,
                  width: microRadius * 2 * happyScale,
                  height: microRadius * 2 * happyScale,
                  pointerEvents: 'none',
                  zIndex: 10,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            )}
          </>
        )}
        {tickType === 'pink' && (
          <g className="tick-group">
            <polyline
              points={
                `${outerRadius - 18},${outerRadius} ` +
                `${outerRadius - 5},${outerRadius + 16} ` +
                `${outerRadius + 20},${outerRadius - 12}`
              }
              fill="none"
              stroke="#ff1493"
              strokeWidth="8"
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
                `${outerRadius - 18},${outerRadius} ` +
                `${outerRadius - 5},${outerRadius + 16} ` +
                `${outerRadius + 20},${outerRadius - 12}`
              }
              fill="none"
              stroke="#00ff88"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="tick-mark"
            />
          </g>
        )}
        {tickType === 'orange' && (
          <g className="tick-group">
            <polyline
              points={
                `${outerRadius - 18},${outerRadius} ` +
                `${outerRadius - 5},${outerRadius + 16} ` +
                `${outerRadius + 20},${outerRadius - 12}`
              }
              fill="none"
              stroke="#ff8c00"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="tick-mark"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default ProgressCircle; 