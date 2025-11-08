import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isMobile && (
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
          {isOpen ? '✕' : '☰'}
        </button>
      )}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'mobile-open' : ''}`}
          onClick={closeSidebar}
        />
      )}
      <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <h2>TRG Bankside</h2>
        <nav>
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/set-goal" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            Set Your Daily Goals
          </NavLink>
          <NavLink 
            to="/competition" 
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeSidebar}
          >
            Competition Management
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 