import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/product/ProductCard';
import FreshProduceLoader from '../components/common/FreshProduceLoader';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { store, isWholesale, setIsWholesale } = useStore();

  const currentCat = searchParams.get('cat') || 'ALL';
  const searchQuery = searchParams.get('q') || '';

  const [loading, setLoading] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (localSearch.trim()) next.set('q', localSearch.trim());
      else next.delete('q');
      return next;
    });
  };

  const filteredProducts = store.products.filter(p => {
    const matchesCat = currentCat === 'ALL' || p.category === currentCat;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.kannadaName && p.kannadaName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // When Wholesale Mode is active, strictly show only items available in bulk crates/sacks
    const matchesWholesale = !isWholesale || (p.hasWholesale !== false && Boolean(p.wholesaleUnit));

    return matchesCat && matchesSearch && matchesWholesale;
  });

  return (
    <div className="section-container" style={{ paddingTop: '16px' }}>
      {/* Top Filter & Search Header */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #E5ECE7',
        borderRadius: '18px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: '#234B3C' }}>
              {currentCat === 'ALL' ? 'Complete Fresh Harvest' : categories.find(c => c.id === currentCat)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: '#52635A', marginTop: '2px' }}>
              Showing {filteredProducts.length} farm-direct products for next-day society fulfillment
            </p>
          </div>

          {/* Wholesale vs Retail Toggle - Commented out for retail concentration
          <div className="wholesale-switch-pill">
            <button
              type="button"
              className={`switch-btn ${!isWholesale ? 'active' : ''}`}
              onClick={() => setIsWholesale(false)}
            >
              Retail Packs
            </button>
            <button
              type="button"
              className={`switch-btn ${isWholesale ? 'wholesale-active' : ''}`}
              onClick={() => setIsWholesale(true)}
            >
              📦 Wholesale Crates
            </button>
          </div>
          */}
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#83968D" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              className="form-input-control"
              style={{ paddingLeft: '42px', height: '44px', borderRadius: '9999px' }}
              placeholder="Filter by name (e.g. Tomato, Spinach, Onion, Apple)..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#234B3C',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '13.5px',
              padding: '0 20px',
              borderRadius: '9999px'
            }}
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: '4px'
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: currentCat === cat.id ? '#234B3C' : '#F2F5F3',
                color: currentCat === cat.id ? '#FFFFFF' : '#52635A',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid or Loader */}
      {loading ? (
        <FreshProduceLoader text="Loading fresh crops..." subtext="Filtering dawn mandi varieties" />
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
                setLocalSearch('');
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
