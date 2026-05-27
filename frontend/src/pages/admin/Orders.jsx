import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
const STATUS_COLOR = { PENDING: '#F59E0B', CONFIRMED: '#3B82F6', PROCESSING: '#8B5CF6', SHIPPED: '#06B6D4', DELIVERED: '#10B981', CANCELLED: '#EF4444' };

export default function AdminOrders() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status],
    queryFn: () => adminAPI.getOrders({ page, size: 20, status: status || undefined }),
    select: d => d.data.data,
    placeholderData: (prev) => prev,
  });

  const handleStatusChange = async (id, newStatus, trackingNumber = '') => {
    setUpdating(id);
    try {
      await adminAPI.updateOrderStatus(id, { status: newStatus, trackingNumber });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Status updated');
    } catch {
      toast.error('Could not update status');
    } finally {
      setUpdating(null);
    }
  };

  const orders = data?.content || [];

  return (
    <AdminLayout title="Orders">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setStatus('')} style={{ padding: '8px 16px', background: !status ? 'var(--black)' : 'none', color: !status ? 'var(--bg)' : 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(0); }} style={{ padding: '8px 16px', background: status === s ? 'var(--black)' : 'none', color: status === s ? 'var(--bg)' : 'var(--text)', border: `1px solid ${status === s ? 'var(--black)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s}</button>
        ))}
      </div>

      {isLoading ? <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: '13px' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                {['Order', 'Date', 'Customer', 'Items', 'Total', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>#{order.orderNumber}</td>
                  <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{order.userEmail}</td>
                  <td style={{ padding: '12px', fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{order.items?.length}</td>
                  <td style={{ padding: '12px', fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, color: 'var(--red)' }}>₹{order.total?.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '3px 10px', background: `${STATUS_COLOR[order.status]}20`, color: STATUS_COLOR[order.status], fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select
                      disabled={updating === order.id}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      defaultValue=""
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '6px 10px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '11px', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="" disabled>Update</option>
                      {STATUSES.filter(s => s !== order.status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{ width: '36px', height: '36px', background: page === i ? 'var(--red)' : 'none', border: `1px solid ${page === i ? 'var(--red)' : 'var(--border)'}`, color: page === i ? '#fff' : 'var(--text)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px' }}>{i + 1}</button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
