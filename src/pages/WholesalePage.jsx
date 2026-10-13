import React from 'react';
import { Package, ShieldCheck, Truck, Users, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/product/ProductCard';
import ModernizedVanTransitHero from '../components/common/ModernizedVanTransitHero';

export default function WholesalePage() {
  const { store, selectedSociety } = useStore();

  return (
    <div className="section-container" style={{ paddingTop: '16px' }}>
      {/* Modernized Freshioz Bulk Reefer Truck Hero Animation (< 1024px) */}
      <ModernizedVanTransitHero 
        mode="wholesale" 
        onClick={() => {
          const el = document.getElementById('wholesale-products-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Desktop Full Wholesale Hero Card (>= 1024px) */}
      <div className="wholesale-desktop-hero hero-desktop-only" style={{
        background: 'linear-gradient(135deg, #1A372B 0%, #234B3C 100%)',
        borderRadius: '24px',
        padding: '32px 28px',
        color: '#FFFFFF',
        marginBottom: '28px',
        boxShadow: '0 8px 24px rgba(26, 55, 43, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(242, 142, 20, 0.25)', border: '1px solid #F28E14', color: '#FFD494', padding: '4px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800, width: 'fit-content' }}>
          <Package size={14} />
          <span>INSTITUTIONAL & BULK WHOLESALE PORTAL</span>
        </div>

        <div>
          <h1 style={{ fontSize: '32px', color: '#FFFFFF', marginBottom: '10px' }}>
            Bulk Farm Crates for Hostels, Messes & Society Group Buys
          </h1>
          <p style={{ fontSize: '15px', color: '#D2E2D8', maxWidth: '720px', lineHeight: '1.6' }}>
            Direct APMC Mandi wholesale crates (10kg – 50kg sacks). Delivered before 7:00 AM next morning to your hostel kitchen, canteen, or society drop gate. No middleman markups.
          </p>
        </div>

        {/* 3 Key Benefits */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginTop: '10px'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#FCD34D', marginBottom: '4px' }}>
              💰 Save 20% to 35%
            </div>
            <div style={{ fontSize: '12px', color: '#E2ECE6' }}>
              Full crate & sack rates benchmarked against daily morning APMC wholesale mandi auctions.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#86EFAC', marginBottom: '4px' }}>
              🚚 Direct Kitchen Delivery
            </div>
            <div style={{ fontSize: '12px', color: '#E2ECE6' }}>
              Heavy crates carried straight to your mess store, kitchen, or designated hostel reception point.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#93C5FD', marginBottom: '4px' }}>
              🧾 GST Invoices Provided
            </div>
            <div style={{ fontSize: '12px', color: '#E2ECE6' }}>
              Complete compliance and official billing statements for hostel trusts, societies, and caterers.
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div id="wholesale-products-grid" className="section-header-row">
        <div>
          <h2>Available Wholesale Crates & Sacks</h2>
          <p className="section-subheading">
            Minimum Order Quantity: 1 Master Crate or Sack. Quantities procured fresh for tomorrow morning.
          </p>
        </div>
        <div style={{ fontSize: '13px', color: '#234B3C', fontWeight: 700, background: '#EBF2EE', padding: '6px 14px', borderRadius: '9999px' }}>
          🏢 Delivering to: {selectedSociety?.name}
        </div>
      </div>

      {(store.products || []).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px dashed #CBD5E1',
          margin: '12px 0 24px'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📦</div>
          <h3 style={{ fontSize: '17px', color: '#0F172A', fontWeight: 800, marginBottom: '6px' }}>
            No Wholesale Crates Published Yet
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '480px', margin: '0 auto' }}>
            Once produce items are added with wholesale crate tiers in the Admin Portal, hostel messes and bulk buyers can purchase them here.
          </p>
        </div>
      ) : (
        <div className="produce-grid">
          {store.products.map(product => (
            <ProductCard key={`ws-page-${product.id}`} product={product} forceWholesale={true} />
          ))}
        </div>
      )}
    </div>
  );
}
