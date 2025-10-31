import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SetGoal.css';
// Icons removed - not currently used

const DAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEATHERS = [
  { label: 'Rain', value: 'rain' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Wind', value: 'wind' },
  { label: 'Sunny', value: 'sunny' },
];

const MICRO_CATEGORIES = [
  { label: 'Hummus', value: 'Hummus' },
  { label: 'Cheesecake', value: 'Cheesecake' },
  { label: 'Water', value: 'Water' },
  { label: 'Olives', value: 'Olives' },
  { label: 'Dips', value: 'Dips' },
  { label: 'Dessert', value: 'Dessert' },
  { label: 'Drinks', value: 'Drinks' },
  { label: 'Glass of Wine', value: 'Glass of Wine' },
  { label: 'Appetizers', value: 'Appetizers' },
  { label: 'Main Course', value: 'Main Course' },
  { label: 'Side Dishes', value: 'Side Dishes' },
  { label: 'Beverages', value: 'Beverages' },
];

const SetGoal: React.FC = () => {
  const [salesGoal, setSalesGoal] = useState<string>('');
  const [reviewsGoal, setReviewsGoal] = useState<string>('');
  // const [microGoalItem, setMicroGoalItem] = useState<string>('');
  // const [microGoalQuantity, setMicroGoalQuantity] = useState<string>('');
  const navigate = useNavigate();

  // Add state for micro goal tab (commented out as not currently used)
  // const [microTab, setMicroTab] = useState<'items' | 'category' | 'asph'>('items');
  // const microItems = ['Hummus', 'Cheesecake', 'Water', 'Olives'];
  // const microCategories = ['Dips', 'Dessert', 'Drinks', 'Glass of Wine'];
  // const [microGoalASPHAmount, setMicroGoalASPHAmount] = useState<string>(() => localStorage.getItem('microGoalASPHAmount') || '');

  // Add state for dropdown open/close (commented out as not currently used)
  // const [microDropdownOpen, setMicroDropdownOpen] = useState(false);
  // const [microSearch, setMicroSearch] = useState('');

  const allSites = [
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
  ];

  const getDefaultComparisonSites = () => {
    // Always include Covent Garden, and first 9 (if not already included)
    const defaultSites = allSites.filter(site => site !== 'TRG Covent Garden').slice(0, 9);
    if (!defaultSites.includes('TRG Covent Garden')) defaultSites[0] = 'TRG Covent Garden';
    return Array.from(new Set(['TRG Covent Garden', ...defaultSites])).slice(0, 9);
  };

  const [comparisonSites, setComparisonSites] = useState<string[]>(() => {
    const stored = localStorage.getItem('comparisonSites');
    if (stored) return JSON.parse(stored);
    return getDefaultComparisonSites();
  });

  const handleCheckboxChange = (site: string) => {
    let sites = comparisonSites.includes(site)
      ? comparisonSites.filter(s => s !== site && s !== 'TRG Covent Garden')
      : [...comparisonSites, site];
    // Always include Covent Garden
    if (!sites.includes('TRG Covent Garden')) sites = ['TRG Covent Garden', ...sites];
    if (sites.length > 9) sites = sites.slice(0, 9);
    setComparisonSites(sites);
    localStorage.setItem('comparisonSites', JSON.stringify(sites));
  };

  // Load existing goals from localStorage
  useEffect(() => {
    const storedSalesGoal = localStorage.getItem('salesGoal');
    const storedReviewsGoal = localStorage.getItem('reviewsGoal');
    // const storedMicroGoalItem = localStorage.getItem('microGoalItem');
    // const storedMicroGoalQuantity = localStorage.getItem('microGoalQuantity');
    
    if (storedSalesGoal) setSalesGoal(storedSalesGoal);
    if (storedReviewsGoal) setReviewsGoal(storedReviewsGoal);
    // if (storedMicroGoalItem) setMicroGoalItem(storedMicroGoalItem);
    // if (storedMicroGoalQuantity) setMicroGoalQuantity(storedMicroGoalQuantity);
  }, []);

  const [aiModal, setAiModal] = useState<{category: string, quantity: number}[] | null>(null);
  const [aiPending, setAiPending] = useState(false);
  const [microDay, setMicroDay] = useState<number>(1);
  const [microHour, setMicroHour] = useState<number>(19);
  const [microWeather, setMicroWeather] = useState<string>('sunny');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);  // Index of selected top suggestion
  
  // Manual micro goal state
  const [microGoalMode, setMicroGoalMode] = useState<'ai' | 'manual'>('ai');
  const [manualMicroCategory, setManualMicroCategory] = useState<string>('');
  const [manualMicroQuantity, setManualMicroQuantity] = useState<string>('');

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salesGoal && !isNaN(Number(salesGoal)) && reviewsGoal && !isNaN(Number(reviewsGoal))) {
      if (microGoalMode === 'manual') {
        // Manual mode - save directly
        if (manualMicroCategory && manualMicroQuantity && !isNaN(Number(manualMicroQuantity))) {
          localStorage.setItem('salesGoal', salesGoal);
          localStorage.setItem('reviewsGoal', reviewsGoal);
          localStorage.setItem('microGoalItem', manualMicroCategory);
          localStorage.setItem('microGoalQuantity', manualMicroQuantity);
          navigate('/');
        }
      } else {
        // AI mode - get suggestions
        setAiPending(true);
        try {
          // Use Netlify function proxy to avoid CORS issues
          const apiUrl = process.env.REACT_APP_API_URL || '';
          const endpoint = apiUrl ? `${apiUrl}/api/suggest-category` : '/.netlify/functions/suggest-category';
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              day_of_week: microDay,
              hour: microHour,
              weather: microWeather
            })
          });
          if (!res.ok) {
            throw new Error('API request failed');
          }
          const data = await res.json();
          setAiPending(false);
          setAiModal(data.suggestions);  // Array of top 3 {category, quantity}
          setSelectedSuggestion(0);  // Default to first suggestion
        } catch (error) {
          console.error('Error fetching AI suggestion:', error);
          setAiPending(false);
          // Optional: Show error message to user
        }
      }
    }
  };
  const handleApproveAIGoal = () => {
    if (aiModal) {
      const selected = aiModal[selectedSuggestion];
      localStorage.setItem('salesGoal', salesGoal);
      localStorage.setItem('reviewsGoal', reviewsGoal);
      localStorage.setItem('microGoalItem', selected.category);
      localStorage.setItem('microGoalQuantity', String(selected.quantity));
      navigate('/');
    }
  };

  // Close dropdown on outside click (commented out as micro dropdown functionality is not currently used)
  // useEffect(() => {
  //   if (!microDropdownOpen) return;
  //   function handleClick(e: MouseEvent) {
  //     // if (microDropdownRef && !microDropdownRef.contains(e.target as Node)) {
  //       // setMicroDropdownOpen(false);
  //     }
  //   }
  //   document.addEventListener('mousedown', handleClick);
  //   return () => document.removeEventListener('mousedown', handleClick);
  // }, [microDropdownOpen]);

  return (
    <div className="set-goal-container">
      <h1>Set Your Daily Goals</h1>
      <form onSubmit={handleSaveGoals}>
        <div className="goals-section">
          <div className="goal-section">
            <h2>Sales Target</h2>
            <div className="input-group">
              <label>Sales (£)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter your sales goal"
                value={salesGoal}
                onChange={e => setSalesGoal(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="goal-section">
            <h2>Reviews Target</h2>
            <div className="input-group">
              <label>Goal</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Enter your reviews goal"
                value={reviewsGoal}
                onChange={e => setReviewsGoal(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="goal-section">
            <h2>Micro Goal Target</h2>
          
          {/* Mode Selection */}
          <div className="input-group">
            <label>Goal Setting Mode</label>
            <div className="mode-selection">
              <label className="mode-option">
                <input
                  type="radio"
                  name="microGoalMode"
                  value="ai"
                  checked={microGoalMode === 'ai'}
                  onChange={e => setMicroGoalMode(e.target.value as 'ai' | 'manual')}
                />
                <span>AI Suggestions (based on time & weather)</span>
              </label>
              <label className="mode-option">
                <input
                  type="radio"
                  name="microGoalMode"
                  value="manual"
                  checked={microGoalMode === 'manual'}
                  onChange={e => setMicroGoalMode(e.target.value as 'ai' | 'manual')}
                />
                <span>Manual Entry</span>
              </label>
            </div>
          </div>

          {/* AI Mode Fields */}
          {microGoalMode === 'ai' && (
            <>
              <div className="input-group">
                <label>Day of Week</label>
                <select value={microDay} onChange={e => setMicroDay(Number(e.target.value))}>
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Hour</label>
                <select value={microHour} onChange={e => setMicroHour(Number(e.target.value))}>
                  {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Weather</label>
                <select value={microWeather} onChange={e => setMicroWeather(e.target.value)}>
                  {WEATHERS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Manual Mode Fields */}
          {microGoalMode === 'manual' && (
            <>
              <div className="input-group">
                <label>Item Category</label>
                <select 
                  value={manualMicroCategory} 
                  onChange={e => setManualMicroCategory(e.target.value)}
                  required={microGoalMode === 'manual'}
                >
                  <option value="">Select a category</option>
                  {MICRO_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Target Quantity</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter target quantity"
                  value={manualMicroQuantity}
                  onChange={e => setManualMicroQuantity(e.target.value)}
                  required={microGoalMode === 'manual'}
                />
              </div>
            </>
          )}
          </div>
          
          <div className="ai-button-section">
            <button onClick={handleSaveGoals} className="save-button" disabled={aiPending}>
              {aiPending ? 'AI is thinking...' : microGoalMode === 'manual' ? 'Save Goals' : 'Get AI Suggestions'}
            </button>
          </div>
        </div>
        
        <div className="competing-locations-section">
          <div className="goal-section">
            <h2>Competing Locations</h2>
            <div className="input-group">
              <label>Select locations to compare with:</label>
              <div className="site-checkbox-list">
                {allSites.map(site => (
                  <label key={site} className={`site-checkbox-label ${site === 'TRG Covent Garden' ? 'always-included' : ''} ${comparisonSites.includes(site) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={comparisonSites.includes(site)}
                      onChange={() => handleCheckboxChange(site)}
                      disabled={site === 'TRG Covent Garden'}
                    />
                    {site}
                  </label>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b0b8c1', marginTop: 4 }}>
                (TRG Covent Garden is always included)
              </div>
              <button 
                type="button"
                className="deselect-all-button"
                onClick={() => {
                  setComparisonSites(['TRG Covent Garden']);
                }}
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>
      </form>
      <div className="save-feedback" style={{ display: 'none' }}>Goals saved!</div>
      {aiModal && (
        <div className="ai-modal-overlay modern-modal-overlay">
          <div className="ai-modal modern-modal">
            <h3>AI Suggestions (Top 3)</h3>
            {aiModal.map((sug, idx) => (
              <div key={idx} className={`ai-suggestion modern-suggestion${selectedSuggestion === idx ? ' selected' : ''}`} onClick={() => setSelectedSuggestion(idx)}>
                <p>Category: <b>{sug.category}</b></p>
                <p>Quantity: <b>{sug.quantity}</b></p>
              </div>
            ))}
            <button onClick={handleApproveAIGoal} className="save-button modern-save">Approve Selected</button>
            <button onClick={() => setAiModal(null)} className="modern-cancel">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetGoal;