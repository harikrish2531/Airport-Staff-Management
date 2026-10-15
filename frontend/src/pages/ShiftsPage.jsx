import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ShiftsPage() {
  const { user, isSupervisor, activeShift, refreshActiveShift } = useAuth();
  const { addToast } = useToast();

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchShifts = useCallback(async () => {
    try {
      // Supervisor gets all shifts, staff gets /api/shifts/my
      const endpoint = isSupervisor ? '/api/shifts' : '/api/shifts/my';
      const res = await api.get(endpoint);
      setShifts(res.data || []);
    } catch {
      addToast('Failed to load shifts record', 'error');
    } finally {
      setLoading(false);
    }
  }, [isSupervisor, addToast]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleStartShift = async () => {
    setClocking(true);
    try {
      await api.post('/api/shifts/start');
      addToast('Shift started! Recorded on duty.', 'success');
      await refreshActiveShift();
      fetchShifts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to start shift';
      addToast(typeof msg === 'string' ? msg : 'Error starting shift', 'error');
    } finally {
      setClocking(false);
    }
  };

  const handleEndShift = async () => {
    setClocking(true);
    try {
      await api.post('/api/shifts/end', { notes: notes.trim() || undefined });
      addToast('Shift ended successfully.', 'info');
      setNotes('');
      await refreshActiveShift();
      fetchShifts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to end shift';
      addToast(typeof msg === 'string' ? msg : 'Error ending shift', 'error');
    } finally {
      setClocking(false);
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'Active';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = Math.max(0, endTime - startTime);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Shift & Duty Attendance Log</h2>
          <p className="page-subheading">
            {isSupervisor
              ? 'Real-time overview of ground staff duty rosters and hours worked.'
              : 'Record your ramp clock-in and clock-out hours and review shift log history.'}
          </p>
        </div>
      </div>

      {/* Clock in / out panel for staff */}
      <div className="content-card duty-control-card">
        <div className="duty-control-content">
          <div className="duty-user-meta">
            <div className={`duty-status-avatar ${activeShift ? 'active' : ''}`}>
              <i className="fa-solid fa-user-clock" />
            </div>
            <div>
              <h3>{user?.name}</h3>
              <p className="duty-role-sub">{user?.role} • Airport Ground Staff</p>
              <div className="duty-badge-row">
                {activeShift ? (
                  <span className="badge badge-success pulse-dot">
                    <span className="dot" /> ACTIVE DUTY SHIFT
                  </span>
                ) : (
                  <span className="badge badge-neutral">OFF DUTY</span>
                )}
              </div>
            </div>
          </div>

          <div className="duty-actions-wrap">
            {activeShift ? (
              <div className="end-shift-form">
                <input
                  type="text"
                  className="form-input shift-notes-input"
                  placeholder="Optional shift handover notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleEndShift}
                  disabled={clocking}
                >
                  <i className="fa-solid fa-stopwatch-20" /> Clock Out (End Shift)
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-success btn-lg"
                onClick={handleStartShift}
                disabled={clocking}
              >
                <i className="fa-solid fa-play" /> Clock In (Start Shift)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shift Log History Table */}
      <div className="content-card">
        <div className="content-card-header">
          <div className="card-header-title">
            <i className="fa-solid fa-clock-rotate-left" />
            <h3>{isSupervisor ? 'All Ground Staff Shift Records' : 'My Personal Shift History'}</h3>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchShifts}
            title="Refresh shift log"
          >
            <i className="fa-solid fa-arrows-rotate" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="fa-solid fa-spinner fa-spin fa-2x" />
            <p>Loading shift logs...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-calendar-xmark fa-2x" />
            <p>No shift records logged yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shift ID</th>
                  {isSupervisor && <th>Staff Member</th>}
                  <th>Shift Start</th>
                  <th>Shift End</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="task-id-tag">#S-{s.id}</span>
                    </td>
                    {isSupervisor && (
                      <td>
                        <strong>{s.staff?.name || `Staff #${s.staff_id}`}</strong>
                        <div className="table-email-sub">{s.staff?.email}</div>
                      </td>
                    )}
                    <td>{s.shift_start ? new Date(s.shift_start).toLocaleString() : '-'}</td>
                    <td>{s.shift_end ? new Date(s.shift_end).toLocaleString() : 'In Progress'}</td>
                    <td>
                      <span className="duration-tag">{calculateDuration(s.shift_start, s.shift_end)}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${s.status.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <span className="shift-notes-text">{s.notes || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
