import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/product/ProductCard';
import FreshProduceLoader from '../components/common/FreshProduceLoader';

import { matchesProductCategory } from '../utils/categoryMatcher';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { store, isWholesale, setIsWholesale, isCatalogError, refetchCatalog } = useStore();

  const currentCat = searchParams.get('cat') || 'ALL';
  const searchQuery = searchParams.get('q') || '';

  const [loading, setLoading] = useState(false);

  // Dynamically pulled from Master Data catalog categories
  const categories = [
    { id: 'ALL', label: 'All Items 🌱' },
    ...(store.categories || []).filter(c => c.status !== 'INACTIVE').map(cat => ({
      id: cat.id,
      label: `${cat.name || cat.label} ${cat.icon || ''}`.trim()
    }))
  ];

  const handleCategorySelect = (catId) => {
    setLoading(true);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (catId === 'ALL') next.delete('cat');
      else next.set('cat', catId);
      return next;
    });
    setTimeout(() => setLoading(false), 300);
  };

  const filteredProducts = (store.products || []).filter(p => {
    const matchesCat = currentCat === 'ALL' || matchesProductCategory(p, currentCat, store.categories);
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // When Wholesale Mode is active, strictly show only items available in bulk crates/sacks
    const matchesWholesale = !isWholesale || (p.hasWholesale !== false && Boolean(p.wholesaleUnit));

    return matchesCat && matchesSearch && matchesWholesale;
  });

  const activeCategoryObj = categories.find(c => 
    c.id === currentCat || 
    c.id?.toLowerCase() === currentCat?.toLowerCase() ||
    c.label?.toLowerCase().includes(currentCat?.toLowerCase())
  );

  return (
    <div className="section-container" style={{ marginTop: '6px' }}>
      {/* Top Filter & Search Header */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #E5ECE7',
        borderRadius: '14px',
        padding: '12px 18px',
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '20px', color: '#234B3C', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              {currentCat === 'ALL' ? 'Complete Fresh Harvest' : (activeCategoryObj?.label || currentCat)}
            </h1>
            <p style={{ fontSize: '12.5px', color: '#52635A', marginTop: '3px', margin: 0 }}>
              Showing {filteredProducts.length} farm-direct products for next-day society fulfillment
            </p>
          </div>
        </div>

        {/* Active Search Query Pill (if searched via header) */}
        {searchQuery && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
            color: '#166534'
          }}>
            <span>Filtered by: <strong>"{searchQuery}"</strong> ({filteredProducts.length} items)</span>
            <button
              type="button"
              onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.delete('q');
                  return next;
                });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#166534',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '12px',
                padding: '2px 6px'
              }}
            >
              Clear Search ✕
            </button>
          </div>
        )}

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: '2px'
        }}>
          {categories.map(cat => {
            const isSelected = currentCat === cat.id || currentCat?.toLowerCase() === cat.id?.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  background: isSelected ? '#234B3C' : '#F2F5F3',
                  color: isSelected ? '#FFFFFF' : '#52635A',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid or Loader */}
      {loading ? (
        <FreshProduceLoader text="Loading fresh crops..." subtext="Filtering dawn mandi varieties" />
      ) : isCatalogError && (store.products || []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#FEF2F2', borderRadius: '16px', border: '1.5px solid #FCA5A5' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ fontSize: '18px', color: '#991B1B', marginBottom: '6px' }}>
            Unable to Load Produce Catalog
          </h3>
          <p style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '16px', maxWidth: '440px', margin: '0 auto 16px' }}>
            We encountered a network issue communicating with our farm warehouse catalog service.
          </p>
          <button
            type="button"
            onClick={() => refetchCatalog && refetchCatalog()}
            style={{
              background: '#234B3C',
              color: '#FFF',
              padding: '9px 22px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Retry Connection ⟳
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E5ECE7' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>
            {(store.products || []).length === 0 ? '🌱' : '🔍'}
          </div>
          <h3 style={{ fontSize: '18px', color: '#15221B', marginBottom: '6px' }}>
            {(store.products || []).length === 0 
              ? 'Farm Produce Catalog is Ready for Testing' 
              : 'No produce found matching your search'}
          </h3>
          <p style={{ fontSize: '13px', color: '#52635A', marginBottom: '16px' }}>
            {(store.products || []).length === 0
              ? 'No produce items added to the catalog yet. Add vegetables & fruits in Admin Portal to start ordering.'
              : 'Try searching for a different vegetable, fruit, or reset category filter.'}
          </p>
          {(store.products || []).length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchParams({});
              }}
              style={{
                background: '#234B3C',
                color: '#FFF',
                padding: '9px 20px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="produce-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
