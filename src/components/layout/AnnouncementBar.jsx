import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function AnnouncementBar() {
  const { cutoffInfo, selectedSociety } = useStore();

  return (
    <div className="cutoff-announcement-bar">
      <div className="cutoff-badge-pill">
        <Clock size={10.5} />
        <span>Cutoff: {cutoffInfo.cutoffTimeStr}</span>
      </div>
      <div className="cutoff-text">
        {cutoffInfo.isPastCutoff ? (
          <span>Next slot: <strong>{cutoffInfo.formattedDeliveryDate}</strong></span>
        ) : (
          <span>
            Order in <strong>{cutoffInfo.hoursRemaining}h {cutoffInfo.minutesRemaining}m</strong> for <strong>Tomorrow Morning</strong>
          </span>
        )}
      </div>
    </div>
  );
}
