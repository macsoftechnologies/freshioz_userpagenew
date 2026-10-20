import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, ArrowRight, Package } from 'lucide-react';
import { resolveImageUrl, handleImageError } from '../../utils/imageUtils';

const POPULAR_SEARCH_TAGS = [
  { label: 'Tomatoes 🍅', query: 'Tomato' },
  { label: 'Onions 🧅', query: 'Onion' },
  { label: 'Potatoes 🥔', query: 'Potato' },
  { label: 'Shimla Apples 🍎', query: 'Apple' },
  { label: 'Fresh Spinach 🥬', query: 'Palak' },
  { label: 'Watermelon 🍉', query: 'Watermelon' },
  { label: 'Fresh Coriander 🌿', query: 'Coriander' },
  { label: 'Sweet Corn 🌽', query: 'Corn' },
];

export default function SearchRecommendations({
  query = '',
  products = [],
  isOpen,
  onClose,
  onSelectQuery,
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim().toLowerCase();

  // Filter products by matching name, description, category, or origin
  const matchingProducts = trimmedQuery
    ? products.filter(p => {
        const name = String(p.name || '').toLowerCase();
        const desc = String(p.desc || '').toLowerCase();
        const rawCat = typeof p.category === 'object' && p.category !== null 
          ? String(p.category.name || p.category.id || '')
          : String(p.category || p.categoryId || '');
        const cat = rawCat.toLowerCase();
        const origin = String(p.origin || '').toLowerCase();
        return name.includes(trimmedQuery) || desc.includes(trimmedQuery) || cat.includes(trimmedQuery) || origin.includes(trimmedQuery);
      }).slice(0, 5)
    : [];

  const handlePickTag = (tagQuery) => {
    if (onSelectQuery) onSelectQuery(tagQuery);
    navigate(`/catalog?q=${encodeURIComponent(tagQuery)}`);
    onClose();
  };

  const handlePickProduct = (product) => {
    if (onSelectQuery) onSelectQuery(product.name);
    navigate(`/catalog?q=${encodeURIComponent(product.name)}`);
    onClose();
  };

  const handleViewAll = () => {
    if (onSelectQuery) onSelectQuery(query);
    navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(0, 0, 0, 0.06)',
        border: '1.5px solid #E2E8F0',
        zIndex: 9999,
        overflow: 'hidden',
        animation: 'fadeInSlideDown 0.18s ease-out'
      }}
    >
      {/* CASE 1: Query is empty - Show Popular search tags & trending items */}
      {!trimmedQuery ? (
        <div style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
            <TrendingUp size={13} color="#059669" />
            <span>Popular Farm Searches</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {POPULAR_SEARCH_TAGS.map(t => (
              <button
                key={t.query}
                type="button"
                onClick={() => handlePickTag(t.query)}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '9999px',
                  padding: '5px 12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#1E293B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ECFDF5';
                  e.currentTarget.style.borderColor = '#10B981';
                  e.currentTarget.style.color = '#047857';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.color = '#1E293B';
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {products.length > 0 && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={12} color="#D97706" />
                <span>Today's Dawn Harvest Arrivals</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {products.slice(0, 3).map(p => (
                  <div
                    key={p.id}
                    onClick={() => handlePickProduct(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.image ? (
                        <img
                          src={resolveImageUrl(p.image)}
                          alt={p.name}
                          onError={handleImageError}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={16} color="#64748B" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{p.origin || 'APMC Mandi'}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669' }}>
                      ₹{p.retailPrice}/{p.retailUnit || 'kg'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* CASE 2: User has typed text - Show Matching Recommendations */
        <div>
          <div style={{ padding: '10px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={12} color="#059669" />
            <span>Matching Produce ({matchingProducts.length})</span>
          </div>

          {matchingProducts.length === 0 ? (
            <div style={{ padding: '24px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                No fresh produce matching "{query}"
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                Try searching by common vegetable or fruit names, or check your spelling.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {POPULAR_SEARCH_TAGS.slice(0, 4).map(t => (
                  <button
                    key={t.query}
                    type="button"
                    onClick={() => handlePickTag(t.query)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '9999px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {matchingProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => handlePickProduct(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {p.image ? (
                      <img
                        src={resolveImageUrl(p.image)}
                        alt={p.name}
                        onError={handleImageError}
                        style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                      />
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={18} color="#64748B" />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ background: '#ECFDF5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '10px' }}>
                          {typeof p.category === 'object' && p.category !== null ? (p.category.name || 'Produce') : (p.category || 'Produce')}
                        </span>
                        <span>• {p.origin || 'APMC Direct'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                      ₹{p.retailPrice}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      per {p.retailUnit || 'kg'}
                    </div>
                  </div>
                </div>
              ))}

              {/* View all results button */}
              <button
                type="button"
                onClick={handleViewAll}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  background: '#F1F5F9',
                  border: 'none',
                  borderTop: '1px solid #E2E8F0',
                  color: '#234B3C',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
              >
                <span>View all results for "<strong>{query}</strong>"</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
