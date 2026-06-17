import { useState, useEffect } from 'react';
import { orderAPI } from '../api/api';
import OrderForm from './OrderForm';
import OrderDetail from './OrderDetail';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineShoppingCart,
} from 'react-icons/hi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await orderAPI.create(data);
      showToast('Order placed successfully!');
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create order', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await orderAPI.delete(id);
      showToast('Order cancelled and stock restored!');
      setConfirmDelete(null);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete order', 'error');
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await orderAPI.getById(orderId);
      setViewingOrder(res.data);
    } catch (err) {
      showToast('Failed to load order details', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show order detail view
  if (viewingOrder) {
    return (
      <OrderDetail order={viewingOrder} onClose={() => setViewingOrder(null)} />
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-actions">
          <div>
            <h1>Orders</h1>
            <p>Track and manage customer orders</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            id="btn-create-order"
          >
            <HiOutlinePlus /> Create Order
          </button>
        </div>
      </div>

      {/* Table */}
      {orders.length > 0 ? (
        <div className="data-table-wrapper">
          <table className="data-table" id="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    #{order.id}
                  </td>
                  <td>{order.customer_name || `Customer #${order.customer_id}`}</td>
                  <td>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.8rem'
                    }}>
                      {order.items?.length || 0} item(s)
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="btn-icon edit"
                        title="View Details"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <HiOutlineEye />
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Cancel Order"
                        onClick={() => setConfirmDelete(order)}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="empty-state">
            <div className="empty-state-icon">
              <HiOutlineShoppingCart />
            </div>
            <h3>No orders yet</h3>
            <p>Create your first order to start tracking sales.</p>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showForm && (
        <OrderForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-dialog-icon">⚠️</div>
                <h3>Cancel Order</h3>
                <p>
                  Are you sure you want to cancel <strong>Order #{confirmDelete.id}</strong>?
                  Product stock will be restored.
                </p>
                <div className="confirm-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Keep Order
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(confirmDelete.id)}
                    id="confirm-delete-order"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
