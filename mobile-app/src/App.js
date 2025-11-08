import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';




function CombinedRings({ items, actuals, onActualChange, headOfficeCompetition, competitionActual }) {
  // Expect up to 3 items: [outer, middle, inner] + optional competition ring
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 720px)');
    const handler = (e) => setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler);
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', handler) : mql.removeListener(handler);
    };
  }, []);

  const baseSize = isMobile ? 220 : 240;
  const size = headOfficeCompetition ? baseSize + 60 : baseSize; // Increase size when competition is active
  const gap = 2; // subtle separation between rings for modern look
  const stroke = 18;
  const center = size / 2;
  const outerRadius = (baseSize - stroke) / 2;
  const middleRadius = outerRadius - (stroke + gap);
  const innerRadius = middleRadius - (stroke + gap);
  const competitionRadius = outerRadius + (stroke / 2) + 15; // External ring for competition, with clear separation from blue ring

  const radii = [outerRadius, middleRadius, innerRadius];

  return (
    <div className="combined-rings">
      <div className="combined-layout">
        <div className="rings-wrap">
          <svg width={size} height={size} className="combined-svg">
            <defs>
              {items.map((rec, idx) => (
                <linearGradient key={idx} id={`comboGrad${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ringColors[idx % ringColors.length].color[0]} />
                  <stop offset="100%" stopColor={ringColors[idx % ringColors.length].color[1]} />
                </linearGradient>
              ))}
              {items.map((rec, idx) => (
                <linearGradient key={`t-${idx}`} id={`trackGrad${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5e7eb" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              ))}
              {/* Competition ring gradients */}
              {headOfficeCompetition && (
                <>
                  <linearGradient id="competitionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                  <linearGradient id="competitionTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                </>
              )}
            </defs>
            {items.map((rec, idx) => {
              const radius = radii[idx];
              if (!radius || radius <= 0) return null;
              const circ = 2 * Math.PI * radius;
              const target = Math.max(rec.target_quantity, 1);
              const predicted = Math.round(rec.predicted_quantity);
              const actual = actuals[idx] !== undefined ? Number(actuals[idx]) : predicted;
              const pct = Math.min(actual / target, 1);
              const dashoffset = pct >= 1 ? 0 : circ * (1 - pct);
              return (
                <g key={idx}>
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={`url(#trackGrad${idx})`}
                    strokeWidth={stroke}
                    fill="none"
                  />
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={`url(#comboGrad${idx})`}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={circ}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.35s' }}
                    transform={`rotate(-90 ${center} ${center})`}
                  />
                </g>
              );
            })}
            {/* Competition ring */}
            {headOfficeCompetition && (
              <g key="competition">
                <circle
                  cx={center}
                  cy={center}
                  r={competitionRadius}
                  stroke="url(#competitionTrackGrad)"
                  strokeWidth={stroke + 6}
                  fill="none"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={competitionRadius}
                  stroke="url(#competitionGrad)"
                  strokeWidth={stroke + 6}
                  fill="none"
                  strokeDasharray={2 * Math.PI * competitionRadius}
                  strokeDashoffset={competitionActual >= 20 ? 0 : 2 * Math.PI * competitionRadius * (1 - Math.min(competitionActual / 20, 1))}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.35s' }}
                  transform={`rotate(-90 ${center} ${center})`}
                />
              </g>
            )}
          </svg>
        </div>
        <div className="actuals-stack">
          {headOfficeCompetition && (
            <div className="actual-item competition-item">
              <span className="actual-value" style={{ color: '#eab308' }}>{competitionActual}</span>
            </div>
          )}
          {items.map((rec, idx) => {
            const color = ringColors[idx % ringColors.length].color[1];
            const actualVal = actuals[idx] !== undefined ? Number(actuals[idx]) : Math.round(rec.predicted_quantity);
            return (
              <div className="actual-item" key={idx}>
                <span className="actual-value" style={{ color }}>{actualVal}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="legend">
        {items.map((rec, idx) => {
          const gradient = `linear-gradient(135deg, ${ringColors[idx % ringColors.length].color[0]}, ${ringColors[idx % ringColors.length].color[1]})`;
          return (
            <div className="legend-item" key={idx}>
              <span className="legend-swatch" style={{ background: gradient }}></span>
              <div className="legend-texts">
                <div className="legend-title-inline">
                  <span className="legend-cat">{rec.category}</span>
                  <span className="legend-target-label">Target:</span>
                  <span className="legend-target-number">{rec.target_quantity}</span>
                </div>
              </div>
            </div>
          );
        })}
        {headOfficeCompetition && (
          <div className="legend-item competition-legend">
            <span className="legend-swatch" style={{ background: 'linear-gradient(135deg, #fde047, #eab308)' }}></span>
            <div className="legend-texts">
              <div className="legend-title-inline">
                <span className="legend-cat">Head Office Competition</span>
                <span className="legend-target-label">Your Share:</span>
                <span className="legend-target-number">20</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ringColors = [
  {
    color: ['#06b6d4', '#3b82f6'],
    secondary: ['#22d3ee', '#06b6d4'],
  },
  {
    color: ['#f97316', '#f43f5e'],
    secondary: ['#f59e0b', '#fb7185'],
  },
  {
    color: ['#f7971e', '#ffd200'],
    secondary: ['#f9a825', '#ffeb3b'],
  },
];

function App() {
  const [day, setDay] = useState('Mon');
  const [session, setSession] = useState('Lunch');
  const [weather, setWeather] = useState('Rain');
  const [waiter, setWaiter] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [actuals, setActuals] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [waiters, setWaiters] = useState([]);
  const [showBottomActuals, setShowBottomActuals] = useState(false);
  const [headOfficeCompetition, setHeadOfficeCompetition] = useState(false);
  const [competitionActual, setCompetitionActual] = useState(0);

  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://waiter-backend-futa.onrender.com'
    : 'http://localhost:5000';

  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/waiters`);
        setWaiters(response.data.waiters);
        if (response.data.waiters.length > 0) {
          setWaiter(response.data.waiters[0]);
        }
      } catch (err) {
        console.error('Error fetching waiters:', err);
      }
    };
    fetchWaiters();
  }, [baseUrl]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRecommendations([]);
    setActuals({});
    try {
      const response = await axios.post(`${baseUrl}/api/recommend-categories`, {
        day,
        session,
        weather,
        waiter,
      });
      setRecommendations(response.data.recommendations);
      setSidebarOpen(false);
    } catch (err) {
      setError('Error fetching recommendations: ' + err.message);
      alert(error);
    }
  };

  const handleActualChange = (idx, value) => {
    setActuals((prev) => ({ ...prev, [idx]: value }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="card">
          {recommendations.length > 0 && (
            <div className="triple-ring-panel">
              <div className="panel-header">
                <div className="panel-title">Micro Goals</div>
                <div className="panel-subtitle">{day} · {session} · {waiter || '—'}</div>
                <div className="panel-icon" aria-label={weather} title={weather}>
                  {weather === 'Sunny' && '☀️'}
                  {weather === 'Cloud' && '☁️'}
                  {weather === 'Rain' && '🌧️'}
                  {weather === 'Wind' && '💨'}
                </div>
              </div>
              <CombinedRings
                items={recommendations.slice(0, 3)}
                actuals={actuals}
                onActualChange={handleActualChange}
                headOfficeCompetition={headOfficeCompetition}
                competitionActual={competitionActual}
              />
              <button className="bottom-actuals-toggle" onClick={() => setShowBottomActuals(v => !v)}>
                {showBottomActuals ? 'Hide Inputs' : 'Show Inputs'}
              </button>
              {showBottomActuals && (
                <div className="bottom-actuals-panel">
                  <div className="bottom-actuals-title">Actuals (Demo)</div>
                  <div className="bottom-actuals-grid">
                    {recommendations.slice(0, 3).map((rec, idx) => {
                      const predictedInt = Math.round(rec.predicted_quantity);
                      const color = ringColors[idx % ringColors.length].color[1];
                      return (
                        <div className="bottom-actuals-item" key={idx}>
                          <div className="bottom-actuals-label" style={{ color }}>{rec.category}</div>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="actual-input"
                            value={actuals[idx] ?? predictedInt}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === '' || /^\d+$/.test(val)) {
                                handleActualChange(idx, val === '' ? '' : parseInt(val, 10));
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                    {headOfficeCompetition && (
                      <div className="bottom-actuals-item competition-input">
                        <div className="bottom-actuals-label" style={{ color: '#eab308' }}>Head Office Competition</div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="actual-input"
                          value={competitionActual}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setCompetitionActual(val === '' ? 0 : parseInt(val, 10));
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sidebar-toggle-icon">{sidebarOpen ? '✕' : '⚙️'}</span>
          <span className="sidebar-toggle-text">Your Goals</span>
        </button>

        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-content">
            <form onSubmit={handleSubmit}>
              <h1>Settings</h1>
              <div className="form-group">
                <label>Day:</label>
                <select value={day} onChange={(e) => setDay(e.target.value)}>
                  <option value="Mon">Mon</option>
                  <option value="Tue">Tue</option>
                  <option value="Wed">Wed</option>
                  <option value="Thu">Thu</option>
                  <option value="Fri">Fri</option>
                  <option value="Sat">Sat</option>
                  <option value="Sun">Sun</option>
                </select>
              </div>
              <div className="form-group">
                <label>Session:</label>
                <select value={session} onChange={(e) => setSession(e.target.value)}>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
              <div className="form-group">
                <label>Weather:</label>
                <select value={weather} onChange={(e) => setWeather(e.target.value)}>
                  <option value="Rain">Rain</option>
                  <option value="Wind">Wind</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Sunny">Sunny</option>
                </select>
              </div>
              <div className="form-group">
                <label>Waiter:</label>
                <select value={waiter} onChange={(e) => setWaiter(e.target.value)}>
                  {waiters.map((w, idx) => (
                    <option key={idx} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={headOfficeCompetition}
                    onChange={(e) => setHeadOfficeCompetition(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Head Office Competition (20 dips target)
                </label>
              </div>
              <button type="submit">Get Recommendations</button>
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </div>

        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
        )}
      </header>
    </div>
  );
}

export default App;