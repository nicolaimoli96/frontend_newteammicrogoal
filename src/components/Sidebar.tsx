import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h2>TRG Bankside</h2>
      <nav>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/set-goal" className={({ isActive }) => isActive ? 'active' : ''}>
          Set Your Daily Goals
        </NavLink>
        <NavLink to="/competition" className={({ isActive }) => isActive ? 'active' : ''}>
          Competition Management
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar; 