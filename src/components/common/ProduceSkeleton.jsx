import React from 'react';

export default function ProduceSkeleton({ count = 4 }) {
  return (
    <div className="produce-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="produce-card-skeleton">
          <div className="skeleton-img shimmer"></div>
          <div className="skeleton-content">
            <div className="skeleton-line sm shimmer"></div>
            <div className="skeleton-line title shimmer"></div>
            <div className="skeleton-line price shimmer"></div>
            <div className="skeleton-btn shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
