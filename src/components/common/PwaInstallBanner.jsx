import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('freshioz_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('freshioz_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
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

  // Only show if installable (Chromium/Android) or on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <aside 
        className="pwa-install-banner" 
        aria-label="Install Freshioz App"
        style={{
          position: 'fixed',
          bottom: '76px', // Above mobile bottom dock
          left: '12px',
          right: '12px',
          zIndex: 9999,
          maxWidth: '460px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #15221B 0%, #234B3C 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '12px 14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <img 
          src="/pwa-192.png" 
          alt="Freshioz App Icon" 
          style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            objectFit: 'cover', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            flexShrink: 0 
          }} 
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
              Freshioz Mobile App
            </span>
            <span style={{ 
              fontSize: '10px', 
              background: 'rgba(255,255,255,0.2)', 
              padding: '1px 6px', 
              borderRadius: '6px', 
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Fast & Free
            </span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#D1E0D7', lineHeight: 1.3 }}>
            Add to home screen for instant 1-tap vegetable & fruit ordering!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              background: '#FCD34D',
              color: '#15221B',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.1s ease'
            }}
          >
            <Download size={14} strokeWidth={2.5} />
            Install
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss app install banner"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </aside>

      {/* iOS Safari Instructions Sheet */}
      {showIosGuide && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setShowIosGuide(false)}
        >
          <div 
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '480px',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px 20px',
              color: '#0F172A',
              animation: 'slideUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/pwa-192.png" alt="Freshioz" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Install Freshioz on iPhone</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Quick 2-step setup via Safari</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowIosGuide(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  Tap the <Share2 size={15} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px', color: '#0284C7' }} /> <strong>Share</strong> button on Safari's bottom toolbar.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  Scroll down and tap <PlusSquare size={15} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px', color: '#16A34A' }} /> <strong>'Add to Home Screen'</strong>.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              style={{
                marginTop: '18px',
                width: '100%',
                background: '#234B3C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
