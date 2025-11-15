import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SetGoal.css';

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

// Category options for the Category tab
const CATEGORY_OPTIONS = [
  'Dips',
  'Side salads',
  'Alcoholic drinks',
  'Desserts'
];

// Item options for the Items tab
const ITEM_OPTIONS = [
  'Olives',
  'hummus',
  'Coke',
  'Moussaka',
  'Tahini and Honey dip',
  'Portokalopita'
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
    'TRG Bankside',
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
    // Only include TRG Bankside by default
    return ['TRG Bankside'];
  };

  const [comparisonSites, setComparisonSites] = useState<string[]>(() => {
    const stored = localStorage.getItem('comparisonSites');
    if (stored) return JSON.parse(stored);
    return getDefaultComparisonSites();
  });

  const handleCheckboxChange = (site: string) => {
    let sites = comparisonSites.includes(site)
      ? comparisonSites.filter(s => s !== site && s !== 'TRG Bankside')
      : [...comparisonSites, site];
    // Always include TRG Bankside
    if (!sites.includes('TRG Bankside')) sites = ['TRG Bankside', ...sites];
    if (sites.length > 9) sites = sites.slice(0, 9);
    setComparisonSites(sites);
    localStorage.setItem('comparisonSites', JSON.stringify(sites));
  };

  // Load existing goals from localStorage
  useEffect(() => {
    const storedSalesGoal = localStorage.getItem('salesGoal');
    const storedReviewsGoal = localStorage.getItem('reviewsGoal');
    const storedMicroGoalItem = localStorage.getItem('microGoalItem');
    const storedMicroGoalQuantity = localStorage.getItem('microGoalQuantity');
    
    if (storedSalesGoal) setSalesGoal(storedSalesGoal);
    if (storedReviewsGoal) setReviewsGoal(storedReviewsGoal);
    if (storedMicroGoalItem) {
      // If it's stored as "ASPH: £X", extract just "ASPH"
      if (storedMicroGoalItem.startsWith('ASPH:')) {
        setManualMicroCategory('ASPH');
        const asphMatch = storedMicroGoalItem.match(/£(\d+\.?\d*)/);
        if (asphMatch) {
          setManualMicroQuantity(asphMatch[1]);
        }
      } else {
        setManualMicroCategory(storedMicroGoalItem);
      }
    }
    if (storedMicroGoalQuantity) {
      setManualMicroQuantity(storedMicroGoalQuantity);
    }
  }, []);

  const [aiModal, setAiModal] = useState<{category: string, quantity: number}[] | null>(null);
  const [aiPending, setAiPending] = useState(false);
  const [microDay, setMicroDay] = useState<number>(1);
  const [microHour, setMicroHour] = useState<number>(19);
  const [microWeather, setMicroWeather] = useState<string>('sunny');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);  // Index of selected top suggestion
  
  // Manual micro goal state
  const [microGoalMode, setMicroGoalMode] = useState<'ai' | 'manual'>('manual');
  const [manualMicroCategory, setManualMicroCategory] = useState<string>('');
  const [manualMicroQuantity, setManualMicroQuantity] = useState<string>('');
  
  // Tabbed dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'category' | 'items' | 'asph'>('category');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salesGoal && !isNaN(Number(salesGoal)) && reviewsGoal && !isNaN(Number(reviewsGoal))) {
      if (microGoalMode === 'manual') {
        // Manual mode - save directly
        const isAsph = manualMicroCategory === 'ASPH';
        const hasValidCategory = manualMicroCategory && manualMicroCategory.trim() !== '';
        const hasValidQuantity = manualMicroQuantity && !isNaN(Number(manualMicroQuantity)) && Number(manualMicroQuantity) > 0;
        
        if (hasValidCategory && hasValidQuantity) {
          localStorage.setItem('salesGoal', salesGoal);
          localStorage.setItem('reviewsGoal', reviewsGoal);
          // For ASPH, save as "ASPH: £X" format, otherwise save as is
          const savedCategory = isAsph ? `ASPH: £${manualMicroQuantity}` : manualMicroCategory;
          localStorage.setItem('microGoalItem', savedCategory);
          localStorage.setItem('microGoalQuantity', manualMicroQuantity);
          navigate('/');
        } else {
          // Show error or feedback if validation fails
          console.error('Validation failed:', { hasValidCategory, hasValidQuantity, isAsph, manualMicroCategory, manualMicroQuantity });
        }
      } else {
        // AI mode - get suggestions
        setAiPending(true);
        try {
          const res = await fetch('http://localhost:5000/api/suggest-category', {
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

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Handle category/item selection
  const handleCategoryItemSelect = (value: string) => {
    setManualMicroCategory(value);
    // Clear quantity when switching items (user will enter new value)
    setManualMicroQuantity('');
    setDropdownOpen(false);
  };

  // Handle ASPH selection (from ASPH tab)
  const handleAsphSelect = () => {
    setManualMicroCategory('ASPH');
    setManualMicroQuantity('');
    setDropdownOpen(false);
  };

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
                <label>MicroGoal category</label>
                <div className="custom-dropdown-wrapper" ref={dropdownRef}>
                  <button
                    type="button"
                    className="custom-dropdown-trigger"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>{manualMicroCategory || 'Select a category'}</span>
                    <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="custom-dropdown">
                      <div className="dropdown-tabs">
                        <button
                          type="button"
                          className={`tab-button ${activeTab === 'category' ? 'active' : ''}`}
                          onClick={() => setActiveTab('category')}
                        >
                          Category
                        </button>
                        <button
                          type="button"
                          className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
                          onClick={() => setActiveTab('items')}
                        >
                          Items
                        </button>
                        <button
                          type="button"
                          className={`tab-button ${activeTab === 'asph' ? 'active' : ''}`}
                          onClick={() => setActiveTab('asph')}
                        >
                          ASPH
                        </button>
                      </div>
                      <div className="dropdown-content">
                        {activeTab === 'category' && (
                          <div className="dropdown-options">
                            {CATEGORY_OPTIONS.map(option => (
                              <div
                                key={option}
                                className={`dropdown-option ${manualMicroCategory === option ? 'selected' : ''}`}
                                onClick={() => handleCategoryItemSelect(option)}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                        {activeTab === 'items' && (
                          <div className="dropdown-options">
                            {ITEM_OPTIONS.map(option => (
                              <div
                                key={option}
                                className={`dropdown-option ${manualMicroCategory === option ? 'selected' : ''}`}
                                onClick={() => handleCategoryItemSelect(option)}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                        {activeTab === 'asph' && (
                          <div className="dropdown-options">
                            <div
                              className={`dropdown-option ${manualMicroCategory === 'ASPH' ? 'selected' : ''}`}
                              onClick={handleAsphSelect}
                            >
                              ASPH
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="input-group">
                <label>{manualMicroCategory === 'ASPH' ? 'Target ASPH (£)' : 'Target Quantity'}</label>
                <input
                  type="number"
                  min={manualMicroCategory === 'ASPH' ? '0' : '1'}
                  step={manualMicroCategory === 'ASPH' ? '0.01' : '1'}
                  placeholder={manualMicroCategory === 'ASPH' ? 'Enter target ASPH in £' : 'Enter target quantity'}
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
                  <label key={site} className={`site-checkbox-label ${site === 'TRG Bankside' ? 'always-included' : ''} ${comparisonSites.includes(site) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={comparisonSites.includes(site)}
                      onChange={() => handleCheckboxChange(site)}
                      disabled={site === 'TRG Bankside'}
                    />
                    {site}
                  </label>
                ))}
              </div>
              <button 
                type="button"
                className="deselect-all-button"
                onClick={() => {
                  setComparisonSites(['TRG Bankside']);
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