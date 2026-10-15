import React from 'react';
import { 
  Clock, 
  Leaf, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  ThermometerSnowflake,
  ShieldCheck,
  Navigation
} from 'lucide-react';

/**
 * LiveVanTransitVisualizer
 * 
 * Interactive, high-tech animated stage journey visualizer for order tracking.
 * Features an animated Freshioz Electric Delivery Van that dynamically glides 
 * along an illuminated expressway between 5 fulfillment milestones:
 * Mandi -> Procurement -> Hub Sorting -> En-Route -> Society Gate.
 */
export default function LiveVanTransitVisualizer({ 
  currentOrder, 
  currentStepIdx, 
  onAdvanceStatus 
}) {
  // Milestone definitions with position percentages along the highway (clean single words)
  const milestones = [
    { 
      id: 'CONFIRMED', 
      label: 'Batched', 
      sublabel: 'Dawn Cutoff', 
      pct: 10, 
      icon: Clock,
      color: '#78B159'
    },
    { 
      id: 'PROCURING', 
      label: 'Procured', 
      sublabel: 'Bidding Won', 
      pct: 30, 
      icon: Leaf,
      color: '#78B159'
    },
    { 
      id: 'PACKED', 
      label: 'Packed', 
      sublabel: 'QC & Packed', 
      pct: 50, 
      icon: PackageCheck,
      color: '#78B159'
    },
    { 
      id: 'OUT_FOR_DELIVERY', 
      label: 'En-Route', 
      sublabel: 'To Society Gate', 
      pct: 70, 
      icon: Truck,
      color: '#F28E14'
    },
    { 
      id: 'DELIVERED', 
      label: 'Delivered', 
      sublabel: 'Society Drop Point', 
      pct: 90, 
      icon: CheckCircle2,
      color: '#234B3C'
    }
  ];

  // Calculate current van horizontal position (%)
  const currentMilestone = milestones[Math.min(currentStepIdx, milestones.length - 1)] || milestones[0];
  const vanLeftPct = currentMilestone.pct;
  const isEnRoute = currentOrder?.status === 'OUT_FOR_DELIVERY';
  const isDelivered = currentOrder?.status === 'DELIVERED';

  return (
    <div className="van-transit-visualizer-card">
      {/* Header bar of visualizer - Clean & Uncluttered */}
      <div className="van-transit-card-header">
        <div className="van-transit-title-group">
          <div className="van-live-beacon">
            <span className="beacon-ping"></span>
            <span className="beacon-core"></span>
          </div>
          <div>
            <div className="van-transit-heading">Live Fleet Telemetry</div>
            <div className="van-transit-sub">
              En-Route to <strong style={{ color: '#234B3C' }}>{currentOrder?.societyName || 'Your Society'}</strong> ({currentOrder?.flatNo || 'Gate Point'})
            </div>
          </div>
        </div>

        <div className="van-transit-status-badge">
          <Navigation size={12} className="nav-icon-spin" />
          <span>{currentOrder?.status?.replace(/_/g, ' ') || 'CONFIRMED'}</span>
        </div>
      </div>

      {/* Panoramic Highway Stage Canvas */}
      <div className="van-highway-stage">
        {/* Sky / Dawn Ambient Backdrop */}
        <div className="van-highway-dawn-glow"></div>
        
        {/* Horizon Landscape Silhouettes (Farm Mandi on left, City/Towers on right) */}
        <div className="van-highway-horizon">
          {/* Farm Windmill & Fields (Left) */}
          <div className="horizon-element farm-element">
            <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
              <path d="M10 32 L16 12 L22 32 Z" fill="rgba(120, 177, 89, 0.18)" />
              <circle cx="16" cy="12" r="2.5" fill="#78B159" opacity="0.6" />
              <line x1="8" y1="12" x2="24" y2="12" stroke="#78B159" strokeWidth="1" opacity="0.5" />
              <line x1="16" y1="4" x2="16" y2="20" stroke="#78B159" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>

          {/* Central Cold Storage Hub (Center) */}
          <div className="horizon-element warehouse-element">
            <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
              <path d="M4 24 L4 10 L24 2 L44 10 L44 24 Z" fill="rgba(242, 142, 20, 0.15)" />
              <line x1="24" y1="2" x2="24" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </svg>
          </div>

          {/* Society Apartment Towers (Right) */}
          <div className="horizon-element tower-element">
            <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
              <rect x="6" y="8" width="14" height="28" rx="2" fill="rgba(120, 177, 89, 0.22)" />
              <rect x="24" y="2" width="18" height="34" rx="2" fill="rgba(120, 177, 89, 0.3)" />
              <rect x="46" y="14" width="10" height="22" rx="1.5" fill="rgba(120, 177, 89, 0.18)" />
            </svg>
          </div>
        </div>

        {/* The Highway Road Bed */}
        <div className="van-road-track">
          {/* Asphalt Surface */}
          <div className="van-road-asphalt">
            {/* Glowing Center Dashed Road Markings */}
            <div className={`van-road-dashes ${isEnRoute ? 'dashes-streaming' : ''}`}></div>
            {/* Active Progress Laser Beam beneath road */}
            <div 
              className="van-road-progress-laser" 
              style={{ width: `${vanLeftPct}%` }}
            ></div>
          </div>

          {/* 5 Milestone Stop Nodes along the road */}
          <div className="van-milestones-track">
            {milestones.map((ms, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const IconComponent = ms.icon;

              return (
                <div 
                  key={ms.id} 
                  className={`van-milestone-marker ${isPast ? 'is-past' : ''} ${isCurrent ? 'is-current' : ''}`}
                  style={{ left: `${ms.pct}%` }}
                  onClick={() => onAdvanceStatus && onAdvanceStatus(ms.id)}
                  title={`Click to simulate ${ms.label}`}
                >
                  <div className="milestone-pin-wrapper">
                    <div className="milestone-circle">
                      {isPast ? (
                        <CheckCircle2 size={13} strokeWidth={2.6} />
                      ) : (
                        <IconComponent size={13} />
                      )}
                    </div>
                    {isCurrent && <div className="milestone-radar-ring"></div>}
                  </div>

                  <div className="milestone-text-cluster">
                    <div className="milestone-title">{ms.label}</div>
                    <div className="milestone-sub">{ms.sublabel}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* THE ANIMATED FRESHIOZ DELIVERY VAN */}
          <div 
            className={`van-actor-wrapper ${isEnRoute ? 'is-driving' : ''} ${isDelivered ? 'is-parked' : ''}`}
            style={{ left: `${vanLeftPct}%` }}
          >
            {/* Floating Van Telemetry Tag */}
            <div className="van-telemetry-tag">
              {isDelivered ? (
                <span className="tag-delivered">🎉 Arrived & Delivered</span>
              ) : isEnRoute ? (
                <span className="tag-enroute">🚚 Express EV En-Route</span>
              ) : (
                <span className="tag-stage">📍 Phase {currentStepIdx + 1}: {currentMilestone.label}</span>
              )}
            </div>

            {/* Van SVG Vehicle Model */}
            <div className="van-svg-container">
              {/* Headlight Beam (Cast forward when driving) */}
              <div className={`van-headlight-cone ${isEnRoute ? 'beam-active' : ''}`}></div>

              <svg 
                className="van-vehicle-svg" 
                viewBox="0 0 100 52" 
                width="84" 
                height="44" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Van Body Gradient */}
                  <linearGradient id="vanBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2E634F" />
                    <stop offset="50%" stopColor="#234B3C" />
                    <stop offset="100%" stopColor="#142C22" />
                  </linearGradient>

                  {/* Citrus Accent Gradient */}
                  <linearGradient id="vanOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F28E14" />
                    <stop offset="100%" stopColor="#FFB356" />
                  </linearGradient>

                  {/* Window Glass Gradient */}
                  <linearGradient id="vanGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C3E6B4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#78B159" stopOpacity="0.4" />
                  </linearGradient>

                  {/* Wheel Rim Gradient */}
                  <radialGradient id="wheelRimGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#83968D" />
                    <stop offset="100%" stopColor="#1F2A24" />
                  </radialGradient>
                </defs>

                {/* Van Shadow */}
                <ellipse cx="48" cy="48" rx="44" ry="4" fill="rgba(0,0,0,0.45)" />

                {/* Cargo Van Chassis & Cab */}
                <g className="van-chassis-group">
                  {/* Main Cargo Box & Driver Cab */}
                  <path 
                    d="M 6,36 L 6,10 C 6,7 8,5 11,5 L 68,5 C 71,5 74,8 77,13 L 88,23 C 90,25 92,28 92,31 L 92,36 C 92,39 90,41 87,41 L 79,41 C 78,35 72,31 66,31 C 60,31 54,35 53,41 L 32,41 C 31,35 25,31 19,31 C 13,31 7,35 6,41 Z" 
                    fill="url(#vanBodyGrad)" 
                    stroke="#78B159" 
                    strokeWidth="1.2"
                  />

                  {/* Citrus Aero Racing Stripe */}
                  <path 
                    d="M 6,26 L 72,26 L 85,32 L 6,32 Z" 
                    fill="url(#vanOrangeGrad)" 
                  />

                  {/* Windshield & Front Side Window */}
                  <path 
                    d="M 69,9 L 75,15 L 83,23 L 69,23 Z" 
                    fill="url(#vanGlassGrad)" 
                    stroke="#C3E6B4" 
                    strokeWidth="0.8"
                  />

                  {/* Driver Side Door Cut Line */}
                  <line x1="66" y1="9" x2="66" y2="39" stroke="#173328" strokeWidth="1" />

                  {/* Freshioz Brand Logo on Cargo Panel */}
                  <text 
                    x="14" 
                    y="19" 
                    fontFamily="Outfit, sans-serif" 
                    fontWeight="800" 
                    fontSize="7.5" 
                    fill="#FFFFFF" 
                    letterSpacing="0.8"
                  >
                    FRESHIOZ
                  </text>

                  {/* Micro Leaf Graphic on Van Panel */}
                  <path 
                    d="M 54,14 C 54,10 59,10 61,14 C 61,18 56,18 54,14 Z" 
                    fill="#78B159" 
                  />

                  {/* Headlight & Tail Light */}
                  <path d="M 91,28 L 93,29 L 91,33 Z" fill="#FFE27A" />
                  <rect x="5" y="14" width="2" height="7" rx="1" fill="#FF4D4D" />

                  {/* Rear Door Seam */}
                  <line x1="12" y1="6" x2="12" y2="38" stroke="#173328" strokeWidth="0.8" />
                </g>

                {/* Left (Rear) Wheel with Spinning Spokes */}
                <g className="van-wheel-group" transform="translate(19, 40)">
                  <circle cx="0" cy="0" r="8.5" fill="#152019" stroke="#485A50" strokeWidth="1" />
                  <circle cx="0" cy="0" r="5" fill="url(#wheelRimGrad)" />
                  <g className={`van-wheel-spokes ${isEnRoute ? 'wheel-spinning' : ''}`}>
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="1" />
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="1" />
                    <circle cx="0" cy="0" r="2" fill="#234B3C" />
                  </g>
                </g>

                {/* Right (Front) Wheel with Spinning Spokes */}
                <g className="van-wheel-group" transform="translate(66, 40)">
                  <circle cx="0" cy="0" r="8.5" fill="#152019" stroke="#485A50" strokeWidth="1" />
                  <circle cx="0" cy="0" r="5" fill="url(#wheelRimGrad)" />
                  <g className={`van-wheel-spokes ${isEnRoute ? 'wheel-spinning' : ''}`}>
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="1" />
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="1" />
                    <circle cx="0" cy="0" r="2" fill="#234B3C" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Status Strip Below Highway */}
      <div className="van-transit-telemetry-bar">
        <div className="telemetry-pill">
          <ThermometerSnowflake size={14} color="#78B159" />
          <span>Cold-Chained: <strong>12°C - 14°C Controlled</strong></span>
        </div>

        <div className="telemetry-pill">
          <ShieldCheck size={14} color="#78B159" />
          <span>Quality Checked: <strong>100% Sorted at APMC Hub</strong></span>
        </div>

        <div className="telemetry-pill">
          <MapPin size={14} color="#F28E14" />
          <span>Destination: <strong>{currentOrder?.societyName || 'Society Drop Point'}</strong></span>
        </div>
      </div>

      {/* Quick Stage Simulator Buttons (For internal testing only when explicit handler passed) */}
      {Boolean(onAdvanceStatus) && (
        <div className="van-stage-simulator-strip">
          <div className="sim-label">⚡ Test Van Stage Motion:</div>
          <div className="sim-buttons-wrap">
            {milestones.map((ms, idx) => (
              <button
                key={ms.id}
                type="button"
                className={`sim-step-btn ${currentOrder?.status === ms.id ? 'active' : ''}`}
                onClick={() => onAdvanceStatus && onAdvanceStatus(ms.id)}
              >
                {idx + 1}. {ms.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
