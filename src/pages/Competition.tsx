import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Competition.css';
import { FaClock, FaTag, FaHashtag, FaUsers } from 'react-icons/fa';

const COMPETITION_CATEGORIES = [
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
  { label: 'ASPH', value: 'ASPH' },
];

const Competition: React.FC = () => {
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
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [item, setItem] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [winnerDefinition, setWinnerDefinition] = useState<string>('');
  const [distributionMethod, setDistributionMethod] = useState<'equal' | 'ai'>('equal');
  const navigate = useNavigate();

  // Load existing competition data
  useEffect(() => {
    const storedCompetition = localStorage.getItem('competition');
    if (storedCompetition) {
      const comp = JSON.parse(storedCompetition);
      setCompetition(comp);
      setStartDate(comp.startDate || '');
      setEndDate(comp.endDate || '');
      setItem(comp.item);
      setQuantity(String(comp.quantity));
      setInstructions(comp.instructions || '');
      setWinnerDefinition(comp.winnerDefinition || '');
    }
  }, []);

  const handleSaveCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (item && quantity && !isNaN(Number(quantity)) && startDate && endDate) {
      const newCompetition = {
        isActive: true,
        startDate: startDate,
        endDate: endDate,
        item: item,
        quantity: Number(quantity),
        actual: competition?.actual || 0,
        instructions: instructions,
        winnerDefinition: winnerDefinition
      };
      setCompetition(newCompetition);
      localStorage.setItem('competition', JSON.stringify(newCompetition));
      navigate('/');
    }
  };

  const handleEndCompetition = () => {
    if (competition) {
      const endedCompetition = {
        ...competition,
        isActive: false
      };
      setCompetition(endedCompetition);
      localStorage.setItem('competition', JSON.stringify(endedCompetition));
    }
  };

  return (
    <div className="competition-container">
      <div className="competition-header">
        <h1 className="competition-title">Company competition</h1>
        {competition?.isActive && (
          <button onClick={handleEndCompetition} className="end-competition-btn">
            End Competition
          </button>
        )}
      </div>
      
      {competition?.isActive && (
        <div className="active-competition-summary">
          <div className="summary-item">
            <span className="summary-label">Item:</span>
            <span className="summary-value">{competition.item}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Target:</span>
            <span className="summary-value">
              {competition.item === 'ASPH' ? `£${competition.quantity}` : competition.quantity}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Progress:</span>
            <span className="summary-value">
              {competition.item === 'ASPH' 
                ? `£${competition.actual} / £${competition.quantity}`
                : `${competition.actual} / ${competition.quantity}`
              }
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveCompetition} className="competition-form">
        <div className="form-grid">
          {/* Row 1: Duration and Item */}
          <div className="form-row">
            <div className="compact-section">
              <div className="section-header-compact">
                <span className="section-icon">{FaClock({})}</span>
                <h3>Duration</h3>
              </div>
              <div className="date-inputs-compact">
                <div className="input-group-compact">
                  <label>Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group-compact">
                  <label>End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="compact-section">
              <div className="section-header-compact">
                <span className="section-icon">{FaTag({})}</span>
                <h3>Item</h3>
              </div>
              <div className="input-group-compact">
                <select 
                  value={item} 
                  onChange={e => setItem(e.target.value)}
                  required
                >
                  <option value="">Select item</option>
                  {COMPETITION_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Quantity and Winner */}
          <div className="form-row">
            <div className="compact-section">
              <div className="section-header-compact">
                <span className="section-icon">{FaHashtag({})}</span>
                <h3>Target</h3>
              </div>
              <div className="input-group-compact">
                {item === 'ASPH' ? (
                  <div style={{ position: 'relative' }}>
                    <span style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#666',
                      fontSize: '14px',
                      pointerEvents: 'none'
                    }}>£</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter target ASPH in £"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      required
                      style={{ paddingLeft: '28px' }}
                    />
                  </div>
                ) : (
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>

            <div className="compact-section">
              <div className="section-header-compact">
                <span className="section-icon">🏆</span>
                <h3>Winner</h3>
              </div>
              <div className="input-group-compact">
                <select 
                  value={winnerDefinition} 
                  onChange={e => setWinnerDefinition(e.target.value)}
                  required
                >
                  <option value="">Select criteria</option>
                  <option value="team_highest_sales">Team with highest sales wins</option>
                  <option value="individual_highest_sales">Individual with highest sales wins</option>
                  <option value="team_hits_target">Any team that hits target sales wins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Instructions and Distribution */}
          <div className="form-row">
            <div className="compact-section instructions-section">
              <div className="section-header-compact">
                <span className="section-icon">💬</span>
                <h3>Instructions</h3>
              </div>
              <div className="input-group-compact">
                <textarea
                  placeholder="Competitions instructions"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="compact-section">
              <div className="section-header-compact">
                <span className="section-icon">{FaUsers({})}</span>
                <h3>Distribution</h3>
              </div>
              <div className="distribution-options-compact">
                <label className="distribution-option-compact">
                  <input
                    type="radio"
                    name="distribution"
                    value="equal"
                    checked={distributionMethod === 'equal'}
                    onChange={e => setDistributionMethod(e.target.value as 'equal' | 'ai')}
                  />
                  <span>Equal Share</span>
                </label>
                <label className="distribution-option-compact">
                  <input
                    type="radio"
                    name="distribution"
                    value="ai"
                    checked={distributionMethod === 'ai'}
                    onChange={e => setDistributionMethod(e.target.value as 'equal' | 'ai')}
                  />
                  <span>AI Recommended</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="save-competition-btn">
          {competition?.isActive ? 'Update Competition' : 'Start Competition'}
        </button>
      </form>
    </div>
  );
};

export default Competition;


