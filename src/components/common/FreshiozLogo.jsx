import React from 'react';

/**
 * Official Freshioz Brand Logo
 * Loads the authentic high-resolution 3D glossy logo asset:
 * "Freshioz • FRUITS, VEGETABLES & MORE •"
 */
export default function FreshiozLogo({ height = 44, className = '', showTagline = true, variant = 'standard' }) {
  if (variant === 'icon' || variant === 'small') {
    return (
      <div className={`inline-flex items-center select-none ${className}`} style={{ lineHeight: 1 }}>
        <img
          src="/smlogo.png"
          alt="Freshioz"
          style={{
            height: `${height}px`,
            width: `${height}px`,
            objectFit: 'contain',
            display: 'block'
          }}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ lineHeight: 1 }}>
      <img
        src="/freshioz-logo.png"
        alt="Freshioz - Fruits, Vegetables & More"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block'
        }}
        loading="eager"
      />
    </div>
  );
}
