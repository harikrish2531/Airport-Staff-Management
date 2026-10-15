import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function StaffPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get('/api/users/staff');
      setStaff(res.data || []);
    } catch (err) {
      addToast('Failed to load staff roster', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleDeleteStaff = async (staffId, staffName) => {
    if (staffId === user?.id) {
      addToast('You cannot delete your own account', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove staff member "${staffName}"?`)) return;

    try {
      await api.delete(`/api/users/${staffId}`);
      addToast(`Staff member "${staffName}" removed`, 'success');
      fetchStaff();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to remove staff member';
      addToast(typeof msg === 'string' ? msg : 'Error', 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Ground Staff Personnel Directory</h2>
          <p className="page-subheading">
            Authorized ramp agents, baggage handlers, and turnaround crew members.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={fetchStaff}
          title="Refresh roster"
        >
          <i className="fa-solid fa-arrows-rotate" /> Refresh Roster
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin fa-2x" />
          <p>Loading ground personnel roster...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-users-slash fa-2x" />
          <p>No ground staff members registered yet.</p>
        </div>
      ) : (
        <div className="staff-cards-grid">
          {staff.map((member) => (
            <div key={member.id} className="staff-card">
              <div className="staff-card-avatar">
                {member.name.charAt(0).toUpperCase()}
              </div>

              <div className="staff-card-info">
                <h3 className="staff-name">{member.name}</h3>
                <span className="staff-email">{member.email}</span>
                <div className="staff-role-badge">
                  <i className="fa-solid fa-id-badge" /> {member.role}
                </div>
              </div>

              <div className="staff-card-meta">
                <span className="staff-id-tag">ID: #{member.id}</span>
                {member.created_at && (
                  <span className="staff-joined">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="staff-card-actions">
                <button
                  type="button"
                  className="btn btn-danger-outline btn-xs btn-block"
                  onClick={() => handleDeleteStaff(member.id, member.name)}
                >
                  <i className="fa-solid fa-user-xmark" /> Remove Access
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
