import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskModal from '../components/TaskModal';

export default function TasksPage() {
  const { isSupervisor } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasksData = useCallback(async () => {
    try {
      const [tasksRes, zonesRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/zones'),
      ]);
      setTasks(tasksRes.data || []);
      setZones(zonesRes.data || []);

      if (isSupervisor) {
        try {
          const staffRes = await api.get('/api/users/staff');
          setStaffList(staffRes.data || []);
        } catch {
          // ignore
        }
      }
    } catch {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [isSupervisor, addToast]);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  // Update status (Ground staff < 5 seconds requirement)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      addToast(`Status updated to ${newStatus}`, 'success');
      fetchTasksData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Status update failed';
      addToast(typeof msg === 'string' ? msg : 'Error updating task', 'error');
    }
  };

  // Delete task (Supervisor only)
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm(`Are you sure you want to delete task #${taskId}?`)) return;

    try {
      await api.delete(`/api/tasks/${taskId}`);
      addToast(`Task #${taskId} deleted successfully`, 'success');
      fetchTasksData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete task';
      addToast(typeof msg === 'string' ? msg : 'Error deleting task', 'error');
    }
  };

  // Filter tasks in memory
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query);
        const matchStaff = t.assignments?.some((a) => a.staff?.name?.toLowerCase().includes(query));
        const matchZone = t.zone?.zone_name?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchStaff && !matchZone) return false;
      }

      // Status
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;

      // Priority
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

      // Zone
      if (zoneFilter !== 'All' && String(t.zone_id) !== zoneFilter) return false;

      return true;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, zoneFilter]);

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Ground Staff Task Management</h2>
          <p className="page-subheading">
            Filter, assign, dispatch, and update turnaround operational tasks.
          </p>
        </div>

        <div className="header-actions-group">
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="fa-solid fa-table-list" /> Table
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
            >
              <i className="fa-solid fa-grip" /> Cards
            </button>
          </div>

          {isSupervisor && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
            >
              <i className="fa-solid fa-plus" /> Dispatch Task
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-controls-panel">
        <div className="search-input-wrap">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search flights, tasks, instructions, or staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        <div className="filter-selects-row">
          <div className="filter-item">
            <label htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              className="form-select filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-priority">Priority</label>
            <select
              id="filter-priority"
              className="form-select filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-zone">Zone</label>
            <select
              id="filter-zone"
              className="form-select filter-select"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            >
              <option value="All">All Zones</option>
              {zones.map((z) => (
                <option key={z.id} value={String(z.id)}>
                  {z.terminal} - {z.zone_name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || zoneFilter !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm reset-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setZoneFilter('All');
              }}
            >
              <i className="fa-solid fa-rotate-left" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Content: Table or Cards */}
      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin fa-2x" />
          <p>Fetching airport task roster...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-filter fa-2x" />
          <p>No tasks match the active filters.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setPriorityFilter('All');
              setZoneFilter('All');
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task / Operation</th>
                <th>Airport Zone</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Status Action</th>
                {isSupervisor && <th>Supervisor</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <span className="task-id-tag">#{task.id}</span>
                  </td>
                  <td>
                    <div className="task-table-title">{task.title}</div>
                    {task.description && (
                      <div className="task-table-desc">{task.description}</div>
                    )}
                  </td>
                  <td>
                    {task.zone ? (
                      <span className="zone-tag">
                        <strong>{task.zone.terminal}</strong>: {task.zone.zone_name}
                      </span>
                    ) : (
                      <span className="unassigned-text">Unassigned Zone</span>
                    )}
                  </td>
                  <td>
                    <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    {task.assignments && task.assignments.length > 0 ? (
                      <div className="assigned-staff-chip">
                        <i className="fa-solid fa-user-check" />
                        <span>{task.assignments[0].staff?.name || 'Staff Member'}</span>
                      </div>
                    ) : (
                      <span className="unassigned-text">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div className="table-action-btns">
                      {task.status === 'Pending' && (
                        <button
                          type="button"
                          className="btn btn-warning btn-xs"
                          onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                          title="Start task (In Progress)"
                        >
                          <i className="fa-solid fa-play" /> Start
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button
                          type="button"
                          className="btn btn-success btn-xs"
                          onClick={() => handleUpdateStatus(task.id, 'Completed')}
                          title="Complete task"
                        >
                          <i className="fa-solid fa-check" /> Done
                        </button>
                      )}
                      {task.status === 'Completed' && (
                        <span className="status-done-chip">
                          <i className="fa-solid fa-circle-check" /> Closed
                        </span>
                      )}
                    </div>
                  </td>
                  {isSupervisor && (
                    <td>
                      <div className="supervisor-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}
                          title="Edit Task"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger-outline btn-xs"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                        >
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`task-card-full priority-${task.priority.toLowerCase()}`}>
              <div className="card-top-row">
                <span className="task-id-tag">#{task.id}</span>
                <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
                <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status}
                </span>
              </div>

              <h3 className="card-task-title">{task.title}</h3>
              {task.description && (
                <p className="card-task-desc">{task.description}</p>
              )}

              <div className="card-meta-list">
                <div className="card-meta-item">
                  <i className="fa-solid fa-map-pin" />
                  <span>
                    {task.zone ? `${task.zone.terminal} - ${task.zone.zone_name}` : 'Ramp Area'}
                  </span>
                </div>
                <div className="card-meta-item">
                  <i className="fa-solid fa-user-astronaut" />
                  <span>
                    {task.assignments && task.assignments.length > 0
                      ? task.assignments[0].staff?.name || 'Assigned Staff'
                      : 'Unassigned in Pool'}
                  </span>
                </div>
              </div>

              <div className="card-footer-actions">
                <div className="card-status-btns">
                  {task.status === 'Pending' && (
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                    >
                      <i className="fa-solid fa-play" /> Start
                    </button>
                  )}
                  {task.status === 'In Progress' && (
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdateStatus(task.id, 'Completed')}
                    >
                      <i className="fa-solid fa-check-double" /> Complete
                    </button>
                  )}
                </div>

                {isSupervisor && (
                  <div className="card-mgmt-btns">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskSaved={fetchTasksData}
        editingTask={editingTask}
        zones={zones}
        staffList={staffList}
      />
    </div>
  );
}
