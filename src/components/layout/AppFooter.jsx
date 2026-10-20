import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Leaf,
  Clock,
  ShieldCheck,
  Truck,
  Coins,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Package
} from 'lucide-react';
import FreshiozLogo from '../common/FreshiozLogo';
import { useStore } from '../../context/StoreContext';

export default function AppFooter() {
  const { cutoffInfo } = useStore();

  return (
    <footer className="freshioz-footer-wrap">
      {/* 3 Core Value Pillars */}
      <div className="footer-pillars-strip">
        <div className="footer-pillars-inner">
          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Leaf size={20} color="#78B159" />
            </div>
            <div>
              <div className="pillar-title">100% Dawn Harvest</div>
              <div className="pillar-desc">Direct 4:00 AM APMC Mandi & farm procurement</div>
            </div>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Clock size={20} color="#F28E14" />
            </div>
            <div>
              <div className="pillar-title">Next-Day 07:00 AM Delivery</div>
              <div className="pillar-desc">Order before {cutoffInfo.cutoffTimeStr} for early morning drop</div>
            </div>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Package size={20} color="#F59E0B" />
            </div>
            <div>
              <div className="pillar-title">Volume Bulk Discounts</div>
              <div className="pillar-desc">Extra percentage savings on 5kg & 10kg volume buying</div>
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Brand Signature Bar */}
      <div className="footer-signature-bar">
        <div className="footer-signature-inner">
          <div className="footer-brand-micro">
            {/* High-Contrast Crisp White Badge Card for Logo */}
            <div className="footer-logo-badge-card">
              <FreshiozLogo height={44} showTagline={true} />
            </div>
            <span className="footer-tagline-text">
              Hyper-local farm-to-community network for Apartments, Gated Communities & Hostels
            </span>
          </div>

          {/* <div className="footer-quick-contacts">
            <span className="footer-contact-pill">
              <Phone size={13} color="#78B159" />
              <span>+91 XXXXXXXXXX</span>
            </span>
            <a href="mailto:support@freshioz.com" className="footer-contact-pill">
              <Mail size={13} color="#78B159" />
              <span>support@freshioz.com</span>
            </a>
          </div> */}
        </div>
      </div>

      {/* Clean Minimalist Sub-Footer (No Cluttered Badges) */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="copyright-text">
            © 2026 Freshioz Technologies Pvt Ltd • Direct APMC Mandis & Regional Hubs, Bengaluru
          </div>
        </div>
      </div>
    </footer>
  );
}
