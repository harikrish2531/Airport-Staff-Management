import React, { useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ZoneModal({ isOpen, onClose, onZoneSaved }) {
  const { addToast } = useToast();
  const [zoneName, setZoneName] = useState('');
  const [terminal, setTerminal] = useState('Terminal 1');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zoneName.trim()) {
      setErrorMsg('Zone name is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/api/zones', {
        zone_name: zoneName.trim(),
        terminal,
      });
      addToast(`Zone "${zoneName}" added to ${terminal}`, 'success');
      setZoneName('');
      onZoneSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add zone';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      addToast(typeof msg === 'string' ? msg : 'Error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <i className="fa-solid fa-map-location-dot" />
            <h3>Add Airport Operational Zone</h3>
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
            <label htmlFor="terminal-select">Airport Terminal *</label>
            <select
              id="terminal-select"
              className="form-select"
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
              required
            >
              <option value="Terminal 1">Terminal 1 (Domestic Operations)</option>
              <option value="Terminal 2">Terminal 2 (International Operations)</option>
              <option value="Terminal 3">Terminal 3 (Cargo & Hangar)</option>
              <option value="Ramp & Apron">Ramp & Apron Operations</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="zone-name">Zone / Area Name *</label>
            <input
              id="zone-name"
              type="text"
              className="form-input"
              placeholder="e.g. Gate 18 Ramp, Baggage Carousel 4, Cargo Bay A"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
