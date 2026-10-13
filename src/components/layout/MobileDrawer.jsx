import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  User, 
  Building2, 
  Coins, 
  Package, 
  Sparkles, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  HelpCircle,
  Clock
} from 'lucide-react';
import FreshiozLogo from '../common/FreshiozLogo';
import { useStore } from '../../context/StoreContext';

export default function MobileDrawer() {
  const navigate = useNavigate();
  const { 
    store,
    isMobileDrawerOpen, 
    setIsMobileDrawerOpen,
    approvedSocieties,
    selectedSociety,
    setSelectedSocietyId,
    activeUser,
    logoutUser,
    partnerAuth,
    logoutPartner,
    setIsAuthModalOpen,
    setIsSocietyRequestModalOpen,
    isWholesale,
    setIsWholesale,
    cutoffInfo
  } = useStore();

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={() => setIsMobileDrawerOpen(false)}>
      <div className="drawer-sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <FreshiozLogo height={38} showTagline={false} />
          <button 
            type="button" 
            onClick={() => setIsMobileDrawerOpen(false)}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0F4F2', display: 'flex', alignContent: 'center', justifyContent: 'center' }}
          >
            <X size={18} color="#15221B" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="drawer-scroll-body">
          {/* User / Partner Profile Card */}
          <div style={{
            background: activeUser ? '#EBF2EE' : partnerAuth ? '#FFF8ED' : '#FAF9F5',
            border: activeUser ? '1px solid #C8DBD0' : partnerAuth ? '1px solid #FCD9A5' : '1px solid #E5ECE7',
            borderRadius: '16px',
            padding: '16px'
          }}>
            {activeUser ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#234B3C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                    {activeUser.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#15221B' }}>{activeUser.name}</div>
                    <div style={{ fontSize: '12px', color: '#52635A' }}>+91 {activeUser.phone}</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#234B3C', fontWeight: 600, background: '#FFF', padding: '6px 10px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #E5ECE7' }}>
                  🏢 {selectedSociety?.name} ({activeUser.flatNo})
                </div>

                {/* Quick Account Navigation Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  <Link
                    to="/profile?tab=orders"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    style={{ fontSize: '12.5px', fontWeight: 700, color: '#234B3C', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Package size={14} /> My Orders & Live Tracking
                  </Link>
                  <Link
                    to="/profile?tab=history"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    style={{ fontSize: '12.5px', fontWeight: 700, color: '#234B3C', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Clock size={14} /> Purchase History & Bills
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    setIsMobileDrawerOpen(false);
                    navigate('/');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#FFF1F2',
                    color: '#E11D48',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={14} /> Logout Account
                </button>
              </div>
            ) : partnerAuth ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F28E14', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#15221B' }}>{partnerAuth.societyName}</div>
                    <div style={{ fontSize: '11.5px', color: '#B45309' }}>Partner Desk • {partnerAuth.secretaryName}</div>
                  </div>
                </div>

                <Link
                  to="/society-portal"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: '#234B3C',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    padding: '8px',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  Open Maintenance Fund Desk
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    logoutPartner();
                    setIsMobileDrawerOpen(false);
                    navigate('/');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#FFF1F2',
                    color: '#E11D48',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={13} /> Exit Partner Desk
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#15221B', marginBottom: '4px' }}>Welcome to Freshioz</div>
                <div style={{ fontSize: '12px', color: '#52635A', marginBottom: '12px' }}>
                  Log in to access next-day society farm delivery & wholesale pricing.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    background: '#234B3C',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '9px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <LogIn size={15} /> Login / Register (OTP: 1234)
                </button>
              </div>
            )}
          </div>

          {/* Wholesale Mode Switch */}
          <div>
            <div className="drawer-section-title">Ordering Mode</div>
            <div className="wholesale-switch-pill" style={{ width: '100%' }}>
              <button
                type="button"
                className={`switch-btn ${!isWholesale ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => setIsWholesale(false)}
              >
                Retail (kg/bunches)
              </button>
              <button
                type="button"
                className={`switch-btn ${isWholesale ? 'wholesale-active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => setIsWholesale(true)}
              >
                📦 Wholesale (Crates)
              </button>
            </div>
          </div>

          {/* Society Selector */}
          <div>
            <div className="drawer-section-title">Your Society / Hostel</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {approvedSocieties.map(soc => (
                <button
                  key={soc.id}
                  type="button"
                  onClick={() => {
                    setSelectedSocietyId(soc.id);
                    setIsMobileDrawerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: selectedSociety?.id === soc.id ? '#EBF2EE' : '#FAFBFB',
                    color: selectedSociety?.id === soc.id ? '#234B3C' : '#15221B',
                    fontWeight: selectedSociety?.id === soc.id ? 700 : 500,
                    fontSize: '12.5px',
                    border: '1px solid #E5ECE7'
                  }}
                >
                  <span>{soc.name}</span>
                  {selectedSociety?.id === soc.id && (
                    <span style={{ fontSize: '11px', color: '#78B159', fontWeight: 800 }}>ACTIVE</span>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsSocietyRequestModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: '#FFF5EB',
                  color: '#F28E14',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  marginTop: '4px'
                }}
              >
                <PlusCircle size={15} />
                <span>Request Your Society / Hostel</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <div className="drawer-section-title">Explore Freshioz</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(store?.categories || []).filter(c => c.status !== 'INACTIVE').map(cat => (
                <Link
                  key={cat.id}
                  to={`/catalog?cat=${cat.id}`}
                  className="drawer-link-item"
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  {cat.icon || '🥬'} {cat.name || cat.label}
                </Link>
              ))}
              <Link
                to="/wholesale"
                className="drawer-link-item"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                📦 Wholesale Crates (Mess & Bulk)
              </Link>
              {!activeUser && (
                <Link
                  to="/society-portal"
                  className="drawer-link-item"
                  style={{ background: '#FEF7ED', color: '#DE8821' }}
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  <Coins size={16} /> Society Partner Portal
                </Link>
              )}
            </div>
          </div>

          {/* Cutoff Info Box */}
          <div style={{
            background: '#F4F7F5',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '12px',
            color: '#52635A'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#234B3C', marginBottom: '4px' }}>
              <Clock size={14} color="#F28E14" />
              <span>Next-Day Farm Delivery</span>
            </div>
            <div>Order before 9:00 PM &rarr; Freshly picked from mandi at dawn & delivered tomorrow morning!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
