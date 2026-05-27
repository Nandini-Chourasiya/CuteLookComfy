import { Link } from 'react-router-dom';
import { useState } from 'react';
import { newsletterAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await newsletterAPI.subscribe(email);
      toast.success('You\'re on the list');
      setEmail('');
    } catch {
      toast.error('Could not subscribe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer style={{
      background: 'var(--black)',
      color: '#EDE8E3',
      marginTop: '80px',
    }}>
      {/* Top strip */}
      <div style={{
        borderBottom: '1px solid rgba(237,232,227,0.1)',
        overflow: 'hidden',
        padding: '16px 0',
      }}>
        <div style={{
          display: 'flex', gap: '48px',
          animation: 'marqueeScroll 20s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {Array(8).fill(0).map((_, i) => (
            <span key={i} style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(237,232,227,0.3)',
            }}>
              Free Shipping Over ₹500 &nbsp;—&nbsp; New Arrivals Every Week &nbsp;—&nbsp; Premium Quality Fashion
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 32px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '64px',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '36px', fontWeight: 900,
              letterSpacing: '-0.02em', textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              CuteLookComfy
            </div>
            <p style={{
              fontFamily: 'Inter', fontSize: '13px',
              lineHeight: 1.7, color: 'rgba(237,232,227,0.5)',
              maxWidth: '240px',
            }}>
              Premium fashion for the bold. Designed for those who wear their confidence.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{
              fontFamily: 'Inter', fontSize: '10px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              marginBottom: '20px', color: 'rgba(237,232,227,0.4)',
            }}>
              Shop
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['New Arrivals', 'Women', 'Men', 'Accessories', 'Sale'].map(item => (
                <Link
                  key={item}
                  to={`/shop/${item.toLowerCase().replace(' ', '-')}`}
                  style={{
                    color: 'rgba(237,232,227,0.6)', textDecoration: 'none',
                    fontFamily: 'Inter', fontSize: '13px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = '#EDE8E3'}
                  onMouseLeave={e => e.target.style.color = 'rgba(237,232,227,0.6)'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 style={{
              fontFamily: 'Inter', fontSize: '10px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              marginBottom: '20px', color: 'rgba(237,232,227,0.4)',
            }}>
              Help
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Track Order', to: '/track' },
                { label: 'Returns', to: '/orders' },
                { label: 'Size Guide', to: '/shop' },
                { label: 'Contact', to: '/' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  style={{
                    color: 'rgba(237,232,227,0.6)', textDecoration: 'none',
                    fontFamily: 'Inter', fontSize: '13px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = '#EDE8E3'}
                  onMouseLeave={e => e.target.style.color = 'rgba(237,232,227,0.6)'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{
              fontFamily: 'Inter', fontSize: '10px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              marginBottom: '20px', color: 'rgba(237,232,227,0.4)',
            }}>
              Stay Updated
            </h4>
            <p style={{
              fontFamily: 'Inter', fontSize: '12px',
              color: 'rgba(237,232,227,0.5)', marginBottom: '16px',
              lineHeight: 1.6,
            }}>
              New drops, exclusive offers and style inspiration.
            </p>
            <form onSubmit={handleSubscribe}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(237,232,227,0.3)' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    padding: '10px 0', color: '#EDE8E3',
                    fontFamily: 'Inter', fontSize: '13px',
                    '::placeholder': { color: 'rgba(237,232,227,0.3)' },
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#E8242A', fontFamily: 'Inter', fontSize: '11px',
                    letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 0 10px 12px',
                  }}
                >
                  {submitting ? '…' : '→'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(237,232,227,0.1)',
          paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{
            fontFamily: 'Inter', fontSize: '11px',
            color: 'rgba(237,232,227,0.3)', letterSpacing: '0.05em',
          }}>
            © 2024 CuteLookComfy. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <Link
                key={item}
                to="/"
                style={{
                  color: 'rgba(237,232,227,0.3)', textDecoration: 'none',
                  fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.05em',
                }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
}
