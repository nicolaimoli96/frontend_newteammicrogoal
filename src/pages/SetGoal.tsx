import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SetGoal.css';
import { FaPoundSign, FaStar, FaBolt, FaCloudSun } from 'react-icons/fa';

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

const SetGoal: React.FC = () => {
  const [salesGoal, setSalesGoal] = useState<string>('');
  const [reviewsGoal, setReviewsGoal] = useState<string>('');
  const [microGoalItem, setMicroGoalItem] = useState<string>('');
  const [microGoalQuantity, setMicroGoalQuantity] = useState<string>('');
  const navigate = useNavigate();

  // Add state for micro goal tab
  const [microTab, setMicroTab] = useState<'items' | 'category' | 'asph'>('items');
  const microItems = ['Hummus', 'Cheesecake', 'Water', 'Olives'];
  const microCategories = ['Dips', 'Dessert', 'Drinks', 'Glass of Wine'];
  const [microGoalASPHAmount, setMicroGoalASPHAmount] = useState<string>(() => localStorage.getItem('microGoalASPHAmount') || '');

  // Add state for dropdown open/close
  const [microDropdownOpen, setMicroDropdownOpen] = useState(false);
  const [microSearch, setMicroSearch] = useState('');

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
    const storedMicroGoalItem = localStorage.getItem('microGoalItem');
    const storedMicroGoalQuantity = localStorage.getItem('microGoalQuantity');
    
    if (storedSalesGoal) setSalesGoal(storedSalesGoal);
    if (storedReviewsGoal) setReviewsGoal(storedReviewsGoal);
    if (storedMicroGoalItem) setMicroGoalItem(storedMicroGoalItem);
    if (storedMicroGoalQuantity) setMicroGoalQuantity(storedMicroGoalQuantity);
  }, []);

  const [aiModal, setAiModal] = useState<{category: string, quantity: number}[] | null>(null);
  const [aiPending, setAiPending] = useState(false);
  const [microDay, setMicroDay] = useState<number>(1);
  const [microHour, setMicroHour] = useState<number>(19);
  const [microWeather, setMicroWeather] = useState<string>('sunny');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);  // Index of selected top suggestion

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salesGoal && !isNaN(Number(salesGoal)) && reviewsGoal && !isNaN(Number(reviewsGoal))) {
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

  const microDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!microDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (microDropdownRef.current && !microDropdownRef.current.contains(e.target as Node)) {
        setMicroDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [microDropdownOpen]);

  return (
    <div className="set-goal-container">
      <h1 className="modern-title">Set Your Daily Goals</h1>
      <p className="modern-subtitle">Boost your performance by setting clear, actionable targets for today.</p>
      <form onSubmit={handleSaveGoals} className="modern-goal-form">
        <div className="goal-section modern-card">
          <div className="section-header">
            <span className="section-icon" role="img" aria-label="Sales">{FaPoundSign({})}</span>
            <div>
              <h2>Sales Target</h2>
              <p className="section-desc">Set your sales goal for the day (£).</p>
            </div>
          </div>
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
        <div className="goal-section modern-card">
          <div className="section-header">
            <span className="section-icon" role="img" aria-label="Reviews">{FaStar({})}</span>
            <div>
              <h2>Reviews Target</h2>
              <p className="section-desc">How many Google reviews do you want to achieve?</p>
            </div>
          </div>
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
        <div className="goal-section modern-card">
          <div className="section-header">
            <span className="section-icon" role="img" aria-label="Micro Goal">{FaBolt({})}</span>
            <div>
              <h2>Micro Goal Target</h2>
              <p className="section-desc">Set a micro goal based on time and weather for a specific item.</p>
            </div>
          </div>
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
        </div>
      </form>
      <div className="modern-divider"><span>Site Comparison</span></div>
      <div className="input-group modern-card" style={{ marginTop: '2rem', maxWidth: 400 }}>
        <div className="section-header">
          <span className="section-icon" role="img" aria-label="Sites">{FaCloudSun({})}</span>
          <div>
            <label>Compare with these sites (up to 9):</label>
            <p className="section-desc">See how you stack up against other locations. Covent Garden is always included.</p>
          </div>
        </div>
        <div className="site-checkbox-list">
          {allSites.map(site => (
            <label key={site} className={`site-checkbox-label${comparisonSites.includes(site) ? ' checked' : ''}${site === 'TRG Covent Garden' ? ' always-included' : ''}`}>
              <input
                type="checkbox"
                checked={comparisonSites.includes(site)}
                disabled={site === 'TRG Covent Garden'}
                onChange={() => handleCheckboxChange(site)}
              />
              <span className="custom-checkbox" />
              {site}
            </label>
          ))}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#b0b8c1', marginTop: 4 }}>
          (TRG Covent Garden is always included)
        </div>
      </div>
      <button onClick={handleSaveGoals} className="save-button modern-save" disabled={aiPending}>
        {aiPending ? 'AI is thinking...' : 'Save Goals'}
      </button>
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