import { HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';

export default function OrderDetail({ order, onClose }) {
  if (!order) return null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={onClose} id="back-to-orders">
          <HiOutlineArrowLeft /> Back to Orders
        </button>
      </div>

      <div className="page-header">
        <div className="page-actions">
          <div>
            <h1>Order #{order.id}</h1>
            <p>Created on {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
          </div>
          <span className={`badge badge-${order.status}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <label>Order ID</label>
            <span>#{order.id}</span>
          </div>
          <div className="detail-item">
            <label>Customer</label>
            <span>{order.customer_name || `Customer #${order.customer_id}`}</span>
          </div>
          <div className="detail-item">
            <label>Status</label>
            <span className={`badge badge-${order.status}`} style={{ marginTop: 4 }}>
              {order.status}
            </span>
          </div>
          <div className="detail-item">
            <label>Total Amount</label>
            <span style={{ color: 'var(--accent-blue)' }}>
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="data-table-wrapper">
        <div className="table-title">
          <h3>Order Items</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {order.items?.length || 0} item(s)
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {item.product_name || `Product #${item.product_id}`}
                </td>
                <td>
                  <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>
                    {item.product_sku || '-'}
                  </code>
                </td>
                <td>${item.unit_price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', paddingTop: 16, paddingBottom: 16 }}>
                Total
              </td>
              <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-blue)', paddingTop: 16, paddingBottom: 16 }}>
                ${order.total_amount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
