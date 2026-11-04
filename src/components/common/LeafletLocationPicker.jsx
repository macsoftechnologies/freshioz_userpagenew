import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

// Fix standard Leaflet marker icons in React bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Freshioz Pin Icon
const FreshiozMarkerIcon = L.divIcon({
  className: 'custom-freshioz-pin',
  html: `<div style="
    background: #F28E14;
    color: #FFFFFF;
    width: 36px;
    height: 36px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  ">
    <div style="transform: rotate(45deg); font-weight: 800; font-size: 16px;">🌱</div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

export default function LeafletLocationPicker({
  initialLat = 12.9716,
  initialLng = 77.5946,
  onLocationChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [isDetecting, setIsDetecting] = useState(false);
  const [addressStatus, setAddressStatus] = useState('Coordinates tagged');

  // Reverse geocode lat/lng to clean address using OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { 'Accept': 'application/json', 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const a = data.address;
          const parts = [
            a.road || a.suburb || a.neighbourhood || a.residential,
            a.city || a.town || a.village || a.county,
            a.state
          ].filter(Boolean);
          if (parts.length > 0) return parts.join(', ');
        }
        if (data && data.display_name) return data.display_name;
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode note:', e);
    }
    return `Lat ${lat}, Lng ${lon}`;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map with OpenStreetMap tiles
    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add Draggable Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: FreshiozMarkerIcon,
      draggable: true
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', async () => {
      const position = marker.getLatLng();
      const lat = Number(position.lat.toFixed(5));
      const lng = Number(position.lng.toFixed(5));
      const newCoords = { lat, lng };
      setCoords(newCoords);
      setAddressStatus('Resolving address from coordinates...');
      const addr = await reverseGeocode(lat, lng);
      setAddressStatus(`Tagged: ${addr}`);
      if (onLocationChange) onLocationChange({ ...newCoords, address: addr });
    });

    // Handle map click
    map.on('click', async (e) => {
      const lat = Number(e.latlng.lat.toFixed(5));
      const lng = Number(e.latlng.lng.toFixed(5));
      const newCoords = { lat, lng };
      marker.setLatLng([lat, lng]);
      setCoords(newCoords);
      setAddressStatus('Resolving address from coordinates...');
      const addr = await reverseGeocode(lat, lng);
      setAddressStatus(`Tagged: ${addr}`);
      if (onLocationChange) onLocationChange({ ...newCoords, address: addr });
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setAddressStatus('Acquiring hardware GPS coordinates...');

    const applyPos = async (latitude, longitude) => {
      const lat = Number(latitude.toFixed(5));
      const lng = Number(longitude.toFixed(5));
      const newCoords = { lat, lng };
      setCoords(newCoords);

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 16);
        markerRef.current.setLatLng([latitude, longitude]);
      }

      setAddressStatus('Resolving GPS address details...');
      const addr = await reverseGeocode(lat, lng);
      setAddressStatus(`GPS: ${addr}`);
      setIsDetecting(false);

      if (onLocationChange) onLocationChange({ ...newCoords, address: addr });
    };

    if (navigator.geolocation) {
      const getPos = (highAcc, timeoutMs) =>
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: highAcc,
            timeout: timeoutMs,
            maximumAge: 60000,
          });
        });

      try {
        const pos = await getPos(true, 5000).catch(() => getPos(false, 6000));
        await applyPos(pos.coords.latitude, pos.coords.longitude);
        return;
      } catch (err) {
        console.warn('Browser GPS error:', err);
      }
    }

    setIsDetecting(false);
    setAddressStatus('Device GPS unavailable. Please click anywhere on the map to pin drop location.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#234B3C', fontWeight: 600 }}>
          <MapPin size={16} color="#F28E14" />
          <span>Pin Society Exact Drop Location:</span>
        </div>
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={isDetecting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#EBF2EE',
            color: '#234B3C',
            border: '1px solid #C4D9CD',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Navigation size={13} color="#234B3C" />
          {isDetecting ? 'Detecting...' : 'Auto-Detect GPS'}
        </button>
      </div>

      {/* Leaflet Map Box */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '220px',
          borderRadius: '12px',
          border: '1.5px solid #E5ECE7',
          overflow: 'hidden',
          zIndex: 1
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#52635A' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={13} color="#78B159" /> {addressStatus}
        </span>
        <span style={{ fontFamily: 'monospace', background: '#F0F4F2', padding: '2px 8px', borderRadius: '4px' }}>
          {coords.lat}, {coords.lng}
        </span>
      </div>
    </div>
  );
}
