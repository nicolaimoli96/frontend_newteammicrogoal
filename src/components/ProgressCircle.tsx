import React, { useEffect, useRef, useState } from 'react';
import './ProgressCircle.css';

interface ProgressCircleProps {
  salesValue: number;
  salesMax: number;
  reviewsValue: number;
  reviewsMax: number;
  microGoalValue?: number;
  microGoalMax?: number;
  competitionValue?: number;
  competitionMax?: number;
  showMicroGoal?: boolean;
  salesGoalSet?: boolean;
  reviewsGoalSet?: boolean;
  microGoalSet?: boolean;
  competitionSet?: boolean;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ 
  salesValue, 
  salesMax, 
  reviewsValue, 
  reviewsMax, 
  microGoalValue = 0, 
  microGoalMax = 1,
  competitionValue = 0,
  competitionMax = 1,
  showMicroGoal = true,
  salesGoalSet = true,
  reviewsGoalSet = true,
  microGoalSet = true,
  competitionSet = false
}) => {
  const competitionRadius = 112; // Yellow competition ring - outermost (largest)
  const outerRadius = 90; // Pink sales ring - second largest
  const innerRadius = 74; // Green reviews ring - third largest
  const microRadius = 58; // Orange micro goal ring - innermost (smallest)
  const stroke = 16;
  const competitionStroke = 20; // Thicker stroke for competition ring
  
  // Refs for animated circles
  const salesRef = useRef<SVGCircleElement>(null);
  const reviewsRef = useRef<SVGCircleElement>(null);
  const microRef = useRef<SVGCircleElement>(null);
  const competitionRef = useRef<SVGCircleElement>(null);
  
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

  // Competition ring calculations
  const competitionNormalizedRadius = competitionRadius - competitionStroke / 2;
  const competitionCircumference = competitionNormalizedRadius * 2 * Math.PI;
  const competitionProgress = competitionMax ? Math.min(competitionValue / competitionMax, 1) : 0;
  const competitionStrokeDashoffset = competitionCircumference * (1 - Math.min(competitionProgress, 1));

  // Add animated dashoffset state for each ring
  const [animatedSalesDashoffset, setAnimatedSalesDashoffset] = useState(salesCircumference);
  const [animatedReviewsDashoffset, setAnimatedReviewsDashoffset] = useState(reviewsCircumference);
  const [animatedMicroDashoffset, setAnimatedMicroDashoffset] = useState(microCircumference);
  const [animatedCompetitionDashoffset, setAnimatedCompetitionDashoffset] = useState(competitionCircumference);

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

  // Animate competition ring
  useEffect(() => {
    setAnimatedCompetitionDashoffset(competitionCircumference);
    requestAnimationFrame(() => {
      setAnimatedCompetitionDashoffset(competitionStrokeDashoffset);
    });
  }, [competitionStrokeDashoffset, competitionCircumference]);

  // Set animations complete after the animation duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsComplete(true);
    }, 1200); // Match the CSS transition duration

    return () => clearTimeout(timer);
  }, [salesProgress, reviewsProgress, microProgress, competitionProgress]);

  // Robust tick/trophy logic - only show if animations are complete and all goals are set
  const tol = 0.001;
  const salesDone = salesProgress >= 1 - tol && salesGoalSet;
  const reviewsDone = reviewsProgress >= 1 - tol && reviewsGoalSet;
  const microDone = microProgress >= 1 - tol && microGoalSet;
  const competitionDone = competitionProgress >= 1 - tol && competitionSet;
  
  let tickType: 'trophy' | 'pink' | 'green' | 'orange' | 'yellow' | null = null;
  if (animationsComplete && salesGoalSet && reviewsGoalSet && (!showMicroGoal || microGoalSet)) {
    if (showMicroGoal) {
      if (salesDone && reviewsDone && microDone) {
        tickType = 'trophy';
      } else if (salesDone && !reviewsDone && !microDone && !competitionDone) {
        tickType = 'pink';
      } else if (!salesDone && reviewsDone && !microDone && !competitionDone) {
        tickType = 'green';
      } else if (!salesDone && !reviewsDone && microDone && !competitionDone) {
        tickType = 'orange';
      } else if (!salesDone && !reviewsDone && !microDone && competitionDone) {
        tickType = 'yellow';
      }
    } else {
      if (salesDone && reviewsDone) {
        tickType = 'trophy';
      } else if (salesDone && !reviewsDone && !competitionDone) {
        tickType = 'pink';
      } else if (!salesDone && reviewsDone && !competitionDone) {
        tickType = 'green';
      } else if (!salesDone && !reviewsDone && competitionDone) {
        tickType = 'yellow';
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
  const centerX = competitionRadius + stroke;
  const centerY = competitionRadius + stroke;

  return (
    <div style={{ position: 'relative', width: (competitionRadius + stroke) * 2, height: (competitionRadius + stroke) * 2 }}>
      {/* Animated happy image for trophy, absolutely positioned */}
      {showBigHappy && (
        <img
          src={process.env.PUBLIC_URL + '/nic-malta-happy.png'}
          alt="nic-malta-happy"
          style={{
            position: 'absolute',
            left: shrinkHappy ? centerX - microRadius * happyScale : centerX - outerRadius * 3 * happyScale,
            top: shrinkHappy ? centerY - microRadius * happyScale : centerY - outerRadius * 3 * happyScale,
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
            left: centerX - microRadius * happyScale,
            top: centerY - microRadius * happyScale,
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
        height={(competitionRadius + stroke) * 2}
        width={(competitionRadius + stroke) * 2}
        className="progress-ring"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        {/* Sales ring - background (transparent pink) - always show */}
        <circle
          stroke="#ff1493"
          fill="none"
          strokeWidth={stroke}
          strokeOpacity="0.3"
          cx={centerX}
          cy={centerY}
          r={salesNormalizedRadius}
          transform={`rotate(-90 ${centerX} ${centerY})`}
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
            cx={centerX}
            cy={centerY}
            r={salesNormalizedRadius}
            className="progress sales-progress"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />
        )}
        {/* Sales ring starting arrow - only if goal is set */}
        {salesGoalSet && (
          <g transform={`translate(${centerX}, ${centerY - salesNormalizedRadius}) rotate(90)`}>
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
          cx={centerX}
          cy={centerY}
          r={reviewsNormalizedRadius}
          transform={`rotate(-90 ${centerX} ${centerY})`}
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
            cx={centerX}
            cy={centerY}
            r={reviewsNormalizedRadius}
            className="progress reviews-progress"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />
        )}
        {/* Reviews ring starting arrow - only if goal is set */}
        {reviewsGoalSet && (
          <g transform={`translate(${centerX}, ${centerY - reviewsNormalizedRadius}) rotate(90)`}>
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
              cx={centerX}
              cy={centerY}
              r={microNormalizedRadius}
              transform={`rotate(-90 ${centerX} ${centerY})`}
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
                cx={centerX}
                cy={centerY}
                r={microNormalizedRadius}
                className="progress micro-progress"
                transform={`rotate(-90 ${centerX} ${centerY})`}
              />
            )}
            {/* Micro goal ring starting arrow - only if goal is set */}
            {microGoalSet && (
              <g transform={`translate(${centerX}, ${centerY - microNormalizedRadius}) rotate(90)`}>
                <polygon
                  points="0,-5 2.5,-1.25 0,1.25 -2.5,-1.25"
                  fill="#e67e00"
                  className="start-arrow"
                />
              </g>
            )}
          </>
        )}
        {/* Competition ring - only show if competition is set - OUTERMOST RING */}
        {competitionSet && (
          <>
            {/* Competition ring - background (transparent yellow) - always show */}
            <circle
              stroke="#ffd700"
              fill="none"
              strokeWidth={competitionStroke}
              strokeOpacity="0.3"
              cx={centerX}
              cy={centerY}
              r={competitionNormalizedRadius}
              transform={`rotate(-90 ${centerX} ${centerY})`}
            />
            {/* Competition ring - progress (solid yellow) - only if competition is set */}
            <circle
              ref={competitionRef}
              stroke="#ffd700"
              fill="none"
              strokeWidth={competitionStroke}
              strokeLinecap="round"
              strokeDasharray={competitionCircumference}
              strokeDashoffset={animatedCompetitionDashoffset}
              cx={centerX}
              cy={centerY}
              r={competitionNormalizedRadius}
              className="progress competition-progress"
              transform={`rotate(-90 ${centerX} ${centerY})`}
            />
            {/* Competition ring starting arrow - only if competition is set */}
            <g transform={`translate(${centerX}, ${centerY - competitionNormalizedRadius}) rotate(90)`}>
              <polygon
                points="0,-4 2,-1 0,1 -2,-1"
                fill="#e6c200"
                className="start-arrow"
              />
            </g>
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
                  left: centerX - microRadius * happyScale,
                  top: centerY - microRadius * happyScale,
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
                `${centerX - 18},${centerY} ` +
                `${centerX - 5},${centerY + 16} ` +
                `${centerX + 20},${centerY - 12}`
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
                `${centerX - 18},${centerY} ` +
                `${centerX - 5},${centerY + 16} ` +
                `${centerX + 20},${centerY - 12}`
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
                `${centerX - 18},${centerY} ` +
                `${centerX - 5},${centerY + 16} ` +
                `${centerX + 20},${centerY - 12}`
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
        {tickType === 'yellow' && (
          <g className="tick-group">
            <polyline
              points={
                `${centerX - 18},${centerY} ` +
                `${centerX - 5},${centerY + 16} ` +
                `${centerX + 20},${centerY - 12}`
              }
              fill="none"
              stroke="#ffd700"
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