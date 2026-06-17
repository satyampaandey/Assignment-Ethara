import { useState, useEffect } from 'react';
import { productAPI } from '../api/api';
import ProductForm from './ProductForm';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCube,
  HiOutlineExclamation,
} from 'react-icons/hi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await productAPI.create(data);
      showToast(`Product "${data.name}" created successfully!`);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create product', 'error');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await productAPI.update(editingProduct.id, data);
      showToast(`Product "${data.name}" updated successfully!`);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update product', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      showToast('Product deleted successfully!');
      setConfirmDelete(null);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete product', 'error');
    }
  };

  const getStockLevel = (qty) => {
    if (qty <= 5) return 'low';
    if (qty <= 20) return 'medium';
    return 'high';
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1>Products</h1>
            <p>Manage your product inventory</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            id="btn-add-product"
          >
            <HiOutlinePlus /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 360 }}
          id="search-products"
        />
      </div>

      {/* Table */}
      {filteredProducts.length > 0 ? (
        <div className="data-table-wrapper">
          <table className="data-table" id="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const level = getStockLevel(product.quantity);
                return (
                  <tr key={product.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {product.name}
                      {product.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>
                        {product.sku}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{product.quantity}</span>
                      <div className="stock-bar">
                        <div
                          className={`stock-bar-fill ${level}`}
                          style={{ width: `${Math.min((product.quantity / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      {product.quantity <= 10 ? (
                        <span className="badge badge-low-stock">
                          <HiOutlineExclamation /> Low Stock
                        </span>
                      ) : (
                        <span className="badge badge-in-stock">In Stock</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon edit"
                          title="Edit"
                          onClick={() => setEditingProduct(product)}
                        >
                          <HiOutlinePencil />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => setConfirmDelete(product)}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="empty-state">
            <div className="empty-state-icon">
              <HiOutlineCube />
            </div>
            <h3>No products yet</h3>
            <p>Add your first product to start managing your inventory.</p>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <ProductForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit Form Modal */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleUpdate}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-dialog-icon">⚠️</div>
                <h3>Delete Product</h3>
                <p>
                  Are you sure you want to delete <strong>{confirmDelete.name}</strong>?
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
                    id="confirm-delete-product"
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
