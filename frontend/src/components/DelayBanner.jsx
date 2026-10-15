import React from 'react';

export default function DelayBanner({ delayedTasks, onReviewClick }) {
  if (!delayedTasks || delayedTasks.length === 0) return null;

  return (
    <div className="delay-alert-banner" role="alert">
      <div className="delay-alert-content">
        <div className="delay-alert-icon">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <div className="delay-alert-text">
          <div className="delay-alert-title">
            <strong>Operational Delay Warning:</strong> {delayedTasks.length} task{delayedTasks.length > 1 ? 's are' : ' is'} overdue or pending without immediate action!
          </div>
          <div className="delay-alert-details">
            Airport ground efficiency threshold exceeded. Immediate supervisor re-assignment or ramp status verification required.
          </div>
        </div>
      </div>
      {onReviewClick && (
        <button
          type="button"
          className="btn btn-warning btn-sm"
          onClick={onReviewClick}
        >
          <i className="fa-solid fa-bolt" /> Review Delayed Tasks
        </button>
      )}
    </div>
  );
}
