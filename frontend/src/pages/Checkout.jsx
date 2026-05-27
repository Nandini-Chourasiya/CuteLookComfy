import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

export default function Checkout() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    userAPI.getAddresses().then(r => {
      const addrs = r.data.data;
      setAddresses(addrs);
      const def = addrs.find(a => a.isDefault);
      if (def) setSelectedAddress(def.id);
    }).catch(() => {});
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await userAPI.addAddress(newAddr);
      const updated = [...addresses, data.data];
      setAddresses(updated);
      setSelectedAddress(data.data.id);
      setAddingAddress(false);
      setNewAddr({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
    } catch {
      toast.error('Could not save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Select a delivery address'); return; }
    setPlacing(true);
    try {
      const { data } = await orderAPI.create({ addressId: selectedAddress });
      const order = data.data;

      const { data: payData } = await paymentAPI.initiate(order.id);
      const { razorpayOrderId, amount, currency } = payData.data;

      const options = {
        key: RAZORPAY_KEY,
        amount,
        currency,
        name: 'CuteLookComfy',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id,
            });
            await fetchCart();
            toast.success('Order placed successfully!');
            navigate(`/orders/${order.id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#E8242A' },
        modal: { ondismiss: () => { setPlacing(false); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
      setPlacing(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'none', border: '1px solid var(--border)',
    padding: '10px 12px', color: 'var(--text)',
    fontFamily: 'Inter', fontSize: '14px', outline: 'none',
  };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '-0.02em',
            color: 'var(--text)', marginBottom: '40px',
          }}
        >
          Checkout
        </motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px' }}>
          <div>
            {/* Delivery */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px', letterSpacing: '0.02em' }}>
                Delivery Address
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    style={{
                      display: 'flex', gap: '12px', padding: '16px',
                      border: `1px solid ${selectedAddress === addr.id ? 'var(--red)' : 'var(--border)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      style={{ accentColor: '#E8242A', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
                        {addr.name} — {addr.phone}
                        {addr.isDefault && <span style={{ marginLeft: '8px', fontSize: '10px', color: 'var(--red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Default</span>}
                      </div>
                      <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.pincode}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {!addingAddress ? (
                <button
                  onClick={() => setAddingAddress(true)}
                  style={{
                    background: 'none', border: '1px dashed var(--border)',
                    padding: '12px 20px', cursor: 'pointer', color: 'var(--text-muted)',
                    fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', width: '100%',
                  }}
                >
                  + Add New Address
                </button>
              ) : (
                <form onSubmit={handleSaveAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <input style={inputStyle} value={newAddr.name} onChange={e => setNewAddr(a => ({ ...a, name: e.target.value }))} required onFocus={e => e.target.style.borderColor='var(--text)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Phone</label>
                    <input style={inputStyle} value={newAddr.phone} onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} required onFocus={e => e.target.style.borderColor='var(--text)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Pincode</label>
                    <input style={inputStyle} value={newAddr.pincode} onChange={e => setNewAddr(a => ({ ...a, pincode: e.target.value }))} required onFocus={e => e.target.style.borderColor='var(--text)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Address Line 1</label>
                    <input style={inputStyle} value={newAddr.line1} onChange={e => setNewAddr(a => ({ ...a, line1: e.target.value }))} required onFocus={e => e.target.style.borderColor='var(--text)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>City</label>
                    <input style={inputStyle} value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} required onFocus={e => e.target.style.borderColor='var(--text)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>State</label>
                    <input style={inputStyle} value={newAddr.state} onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))} required onFocus={e => e.target.style.borderColor='var(--text)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
                    <button type="submit" style={{ padding: '12px 24px', background: 'var(--black)', color: 'var(--bg)', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Save Address</button>
                    <button type="button" onClick={() => setAddingAddress(false)} style={{ padding: '12px 24px', background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cancel</button>
                  </div>
                </form>
              )}
            </section>
          </div>

          {/* Order Summary */}
          <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
            <div style={{ border: '1px solid var(--border)', padding: '24px' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>
                Order ({cart?.items?.length || 0} items)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {cart?.items?.map(item => (
                  <div key={item.productId} style={{ display: 'flex', gap: '12px' }}>
                    <img src={item.image || '/placeholder.jpg'} alt={item.productName} style={{ width: '52px', height: '68px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text)' }}>{item.productName}</div>
                      <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>Discount</span>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--red)' }}>−₹{cart?.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)' }}>Total</span>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>₹{cart?.total?.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
                style={{
                  width: '100%', marginTop: '20px', padding: '16px',
                  background: placing || !selectedAddress ? 'var(--text-muted)' : 'var(--red)',
                  color: '#fff', border: 'none', cursor: placing || !selectedAddress ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase',
                }}
              >
                {placing ? 'Processing…' : 'Pay with Razorpay'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '12px', fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)' }}>
                Secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
