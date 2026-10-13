import React from 'react';

/**
 * Animated Fresh Produce Loader
 * Features bouncy organic produce (lemon, carrot, tomato) with a rotating leaf halo
 */
export default function FreshProduceLoader({
  text = 'Harvesting farm freshness...',
  subtext = 'Direct from morning mandis to your society',
  fullScreen = false,
  size = 'normal'
}) {
  const content = (
    <div className="freshioz-loader-container">
      <div className={`freshioz-loader-stage ${size === 'small' ? 'stage-sm' : ''}`}>
        {/* Pulsing Garden Ring */}
        <div className="loader-glow-ring"></div>

        {/* Animated Bouncing SVG Produce */}
        <div className="loader-produce-group">
          {/* Juicy Tomato / Orange */}
          <div className="bouncing-item item-orange">
            <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
              <circle cx="20" cy="22" r="16" fill="#F28E14" />
              <path d="M14 12 A 10 10 0 0 1 26 14" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              <path d="M20 8 C 17 2, 22 -1, 26 3 C 25 7, 21 7, 20 8 Z" fill="#78B159" />
              <path d="M20 8 C 22 1, 30 2, 29 7 C 26 8, 22 8, 20 8 Z" fill="#86C45E" />
            </svg>
          </div>

          {/* Crisp Carrot */}
          <div className="bouncing-item item-carrot">
            <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
              <path d="M16 12 L 28 8 L 30 18 L 10 36 Z" fill="#FF7A00" />
              <path d="M26 9 L 29 17" stroke="#E65100" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 18 L 24 23" stroke="#E65100" strokeWidth="1.5" strokeLinecap="round" />
              {/* Carrot Tops */}
              <path d="M28 8 C 30 2, 36 2, 34 8 Z" fill="#78B159" />
              <path d="M28 8 C 32 6, 38 10, 31 11 Z" fill="#86C45E" />
            </svg>
          </div>

          {/* Tender Green Pea / Lemon */}
          <div className="bouncing-item item-lemon">
            <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
              <ellipse cx="20" cy="20" rx="14" ry="12" fill="#EAB308" transform="rotate(-15 20 20)" />
              <path d="M12 14 A 8 8 0 0 1 22 13" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M22 10 C 24 4, 30 6, 27 12 Z" fill="#78B159" />
            </svg>
          </div>
        </div>

        {/* Orbiting Fresh Leaf */}
        <div className="orbiting-leaf">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#78B159">
            <path d="M17 3 C 8 3, 4 10, 5 19 C 14 20, 21 16, 21 7 C 21 4.8, 19.2 3, 17 3 Z" />
            <path d="M5 19 C 10 14, 15 11, 21 7" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {text && <div className="freshioz-loader-text">{text}</div>}
      {subtext && <div className="freshioz-loader-subtext">{subtext}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="freshioz-loader-fullscreen-overlay">
        {content}
      </div>
    );
  }

  return content;
}
