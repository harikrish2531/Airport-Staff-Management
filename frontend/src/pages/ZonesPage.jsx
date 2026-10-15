import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ZoneModal from '../components/ZoneModal';

export default function ZonesPage() {
  const { isSupervisor } = useAuth();
  const { addToast } = useToast();

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState('All');

  const fetchZones = useCallback(async () => {
    try {
      const res = await api.get('/api/zones');
      setZones(res.data || []);
    } catch {
      addToast('Failed to load airport zones', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleDeleteZone = async (zoneId, zoneName) => {
    if (!window.confirm(`Are you sure you want to delete zone "${zoneName}"?`)) return;

    try {
      await api.delete(`/api/zones/${zoneId}`);
      addToast(`Zone "${zoneName}" removed`, 'success');
      fetchZones();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete zone';
      addToast(typeof msg === 'string' ? msg : 'Error deleting zone', 'error');
    }
  };

  const filteredZones = selectedTerminal === 'All'
    ? zones
    : zones.filter((z) => z.terminal === selectedTerminal);

  const terminals = ['All', ...new Set(zones.map((z) => z.terminal))];

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Airport Operational Zones</h2>
          <p className="page-subheading">
            Operational gates, apron sectors, baggage halls, and maintenance bays.
          </p>
        </div>

        {isSupervisor && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fa-solid fa-plus" /> Add Operational Zone
          </button>
        )}
      </div>

      {/* Terminal tabs */}
      <div className="terminal-filter-tabs">
        {terminals.map((t) => (
          <button
            key={t}
            type="button"
            className={`terminal-tab ${selectedTerminal === t ? 'active' : ''}`}
            onClick={() => setSelectedTerminal(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin fa-2x" />
          <p>Loading airport zones...</p>
        </div>
      ) : filteredZones.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-map-location-dot fa-2x" />
          <p>No operational zones listed in this terminal.</p>
        </div>
      ) : (
        <div className="zones-grid">
          {filteredZones.map((zone) => (
            <div key={zone.id} className="zone-card">
              <div className="zone-card-header">
                <span className="zone-terminal-pill">{zone.terminal}</span>
                {isSupervisor && (
                  <button
                    type="button"
                    className="zone-delete-btn"
                    onClick={() => handleDeleteZone(zone.id, zone.zone_name)}
                    title="Delete Zone"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                )}
              </div>

              <div className="zone-card-body">
                <div className="zone-icon-badge">
                  <i className="fa-solid fa-location-crosshairs" />
                </div>
                <h3 className="zone-title">{zone.zone_name}</h3>
                <p className="zone-id-sub">System Zone ID: #{zone.id}</p>
              </div>

              <div className="zone-card-footer">
                <span className="zone-status-active">
                  <i className="fa-solid fa-circle-dot" /> Operational
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ZoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onZoneSaved={fetchZones}
      />
    </div>
  );
}
