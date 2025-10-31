import React, { useEffect, useState, useMemo } from 'react';
import './Dashboard.css';
import WeeklyProgressCircle from '../components/WeeklyProgressCircle';
import ProgressCircle from '../components/ProgressCircle';

const Dashboard: React.FC = () => {
  const [salesGoal, setSalesGoal] = useState<number | null>(null);
  const [reviewsGoal, setReviewsGoal] = useState<number | null>(null);
  const [microGoalItem, setMicroGoalItem] = useState<string>('');
  const [microGoalQuantity, setMicroGoalQuantity] = useState<number | null>(null);
  const [salesActual, setSalesActual] = useState(2000); // For test/demo
  const [reviewsActual, setReviewsActual] = useState(8); // For test/demo
  const [microGoalActual, setMicroGoalActual] = useState(10); // For test/demo
  
  // Competition state
  const [competition, setCompetition] = useState<{
    isActive: boolean;
    startDate: string;
    endDate: string;
    item: string;
    quantity: number;
    actual: number;
    instructions: string;
    winnerDefinition: string;
  } | null>(null);

  // Competitor data with random progress (commented out as not currently used)
  // const competitors = [
  //   {
  //     name: 'TRG Covent Garden',
  //     salesTarget: 2500,
  //     salesActual: 2500,
  //     reviewsTarget: 12,
  //     reviewsActual: 12
  //   },
  //   {
  //     name: 'TRG Stratford',
  //     salesTarget: 2200,
  //     salesActual: 1800,
  //     reviewsTarget: 10,
  //     reviewsActual: 7
  //   },
  //   {
  //     name: 'TRG SOHO',
  //     salesTarget: 2800,
  //     salesActual: 2400,
  //     reviewsTarget: 15,
  //     reviewsActual: 11
  //   }
  // ];

  useEffect(() => {
    const storedSalesGoal = localStorage.getItem('salesGoal');
    const storedReviewsGoal = localStorage.getItem('reviewsGoal');
    const storedMicroGoalItem = localStorage.getItem('microGoalItem');
    const storedMicroGoalQuantity = localStorage.getItem('microGoalQuantity');
    
    if (storedSalesGoal) setSalesGoal(Number(storedSalesGoal));
    if (storedReviewsGoal) setReviewsGoal(Number(storedReviewsGoal));
    if (storedMicroGoalItem) setMicroGoalItem(storedMicroGoalItem);
    if (storedMicroGoalQuantity) setMicroGoalQuantity(Number(storedMicroGoalQuantity));
    
    // Load competition data
    const storedCompetition = localStorage.getItem('competition');
    if (storedCompetition) {
      setCompetition(JSON.parse(storedCompetition));
    }
  }, []);

  // Progress is always actual / target
  const salesProgress = salesGoal ? salesActual / salesGoal : 0;
  const reviewsProgress = reviewsGoal ? reviewsActual / reviewsGoal : 0;
  const microGoalProgress = microGoalQuantity ? microGoalActual / microGoalQuantity : 0;
  const competitionProgress = competition?.isActive && competition?.quantity ? competition.actual / competition.quantity : 0;

  // Weekly data - using fixed percentages regardless of goals being set
  const weeklyData = [
    // Monday: sales 80%, reviews 50%
    { day: 'Mon', sales: 0.8, reviews: 1.0 },
    // Tuesday: sales 100%, reviews 100%
    { day: 'Tue', sales: 1.0, reviews: 1.0 },
    // Wednesday: sales 50%, reviews 50%
    { day: 'Wed', sales: 0.2, reviews: 0.4 },
    // Thursday: sales 100%, reviews 80%
    { day: 'Thu', sales: 1.0, reviews: 0.8 },
    // Friday-Sunday: no progress
    { day: 'Fri', sales: 0, reviews: 0 },
    { day: 'Sat', sales: 0, reviews: 0 },
    { day: 'Sun', sales: 0, reviews: 0 }
  ];

  // Handlers for editing actuals
  const handleActualEdit = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value;
      if (!isNaN(Number(value)) && value !== '') {
        setter(Number(value));
      }
    }
  };

  // List of all sites for league board - memoized to prevent infinite re-renders
  const allSites = useMemo(() => [
    'TRG Marylebone',
    'TRG Covent Garden',
    'TRG Spitalfields',
    'TRG Westfield',
    'TRG Stratford Westfield',
    'TRG Windsor',
    'TRG Soho',
    'TRG St Martins Lane',
    'TRG Muswell Hill',
    'TRG Southampton',
    'TRG Bournemouth',
    'TRG Dulwich',
    'TRG Bristol',
    'TRG The Strand',
    'TRG Tower Bridge',
    'TRG Bracknell',
    'TRG Norwich',
    'TRG Bluewater',
    'TRG Manchester',
    'TRG Trafford Centre',
    'TRG Solihull',
    'TRG Gloucester Quays',
    'TRG Edinburgh',
    'TRG Glasgow',
    'TRG Liverpool',
    'TRG Braintree',
    'TRG Sheffield Meadowhall',
    'TRG St Pauls',
  ], []);

  const getDefaultComparisonSites = useMemo(() => {
    return () => {
      const defaultSites = allSites.filter(site => site !== 'TRG Covent Garden').slice(0, 9);
      if (!defaultSites.includes('TRG Covent Garden')) defaultSites[0] = 'TRG Covent Garden';
      return Array.from(new Set(['TRG Covent Garden', ...defaultSites])).slice(0, 9);
    };
  }, [allSites]);

  const [leagueSites, setLeagueSites] = useState<string[]>([]);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('comparisonSites');
    let sites: string[] = stored ? JSON.parse(stored) : getDefaultComparisonSites();
    // Always include TRG Covent Garden
    if (!sites.includes('TRG Covent Garden')) sites = ['TRG Covent Garden', ...sites];
    // Fill with randoms if less than 9
    if (sites.length < 9) {
      const pool = allSites.filter(site => !['TRG Bankside', ...sites].includes(site));
      const shuffled = pool.sort(() => 0.5 - Math.random());
      const needed = 9 - sites.length;
      sites = [...sites, ...shuffled.slice(0, needed)];
    }
    sites = Array.from(new Set(sites)).slice(0, 9);
    setLeagueSites(['TRG Bankside', ...sites]);
  }, [salesGoal, reviewsGoal, microGoalItem, microGoalQuantity, allSites, getDefaultComparisonSites]);

  // Generate league board data
  const leagueData = leagueSites.map(site => {
    if (site === 'TRG Bankside') {
      return { name: site, percent: Math.round((salesGoal ? salesActual / salesGoal : 0) * 100), isUser: true };
    }
    // Fake data for other sites
    return { name: site, percent: Math.floor(Math.random() * 41) + 60, isUser: false }; // 60-100%
  });
  // Sort by percent descending
  leagueData.sort((a, b) => b.percent - a.percent);

  // Function to convert winner definition to readable format
  const getWinnerDefinitionText = (definition: string) => {
    const definitions: { [key: string]: string } = {
      'team_highest_sales': 'Team with highest sales wins',
      'individual_highest_sales': 'Individual with highest sales wins',
      'team_hits_target': 'Any team that hits target sales wins'
    };
    return definitions[definition] || definition;
  };

  return (
    <div className="dashboard-wrapper">

      <div className="dashboard-container">
        <h1>Today's Progress</h1>
        
        
        <div className="dashboard-content">
          <div className="center-rings">
            <ProgressCircle 
              salesValue={salesActual} 
              salesMax={salesGoal || 1} 
              reviewsValue={reviewsActual} 
              reviewsMax={reviewsGoal || 1}
              microGoalValue={microGoalActual}
              microGoalMax={microGoalQuantity || 1}
              competitionValue={competition?.actual || 0}
              competitionMax={competition?.quantity || 1}
              salesGoalSet={!!salesGoal}
              reviewsGoalSet={!!reviewsGoal}
              microGoalSet={!!microGoalQuantity}
              competitionSet={!!competition?.isActive}
            />
          </div>
          
          
          <div className="right-table">
            <div className="progress-table">
            <div className="table-header">
              <span>Metric</span>
              <span>Target</span>
              <span>Actual</span>
              <span>Progress</span>
            </div>
            <div className="table-row sales-row">
              <span className="metric-name">Sales</span>
              <span className="target">£{salesGoal ? salesGoal.toLocaleString() : 'Not set'}</span>
              <span className="actual">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={salesActual}
                  onKeyDown={handleActualEdit(setSalesActual)}
                  style={{ width: '70px', fontWeight: 600, fontSize: '0.95rem', background: 'transparent', color: '#fff', border: 'none', outline: 'none', textAlign: 'right' }}
                />
              </span>
              <span className="progress-percent">{Math.round(salesProgress * 100)}%</span>
            </div>
            <div className="table-row reviews-row">
              <span className="metric-name">Google reviews</span>
              <span className="target">{reviewsGoal || 'Not set'}</span>
              <span className="actual">
                <input
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={reviewsActual}
                  onKeyDown={handleActualEdit(setReviewsActual)}
                  style={{ width: '50px', fontWeight: 600, fontSize: '0.95rem', background: 'transparent', color: '#fff', border: 'none', outline: 'none', textAlign: 'right' }}
                />
              </span>
              <span className="progress-percent">{Math.round(reviewsProgress * 100)}%</span>
            </div>
            <div className="table-row micro-row">
              <span className="metric-name">Micro Goal</span>
              <span className="target">{microGoalQuantity ? `${microGoalQuantity} ${microGoalItem}` : 'Not set'}</span>
              <span className="actual">
                <input
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={microGoalActual}
                  onKeyDown={handleActualEdit(setMicroGoalActual)}
                  style={{ width: '50px', fontWeight: 600, fontSize: '0.95rem', background: 'transparent', color: '#fff', border: 'none', outline: 'none', textAlign: 'right' }}
                />
              </span>
              <span className="progress-percent">{Math.round(microGoalProgress * 100)}%</span>
            </div>
            {competition?.isActive && (
              <div className="table-row competition-row">
                <span className="metric-name">🏆 Competition</span>
                <span 
                  className="target clickable-target" 
                  onClick={() => setShowInstructionsModal(true)}
                  style={{ cursor: 'pointer' }}
                >
                  {competition.quantity} {competition.item}
                </span>
                <span className="actual">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={competition.actual}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value;
                        if (!isNaN(Number(value)) && value !== '') {
                          const updatedCompetition = { ...competition, actual: Number(value) };
                          setCompetition(updatedCompetition);
                          localStorage.setItem('competition', JSON.stringify(updatedCompetition));
                        }
                      }
                    }}
                    style={{ width: '50px', fontWeight: 600, fontSize: '0.95rem', background: 'transparent', color: '#fff', border: 'none', outline: 'none', textAlign: 'right' }}
                  />
                </span>
                <span className="progress-percent">{Math.round(competitionProgress * 100)}%</span>
              </div>
            )}
            </div>
          </div>
        </div>
        
        <div className="weekly-progress">
          <h2>This week</h2>
          <div className="weekly-rings">
            {weeklyData.map((dayData, index) => (
              <div key={index} className="day-ring">
                <WeeklyProgressCircle
                  salesValue={dayData.sales}
                  salesMax={1}
                  reviewsValue={dayData.reviews}
                  reviewsMax={1}
                  salesGoalSet={!!salesGoal}
                  reviewsGoalSet={!!reviewsGoal}
                />
                <span className="day-label">{dayData.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="competitor-sidebar">
        <h2>Area's progress</h2>
        <div className="competitor-list">
          {leagueData.map((site, index) => (
            <div key={site.name} className={`competitor-item${site.isUser ? ' user-site' : ''}`}>
              <div className="competitor-progress-bar-bg">
                <div
                  className="competitor-progress-bar-fill"
                  style={{ width: `${site.percent}%` }}
                >
                  <span className="competitor-bar-text name">{site.name}</span>
                  <span className="competitor-bar-text percent">{site.percent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Instructions Modal */}
      {showInstructionsModal && (competition?.instructions || competition?.winnerDefinition) && (
        <div className="instructions-modal-overlay" onClick={() => setShowInstructionsModal(false)}>
          <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="instructions-header">
              <h3>🏆 Competition Details</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowInstructionsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="instructions-content">
              {competition?.winnerDefinition && (
                <div className="winner-definition-section">
                  <h4>🏆 Winner Criteria</h4>
                  <p className="winner-criteria">{getWinnerDefinitionText(competition.winnerDefinition)}</p>
                </div>
              )}
              {competition?.instructions && (
                <div className="instructions-section">
                  <h4>💬 Instructions & Motivation</h4>
                  <p>{competition.instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 