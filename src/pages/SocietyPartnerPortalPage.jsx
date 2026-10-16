import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Coins, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  LogOut, 
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { saveFreshiozStore, generateId, generateUUID, API_BASE_URL } from '../shared/freshiozStore';
import FreshiozLogo from '../components/common/FreshiozLogo';

export default function SocietyPartnerPortalPage() {
  const { 
    store, 
    approvedSocieties, 
    partnerAuth, 
    loginPartner, 
    logoutPartner,
    activeUser,
    requestLogout
  } = useStore();

  // Login Form States
  const [selectedSocietyId, setSelectedSocietyId] = useState(approvedSocieties[0]?.id || '');
  const [headPhone, setHeadPhone] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState('ALL'); // 'ALL' | 'CREDITS' | 'DEBITS'

  const currentSociety = store.societies.find(s => s.id === (partnerAuth?.societyId || selectedSocietyId)) || store.societies[0];

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!currentSociety) {
      setLoginError('No approved community found. Please onboard and approve your society in the Admin portal first.');
      return;
    }
    const enteredDigits = headPhone.replace(/\D/g, '').slice(-10);

    if (!enteredDigits) {
      setLoginError('Please enter the registered Secretary / Warden phone number.');
      return;
    }

    if (!partnerPassword.trim()) {
      setLoginError('Please enter your Association Partner portal password.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/partner-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societyId: currentSociety.id,
          phone: enteredDigits,
          password: partnerPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      if (data.token) {
        localStorage.setItem('freshioz_partner_token', data.token);
      }

      setLoginError('');
      const authPayload = {
        societyId: currentSociety.id,
        societyName: currentSociety.name,
        secretaryName: currentSociety.secretaryName || 'Secretary / Warden',
        phone: enteredDigits,
        token: data.token
      };
      loginPartner(authPayload);
    } catch (err) {
      setLoginError(err.message || 'Incorrect credentials. Please verify your registered phone and password.');
    }
  };

  const handleLogout = () => {
    logoutPartner(true);
  };

  // Submit Withdrawal Request
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setWithdrawMsg('Please enter a valid amount.');
      return;
    }
    if (amt > currentSociety.balanceEarned) {
      setWithdrawMsg(`Requested amount cannot exceed your available balance of ₹${currentSociety.balanceEarned.toLocaleString()}.`);
      return;
    }

    try {
      const partnerToken = localStorage.getItem('freshioz_partner_token') || partnerAuth?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (partnerToken) {
        headers['Authorization'] = `Bearer ${partnerToken}`;
      }

      const res = await fetch(`${API_BASE_URL}/societies/${currentSociety.id}/payout-request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: amt })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Withdrawal request failed (${res.status})`);
      }

      const serverPayout = await res.json();

      const newWithdrawal = {
        id: serverPayout.id || generateId('FRZ_WDR'),
        uuid: serverPayout.uuid || generateUUID(),
        societyId: currentSociety.id,
        societyName: currentSociety.name,
        amount: amt,
        bankDetails: `${currentSociety.bankDetails?.bankName || 'HDFC Bank'} - A/C ...${(currentSociety.bankDetails?.accountNumber || '817291').slice(-4)} (IFSC: ${currentSociety.bankDetails?.ifscCode || 'HDFC0001742'})`,
        requestedAt: serverPayout.createdAt || new Date().toISOString(),
        status: 'PENDING_APPROVAL',
        bankUtr: null,
        disbursedAt: null
      };

      // Update local state and canonical storage, preserving all products and store collections
      saveFreshiozStore(prev => {
        const updatedSocieties = (prev.societies || []).map(s => {
          if (s.id === currentSociety.id) {
            return {
              ...s,
              balanceEarned: Number((s.balanceEarned - amt).toFixed(2))
            };
          }
          return s;
        });

        return {
          ...prev,
          societies: updatedSocieties,
          withdrawals: [newWithdrawal, ...(prev.withdrawals || [])]
        };
      }, { skipPush: true });

      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      alert(`Withdrawal request of ₹${amt.toLocaleString()} submitted successfully! It has been deducted from your available balance and recorded in the database.`);
    } catch (err) {
      console.error('Withdrawal submission error:', err);
      setWithdrawMsg(err.message || 'Failed to submit withdrawal request.');
    }
  };

  // Society-specific ledger
  const societyWithdrawals = (store.withdrawals || []).filter(w => w.societyId === currentSociety?.id);
  const societyOrders = (store.orders || []).filter(o => o.societyId === currentSociety?.id);

  // Assemble Unified, Privacy-Safe Activity Stream (Delivered orders + Disbursals)
  // CRITICAL PRIVACY NOTE: Individual grocery items and personal grocery spend are intentionally excluded!
  const orderTransactions = societyOrders.map(o => {
    const unitLabel = o.flatNo 
      ? (o.flatNo.includes('-') ? o.flatNo.split('-').pop().trim() : o.flatNo)
      : 'Resident Flat';
    const pts = o.status === 'CANCELLED' ? 0 : Number((o.societyCommissionEarned || 5).toFixed(2));
    
    return {
      id: o.id,
      type: 'CREDIT',
      timestamp: o.deliveredAt || o.orderPlacedAt || '2026-10-12T07:30:00',
      reference: `Order #${o.id}`,
      unit: unitLabel,
      description: o.status === 'DELIVERED' 
        ? 'Early Morning Order Delivered' 
        : o.status === 'CANCELLED' 
        ? 'Order Cancelled Before Cutoff' 
        : 'In Transit / Sorting at Hub',
      points: pts,
      status: o.status === 'DELIVERED' ? 'CREDITED' : o.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING_DELIVERY'
    };
  });

  const withdrawalTransactions = societyWithdrawals.map(w => ({
    id: w.id,
    type: 'DEBIT',
    timestamp: w.requestedAt,
    reference: `Disbursal #${w.id}`,
    unit: 'Association Bank A/C',
    description: `NEFT Bank Disbursal (${w.bankDetails})`,
    points: -Number(w.amount),
    status: w.status,
    bankUtr: w.bankUtr,
    rejectionReason: w.rejectionReason
  }));

  const allTransactions = [...orderTransactions, ...withdrawalTransactions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredTransactions = ledgerFilter === 'CREDITS'
    ? allTransactions.filter(t => t.type === 'CREDIT')
    : ledgerFilter === 'DEBITS'
    ? allTransactions.filter(t => t.type === 'DEBIT')
    : allTransactions;

  // If Logged in as Resident User, DO NOT show Association Partner Login form!
  if (activeUser) {
    return (
      <div style={{ maxWidth: '520px', margin: '48px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '22px',
          border: '1.5px solid #E5ECE7',
          padding: '36px 28px',
          boxShadow: '0 8px 24px rgba(21, 34, 27, 0.06)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#F0F4F2',
            color: '#234B3C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Building2 size={30} />
          </div>

          <div style={{
            display: 'inline-block',
            background: '#FFF8ED',
            color: '#B45309',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '9999px',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            Apartment & Hostel Partner Desk
          </div>

          <h2 style={{ fontSize: '21px', fontWeight: 800, color: '#15221B', marginBottom: '8px' }}>
            Restricted to Society Representatives
          </h2>

          <p style={{ fontSize: '13.5px', color: '#52635A', lineHeight: '1.55', marginBottom: '24px' }}>
            You are currently signed in as Resident: <strong>{activeUser.name}</strong> ({activeUser.societyName}).
            <br />
            This desk is exclusively for Apartment Association Presidents, Secretaries, and Wardens to manage community earnings & withdrawals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/"
              style={{
                display: 'block',
                background: '#234B3C',
                color: '#FFF',
                padding: '11px 24px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '13.5px',
                textDecoration: 'none'
              }}
            >
              Return to Farm Produce Store
            </Link>

            <button
              type="button"
              onClick={() => requestLogout('USER')}
              style={{
                background: '#FFF1F2',
                color: '#E11D48',
                border: '1.5px solid #FFE4E6',
                padding: '10px 20px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Sign Out Resident Account to Login as Partner
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If NOT Logged In, Render Dedicated Society Partner Login Screen
  if (!partnerAuth) {
    return (
      <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E5ECE7',
          padding: '32px 24px',
          boxShadow: '0 8px 24px rgba(21, 34, 27, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <FreshiozLogo height={56} showTagline={true} />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FEF7ED',
              border: '1px solid #FCD34D',
              color: '#B45309',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 800,
              marginTop: '12px'
            }}>
              <Coins size={13} />
              <span>SOCIETY & HOSTEL PARTNER PORTAL</span>
            </div>
            <h2 style={{ fontSize: '22px', marginTop: '10px', color: '#234B3C' }}>
              Association Partner Login
            </h2>
            <p style={{ fontSize: '13px', color: '#52635A', marginTop: '4px' }}>
              For Apartment Presidents, Secretaries, and Hostel Wardens to manage community earnings & withdrawals.
            </p>
          </div>

          {loginError && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {loginError}
            </div>
          )}

            <form onSubmit={handleCredentialsSubmit}>
              {/* Select Apartment or Hostel */}
              <div className="form-group-field">
                <label className="form-label-title">Select Your Society or Hostel</label>
                <select
                  className="form-input-control"
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {approvedSocieties.map(soc => (
                    <option key={soc.id} value={soc.id}>
                      {soc.name} ({soc.type === 'HOSTEL' ? 'Hostel' : 'Apartment'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Head / Secretary Registered Phone */}
              <div className="form-group-field">
                <label className="form-label-title">Secretary / Warden Phone Number</label>
                <input
                  type="tel"
                  className="form-input-control"
                  placeholder="Registered 10-digit mobile number"
                  value={headPhone}
                  onChange={(e) => setHeadPhone(e.target.value)}
                  required
                />
              </div>

              {/* Partner Portal Access Password */}
              <div className="form-group-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label-title">Association Access Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#234B3C', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input-control"
                  placeholder="Enter Association Password"
                  value={partnerPassword}
                  onChange={(e) => setPartnerPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#234B3C',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '13px',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 12px rgba(35, 75, 60, 0.25)'
                }}
              >
                Sign In to Association Partner Desk
              </button>
            </form>
        </div>
      </div>
    );
  }

  // LOGGED IN: Dedicated Society Partner Dashboard
  return (
    <div className="section-container" style={{ paddingTop: '20px' }}>
      {/* Top Header Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid #E5ECE7',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: '#234B3C',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', color: '#15221B' }}>{currentSociety.name}</h1>
              <span style={{ background: '#EBF7E5', color: '#234B3C', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px' }}>
                {currentSociety.type === 'HOSTEL' ? 'HOSTEL' : 'APARTMENT'}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#52635A', marginTop: '2px' }}>
              {currentSociety.address} • Authorized Head: <strong>{currentSociety.secretaryName}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9999px',
            background: '#F0F4F2',
            color: '#52635A',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          <LogOut size={15} />
          <span>Logout Partner Desk</span>
        </button>
      </div>

      {/* 3 Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* 1. Available Earnings Balance with Withdraw Action */}
        <div style={{
          background: 'linear-gradient(135deg, #234B3C 0%, #173328 100%)',
          borderRadius: '18px',
          padding: '24px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12.5px', color: '#C3E6B4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Available Maintenance Fund
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'Outfit', color: '#FFFFFF', marginTop: '4px' }}>
              {currentSociety.balanceEarned?.toLocaleString() || '0'} Points
            </div>
            <div style={{ fontSize: '12px', color: '#D2E2D8', marginTop: '4px' }}>
              Equivalent to ₹{currentSociety.balanceEarned?.toLocaleString() || '0'} • 1 Point = ₹1 Bank Disbursal
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            style={{
              background: '#F28E14',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '14px',
              padding: '11px 20px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(242, 142, 20, 0.4)'
            }}
          >
            <ArrowUpRight size={17} />
            <span>Request Bank Disbursal</span>
          </button>
        </div>

        {/* 2. Total Orders Delivered */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1.5px solid #E5ECE7',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>
              Resident Orders Delivered
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'Outfit', color: '#234B3C', marginTop: '4px' }}>
              {currentSociety.totalOrdersDelivered || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: '#52635A', marginTop: '4px' }}>
              Across {currentSociety.totalUnits} flats & rooms
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#78B159', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={15} /> Growing community participation
          </div>
        </div>

        {/* 3. Society Reward Rate */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1.5px solid #E5ECE7',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Reward Rate
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Outfit', color: '#DE8821', marginTop: '4px' }}>
              {currentSociety.commissionType === 'PERCENTAGE'
                ? `${currentSociety.commissionValue}% Pts`
                : `${currentSociety.commissionValue} Pts / Order`}
            </div>
            <div style={{ fontSize: '12.5px', color: '#52635A', marginTop: '4px' }}>
              Credited directly to society wallet on next-day early morning delivery
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#234B3C', fontWeight: 600 }}>
            Setup by Freshioz Admin Verification Desk
          </div>
        </div>
      </div>

      {/* Verified Bank Account Details Card */}
      <div style={{
        background: '#FAFBFB',
        borderRadius: '18px',
        border: '1.5px solid #E5ECE7',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <CreditCard size={20} color="#234B3C" />
          <h3 style={{ fontSize: '18px', color: '#15221B' }}>Registered Settlement Bank Account</h3>
          <span style={{ background: '#EBF7E5', color: '#234B3C', fontSize: '11.5px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="#78B159" /> Verified for Disbursal
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#83968D', fontWeight: 600 }}>Bank Name</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B' }}>
              {currentSociety.bankDetails?.bankName || 'HDFC Bank'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', color: '#83968D', fontWeight: 600 }}>Account Holder</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B' }}>
              {currentSociety.bankDetails?.accountHolder || currentSociety.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', color: '#83968D', fontWeight: 600 }}>Account Number</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B', fontFamily: 'monospace' }}>
              {currentSociety.bankDetails?.accountNumber || '50100492817291'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', color: '#83968D', fontWeight: 600 }}>IFSC Code</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B', fontFamily: 'monospace' }}>
              {currentSociety.bankDetails?.ifscCode || 'HDFC0001742'}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy-Safe Community Points & Activity Statement */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: '1.5px solid #E5ECE7',
        padding: '24px',
        marginBottom: '40px'
      }}>
        {/* Header & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#234B3C" />
              <h3 style={{ fontSize: '18px', color: '#15221B', margin: 0, fontWeight: 800 }}>Community Points & Activity Statement</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#52635A', margin: '3px 0 0' }}>
              Verified points received from delivered resident orders and official bank disbursals.
            </p>
          </div>

          {/* Sub-Filters */}
          <div style={{ display: 'flex', gap: '6px', background: '#F2F5F3', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setLedgerFilter('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                background: ledgerFilter === 'ALL' ? '#FFFFFF' : 'transparent',
                color: ledgerFilter === 'ALL' ? '#234B3C' : '#64748B',
                boxShadow: ledgerFilter === 'ALL' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              All Activity ({allTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => setLedgerFilter('CREDITS')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                background: ledgerFilter === 'CREDITS' ? '#FFFFFF' : 'transparent',
                color: ledgerFilter === 'CREDITS' ? '#059669' : '#64748B',
                boxShadow: ledgerFilter === 'CREDITS' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              Points Received (+)
            </button>
            <button
              type="button"
              onClick={() => setLedgerFilter('DEBITS')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                background: ledgerFilter === 'DEBITS' ? '#FFFFFF' : 'transparent',
                color: ledgerFilter === 'DEBITS' ? '#D97706' : '#64748B',
                boxShadow: ledgerFilter === 'DEBITS' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              Disbursals (-)
            </button>
          </div>
        </div>

        {/* Resident Grocery Privacy Guarantee Banner */}
        <div style={{
          background: '#F0FDF4',
          border: '1.5px solid #BBF7D0',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldCheck size={22} color="#16A34A" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.45 }}>
            <strong>Resident Grocery Privacy Standard Active:</strong> In accordance with resident privacy standards, personal grocery items, baskets, and household order spends are strictly confidential and hidden from association representatives. This ledger solely audits verified <strong>Points Received (+Pts)</strong> upon early morning delivery and official <strong>Disbursals (-Pts)</strong>. (1 Point = ₹1 Bank Disbursal).
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#83968D', fontSize: '13.5px' }}>
            No records match the selected filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTransactions.map(t => (
              <div
                key={`${t.type}-${t.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#FAFBFB',
                  border: '1px solid #E5ECE7',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: t.type === 'CREDIT' ? '#ECFDF5' : '#FEF3C7',
                    color: t.type === 'CREDIT' ? '#059669' : '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {t.type === 'CREDIT' ? <Coins size={18} /> : <ArrowUpRight size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#15221B' }}>
                        {t.reference}
                      </span>
                      <span style={{
                        background: '#EEF2F0',
                        color: '#234B3C',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 8px',
                        borderRadius: '6px'
                      }}>
                        {t.unit}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>
                      {new Date(t.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} • {t.description}
                    </div>

                    {t.bankUtr && (
                      <div style={{ fontSize: '11.5px', color: '#234B3C', fontWeight: 700, marginTop: '2px' }}>
                        Bank Settlement UTR: {t.bankUtr}
                      </div>
                    )}

                    {t.rejectionReason && (
                      <div style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '2px', fontWeight: 600 }}>
                        Rejection Reason: {t.rejectionReason} (Points refunded to wallet)
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: t.type === 'CREDIT'
                      ? t.status === 'CANCELLED' ? '#94A3B8' : '#059669'
                      : t.status === 'REJECTED' ? '#DC2626' : '#D97706'
                  }}>
                    {t.type === 'CREDIT' 
                      ? (t.points > 0 ? `+${t.points} Pts` : '0 Pts')
                      : `${t.points.toLocaleString()} Pts`}
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    {t.status === 'CREDITED' || t.status === 'COMPLETED' ? (
                      <span style={{ background: '#EBF7E5', color: '#234B3C', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800 }}>
                        {t.type === 'CREDIT' ? '✓ POINTS CREDITED' : '✓ TRANSFERRED'}
                      </span>
                    ) : t.status === 'CANCELLED' ? (
                      <span style={{ background: '#F1F5F9', color: '#64748B', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800 }}>
                        ✕ CANCELLED ORDER
                      </span>
                    ) : t.status === 'REJECTED' ? (
                      <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800 }}>
                        ✕ REJECTED & REFUNDED
                      </span>
                    ) : t.status === 'PENDING_DELIVERY' ? (
                      <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800 }}>
                        ⏳ IN TRANSIT (ACCRUES ON DELIVERY)
                      </span>
                    ) : (
                      <span style={{ background: '#FEF3C7', color: '#B45309', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800 }}>
                        ⏳ PENDING ADMIN TRANSFER
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {isWithdrawModalOpen && (
        <div className="modal-backdrop-overlay">
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-icon"
              onClick={() => setIsWithdrawModalOpen(false)}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF7ED', color: '#DE8821', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Coins size={24} />
              </div>
              <h3 style={{ fontSize: '20px', color: '#234B3C' }}>Request Bank Withdrawal</h3>
              <p style={{ fontSize: '13px', color: '#52635A', marginTop: '4px' }}>
                Transfer accumulated society earnings to your registered bank account.
              </p>
            </div>

            {withdrawMsg && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {withdrawMsg}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit}>
              <div style={{
                background: '#EBF2EE',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#234B3C'
              }}>
                <div>Available Balance: <strong>₹{currentSociety.balanceEarned?.toLocaleString()}</strong></div>
                <div style={{ fontSize: '12px', color: '#52635A', marginTop: '4px' }}>
                  Target Bank: {currentSociety.bankDetails?.bankName} (A/C ...{currentSociety.bankDetails?.accountNumber?.slice(-4)})
                </div>
              </div>

              <div className="form-group-field">
                <label className="form-label-title">Enter Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  className="form-input-control"
                  placeholder="e.g. 5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={currentSociety.balanceEarned}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(Math.min(2500, currentSociety.balanceEarned)))}
                  style={{ flex: 1, padding: '6px', background: '#F0F4F2', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                >
                  ₹2,500
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(Math.min(5000, currentSociety.balanceEarned)))}
                  style={{ flex: 1, padding: '6px', background: '#F0F4F2', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                >
                  ₹5,000
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(currentSociety.balanceEarned))}
                  style={{ flex: 1, padding: '6px', background: '#F0F4F2', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                >
                  Full Balance
                </button>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#234B3C',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '13px',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 12px rgba(35, 75, 60, 0.25)'
                }}
              >
                Confirm & Submit Payout Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
