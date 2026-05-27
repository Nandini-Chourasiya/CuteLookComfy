import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getBySlug(slug),
    select: d => d.data.data,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => productAPI.getReviews(product.id, { page: 0, size: 10 }),
    select: d => d.data.data,
    enabled: !!product?.id,
  });

  if (isLoading) {
    return (
      <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [];
  const variants = product.variants || [];
  const hasDiscount = product.comparePrice && product.comparePrice > product.sellingPrice;
  const discountPct = hasDiscount ? Math.round((1 - product.sellingPrice / product.comparePrice) * 100) : null;
  const inStock = product.stockQuantity > 0;

  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error('Please select a size/variant');
      return;
    }
    setAdding(true);
    await addItem(product.id, selectedVariant?.id, qty);
    setAdding(false);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Sign in to save items'); return; }
    try {
      if (wishlisted) {
        await wishlistAPI.remove(product.id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        setWishlisted(true);
        toast.success('Saved to wishlist');
      }
    } catch {}
  };

  const avgRating = reviews?.content?.length
    ? (reviews.content.reduce((s, r) => s + r.rating, 0) / reviews.content.length).toFixed(1)
    : null;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 32px 0' }}>
        <div style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
          {/* Images */}
          <div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {images.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '72px' }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: '72px', height: '90px', padding: 0, border: 'none',
                        cursor: 'pointer', overflow: 'hidden',
                        outline: selectedImage === i ? '2px solid var(--red)' : '1px solid var(--border)',
                        outlineOffset: '2px',
                      }}
                    >
                      <img src={img.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              <div style={{ flex: 1, position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]?.imageUrl || '/placeholder.jpg'}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>

                {discountPct && (
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    background: 'var(--red)', color: '#fff',
                    fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '5px 10px',
                  }}>
                    −{discountPct}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            {product.categoryName && (
              <Link to={`/shop/${product.categorySlug}`} style={{
                fontFamily: 'Inter', fontSize: '11px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--red)', textDecoration: 'none',
              }}>
                {product.categoryName}
              </Link>
            )}

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '-0.02em', color: 'var(--text)',
              margin: '12px 0 0', lineHeight: 0.95,
            }}>
              {product.name}
            </h1>

            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s <= Math.round(avgRating) ? '#E8242A' : 'var(--border)', fontSize: '14px' }}>★</span>
                  ))}
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {avgRating} ({reviews.totalElements} reviews)
                </span>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '40px', fontWeight: 700, color: 'var(--red)',
              }}>
                ₹{product.sellingPrice?.toLocaleString()}
              </span>
              {hasDiscount && (
                <span style={{ fontFamily: 'Inter', fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.comparePrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {selectedVariant ? `Size: ${selectedVariant.label}` : 'Select Size'}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stockQuantity === 0}
                      style={{
                        width: '48px', height: '48px', border: 'none',
                        background: selectedVariant?.id === v.id ? 'var(--black)' : 'var(--surface)',
                        color: selectedVariant?.id === v.id ? 'var(--bg)' : v.stockQuantity === 0 ? 'var(--text-muted)' : 'var(--text)',
                        cursor: v.stockQuantity === 0 ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter', fontSize: '13px',
                        textDecoration: v.stockQuantity === 0 ? 'line-through' : 'none',
                        position: 'relative',
                        outline: selectedVariant?.id === v.id ? '2px solid var(--black)' : '1px solid var(--border)',
                        outlineOffset: '2px',
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '44px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '18px' }}>−</button>
                <span style={{ width: '44px', textAlign: 'center', fontFamily: 'Inter', fontSize: '15px', color: 'var(--text)' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: '44px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '18px' }}>+</button>
              </div>

              {inStock ? (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  style={{
                    flex: 1, height: '44px',
                    background: 'var(--red)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '12px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => !adding && (e.currentTarget.style.background = '#c51e22')}
                  onMouseLeave={e => e.currentTarget.style.background = '#E8242A'}
                >
                  {adding ? 'Adding…' : 'Add to Bag'}
                </button>
              ) : (
                <button disabled style={{
                  flex: 1, height: '44px', background: 'var(--surface)',
                  color: 'var(--text-muted)', border: '1px solid var(--border)',
                  fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', cursor: 'not-allowed',
                }}>
                  Sold Out
                </button>
              )}

              <button
                onClick={handleWishlist}
                style={{
                  width: '44px', height: '44px',
                  background: 'none', border: '1px solid var(--border)',
                  cursor: 'pointer', color: wishlisted ? 'var(--red)' : 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Stock notice */}
            {inStock && product.stockQuantity <= 5 && (
              <p style={{ marginTop: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--red)', letterSpacing: '0.05em' }}>
                Only {product.stockQuantity} left in stock
              </p>
            )}

            {/* Trust badges */}
            <div style={{
              marginTop: '28px', paddingTop: '24px',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: '24px', flexWrap: 'wrap',
            }}>
              {['Free shipping over ₹500', 'Easy 30-day returns', 'Secure checkout'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--red)', fontSize: '14px' }}>✓</span>
                  <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                {['description', 'details', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '10px 20px 10px 0',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'Inter', fontSize: '11px',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab ? '2px solid var(--red)' : '2px solid transparent',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                      {product.description || 'No description available.'}
                    </p>
                  </motion.div>
                )}
                {activeTab === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        ['SKU', product.sku],
                        ['Category', product.categoryName],
                        ['Stock', product.stockQuantity + ' units'],
                        ['Weight', product.weight ? product.weight + ' g' : '—'],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{k}</div>
                          <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'reviews' && (
                  <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {reviews?.content?.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {reviews.content.map(r => (
                          <div key={r.id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{r.userName}</span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#E8242A' : 'var(--border)', fontSize: '12px' }}>★</span>)}
                              </div>
                            </div>
                            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
