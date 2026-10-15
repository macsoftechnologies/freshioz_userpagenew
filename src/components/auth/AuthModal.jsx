import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Building2, 
  Phone, 
  User, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import FreshiozLogo from '../common/FreshiozLogo';
import { API_BASE_URL } from '../../shared/freshiozStore';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    approvedSocieties, 
    selectedSociety, 
    loginUser,
    store,
    setIsSocietyRequestModalOpen 
  } = useStore();

  // Mode: 'LOGIN' (Sign In) vs 'REGISTER' (Create New Account)
  const [authMode, setAuthMode] = useState('LOGIN');

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    societyId: selectedSociety?.id || approvedSocieties[0]?.id || '',
    flatNo: '',
    password: '',
    confirmPassword: '',
    agreedTerms: true
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isConfirmRegisterModalOpen, setIsConfirmRegisterModalOpen] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const currentSelectedSociety = approvedSocieties.find(s => s.id === registerData.societyId) || approvedSocieties[0];

  // Strong Password Strength Calculator
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#CBD5E1', checks: { length: false, number: false, mixed: false, symbol: false } };
    
    const checks = {
      length: pwd.length >= 8,
      number: /\d/.test(pwd),
      mixed: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      symbol: /[^a-zA-Z0-9]/.test(pwd)
    };

    let score = 0;
    if (checks.length) score += 1;
    if (checks.number) score += 1;
    if (checks.mixed) score += 1;
    if (checks.symbol) score += 1;

    let label = 'Weak';
    let color = '#EF4444'; // Red
    if (score >= 3) {
      label = 'Strong';
      color = '#10B981'; // Green
    } else if (score === 2) {
      label = 'Moderate';
      color = '#F59E0B'; // Amber
    }

    return { score, label, color, checks };
  };

  const pwdStrength = calculatePasswordStrength(registerData.password);

  // Phone sanitization helper (10 Indian digits)
  const sanitizePhone = (val) => val.replace(/\D/g, '').slice(0, 10);

  // Real-time name handler
  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
    setRegisterData(prev => ({ ...prev, name: val }));
    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: null }));
  };

  // ================= HANDLE LOGIN SUBMISSION =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = sanitizePhone(loginPhone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          password: loginPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please verify credentials.');
      }

      if (data.token) {
        localStorage.setItem('freshioz_user_token', data.token);
      }

      const activeUserData = data.user || {
        phone: cleanPhone,
        name: data.user?.name || 'Resident Member',
        societyId: data.user?.societyId,
        societyName: data.user?.societyName,
        flatNo: data.user?.flatNo
      };

      setSuccessToast(`✓ Welcome back, ${activeUserData.name}!`);
      setTimeout(() => {
        loginUser(activeUserData);
        setSuccessToast('');
        setIsSubmitting(false);
      }, 500);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'No resident account found or password mismatch. Please sign up or try again.');
    }
  };

  // ================= HANDLE REGISTRATION SUBMISSION =================
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errors = {};

    // 1. Full Name
    if (!registerData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (registerData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // 2. Phone
    const cleanPhone = sanitizePhone(registerData.phone);
    if (!cleanPhone) {
      errors.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errors.phone = 'Must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Enter valid 10-digit number starting with 6-9';
    }

    // Check duplicate phone in database
    const existingUser = (store.users || []).find(u => u.phone === cleanPhone);
    if (existingUser) {
      errors.phone = 'An account with this phone already exists. Please Sign In.';
    }

    // 3. Email (Mandatory)
    const cleanEmail = registerData.email.trim();
    if (!cleanEmail) {
      errors.email = 'Email address is mandatory';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Enter a valid email address';
    } else {
      const existingEmail = (store.users || []).find(u => (u.email || '').toLowerCase() === cleanEmail.toLowerCase());
      if (existingEmail) {
        errors.email = 'An account with this email already exists. Please Sign In.';
      }
    }

    // 4. Flat / Room
    if (!registerData.flatNo.trim()) {
      errors.flatNo = currentSelectedSociety?.type === 'HOSTEL' ? 'Room / Bed number required' : 'Flat / Block number required';
    }

    // 5. Strong Password Validation
    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (registerData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (pwdStrength.score < 2) {
      errors.password = 'Please use a stronger password (include letters and numbers)';
    }

    // 6. Confirm Password Match
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // 7. Terms
    if (!registerData.agreedTerms) {
      errors.agreedTerms = 'You must accept the terms to proceed';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please resolve highlighted errors to complete registration.');
      return;
    }

    setFieldErrors({});
    setIsConfirmRegisterModalOpen(true);
  };

  const handleFinalCommitRegister = async () => {
    const cleanPhone = sanitizePhone(registerData.phone);
    const newUserPayload = {
      name: registerData.name.trim(),
      phone: cleanPhone,
      password: registerData.password,
      email: registerData.email.trim(),
      societyId: registerData.societyId,
      societyName: currentSelectedSociety?.name || 'Selected Community',
      flatNo: registerData.flatNo.trim()
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please check details.');
      }

      if (data.token) {
        localStorage.setItem('freshioz_user_token', data.token);
      }

      setIsConfirmRegisterModalOpen(false);
      setSuccessToast(`✓ Account created successfully! Welcome, ${newUserPayload.name}.`);
      setTimeout(() => {
        loginUser(data.user || newUserPayload);
        setSuccessToast('');
        setIsSubmitting(false);
      }, 600);
    } catch (err) {
      setIsSubmitting(false);
      setIsConfirmRegisterModalOpen(false);
      setErrorMsg(err.message || 'Failed to create account.');
    }
  };

  return (
    <div className="modal-backdrop-overlay">
      <div 
        className="modal-dialog-box modern-auth-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', padding: '24px 26px', position: 'relative' }}
      >
        {/* Top Close Button */}
        <button
          type="button"
          className="modal-close-icon"
          onClick={() => setIsAuthModalOpen(false)}
          aria-label="Close modal"
        >
          <X size={17} />
        </button>

        {/* Brand Header */}
        <div className="auth-header-block" style={{ marginBottom: '14px' }}>
          <FreshiozLogo height={60} showTagline={true} />
          <h3 className="auth-modal-title" style={{ marginTop: '8px' }}>
            {authMode === 'LOGIN' ? 'Resident Member Sign In' : 'Create Resident Account'}
          </h3>
          <p className="auth-modal-subtitle">
            Direct Farm-Fresh harvest delivered straight to your society reception desk
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: '#F1F5F9',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMode('LOGIN'); setErrorMsg(''); setFieldErrors({}); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'LOGIN' ? '#234B3C' : 'transparent',
              color: authMode === 'LOGIN' ? '#FFFFFF' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={13} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('REGISTER'); setErrorMsg(''); setFieldErrors({}); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'REGISTER' ? '#234B3C' : 'transparent',
              color: authMode === 'REGISTER' ? '#FFFFFF' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={13} />
            <span>New Resident</span>
          </button>
        </div>

        {/* Banners */}
        {errorMsg && (
          <div className="auth-error-banner" style={{ marginBottom: '14px' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successToast && (
          <div className="auth-success-banner" style={{ marginBottom: '14px' }}>
            <Check size={16} color="#78B159" />
            <span>{successToast}</span>
          </div>
        )}

        {/* ================= MODE 1: LOGIN ================= */}
        {authMode === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="modern-form-group" style={{ marginBottom: '14px' }}>
              <label className="modern-field-label">Registered Mobile Number *</label>
              <div className="modern-input-wrapper">
                <span className="phone-country-code">+91</span>
                <input
                  type="tel"
                  className="modern-text-input input-phone-indent"
                  placeholder="10-digit mobile number"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(sanitizePhone(e.target.value))}
                  maxLength={10}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <div className="modern-form-group" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="modern-field-label" style={{ margin: 0 }}>Password *</label>
              </div>
              <div className="modern-input-wrapper" style={{ position: 'relative' }}>
                <Key size={15} className="input-prefix-icon" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="modern-text-input"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="modern-submit-btn" style={{ width: '100%', marginBottom: '12px' }}>
              <span>Sign In to Account</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', fontSize: '12.5px', color: '#64748B' }}>
              First time ordering?{' '}
              <button
                type="button"
                onClick={() => { setAuthMode('REGISTER'); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#234B3C', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register your flat here
              </button>
            </div>
          </form>
        ) : (
          /* ================= MODE 2: REGISTER ================= */
          <form onSubmit={handleRegisterSubmit} noValidate>
            {/* Full Name & Phone */}
            <div className="form-grid-two-col" style={{ marginBottom: '12px' }}>
              <div className="modern-form-group">
                <label className="modern-field-label">Full Name *</label>
                <div className="modern-input-wrapper">
                  <User size={15} className="input-prefix-icon" />
                  <input
                    type="text"
                    className={`modern-text-input ${fieldErrors.name ? 'has-error' : ''}`}
                    placeholder="e.g. Kavitha R"
                    value={registerData.name}
                    onChange={handleNameChange}
                    maxLength={50}
                  />
                </div>
                {fieldErrors.name && <span className="modern-error-hint">{fieldErrors.name}</span>}
              </div>

              <div className="modern-form-group">
                <label className="modern-field-label">Phone Number *</label>
                <div className="modern-input-wrapper">
                  <span className="phone-country-code">+91</span>
                  <input
                    type="tel"
                    className={`modern-text-input input-phone-indent ${fieldErrors.phone ? 'has-error' : ''}`}
                    placeholder="10-digit mobile"
                    value={registerData.phone}
                    onChange={(e) => {
                      const clean = sanitizePhone(e.target.value);
                      setRegisterData(prev => ({ ...prev, phone: clean }));
                      if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: null }));
                    }}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                {fieldErrors.phone && <span className="modern-error-hint">{fieldErrors.phone}</span>}
              </div>
            </div>

            {/* Select Society / Hostel */}
            <div className="modern-form-group" style={{ marginBottom: '12px' }}>
              <div className="label-with-action-row">
                <label className="modern-field-label">Select Apartment or Hostel *</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setIsSocietyRequestModalOpen(true);
                  }}
                  className="label-action-link"
                >
                  + Request your society
                </button>
              </div>

              <div className="modern-select-wrapper">
                <Building2 size={15} className="input-prefix-icon" />
                <select
                  className="modern-select-input"
                  value={registerData.societyId}
                  onChange={(e) => setRegisterData({ ...registerData, societyId: e.target.value })}
                >
                  {approvedSocieties.map(soc => (
                    <option key={soc.id} value={soc.id}>
                      {soc.name} ({soc.type === 'HOSTEL' ? 'Hostel' : 'Apartment'})
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="select-dropdown-arrow" />
              </div>
            </div>

            {/* Flat / Block No & Email */}
            <div className="form-grid-two-col" style={{ marginBottom: '12px' }}>
              <div className="modern-form-group">
                <label className="modern-field-label">
                  {currentSelectedSociety?.type === 'HOSTEL' ? 'Room / Bed No *' : 'Flat / Block No *'}
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="text"
                    className={`modern-text-input no-icon-indent ${fieldErrors.flatNo ? 'has-error' : ''}`}
                    placeholder={currentSelectedSociety?.unitPlaceholder || 'e.g. Tower B - Flat 402'}
                    value={registerData.flatNo}
                    onChange={(e) => {
                      setRegisterData({ ...registerData, flatNo: e.target.value });
                      if (fieldErrors.flatNo) setFieldErrors(prev => ({ ...prev, flatNo: null }));
                    }}
                    maxLength={40}
                  />
                </div>
                {fieldErrors.flatNo && <span className="modern-error-hint">{fieldErrors.flatNo}</span>}
              </div>

              <div className="modern-form-group">
                <label className="modern-field-label">Email Address *</label>
                <div className="modern-input-wrapper">
                  <Mail size={15} className="input-prefix-icon" />
                  <input
                    type="email"
                    className={`modern-text-input ${fieldErrors.email ? 'has-error' : ''}`}
                    placeholder="name@email.com"
                    value={registerData.email}
                    onChange={(e) => {
                      setRegisterData({ ...registerData, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                    }}
                    required
                  />
                </div>
                {fieldErrors.email && <span className="modern-error-hint">{fieldErrors.email}</span>}
              </div>
            </div>

            {/* Password with Strong Password Indicator */}
            <div className="modern-form-group" style={{ marginBottom: '10px' }}>
              <label className="modern-field-label">Create Strong Password *</label>
              <div className="modern-input-wrapper" style={{ position: 'relative' }}>
                <Key size={15} className="input-prefix-icon" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  className={`modern-text-input ${fieldErrors.password ? 'has-error' : ''}`}
                  placeholder="Min 8 characters with letters & numbers"
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                  }}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Real-time Strength Meter */}
              {registerData.password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Password Strength:</span>
                    <strong style={{ fontSize: '11px', color: pwdStrength.color }}>{pwdStrength.label}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden', background: '#E2E8F0' }}>
                    <div style={{ flex: 1, background: pwdStrength.score >= 1 ? pwdStrength.color : 'transparent', transition: 'background 0.2s' }} />
                    <div style={{ flex: 1, background: pwdStrength.score >= 2 ? pwdStrength.color : 'transparent', transition: 'background 0.2s' }} />
                    <div style={{ flex: 1, background: pwdStrength.score >= 3 ? pwdStrength.color : 'transparent', transition: 'background 0.2s' }} />
                    <div style={{ flex: 1, background: pwdStrength.score >= 4 ? pwdStrength.color : 'transparent', transition: 'background 0.2s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px', fontSize: '10px', color: '#64748B' }}>
                    <span style={{ color: pwdStrength.checks.length ? '#10B981' : '#94A3B8' }}>
                      {pwdStrength.checks.length ? '✓' : '•'} 8+ chars
                    </span>
                    <span style={{ color: pwdStrength.checks.number ? '#10B981' : '#94A3B8' }}>
                      {pwdStrength.checks.number ? '✓' : '•'} Number
                    </span>
                    <span style={{ color: pwdStrength.checks.mixed ? '#10B981' : '#94A3B8' }}>
                      {pwdStrength.checks.mixed ? '✓' : '•'} Upper & Lowercase
                    </span>
                  </div>
                </div>
              )}
              {fieldErrors.password && <span className="modern-error-hint">{fieldErrors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="modern-form-group" style={{ marginBottom: '12px' }}>
              <label className="modern-field-label">Confirm Password *</label>
              <div className="modern-input-wrapper" style={{ position: 'relative' }}>
                <ShieldCheck size={15} className="input-prefix-icon" />
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  className={`modern-text-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                  placeholder="Re-type your password"
                  value={registerData.confirmPassword}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, confirmPassword: e.target.value });
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: null }));
                  }}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                  aria-label="Toggle confirm password visibility"
                >
                  {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {registerData.confirmPassword && (
                <div style={{ fontSize: '11px', marginTop: '3px', color: registerData.password === registerData.confirmPassword ? '#10B981' : '#EF4444' }}>
                  {registerData.password === registerData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
              {fieldErrors.confirmPassword && <span className="modern-error-hint">{fieldErrors.confirmPassword}</span>}
            </div>

            {/* Terms Checkbox */}
            <div style={{ margin: '10px 0 14px' }}>
              <label className="modern-checkbox-label">
                <input
                  type="checkbox"
                  className="modern-checkbox-input"
                  checked={registerData.agreedTerms}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, agreedTerms: e.target.checked });
                    if (fieldErrors.agreedTerms) setFieldErrors(prev => ({ ...prev, agreedTerms: null }));
                  }}
                />
                <span className="checkbox-text" style={{ fontSize: '11.5px' }}>
                  I agree to Freshioz Next-Day Society Drop Desk Terms
                </span>
              </label>
              {fieldErrors.agreedTerms && <div className="modern-error-hint">{fieldErrors.agreedTerms}</div>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="modern-submit-btn" style={{ width: '100%', marginBottom: '10px' }}>
              <span>Create Account & Start Ordering</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', fontSize: '12.5px', color: '#64748B' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setAuthMode('LOGIN'); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#234B3C', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In here
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Registration Details Confirmation Modal */}
      {isConfirmRegisterModalOpen && (
        <div 
          className="modal-backdrop-overlay" 
          style={{ zIndex: 1200, background: 'rgba(15, 23, 42, 0.78)' }}
        >
          <div 
            className="modal-dialog-box"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '420px', 
              padding: '24px 22px', 
              borderRadius: '16px',
              border: '2px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              background: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Confirm Registration Details
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  Please verify your credentials before signing up:
                </p>
              </div>
            </div>

            <div style={{
              background: '#F8FAFC',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '12.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Full Name:</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{registerData.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Mobile Number:</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>+91 {registerData.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Email Address:</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{registerData.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Community / Hostel:</span>
                <span style={{ color: '#059669', fontWeight: 800, textAlign: 'right', maxWidth: '200px' }}>
                  {currentSelectedSociety?.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Flat / Room No:</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{registerData.flatNo}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsConfirmRegisterModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalCommitRegister}
                style={{
                  flex: 1.2,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#234B3C',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Confirm & Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
