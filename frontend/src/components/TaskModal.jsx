import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function TaskModal({ isOpen, onClose, onTaskSaved, editingTask, zones, staffList }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setZoneId(editingTask.zone_id ? String(editingTask.zone_id) : '');
      setPriority(editingTask.priority || 'Medium');
      const assigned = editingTask.assignments?.[0]?.staff_id;
      setAssignedStaffId(assigned ? String(assigned) : '');
    } else {
      setTitle('');
      setDescription('');
      setZoneId(zones.length > 0 ? String(zones[0].id) : '');
      setPriority('Medium');
      setAssignedStaffId('');
    }
    setErrorMsg('');
  }, [editingTask, isOpen, zones]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingTask) {
        // Update task
        await api.put(`/api/tasks/${editingTask.id}`, {
          title,
          description,
          zone_id: zoneId ? parseInt(zoneId, 10) : null,
          priority,
        });

        // If staff assignment changed
        if (assignedStaffId) {
          await api.post(`/api/tasks/${editingTask.id}/assign`, {
            staff_id: parseInt(assignedStaffId, 10),
          });
        }
        addToast('Task updated successfully!', 'success');
      } else {
        // Create new task
        await api.post('/api/tasks', {
          title,
          description,
          zone_id: zoneId ? parseInt(zoneId, 10) : null,
          priority,
          assigned_staff_id: assignedStaffId ? parseInt(assignedStaffId, 10) : null,
        });
        addToast('New task created and dispatched!', 'success');
      }

      onTaskSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save task. Please try again.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      addToast(typeof msg === 'string' ? msg : 'Error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <i className={`fa-solid ${editingTask ? 'fa-pen-to-square' : 'fa-circle-plus'}`} />
            <h3>{editingTask ? 'Edit Ground Task' : 'Dispatch New Ground Task'}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {errorMsg && (
          <div className="form-error-alert">
            <i className="fa-solid fa-triangle-exclamation" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="task-title">Task Title / Flight Operation *</label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Baggage Handling Flight AI-302"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Operational Details / Instructions</label>
            <textarea
              id="task-desc"
              className="form-textarea"
              rows={3}
              placeholder="e.g. Unload 140 bags from rear cargo hold and expedite connection bags to Terminal 2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="task-zone">Airport Zone / Gate</label>
              <select
                id="task-zone"
                className="form-select"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              >
                <option value="">-- Select Airport Zone --</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.terminal} - {z.zone_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority Level</label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Critical">Critical (Immediate)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Standard</option>
                <option value="Low">Low Routine</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-staff">Assign Ground Staff Personnel</label>
            <select
              id="task-staff"
              className="form-select"
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
            >
              <option value="">-- Unassigned (Available in Pool) --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Saving...
                </>
              ) : editingTask ? (
                'Update Task'
              ) : (
                'Dispatch Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
