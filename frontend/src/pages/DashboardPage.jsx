import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DelayBanner from '../components/DelayBanner';
import TaskModal from '../components/TaskModal';

export default function DashboardPage() {
  const { user, isSupervisor, isStaff, activeShift, refreshActiveShift } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [shiftLoading, setShiftLoading] = useState(false);

  // Fetch dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const [statsRes, tasksRes, zonesRes] = await Promise.all([
        api.get('/api/tasks/stats/summary'),
        api.get('/api/tasks'),
        api.get('/api/zones'),
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
      setTasks(tasksRes.data || []);
      setZones(zonesRes.data || []);

      if (isSupervisor) {
        try {
          const staffRes = await api.get('/api/users/staff');
          setStaffList(staffRes.data || []);
        } catch {
          // ignore if non-supervisor
        }
      }
    } catch {
      addToast('Failed to refresh operations telemetry', 'error');
    } finally {
      setLoading(false);
    }
  }, [isSupervisor, addToast]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000); // 15s live polling
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Identify delayed tasks (Pending for > 15 mins or Critical pending)
  const delayedTasks = useMemo(() => {
    const nowTime = Date.now();
    return tasks.filter((t) => {
      if (t.status !== 'Pending') return false;
      if (t.priority === 'Critical') return true;
      if (t.created_at) {
        const createdTime = new Date(t.created_at).getTime();
        const diffMinutes = (nowTime - createdTime) / (1000 * 60);
        return diffMinutes > 15;
      }
      return false;
    });
  }, [tasks]);

  // Handle shift start/end for staff
  const handleToggleShift = async () => {
    setShiftLoading(true);
    try {
      if (activeShift) {
        await api.post('/api/shifts/end', { notes: 'Shift ended from dashboard' });
        addToast('Shift marked completed. Off duty.', 'info');
      } else {
        await api.post('/api/shifts/start');
        addToast('Shift started! You are now ON DUTY.', 'success');
      }
      await refreshActiveShift();
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to toggle shift state';
      addToast(typeof msg === 'string' ? msg : 'Error toggling shift', 'error');
    } finally {
      setShiftLoading(false);
    }
  };

  // Quick 1-click status update (Ground Staff < 5s requirement)
  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      addToast(`Task marked as ${newStatus}!`, 'success');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Status update failed';
      addToast(typeof msg === 'string' ? msg : 'Error updating task', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Delayed Tasks Warning Banner */}
      <DelayBanner
        delayedTasks={delayedTasks}
        onReviewClick={() => navigate('/tasks?status=Pending')}
      />

      {/* Dashboard Top Header */}
      <div className="dashboard-top-bar">
        <div>
          <h2 className="page-heading">Operations Command Dashboard</h2>
          <p className="page-subheading">
            Real-time airport ground operations telemetry, staffing, and ramp dispatch.
          </p>
        </div>

        <div className="dashboard-header-actions">
          {isSupervisor && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsTaskModalOpen(true)}
            >
              <i className="fa-solid fa-plus" /> Dispatch Task
            </button>
          )}

          {isStaff && (
            <button
              type="button"
              className={`btn ${activeShift ? 'btn-danger' : 'btn-success'}`}
              onClick={handleToggleShift}
              disabled={shiftLoading}
            >
              <i className={`fa-solid ${activeShift ? 'fa-stopwatch-20' : 'fa-play'}`} />
              {activeShift ? 'Clock Out (End Shift)' : 'Clock In (Start Shift)'}
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline btn-icon-only"
            onClick={loadDashboardData}
            title="Refresh Live Data"
          >
            <i className="fa-solid fa-arrows-rotate" />
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-card-icon">
            <i className="fa-solid fa-clipboard-list" />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Assigned Tasks</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-card-icon">
            <i className="fa-solid fa-clock" />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Pending Dispatch</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>

        <div className="stat-card stat-in-progress">
          <div className="stat-card-icon">
            <i className="fa-solid fa-spinner fa-spin-pulse" />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Active / In Progress</span>
            <span className="stat-value">{stats.in_progress}</span>
          </div>
        </div>

        <div className="stat-card stat-completed">
          <div className="stat-card-icon">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Completed Tasks</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Main Operational Feed & Panels */}
      <div className="dashboard-columns">
        <div className="dashboard-main-column">
          <div className="content-card">
            <div className="content-card-header">
              <div className="card-header-title">
                <i className="fa-solid fa-list-check" />
                <h3>Active Ground Tasks ({tasks.length})</h3>
              </div>
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => navigate('/tasks')}
              >
                View All in Table →
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <i className="fa-solid fa-spinner fa-spin fa-2x" />
                <p>Loading real-time ground tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-clipboard-check fa-2x" />
                <p>No active ground tasks at this moment.</p>
                {isSupervisor && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsTaskModalOpen(true)}
                  >
                    Create First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="task-cards-list">
                {tasks.slice(0, 6).map((task) => (
                  <div key={task.id} className={`task-feed-card priority-${task.priority.toLowerCase()}`}>
                    <div className="task-feed-left">
                      <div className="task-feed-header">
                        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <span className="task-zone-chip">
                          <i className="fa-solid fa-map-pin" /> {task.zone?.terminal || 'Airport'} - {task.zone?.zone_name || 'General Ramp'}
                        </span>
                        <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                          {task.status}
                        </span>
                      </div>

                      <h4 className="task-feed-title">{task.title}</h4>
                      {task.description && (
                        <p className="task-feed-desc">{task.description}</p>
                      )}

                      <div className="task-feed-meta">
                        <span className="meta-item">
                          <i className="fa-solid fa-user" /> Assigned:{' '}
                          <strong>
                            {task.assignments && task.assignments.length > 0
                              ? task.assignments[0].staff?.name || 'Assigned Staff'
                              : 'Unassigned Pool'}
                          </strong>
                        </span>
                        {task.created_at && (
                          <span className="meta-item">
                            <i className="fa-regular fa-clock" />{' '}
                            {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="task-feed-actions">
                      {task.status === 'Pending' && (
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleQuickStatusUpdate(task.id, 'In Progress')}
                          title="Start task (Immediate Ramp Acknowledge)"
                        >
                          <i className="fa-solid fa-play" /> Start
                        </button>
                      )}

                      {task.status === 'In Progress' && (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleQuickStatusUpdate(task.id, 'Completed')}
                          title="Complete task"
                        >
                          <i className="fa-solid fa-check-double" /> Complete
                        </button>
                      )}

                      {task.status === 'Completed' && (
                        <span className="task-completed-label">
                          <i className="fa-solid fa-circle-check" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Telemetry Column */}
        <div className="dashboard-side-column">
          {/* Quick Staff Shift Panel */}
          <div className="content-card">
            <div className="content-card-header">
              <div className="card-header-title">
                <i className="fa-solid fa-user-clock" />
                <h3>Duty & Shift Status</h3>
              </div>
            </div>

            <div className="shift-summary-widget">
              <div className="shift-status-hero">
                <div className={`shift-status-icon ${activeShift ? 'active' : 'inactive'}`}>
                  <i className={`fa-solid ${activeShift ? 'fa-id-card-clip' : 'fa-moon'}`} />
                </div>
                <div>
                  <div className="shift-user-name">{user?.name}</div>
                  <div className="shift-user-role">{user?.role}</div>
                </div>
              </div>

              <div className="shift-card-info-box">
                {activeShift ? (
                  <>
                    <div className="shift-info-row">
                      <span>Shift Started:</span>
                      <strong>{new Date(activeShift.shift_start).toLocaleTimeString()}</strong>
                    </div>
                    <div className="shift-info-row">
                      <span>Status:</span>
                      <span className="badge badge-success">ACTIVE ON DUTY</span>
                    </div>
                  </>
                ) : (
                  <p className="shift-off-text">
                    No active shift recorded. Clock in to begin recording ramp task operations.
                  </p>
                )}
              </div>

              {isStaff && (
                <button
                  type="button"
                  className={`btn btn-block ${activeShift ? 'btn-danger' : 'btn-success'}`}
                  onClick={handleToggleShift}
                  disabled={shiftLoading}
                >
                  <i className={`fa-solid ${activeShift ? 'fa-arrow-right-from-bracket' : 'fa-play'}`} />
                  {activeShift ? 'End Current Shift' : 'Clock In Now'}
                </button>
              )}
            </div>
          </div>

          {/* Airport Zones Summary */}
          <div className="content-card">
            <div className="content-card-header">
              <div className="card-header-title">
                <i className="fa-solid fa-map-location-dot" />
                <h3>Terminal Zones ({zones.length})</h3>
              </div>
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => navigate('/zones')}
              >
                Manage →
              </button>
            </div>

            <div className="zones-mini-list">
              {zones.slice(0, 5).map((z) => (
                <div key={z.id} className="zone-mini-item">
                  <span className="zone-terminal-pill">{z.terminal}</span>
                  <span className="zone-name-text">{z.zone_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Dispatch Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskSaved={loadDashboardData}
        editingTask={null}
        zones={zones}
        staffList={staffList}
      />
    </div>
  );
}
