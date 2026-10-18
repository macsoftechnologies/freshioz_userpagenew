import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function AnnouncementBar() {
  const { cutoffInfo, selectedSociety } = useStore();

  return (
    <div className="cutoff-announcement-bar">
      <div className="cutoff-badge-pill">
        <Clock size={11} />
        <span>⚡ Dawn Harvest Lock: <strong>{cutoffInfo.cutoffTimeStr}</strong></span>
      </div>
      <div className="cutoff-text">
        {cutoffInfo.isPastCutoff ? (
          <span>
            🌙 <strong>Today's morning batch locked & harvesting!</strong> Next dawn farm drop: <strong>{cutoffInfo.formattedDeliveryDate} (7 AM)</strong>
          </span>
        ) : (
          <span>
            🌿 Order within <strong>{cutoffInfo.hoursRemaining}h {cutoffInfo.minutesRemaining}m</strong> • Farm-fresh at your door <strong>Tomorrow by 7:00 AM 🌅</strong>
          </span>
        )}
      </div>
    </div>
  );
}
