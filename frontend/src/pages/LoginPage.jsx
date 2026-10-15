import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Ground Staff');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCredentialsDirectory, setShowCredentialsDirectory] = useState(true);

  // Authorized personnel roster provisioned in SQLite database
  const authorizedAccounts = [
    {
      role: 'Admin',
      badgeClass: 'badge-admin',
      name: 'Operations Admin',
      email: 'admin@airport.com',
      pass: 'Admin@123',
      dept: 'Airport Ground Operations Command'
    },
    {
      role: 'Supervisor',
      badgeClass: 'badge-supervisor',
      name: 'Marcus Vance',
      email: 'supervisor@airport.com',
      pass: 'Supervisor@123',
      dept: 'Ramp & Tarmac Operations Lead'
    },
    {
      role: 'Ground Staff',
      badgeClass: 'badge-staff',
      name: 'John Miller (Emp 1)',
      email: 'employee1@airport.com',
      pass: 'Employee@123',
      dept: 'Baggage Handling & Routing'
    },
    {
      role: 'Ground Staff',
      badgeClass: 'badge-staff',
      name: 'Sarah Jenkins (Emp 2)',
      email: 'employee2@airport.com',
      pass: 'Employee@123',
      dept: 'Ramp Marshalling & FOD Safety'
    },
    {
      role: 'Ground Staff',
      badgeClass: 'badge-staff',
      name: 'Michael Chen (Emp 3)',
      email: 'employee3@airport.com',
      pass: 'Employee@123',
      dept: 'Aircraft Refueling & Fuel Farm'
    },
    {
      role: 'Ground Staff',
      badgeClass: 'badge-staff',
      name: 'Emily Davis (Emp 4)',
      email: 'employee4@airport.com',
      pass: 'Employee@123',
      dept: 'Gate 12 Turnaround & Cabin Sanitization'
    },
    {
      role: 'Ground Staff',
      badgeClass: 'badge-staff',
      name: 'David Wilson (Emp 5)',
      email: 'employee5@airport.com',
      pass: 'Employee@123',
      dept: 'Cargo Loading & Freight Logistics'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) {
          setErrorMsg('Full name is required');
          setLoading(false);
          return;
        }
        await register(name.trim(), email.trim(), password, role);
        addToast('Staff account registered successfully! Authenticating...', 'success');
        // Auto-login after registration
        await login(email.trim(), password);
      } else {
        await login(email.trim(), password);
        addToast('Authentication verified. Welcome to AeroOps Command!', 'success');
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please verify credentials.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      addToast(typeof msg === 'string' ? msg : 'Error logging in', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (accEmail, accPass) => {
    setIsRegistering(false);
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMsg('');
    addToast(`Credentials populated: ${accEmail}`, 'info');
  };

  return (
    <div className="login-page-container">
      <div className="login-backdrop-glow" />

      <div className="login-card">
        <div className="login-header">
          <div className="brand-logo-large">
            <div className="logo-icon-wrap large">
              <i className="fa-solid fa-plane-departure" />
            </div>
            <div>
              <h1 className="brand-title">AeroOps</h1>
              <p className="brand-tagline">Airport Ground Staff Management System</p>
            </div>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegistering ? 'active' : ''}`}
            onClick={() => {
              setIsRegistering(false);
              setErrorMsg('');
            }}
          >
            <i className="fa-solid fa-right-to-bracket" /> Staff Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegistering ? 'active' : ''}`}
            onClick={() => {
              setIsRegistering(true);
              setErrorMsg('');
            }}
          >
            <i className="fa-solid fa-user-plus" /> Register New Account
          </button>
        </div>

        {errorMsg && (
          <div className="form-error-alert">
            <i className="fa-solid fa-circle-exclamation" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="reg-name">Full Personnel Name</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-user icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegistering}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Airport Staff Email Address</label>
            <div className="input-with-icon">
              <i className="fa-solid fa-envelope icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="name@airport.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Account Password</label>
            <div className="input-with-icon password-input-wrap">
              <i className="fa-solid fa-lock icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="reg-role">Designated Airport Role</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-id-badge icon" />
                <select
                  id="reg-role"
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Ground Staff">Ground Staff (Ramp / Baggage / Cleaning)</option>
                  <option value="Supervisor">Supervisor (Operations & Dispatch)</option>
                  <option value="Admin">Admin (Operations & System Management)</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Verifying Credentials...
              </>
            ) : isRegistering ? (
              'Create Airport Staff Account'
            ) : (
              'Authenticate & Enter Command'
            )}
          </button>
        </form>

        {/* Authorized Database Credentials Directory */}
        <div className="credentials-directory-card">
          <div
            className="directory-header"
            onClick={() => setShowCredentialsDirectory((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            <div className="directory-header-left">
              <i className="fa-solid fa-shield-halved text-cyan" />
              <div>
                <strong>Authorized Personnel Credentials</strong>
                <span className="directory-sub">Stored in SQLite Database</span>
              </div>
            </div>
            <i className={`fa-solid ${showCredentialsDirectory ? 'fa-chevron-up' : 'fa-chevron-down'} toggle-icon`} />
          </div>

          {showCredentialsDirectory && (
            <div className="directory-accounts-list">
              {authorizedAccounts.map((acc, index) => (
                <div
                  key={acc.email}
                  className="account-item-row"
                  onClick={() => handleSelectAccount(acc.email, acc.pass)}
                  role="button"
                  tabIndex={0}
                  title="Click to populate credentials"
                >
                  <div className="acc-left">
                    <span className={`role-pill ${acc.badgeClass}`}>{acc.role}</span>
                    <div className="acc-details">
                      <div className="acc-name">{acc.name}</div>
                      <div className="acc-email">{acc.email}</div>
                    </div>
                  </div>
                  <div className="acc-right">
                    <span className="acc-pass-tag">{acc.pass}</span>
                    <button
                      type="button"
                      className="btn-use-creds"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAccount(acc.email, acc.pass);
                      }}
                      title="Use credentials"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="login-footer-meta">
          <span>AeroOps Airport Ground Operations System • SQLite Database Active</span>
        </div>
      </div>
    </div>
  );
}
