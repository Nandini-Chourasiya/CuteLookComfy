import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };

      const { data } = await api.post(endpoint, payload);
      login(data.data.accessToken, data.data.user);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Link to="/" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '36px', fontWeight: 900,
              letterSpacing: '-0.02em', textTransform: 'uppercase',
              color: 'var(--text)', textDecoration: 'none',
            }}>
              CuteLookComfy
            </Link>
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setMode('login')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 12px',
                  color: mode === 'login' ? 'var(--text)' : 'var(--text-muted)',
                  borderBottom: mode === 'login' ? '2px solid var(--red)' : '2px solid transparent',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 12px',
                  color: mode === 'register' ? 'var(--text)' : 'var(--text-muted)',
                  borderBottom: mode === 'register' ? '2px solid var(--red)' : '2px solid transparent',
                }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Google OAuth */}
          <a
            href={`${API_URL}/oauth2/authorization/google`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', border: '1px solid var(--border)',
              textDecoration: 'none', color: 'var(--text)',
              fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.05em',
              marginBottom: '24px',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              or
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'none', border: '1px solid var(--border)',
                    padding: '12px 16px', color: 'var(--text)',
                    fontFamily: 'Inter', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--text)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            <div>
              <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'none', border: '1px solid var(--border)',
                  padding: '12px 16px', color: 'var(--text)',
                  fontFamily: 'Inter', fontSize: '14px', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--text)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'none', border: '1px solid var(--border)',
                  padding: '12px 16px', color: 'var(--text)',
                  fontFamily: 'Inter', fontSize: '14px', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--text)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px', background: loading ? 'var(--text-muted)' : 'var(--red)',
                color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter', fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                transition: 'background 0.2s',
                marginTop: '8px',
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
