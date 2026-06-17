import { useState, useEffect } from 'react';
import { productAPI, customerAPI } from '../api/api';
import { HiOutlineX, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

export default function OrderForm({ onSubmit, onClose }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerAPI.getAll(),
          productAPI.getAll(),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getEstimatedTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find((p) => p.id === Number(item.product_id));
      if (product && item.quantity > 0) {
        return total + product.price * item.quantity;
      }
      return total;
    }, 0);
  };

  const validate = () => {
    const newErrors = {};
    if (!customerId) newErrors.customer = 'Please select a customer';
    
    const validItems = items.filter((item) => item.product_id);
    if (validItems.length === 0) newErrors.items = 'Add at least one product';

    items.forEach((item, i) => {
      if (item.product_id) {
        const product = products.find((p) => p.id === Number(item.product_id));
        if (product && item.quantity > product.quantity) {
          newErrors[`item_${i}`] = `Only ${product.quantity} available`;
        }
        if (item.quantity < 1) {
          newErrors[`item_${i}`] = 'Quantity must be at least 1';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const validItems = items
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }));

    onSubmit({
      customer_id: Number(customerId),
      items: validItems,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2>Create New Order</h2>
          <button className="btn-icon" onClick={onClose} id="close-order-form">
            <HiOutlineX />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer Selection */}
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select
                className="form-select"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  if (errors.customer) setErrors({ ...errors, customer: undefined });
                }}
                id="select-customer"
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
              {errors.customer && <div className="form-error">{errors.customer}</div>}
            </div>

            {/* Order Items */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Order Items *</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                  <HiOutlinePlus /> Add Item
                </button>
              </div>
              {errors.items && <div className="form-error" style={{ marginBottom: 8 }}>{errors.items}</div>}

              {items.map((item, index) => {
                const selectedProduct = products.find((p) => p.id === Number(item.product_id));
                return (
                  <div key={index} className="order-item-row">
                    <div>
                      <select
                        className="form-select"
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)} (Stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        max={selectedProduct?.quantity || 9999}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        style={{ opacity: items.length === 1 ? 0.3 : 1 }}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                    {errors[`item_${index}`] && (
                      <div className="form-error" style={{ gridColumn: '1 / -1' }}>
                        {errors[`item_${index}`]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estimated Total */}
            <div className="order-total">
              <span className="order-total-label">Estimated Total</span>
              <span className="order-total-value">
                ${getEstimatedTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="submit-order">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
