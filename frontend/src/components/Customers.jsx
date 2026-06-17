import { useState, useEffect } from 'react';
import { customerAPI } from '../api/api';
import CustomerForm from './CustomerForm';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineMail,
  HiOutlinePhone,
} from 'react-icons/hi';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll();
      setCustomers(res.data);
    } catch (err) {
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await customerAPI.create(data);
      showToast(`Customer "${data.full_name}" added successfully!`);
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create customer', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await customerAPI.delete(id);
      showToast('Customer deleted successfully!');
      setConfirmDelete(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete customer', 'error');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
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
            <h1>Customers</h1>
            <p>Manage your customer directory</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            id="btn-add-customer"
          >
            <HiOutlinePlus /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 360 }}
          id="search-customers"
        />
      </div>

      {/* Table */}
      {filteredCustomers.length > 0 ? (
        <div className="data-table-wrapper">
          <table className="data-table" id="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'var(--gradient-purple)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {customer.full_name.charAt(0).toUpperCase()}
                      </div>
                      {customer.full_name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiOutlineMail style={{ opacity: 0.5 }} />
                      {customer.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiOutlinePhone style={{ opacity: 0.5 }} />
                      {customer.phone}
                    </div>
                  </td>
                  <td>
                    {new Date(customer.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-icon danger"
                      title="Delete"
                      onClick={() => setConfirmDelete(customer)}
                    >
                      <HiOutlineTrash />
                    </button>
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
              <HiOutlineUsers />
            </div>
            <h3>No customers yet</h3>
            <p>Add your first customer to start building your directory.</p>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <CustomerForm
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
                <h3>Delete Customer</h3>
                <p>
                  Are you sure you want to delete <strong>{confirmDelete.full_name}</strong>?
                  This action cannot be undone.
                </p>
                <div className="confirm-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(confirmDelete.id)}
                    id="confirm-delete-customer"
                  >
                    Delete
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
