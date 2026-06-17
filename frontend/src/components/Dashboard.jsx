import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/api';
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
  HiOutlineExclamation,
} from 'react-icons/hi';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.get();
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>{error}</h3>
        <p>Make sure the backend server is running.</p>
        <button className="btn btn-primary" onClick={fetchDashboard} style={{ marginTop: 16 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your inventory and order management</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue" id="stat-products">
          <div className="stat-card-header">
            <div className="stat-icon blue">
              <HiOutlineCube />
            </div>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-value blue">{data?.total_products || 0}</div>
        </div>

        <div className="stat-card emerald" id="stat-customers">
          <div className="stat-card-header">
            <div className="stat-icon emerald">
              <HiOutlineUsers />
            </div>
            <span className="stat-label">Customers</span>
          </div>
          <div className="stat-value emerald">{data?.total_customers || 0}</div>
        </div>

        <div className="stat-card amber" id="stat-orders">
          <div className="stat-card-header">
            <div className="stat-icon amber">
              <HiOutlineShoppingCart />
            </div>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-value amber">{data?.total_orders || 0}</div>
        </div>

        <div className="stat-card rose" id="stat-revenue">
          <div className="stat-card-header">
            <div className="stat-icon rose">
              <HiOutlineCurrencyDollar />
            </div>
            <span className="stat-label">Revenue</span>
          </div>
          <div className="stat-value rose">
            ${(data?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="data-table-wrapper" style={{ marginTop: 8 }}>
        <div className="table-title">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineExclamation style={{ color: 'var(--accent-rose)' }} />
            Low Stock Alerts
          </h3>
          <span className="badge badge-low-stock">
            {data?.low_stock_products?.length || 0} items
          </span>
        </div>
        {data?.low_stock_products?.length > 0 ? (
          <div style={{ padding: 20 }}>
            <div className="low-stock-grid">
              {data.low_stock_products.map((product) => (
                <div key={product.id} className="low-stock-item">
                  <div className="low-stock-info">
                    <h4>{product.name}</h4>
                    <span>SKU: {product.sku}</span>
                  </div>
                  <div className="low-stock-qty">{product.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '40px 24px' }}>
            <p>✅ All products are well stocked!</p>
          </div>
        )}
      </div>
    </div>
  );
}
