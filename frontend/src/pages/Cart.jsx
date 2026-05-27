import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const items = cart?.items || [];

  const handleCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponCode.trim().toUpperCase());
      toast.success('Coupon applied!');
      setCouponCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{
        paddingTop: '64px', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '24px',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900,
          textTransform: 'uppercase', color: 'var(--text)',
        }}>
          Your Bag is Empty
        </div>
        <Link to="/shop" style={{
          padding: '14px 48px', background: 'var(--red)', color: '#fff',
          textDecoration: 'none', fontFamily: 'Inter', fontSize: '12px',
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '-0.02em',
            color: 'var(--text)', marginBottom: '48px',
          }}
        >
          Your Bag ({items.length})
        </motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px' }}>
          {/* Items */}
          <div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {items.map((item, i) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '100px 1fr auto',
                    gap: '20px', padding: '24px 0',
                    borderBottom: '1px solid var(--border)',
                    alignItems: 'start',
                  }}
                >
                  <Link to={`/product/${item.slug}`}>
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.productName}
                      style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
                    />
                  </Link>

                  <div>
                    <Link to={`/product/${item.slug}`} style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '20px', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.02em',
                      color: 'var(--text)', textDecoration: 'none',
                    }}>
                      {item.productName}
                    </Link>
                    {item.variantLabel && (
                      <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Size: {item.variantLabel}
                      </div>
                    )}
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '20px', fontWeight: 700,
                      color: 'var(--red)', marginTop: '10px',
                    }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                        <button onClick={() => updateItem(item.productId, item.quantity - 1)}
                          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '16px' }}>−</button>
                        <span style={{ width: '36px', textAlign: 'center', fontFamily: 'Inter', fontSize: '14px', color: 'var(--text)' }}>{item.quantity}</span>
                        <button onClick={() => updateItem(item.productId, item.quantity + 1)}
                          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '16px' }}>+</button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'Inter', fontSize: '11px',
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '18px', fontWeight: 600,
                    color: 'var(--text)',
                  }}>
                    ₹{item.price?.toLocaleString()} ea.
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
            <div style={{ border: '1px solid var(--border)', padding: '28px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '24px', fontWeight: 700,
                textTransform: 'uppercase', color: 'var(--text)',
                marginBottom: '24px',
              }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>₹{cart?.subtotal?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', color: cart?.shippingCost === 0 ? 'var(--red)' : 'var(--text)' }}>
                    {cart?.shippingCost === 0 ? 'Free' : `₹${cart?.shippingCost}`}
                  </span>
                </div>
                {cart?.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>
                      Discount {cart.couponCode && `(${cart.couponCode})`}
                    </span>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--red)' }}>−₹{cart.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text)' }}>Total</span>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
                    ₹{cart?.total?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Coupon */}
              {cart?.couponCode ? (
                <div style={{ marginBottom: '20px', padding: '10px 12px', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--red)' }}>
                    {cart.couponCode} applied
                  </span>
                  <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px' }}>✕</button>
                </div>
              ) : (
                <form onSubmit={handleCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    style={{
                      flex: 1, background: 'none', border: '1px solid var(--border)',
                      padding: '10px 12px', color: 'var(--text)',
                      fontFamily: 'Inter', fontSize: '13px',
                      textTransform: 'uppercase', outline: 'none',
                    }}
                  />
                  <button type="submit" disabled={applyingCoupon} style={{
                    padding: '10px 16px', background: 'var(--black)',
                    color: 'var(--bg)', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    Apply
                  </button>
                </form>
              )}

              {user ? (
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', padding: '16px',
                    background: 'var(--red)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '12px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                  }}
                >
                  Checkout
                </button>
              ) : (
                <Link to="/login" style={{
                  display: 'block', padding: '16px',
                  background: 'var(--black)', color: 'var(--bg)',
                  textAlign: 'center', textDecoration: 'none',
                  fontFamily: 'Inter', fontSize: '12px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                }}>
                  Sign In to Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
