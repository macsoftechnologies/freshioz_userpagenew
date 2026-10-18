import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function AnnouncementBar() {
  const { cutoffInfo, selectedSociety } = useStore();

  return (
    <div className="cutoff-announcement-bar">
      <div className="cutoff-badge-pill">
        <Clock size={10.5} />
        <span>⏰ Daily Cutoff: {cutoffInfo.cutoffTimeStr}</span>
      </div>
      <div className="cutoff-text">
        {cutoffInfo.isPastCutoff ? (
          <span>🌙 Today's harvest packed! Next dawn drop: <strong>{cutoffInfo.formattedDeliveryDate}</strong></span>
        ) : (
          <span>
            Order within <strong>{cutoffInfo.hoursRemaining}h {cutoffInfo.minutesRemaining}m</strong> for <strong>Tomorrow's Dawn Harvest 🌿</strong>
          </span>
        )}
      </div>
    </div>
  );
}
