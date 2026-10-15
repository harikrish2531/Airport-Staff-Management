import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, activeShift, isStaff } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toUTCString().slice(17, 25) + ' UTC | ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' Local'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <i className="fa-solid fa-bars" />
        </button>
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrap">
            <i className="fa-solid fa-plane-departure" />
          </div>
          <div className="brand-text">
            <span className="brand-main">AeroOps</span>
            <span className="brand-sub">Ground Command</span>
          </div>
        </Link>
      </div>

      <div className="navbar-center">
        <div className="airport-clock">
          <i className="fa-regular fa-clock" />
          <span>{time}</span>
        </div>
      </div>

      <div className="navbar-right">
        {isStaff && (
          <div className="shift-badge-header">
            {activeShift ? (
              <span className="badge badge-success pulse-dot">
                <span className="dot" /> On Active Shift
              </span>
            ) : (
              <span className="badge badge-neutral">
                <i className="fa-solid fa-circle-pause" /> Off Duty
              </span>
            )}
          </div>
        )}

        <div className="user-profile-menu">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role role-${user?.role?.toLowerCase().replace(' ', '-')}`}>
              {user?.role}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm logout-btn"
            onClick={handleLogout}
            title="Sign out of AeroOps"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" />
            <span className="logout-text">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
