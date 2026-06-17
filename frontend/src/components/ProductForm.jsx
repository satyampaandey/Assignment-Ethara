import { useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';

export default function ProductForm({ product, onSubmit, onClose }) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
    description: product?.description || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (formData.price === '' || Number(formData.price) < 0)
      newErrors.price = 'Price must be 0 or greater';
    if (formData.quantity === '' || Number(formData.quantity) < 0)
      newErrors.quantity = 'Quantity must be 0 or greater';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      description: formData.description.trim(),
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="btn-icon" onClick={onClose} id="close-product-form">
            <HiOutlineX />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Wireless Mouse"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  id="input-product-name"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. WM-001"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  id="input-product-sku"
                />
                {errors.sku && <div className="form-error">{errors.sku}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  id="input-product-price"
                />
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  id="input-product-quantity"
                />
                {errors.quantity && <div className="form-error">{errors.quantity}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                type="text"
                placeholder="Optional product description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                id="input-product-description"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="submit-product">
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
