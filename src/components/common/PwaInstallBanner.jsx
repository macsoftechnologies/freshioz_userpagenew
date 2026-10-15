import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, ChevronDown } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('freshioz_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
    const minimized = sessionStorage.getItem('freshioz_pwa_banner_minimized');
    if (minimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  const handleDismiss = (e) => {
    e?.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('freshioz_pwa_banner_dismissed', 'true');
  };

  const handleMinimize = (e) => {
    e?.stopPropagation();
    setIsMinimized(true);
    sessionStorage.setItem('freshioz_pwa_banner_minimized', 'true');
  };

  const handleExpand = () => {
    setIsMinimized(false);
    sessionStorage.setItem('freshioz_pwa_banner_minimized', 'false');
  };

  const handleInstallClick = async (e) => {
    e?.stopPropagation();
    if (isInstallable) {
      await triggerInstall();
    } else if (isIOS) {
      setShowIosGuide(true);
    }
  };

  // If already installed, or dismissed, or neither installable nor iOS in non-standalone browser, return null
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show if installable (Chromium/Android/Desktop) or on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes floatPwaIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pwaPulseGlow {
          0%, 100% {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 0 rgba(252, 211, 77, 0.4);
          }
          50% {
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35), 0 0 0 6px rgba(252, 211, 77, 0);
          }
        }
        .pwa-floating-root {
          position: fixed;
          z-index: 9999;
          font-family: inherit;
        }
        @media (max-width: 768px) {
          .pwa-floating-root {
            bottom: 84px !important;
            right: 14px !important;
          }
        }
        @media (min-width: 769px) {
          .pwa-floating-root {
            bottom: 24px !important;
            right: 24px !important;
          }
        }
      `}</style>

      <div className="pwa-floating-root">
        {/* Minimized State: Sleek Floating Corner Pill */}
        {isMinimized ? (
          <button
            type="button"
            onClick={handleExpand}
            aria-label="Open Freshioz App Install Prompt"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #15221B 0%, #234B3C 100%)',
              color: '#FFFFFF',
              border: '1px solid rgba(252, 211, 77, 0.4)',
              borderRadius: '9999px',
              padding: '8px 14px',
              cursor: 'pointer',
              animation: 'pwaPulseGlow 3s infinite',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <img
              src="/pwa-192.png"
              alt="Freshioz"
              style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FCD34D' }}>
              Install App
            </span>
            <Download size={14} color="#FCD34D" strokeWidth={2.5} />
          </button>
        ) : (
          /* Expanded State: Sleek Corner Floating Card (Never in the screen center) */
          <aside
            aria-label="Install Freshioz App"
            style={{
              width: '360px',
              maxWidth: 'calc(100vw - 28px)',
              background: 'linear-gradient(135deg, rgba(21, 34, 27, 0.97) 0%, rgba(35, 75, 60, 0.97) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '12px 14px',
              boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              animation: 'floatPwaIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Top Row: App Info & Dismiss / Minimize Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/pwa-192.png"
                alt="Freshioz App Icon"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  objectFit: 'cover',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                    Freshioz App
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      background: 'rgba(252, 211, 77, 0.2)',
                      color: '#FCD34D',
                      border: '1px solid rgba(252, 211, 77, 0.3)',
                      padding: '1px 6px',
                      borderRadius: '5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    1-Tap
                  </span>
                </div>
                <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#D1E0D7', lineHeight: 1.25 }}>
                  Add to home screen for instant vegetable & fruit ordering!
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleMinimize}
                  title="Minimize to floating pill"
                  aria-label="Minimize"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                >
                  <ChevronDown size={17} />
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  title="Dismiss"
                  aria-label="Dismiss app install banner"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Row: One-click Install Action & Minimize link */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '2px' }}>
              <button
                type="button"
                onClick={handleMinimize}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
              >
                Remind me later
              </button>

              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                  color: '#15221B',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Download size={13} strokeWidth={2.5} />
                Install Free App
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* iOS Minimal Micro-Callout (Clean & Frictionless) */}
      {showIosGuide && (
        <div
          onClick={() => setShowIosGuide(false)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100000,
            background: 'rgba(21, 34, 27, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px 18px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
            border: '1.5px solid rgba(252, 211, 77, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '360px',
            width: 'calc(100vw - 32px)',
            animation: 'floatPwaIn 0.25s ease',
          }}
        >
          <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.35, color: '#FFFFFF' }}>
            Tap <Share2 size={14} style={{ display: 'inline', color: '#38BDF8', verticalAlign: 'middle', margin: '0 2px' }} /> <strong>Share</strong> on Safari, then tap <strong>'Add to Home Screen'</strong>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowIosGuide(false);
            }}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
