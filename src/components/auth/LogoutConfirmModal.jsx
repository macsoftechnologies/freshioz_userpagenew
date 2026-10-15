import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function LogoutConfirmModal() {
  const { 
    isLogoutModalOpen, 
    setIsLogoutModalOpen, 
    logoutTarget, 
    confirmLogout,
    activeUser,
    partnerAuth 
  } = useStore();

  if (!isLogoutModalOpen) return null;

  const isPartner = logoutTarget === 'PARTNER';

  return (
    <div 
      className="modal-backdrop-overlay" 
      style={{ zIndex: 2000 }}
    >
      <div 
        className="modal-dialog-box" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '460px', 
          width: '92%',
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px 26px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '2px solid #E2E8F0'
        }}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <LogOut size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {isPartner ? 'Log Out of Partner Desk?' : 'Log Out of Freshioz?'}
              </h3>
              <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                {isPartner 
                  ? 'Society committee access will be locked'
                  : 'You will need to sign in again to place orders'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Account Info Box */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '14px 16px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          {isPartner ? (
            <div>
              <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Active Society Desk:</div>
              <div style={{ color: '#0F172A', fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>
                🏢 {partnerAuth?.societyName || 'Society Committee'}
              </div>
              <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                Secretary Phone: +91 {partnerAuth?.secretaryPhone}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Active Resident Account:</div>
              <div style={{ color: '#0F172A', fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>
                {activeUser?.name || 'Resident User'}
              </div>
              <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                +91 {activeUser?.phone} • {activeUser?.societyName} ({activeUser?.flatNo})
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Cancel vs Confirm */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={confirmLogout}
            style={{
              flex: 1,
              padding: '11px 18px',
              borderRadius: '10px',
              border: 'none',
              background: '#DC2626',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={15} />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
