import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SetGoal.css';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesGoal && !isNaN(Number(salesGoal)) && 
        reviewsGoal && !isNaN(Number(reviewsGoal)) &&
        microGoalItem && (microGoalItem === 'ASPH' ? microGoalASPHAmount && !isNaN(Number(microGoalASPHAmount)) : microGoalQuantity && !isNaN(Number(microGoalQuantity)))) {
      localStorage.setItem('salesGoal', salesGoal);
      localStorage.setItem('reviewsGoal', reviewsGoal);
      localStorage.setItem('microGoalItem', microGoalItem);
      if (microGoalItem === 'ASPH') {
        localStorage.setItem('microGoalASPHAmount', microGoalASPHAmount);
        localStorage.setItem('microGoalQuantity', microGoalASPHAmount);
      } else {
        localStorage.setItem('microGoalQuantity', microGoalQuantity);
      }
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
      <h1>Daily Goals</h1>
      <form onSubmit={handleSubmit}>
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
          <div className="input-group">
            <label>Micro Goal</label>
            <div className="micro-dropdown-wrapper" ref={microDropdownRef}>
              <div className={`micro-dropdown-trigger${microDropdownOpen ? ' open' : ''}`}> 
                <input
                  className="micro-dropdown-input"
                  type="text"
                  placeholder="Select a micro goal..."
                  value={microDropdownOpen ? microSearch : (microGoalItem || '')}
                  onFocus={() => setMicroDropdownOpen(true)}
                  onChange={e => {
                    setMicroSearch(e.target.value);
                    if (!microDropdownOpen) setMicroDropdownOpen(true);
                  }}
                  autoComplete="off"
                />
                <span className="micro-dropdown-arrow">▼</span>
              </div>
              {microDropdownOpen && (
                <div className="micro-dropdown">
                  <div className="micro-tabs">
                    <button type="button" className={microTab === 'items' ? 'active' : ''} onClick={e => { e.stopPropagation(); setMicroTab('items'); setMicroSearch(''); }}>Items</button>
                    <button type="button" className={microTab === 'category' ? 'active' : ''} onClick={e => { e.stopPropagation(); setMicroTab('category'); setMicroSearch(''); }}>Category</button>
                    <button type="button" className={microTab === 'asph' ? 'active' : ''} onClick={e => { e.stopPropagation(); setMicroTab('asph'); setMicroSearch(''); }}>ASPH</button>
                  </div>
                  <div className="micro-options-list">
                    {microTab === 'items' && microItems.filter(option => option.toLowerCase().includes(microSearch.toLowerCase())).map(option => (
                      <div
                        key={option}
                        className={`micro-option${microGoalItem === option ? ' selected' : ''}`}
                        onClick={e => { setMicroGoalItem(option); setMicroDropdownOpen(false); setMicroSearch(''); }}
                      >
                        {option}
                      </div>
                    ))}
                    {microTab === 'category' && microCategories.filter(option => option.toLowerCase().includes(microSearch.toLowerCase())).map(option => (
                      <div
                        key={option}
                        className={`micro-option${microGoalItem === option ? ' selected' : ''}`}
                        onClick={e => { setMicroGoalItem(option); setMicroDropdownOpen(false); setMicroSearch(''); }}
                      >
                        {option}
                      </div>
                    ))}
                    {microTab === 'asph' && (
                      <div
                        className={`micro-option${microGoalItem === 'ASPH' ? ' selected' : ''}`}
                        onClick={e => { setMicroGoalItem('ASPH'); setMicroDropdownOpen(false); setMicroSearch(''); }}
                      >
                        ASPH
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {microGoalItem === 'ASPH' ? (
            <div className="input-group" style={{ marginTop: '0.7rem' }}>
              <label>ASPH Target (£)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter ASPH target in £"
                value={microGoalASPHAmount}
                onChange={e => setMicroGoalASPHAmount(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="input-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter target quantity"
                value={microGoalQuantity}
                onChange={e => setMicroGoalQuantity(e.target.value)}
                required
              />
            </div>
          )}
        </div>
      </form>
      <div className="input-group" style={{ marginTop: '2rem', maxWidth: 400 }}>
        <label>Compare with these sites (up to 9):</label>
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
      <button onClick={handleSubmit} className="save-button">
        Save Goals
      </button>
    </div>
  );
};

export default SetGoal; 