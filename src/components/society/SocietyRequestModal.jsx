import React, { useState } from 'react';
import { X, CheckCircle2, Building2, MapPin, Send, Sparkles, Phone, User, Mail, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import LeafletLocationPicker from '../common/LeafletLocationPicker';
import FreshiozLogo from '../common/FreshiozLogo';

export default function SocietyRequestModal() {
  const { 
    isSocietyRequestModalOpen, 
    setIsSocietyRequestModalOpen, 
    requestNewSociety 
  } = useStore();

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    societyName: '',
    societyType: 'APARTMENT', // 'APARTMENT' or 'HOSTEL'
    address: '',
    lat: 12.9716,
    lng: 77.5946,
    estimatedFlats: 150
  });

  if (!isSocietyRequestModalOpen) return null;

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, requesterPhone: val });
    if (errorMsg) setErrorMsg('');
  };

  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
    setFormData({ ...formData, requesterName: val });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.requesterName.trim() || formData.requesterName.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 letters).');
      return;
    }
    if (!formData.requesterPhone || formData.requesterPhone.length !== 10 || !/^[6-9]\d{9}$/.test(formData.requesterPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6-9.');
      return;
    }
    if (formData.requesterEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requesterEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.societyName.trim() || formData.societyName.trim().length < 3) {
      setErrorMsg('Please enter the apartment or hostel name.');
      return;
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setErrorMsg('Please enter the locality or street address.');
      return;
    }

    requestNewSociety({
      requesterName: formData.requesterName.trim(),
      requesterPhone: formData.requesterPhone.trim(),
      requesterEmail: formData.requesterEmail.trim(),
      societyName: formData.societyName.trim(),
      societyType: formData.societyType,
      address: formData.address.trim(),
      lat: formData.lat,
      lng: formData.lng,
      estimatedFlats: Number(formData.estimatedFlats) || 100
    });

    setSubmitted(true);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={() => setIsSocietyRequestModalOpen(false)}>
      <div className="modal-dialog-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-icon"
          onClick={() => setIsSocietyRequestModalOpen(false)}
          aria-label="Close modal"
        >
          <X size={17} />
        </button>

        {!submitted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <FreshiozLogo height={48} showTagline={false} />
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#173328', marginTop: '8px' }}>
                Request Your Apartment or Hostel
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B7F74', marginTop: '3px' }}>
                Bring next-day dawn-harvested farm vegetables & fruits to your community gate!
              </p>
            </div>

            {errorMsg && (
              <div className="auth-error-banner">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid-two-col">
                {/* Your Name */}
                <div className="modern-form-group">
                  <label className="modern-field-label">Your Full Name *</label>
                  <div className="modern-input-wrapper">
                    <User size={15} className="input-prefix-icon" />
                    <input
                      type="text"
                      className="modern-text-input"
                      placeholder="e.g. Ramesh Babu"
                      value={formData.requesterName}
                      onChange={handleNameChange}
                      maxLength={50}
                      required
                    />
                  </div>
                </div>

                {/* Your Phone */}
                <div className="modern-form-group">
                  <label className="modern-field-label">Contact Phone *</label>
                  <div className="modern-input-wrapper">
                    <span className="phone-country-code">+91</span>
                    <input
                      type="tel"
                      className="modern-text-input input-phone-indent"
                      placeholder="10-digit mobile"
                      value={formData.requesterPhone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="modern-form-group" style={{ marginBottom: '12px' }}>
                <label className="modern-field-label">Email Address (Optional)</label>
                <div className="modern-input-wrapper">
                  <Mail size={15} className="input-prefix-icon" />
                  <input
                    type="email"
                    className="modern-text-input"
                    placeholder="name@email.com"
                    value={formData.requesterEmail}
                    onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-two-col">
                {/* Society / Hostel Name */}
                <div className="modern-form-group">
                  <label className="modern-field-label">Apartment / Hostel Name *</label>
                  <div className="modern-input-wrapper">
                    <Building2 size={15} className="input-prefix-icon" />
                    <input
                      type="text"
                      className="modern-text-input"
                      placeholder="e.g. Purva Skywood / Zolo Co-Living"
                      value={formData.societyName}
                      onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Society Type */}
                <div className="modern-form-group">
                  <label className="modern-field-label">Property Type</label>
                  <div className="modern-select-wrapper">
                    <select
                      className="modern-select-input no-icon-indent"
                      value={formData.societyType}
                      onChange={(e) => setFormData({ ...formData, societyType: e.target.value })}
                    >
                      <option value="APARTMENT">Apartment / Gated Community</option>
                      <option value="HOSTEL">Hostel / PG Co-Living</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Street Address */}
              <div className="modern-form-group" style={{ marginBottom: '12px' }}>
                <label className="modern-field-label">Locality / Area Address *</label>
                <div className="modern-input-wrapper">
                  <MapPin size={15} className="input-prefix-icon" />
                  <input
                    type="text"
                    className="modern-text-input"
                    placeholder="e.g. Sarjapur Main Road, Haralur, Bengaluru"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Interactive OpenStreetMap Pin Picker */}
              <div style={{ marginBottom: '16px' }}>
                <label className="modern-field-label" style={{ marginBottom: '6px', display: 'block' }}>
                  Pinpoint Location on Map (Free OpenStreetMap)
                </label>
                <LeafletLocationPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onLocationChange={(coords) => setFormData({ ...formData, lat: coords.lat, lng: coords.lng })}
                />
              </div>

              <button
                type="submit"
                className="modern-submit-btn"
              >
                <Send size={16} />
                <span>Submit Society Request for Onboarding</span>
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#EBF7E5',
              color: '#78B159',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#173328', marginBottom: '8px' }}>
              Request Received Successfully!
            </h3>
            <p style={{ fontSize: '13px', color: '#52635A', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto 20px' }}>
              Thank you, <strong>{formData.requesterName}</strong>! Our field sales team will inspect the delivery gate at <strong>{formData.societyName}</strong> and connect with your Resident Welfare Association.
            </p>

            <button
              type="button"
              className="modern-submit-btn"
              style={{ maxWidth: '240px', margin: '0 auto' }}
              onClick={() => {
                setSubmitted(false);
                setIsSocietyRequestModalOpen(false);
              }}
            >
              Done & Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
