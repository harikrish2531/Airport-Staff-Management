import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { isSupervisor } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-section-title">MAIN NAVIGATION</div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className="fa-solid fa-chart-pie" />
            <span>Operations Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className="fa-solid fa-list-check" />
            <span>Task Management</span>
          </NavLink>

          <NavLink
            to="/shifts"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className="fa-solid fa-user-clock" />
            <span>Shifts & Duty Log</span>
          </NavLink>

          <NavLink
            to="/zones"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className="fa-solid fa-location-dot" />
            <span>Airport Zones</span>
          </NavLink>

          {isSupervisor && (
            <>
              <div className="sidebar-section-title">SUPERVISOR CONTROL</div>
              <NavLink
                to="/staff"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className="fa-solid fa-users" />
                <span>Ground Staff Directory</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-ping" />
            <div className="status-meta">
              <span className="status-label">AeroOps Core API</span>
              <span className="status-state">Operational (v2.0)</span>
            </div>
          </div>
          <div className="sidebar-quick-help">
            <i className="fa-solid fa-shield-halved" />
            <span>Airport Ops Secure</span>
          </div>
        </div>
      </aside>
    </>
  );
}
