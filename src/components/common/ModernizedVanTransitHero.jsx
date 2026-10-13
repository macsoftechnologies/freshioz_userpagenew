import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Truck, 
  Building2, 
  Clock, 
  ThermometerSnowflake, 
  Package, 
  Sparkles,
  Navigation
} from 'lucide-react';

/**
 * ModernizedVanTransitHero
 * 
 * Ultra-modern, borderless, clean white animated stage showcasing Freshioz's 
 * direct farm-to-gate logistics (APMC Mandi ➔ Cold-Chain ➔ Society Gate / Mess Kitchen).
 * Features an animated EV Delivery Van / Commercial Bulk Truck gliding seamlessly 
 * along an expressway with spinning alloy wheels, active headlight beam, and streaming road dashes.
 */
export default function ModernizedVanTransitHero({ mode = 'retail', onClick }) {
  const isWholesale = mode === 'wholesale';
  const [selectedStation, setSelectedStation] = useState(null);

  const retailStations = [
    { id: 'mandi', label: 'Mandi 4 AM', pct: 14, icon: Leaf },
    { id: 'transit', label: 'Cold-Chain', pct: 50, icon: ThermometerSnowflake },
    { id: 'gate', label: 'Gate 7 AM', pct: 86, icon: Building2 }
  ];

  const wholesaleStations = [
    { id: 'mandi', label: 'Mandi Auction', pct: 14, icon: Package },
    { id: 'transit', label: 'Bulk Reefer', pct: 50, icon: Truck },
    { id: 'gate', label: 'Mess Kitchen', pct: 86, icon: Building2 }
  ];

  const stations = isWholesale ? wholesaleStations : retailStations;

  return (
    <div 
      className={`hero-van-transit-stage ${isWholesale ? 'is-wholesale' : ''}`}
      onClick={onClick}
      role="region"
      aria-label={isWholesale ? "Freshioz Wholesale Mandi Bulk Transit" : "Freshioz Dawn Mandi Express Delivery"}
    >
      {/* Top Header Telemetry Strip - Clean Single Line */}
      <div className="hero-van-stage-header">
        <div className="hero-van-title-group">
          <div className="van-live-beacon">
            <span className="beacon-ping"></span>
            <span className="beacon-core"></span>
          </div>
          <span className="hero-van-main-title">
            {isWholesale ? 'Bulk Mandi Logistics' : 'Dawn Mandi Express'}
          </span>
        </div>

        <div className="hero-van-badge-tag">
          <Navigation size={11} className="nav-icon-spin" />
          <span>{isWholesale ? 'Bulk Fleet' : '7 AM Gate Drop'}</span>
        </div>
      </div>

      {/* Highway Expressway Panoramic Canvas */}
      <div className="hero-van-canvas">
        {/* Soft Dawn Sky Glow */}
        <div className="hero-van-sky-glow"></div>

        {/* Minimalist Horizon Landscape Silhouettes */}
        <div className="hero-van-horizon">
          {/* Farm Windmill & Mandi Yard (Left) */}
          <div className="horizon-glyph farm-glyph">
            <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
              <path d="M8 24 L13 9 L18 24 Z" fill={isWholesale ? "rgba(242, 142, 20, 0.18)" : "rgba(120, 177, 89, 0.22)"} />
              <circle cx="13" cy="9" r="2" fill={isWholesale ? "#F28E14" : "#78B159"} opacity="0.7" />
              <line x1="6" y1="9" x2="20" y2="9" stroke={isWholesale ? "#F28E14" : "#78B159"} strokeWidth="1" opacity="0.5" />
              <line x1="13" y1="2" x2="13" y2="16" stroke={isWholesale ? "#F28E14" : "#78B159"} strokeWidth="1" opacity="0.5" />
            </svg>
          </div>

          {/* Central Cold Storage Transit Waypoint */}
          <div className="horizon-glyph warehouse-glyph">
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
              <path d="M4 20 L4 8 L20 2 L36 8 L36 20 Z" fill={isWholesale ? "rgba(245, 158, 11, 0.16)" : "rgba(35, 75, 60, 0.12)"} />
              <line x1="20" y1="2" x2="20" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            </svg>
          </div>

          {/* Society Apartment Towers / Kitchen (Right) */}
          <div className="horizon-glyph tower-glyph">
            <svg width="44" height="28" viewBox="0 0 44 28" fill="none">
              <rect x="4" y="6" width="11" height="22" rx="1.5" fill={isWholesale ? "rgba(242, 142, 20, 0.22)" : "rgba(120, 177, 89, 0.25)"} />
              <rect x="18" y="2" width="14" height="26" rx="1.5" fill={isWholesale ? "rgba(242, 142, 20, 0.3)" : "rgba(120, 177, 89, 0.32)"} />
              <rect x="34" y="10" width="8" height="18" rx="1.5" fill={isWholesale ? "rgba(242, 142, 20, 0.18)" : "rgba(120, 177, 89, 0.2)"} />
            </svg>
          </div>
        </div>

        {/* Highway Road Bed */}
        <div className="hero-van-road-bed">
          <div className="hero-van-asphalt">
            {/* Center Dashes Moving Continuously */}
            <div className="hero-van-road-dashes dashes-streaming"></div>
            {/* Laser Line Underlay */}
            <div className="hero-van-laser-trail"></div>
          </div>

          {/* 3 Illuminated Route Milestones */}
          <div className="hero-van-milestones-layer">
            {stations.map((st, idx) => {
              const IconComp = st.icon;
              const isSelected = selectedStation === st.id;

              return (
                <div 
                  key={st.id} 
                  className={`hero-milestone-pin ${isSelected ? 'selected' : ''}`}
                  style={{ left: `${st.pct}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStation(st.id);
                  }}
                  title={`Click station: ${st.label}`}
                >
                  <div className="hero-pin-circle">
                    <IconComp size={11} />
                    <span className="hero-pin-pulse"></span>
                  </div>
                  <div className="hero-pin-text">
                    <span className="hero-pin-name">{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* THE MODERNIZED VEHICLE ACTOR */}
          <div 
            className={`hero-actor-van ${selectedStation ? 'has-manual-stop' : 'auto-cruise'}`}
            style={selectedStation ? { left: `${stations.find(s => s.id === selectedStation)?.pct || 50}%` } : undefined}
          >
            {/* Vehicle Model */}
            <div className="hero-van-svg-box">
              {/* Headlight Beam Cast Forward */}
              <div className="hero-van-headlight-cone beam-active"></div>

              {!isWholesale ? (
                /* FRESHIOZ ELECTRIC DELIVERY VAN (RETAIL) */
                <svg viewBox="0 0 100 52" width="76" height="40" className="hero-vehicle-svg">
                  <defs>
                    <linearGradient id="heroVanBody" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2E634F" />
                      <stop offset="50%" stopColor="#234B3C" />
                      <stop offset="100%" stopColor="#142C22" />
                    </linearGradient>
                    <linearGradient id="heroVanCitrus" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F28E14" />
                      <stop offset="100%" stopColor="#FFB356" />
                    </linearGradient>
                    <linearGradient id="heroVanGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#C3E6B4" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#78B159" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Ground Shadow */}
                  <ellipse cx="48" cy="48" rx="42" ry="3.5" fill="rgba(0,0,0,0.35)" />

                  {/* Van Chassis & Cab */}
                  <g className="van-chassis-vibe">
                    <path 
                      d="M 6,36 L 6,10 C 6,7 8,5 11,5 L 68,5 C 71,5 74,8 77,13 L 88,23 C 90,25 92,28 92,31 L 92,36 C 92,39 90,41 87,41 L 79,41 C 78,35 72,31 66,31 C 60,31 54,35 53,41 L 32,41 C 31,35 25,31 19,31 C 13,31 7,35 6,41 Z" 
                      fill="url(#heroVanBody)" 
                      stroke="#78B159" 
                      strokeWidth="1.2"
                    />

                    {/* Citrus Aero Racing Stripe */}
                    <path d="M 6,26 L 72,26 L 85,32 L 6,32 Z" fill="url(#heroVanCitrus)" />

                    {/* Windshield */}
                    <path d="M 69,9 L 75,15 L 83,23 L 69,23 Z" fill="url(#heroVanGlass)" stroke="#C3E6B4" strokeWidth="0.8" />

                    {/* Cab Door Line */}
                    <line x1="66" y1="9" x2="66" y2="39" stroke="#173328" strokeWidth="1" />

                    {/* Freshioz Typography */}
                    <text x="14" y="19" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="7.5" fill="#FFFFFF" letterSpacing="0.8">
                      FRESHIOZ
                    </text>

                    {/* Micro Leaf */}
                    <path d="M 54,14 C 54,10 59,10 61,14 C 61,18 56,18 54,14 Z" fill="#78B159" />

                    {/* Headlight & Tail Light */}
                    <path d="M 91,28 L 93,29 L 91,33 Z" fill="#FFE27A" />
                    <rect x="5" y="14" width="2" height="7" rx="1" fill="#FF4D4D" />
                  </g>

                  {/* Rear Wheel */}
                  <g transform="translate(19, 40)">
                    <circle cx="0" cy="0" r="8.5" fill="#152019" stroke="#485A50" strokeWidth="1" />
                    <circle cx="0" cy="0" r="5" fill="#83968D" />
                    <g className="wheel-spinning">
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="1" />
                      <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="1" />
                      <circle cx="0" cy="0" r="2" fill="#234B3C" />
                    </g>
                  </g>

                  {/* Front Wheel */}
                  <g transform="translate(66, 40)">
                    <circle cx="0" cy="0" r="8.5" fill="#152019" stroke="#485A50" strokeWidth="1" />
                    <circle cx="0" cy="0" r="5" fill="#83968D" />
                    <g className="wheel-spinning">
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="1" />
                      <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="1" />
                      <circle cx="0" cy="0" r="2" fill="#234B3C" />
                    </g>
                  </g>
                </svg>
              ) : (
                /* FRESHIOZ COMMERCIAL BULK REEFER TRUCK (WHOLESALE) */
                <svg viewBox="0 0 110 52" width="84" height="40" className="hero-vehicle-svg">
                  <defs>
                    <linearGradient id="heroTruckCab" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D97706" />
                      <stop offset="50%" stopColor="#B45309" />
                      <stop offset="100%" stopColor="#78350F" />
                    </linearGradient>
                    <linearGradient id="heroTruckBox" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2E634F" />
                      <stop offset="100%" stopColor="#1A3B2F" />
                    </linearGradient>
                  </defs>

                  {/* Ground Shadow */}
                  <ellipse cx="55" cy="48" rx="50" ry="3.5" fill="rgba(0,0,0,0.35)" />

                  <g className="van-chassis-vibe">
                    {/* Heavy Cargo Box */}
                    <rect x="4" y="6" width="68" height="35" rx="3" fill="url(#heroTruckBox)" stroke="#78B159" strokeWidth="1.2" />
                    <line x1="26" y1="6" x2="26" y2="41" stroke="#234B3C" strokeWidth="1" />
                    <line x1="50" y1="6" x2="50" y2="41" stroke="#234B3C" strokeWidth="1" />

                    {/* Truck Brand */}
                    <text x="8" y="22" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="7" fill="#FFFFFF" letterSpacing="0.6">
                      FRESHIOZ
                    </text>
                    <text x="8" y="32" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="6" fill="#FCD34D" letterSpacing="0.8">
                      BULK FLEET
                    </text>

                    {/* Commercial Cab */}
                    <path 
                      d="M 72,16 L 86,16 C 89,16 92,18 94,22 L 100,29 C 102,31 103,34 103,37 L 103,41 L 72,41 Z" 
                      fill="url(#heroTruckCab)" 
                      stroke="#F59E0B" 
                      strokeWidth="1.2"
                    />

                    {/* Windshield */}
                    <path d="M 87,19 L 93,24 L 98,30 L 87,30 Z" fill="#C3E6B4" stroke="#FFF" strokeWidth="0.8" opacity="0.85" />

                    {/* Headlight */}
                    <path d="M 102,35 L 104,36 L 102,39 Z" fill="#FFE27A" />
                  </g>

                  {/* Rear Tandem Wheels */}
                  <g transform="translate(18, 41)">
                    <circle cx="0" cy="0" r="8" fill="#152019" stroke="#485A50" strokeWidth="1" />
                    <circle cx="0" cy="0" r="4.5" fill="#83968D" />
                    <g className="wheel-spinning">
                      <line x1="0" y1="-4.5" x2="0" y2="4.5" stroke="#FFF" strokeWidth="1" />
                      <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#FFF" strokeWidth="1" />
                    </g>
                  </g>
                  <g transform="translate(36, 41)">
                    <circle cx="0" cy="0" r="8" fill="#152019" stroke="#485A50" strokeWidth="1" />
                    <circle cx="0" cy="0" r="4.5" fill="#83968D" />
                    <g className="wheel-spinning">
                      <line x1="0" y1="-4.5" x2="0" y2="4.5" stroke="#FFF" strokeWidth="1" />
                      <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#FFF" strokeWidth="1" />
                    </g>
                  </g>

                  {/* Front Cab Wheel */}
                  <g transform="translate(86, 41)">
                    <circle cx="0" cy="0" r="8" fill="#152019" stroke="#485A50" strokeWidth="1" />
                    <circle cx="0" cy="0" r="4.5" fill="#83968D" />
                    <g className="wheel-spinning">
                      <line x1="0" y1="-4.5" x2="0" y2="4.5" stroke="#FFF" strokeWidth="1" />
                      <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#FFF" strokeWidth="1" />
                    </g>
                  </g>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
