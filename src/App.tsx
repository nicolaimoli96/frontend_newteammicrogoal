import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SetGoal from './pages/SetGoal';
import Competition from './pages/Competition';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/set-goal" element={<SetGoal />} />
            <Route path="/competition" element={<Competition />} />
          </Routes>
        </main>
    </div>
    </Router>
  );
}

export default App;
