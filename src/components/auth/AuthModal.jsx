import React, { useState } from 'react';
import { X, Check, Building2, Phone, User, Mail, Sparkles, PlusCircle, ArrowRight, ChevronDown, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import FreshiozLogo from '../common/FreshiozLogo';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    approvedSocieties, 
    selectedSociety, 
    loginUser,
    setIsSocietyRequestModalOpen 
  } = useStore();

  const [step, setStep] = useState('DETAILS'); // 'DETAILS' -> 'OTP'
  const [formData, setFormData] = useState({
    name: 'Kavitha R',
    phone: '9845012345',
    email: '',
    societyId: selectedSociety?.id || approvedSocieties[0]?.id || 'soc-1',
    flatNo: 'Tower B - Flat 402',
    agreedTerms: true
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  if (!isAuthModalOpen) return null;

  const currentSelectedSociety = approvedSocieties.find(s => s.id === formData.societyId) || approvedSocieties[0];

  // Real-time phone handler: ONLY digits, max 10 digits
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
    if (fieldErrors.phone) {
      setFieldErrors(prev => ({ ...prev, phone: null }));
    }
  };

  // Real-time name handler: letters and spaces only
  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
    setFormData({ ...formData, name: val });
    if (fieldErrors.name) {
      setFieldErrors(prev => ({ ...prev, name: null }));
    }
  };

  const validateDetails = () => {
    const errors = {};

    // 1. Full Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // 2. Phone Number validation (Strict 10 digits Indian mobile)
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid 10-digit mobile number starting with 6-9';
    }

    // 3. Flat / Room validation
    if (!formData.flatNo.trim()) {
      errors.flatNo = currentSelectedSociety?.type === 'HOSTEL' ? 'Room / Bed number is required' : 'Flat / Block number is required';
    }

    // 4. Email validation (Optional, but strict format if provided)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // 5. Terms validation
    if (!formData.agreedTerms) {
      errors.agreedTerms = 'You must accept the terms to proceed';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!validateDetails()) {
      setErrorMsg('Please correct the highlighted errors before continuing.');
      return;
    }
    setErrorMsg('');
    setStep('OTP');
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp !== '1234') {
      setErrorMsg('Invalid OTP. Use demo verification code 1234.');
      return;
    }

    setSuccessToast(true);
    setTimeout(() => {
      loginUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        societyId: formData.societyId,
        societyName: currentSelectedSociety?.name,
        flatNo: formData.flatNo.trim()
      });
      setSuccessToast(false);
      setStep('DETAILS');
    }, 600);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-dialog-box modern-auth-modal" onClick={(e) => e.stopPropagation()}>
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
        <div className="auth-header-block">
          <FreshiozLogo height={52} showTagline={false} />
          <h3 className="auth-modal-title">
            {step === 'DETAILS' ? 'Resident Login & Registration' : 'Verify Mobile OTP'}
          </h3>
          <p className="auth-modal-subtitle">
            {step === 'DETAILS'
              ? 'Direct next-day farm delivery to your society gate & flat'
              : `Enter the 4-digit code sent to +91 ${formData.phone}`}
          </p>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successToast && (
          <div className="auth-success-banner">
            <Check size={16} color="#78B159" />
            <span>Login Successful! Welcome to Freshioz.</span>
          </div>
        )}

        {step === 'DETAILS' ? (
          <form onSubmit={handleDetailsSubmit} noValidate>
            {/* Row 1: Full Name & Phone Number */}
            <div className="form-grid-two-col">
              <div className="modern-form-group">
                <label className="modern-field-label">Full Name *</label>
                <div className="modern-input-wrapper">
                  <User size={15} className="input-prefix-icon" />
                  <input
                    type="text"
                    className={`modern-text-input ${fieldErrors.name ? 'has-error' : ''}`}
                    placeholder="e.g. Kavitha R"
                    value={formData.name}
                    onChange={handleNameChange}
                    maxLength={50}
                  />
                </div>
                {fieldErrors.name && (
                  <span className="modern-error-hint">{fieldErrors.name}</span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-field-label">Phone Number *</label>
                <div className="modern-input-wrapper">
                  <span className="phone-country-code">+91</span>
                  <input
                    type="tel"
                    className={`modern-text-input input-phone-indent ${fieldErrors.phone ? 'has-error' : ''}`}
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                {fieldErrors.phone && (
                  <span className="modern-error-hint">{fieldErrors.phone}</span>
                )}
              </div>
            </div>

            {/* Row 2: Select Society / Hostel */}
            <div className="modern-form-group" style={{ marginBottom: '14px' }}>
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
                  value={formData.societyId}
                  onChange={(e) => setFormData({ ...formData, societyId: e.target.value })}
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

            {/* Row 3: Flat / Block No & Optional Email */}
            <div className="form-grid-two-col">
              <div className="modern-form-group">
                <label className="modern-field-label">
                  {currentSelectedSociety?.type === 'HOSTEL' ? 'Room / Bed No *' : 'Flat / Block No *'}
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="text"
                    className={`modern-text-input no-icon-indent ${fieldErrors.flatNo ? 'has-error' : ''}`}
                    placeholder={currentSelectedSociety?.unitPlaceholder || 'e.g. Tower B - Flat 402'}
                    value={formData.flatNo}
                    onChange={(e) => {
                      setFormData({ ...formData, flatNo: e.target.value });
                      if (fieldErrors.flatNo) setFieldErrors(prev => ({ ...prev, flatNo: null }));
                    }}
                    maxLength={40}
                  />
                </div>
                {fieldErrors.flatNo && (
                  <span className="modern-error-hint">{fieldErrors.flatNo}</span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-field-label">Email (Optional)</label>
                <div className="modern-input-wrapper">
                  <Mail size={15} className="input-prefix-icon" />
                  <input
                    type="email"
                    className={`modern-text-input ${fieldErrors.email ? 'has-error' : ''}`}
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                    }}
                  />
                </div>
                {fieldErrors.email && (
                  <span className="modern-error-hint">{fieldErrors.email}</span>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div style={{ margin: '14px 0 18px' }}>
              <label className="modern-checkbox-label">
                <input
                  type="checkbox"
                  className="modern-checkbox-input"
                  checked={formData.agreedTerms}
                  onChange={(e) => {
                    setFormData({ ...formData, agreedTerms: e.target.checked });
                    if (fieldErrors.agreedTerms) setFieldErrors(prev => ({ ...prev, agreedTerms: null }));
                  }}
                />
                <span className="checkbox-text">
                  I agree to Freshioz Next-Day Delivery Terms & Privacy Policy
                </span>
              </label>
              {fieldErrors.agreedTerms && (
                <div className="modern-error-hint" style={{ marginTop: '4px' }}>
                  {fieldErrors.agreedTerms}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="modern-submit-btn">
              <span>Get 4-Digit OTP</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="otp-universal-hint">
              ✨ Universal Demo OTP: <strong>1234</strong>
            </div>

            <div className="otp-boxes-container">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  className="modern-otp-box"
                  value={digit}
                  inputMode="numeric"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const newOtp = [...otp];
                    newOtp[idx] = val;
                    setOtp(newOtp);
                    // Auto-focus next input
                    if (val && idx < 3) {
                      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
                      if (nextInput) nextInput.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                      const prevInput = document.getElementById(`otp-input-${idx - 1}`);
                      if (prevInput) prevInput.focus();
                    }
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="modern-secondary-btn"
              >
                Back
              </button>

              <button
                type="submit"
                className="modern-submit-btn"
                style={{ flex: 2 }}
              >
                Verify & Continue
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
