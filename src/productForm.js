import React, { useState, useEffect, useRef } from 'react';
import useBarcodeScanner from './BarcodeScanner';

const ProductForm = ({ onAdd, onAddToWarehouse, onEdit, initialData, existingBarcodes, products, onCreatePendingRequest, disableEditOnExistingBarcode = false, clearInitialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    category: '',
    quantity: 1,
    isExistingProduct: false
  }); 
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        barcode: initialData.barcode || '',
        price: initialData.price || '',
        category: initialData.category || '',
        quantity: initialData.quantity || 1,
        isExistingProduct: true,
        id: initialData.id
      });
    } else {
      setFormData({
        name: '',
        barcode: '',
        price: '',
        category: '',
        quantity: 1,
        isExistingProduct: false
      });
    }
  }, [initialData]);


  const handleBarcodeDetected = (code) => {
    console.log('ProductForm handleBarcodeDetected called with code:', code);
    const existingProduct = products.find(p => p.barcode === code);
    if (existingProduct) {
      if (disableEditOnExistingBarcode) {
        setFormData(prev => ({ ...prev, barcode: code, isExistingProduct: false }));
        setScanStatus('تم اكتشاف الباركود: ' + code);
      } else {
        setFormData({
          name: existingProduct.name,
          barcode: existingProduct.barcode,
          price: existingProduct.price,
          category: existingProduct.category,
          quantity: 1,
          isExistingProduct: true,
          id: existingProduct.id
        });
        setScanStatus('تم اكتشاف منتج موجود مسبقاً: ' + existingProduct.name);
      }
    } else {
      setFormData(prev => ({ ...prev, barcode: code, isExistingProduct: false }));
      setScanStatus('تم اكتشاف الباركود: ' + code);
    }
    setScanning(false);
    setTimeout(() => setScanStatus(''), 3000);
  };

  useBarcodeScanner(videoRef, handleBarcodeDetected, scanning);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 1 : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      alert('الرجاء إدخال الاسم والباركود');
      return;
    }

    if (existingBarcodes && existingBarcodes.includes(formData.barcode.trim()) && (!initialData || formData.barcode.trim() !== initialData.barcode)) {
      alert('هذا الباركود موجود بالفعل لمنتج آخر');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('الرجاء إدخال سعر صحيح');
      return;
    }

    if (!formData.category.trim()) {
      alert('الرجاء إدخال التصنيف');
      return;
    }

    if (isNaN(formData.quantity) || formData.quantity <= 0) {
      alert('الرجاء إدخال كمية صحيحة');
      return;
    }

    if (initialData && onEdit) {
      // Edit existing product
      onEdit({
        ...initialData,
        name: formData.name.trim(),
        barcode: formData.barcode.trim(),
        price: price,
        category: formData.category.trim(),
        quantity: formData.quantity
      });
    } else {
      // Add new product or create pending request for existing product
      if (formData.isExistingProduct) {
        if (window.confirm(`المنتج موجود بالفعل: ${formData.name}. هل تريد إنشاء طلب زيادة الكمية والسعر؟`)) {
          if (onCreatePendingRequest) {
            onCreatePendingRequest({
              productId: formData.id,
              price: price,
              quantity: formData.quantity
            });
            alert('تم إنشاء طلب انتظار للموافقة');
          }
        }
      } else {
        if (onAdd) {
          (async () => {
            const newProduct = await onAdd({ 
              name: formData.name.trim(), 
              barcode: formData.barcode.trim(),
              price: price,
              category: formData.category.trim(),
              quantity: formData.quantity
            });
            if (newProduct && onAddToWarehouse) {
              onAddToWarehouse(newProduct.id, formData.quantity);
              alert('تم إضافة المنتج إلى المخزن');
            }
          })();
        }
      }
    }
    
    setFormData({ name: '', barcode: '', price: '', category: '', quantity: 1, isExistingProduct: false });
  };

  const toggleScanner = () => {
    setScanning(!scanning);
    setScanStatus(scanning ? '' : 'جاري البحث عن باركود...');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>{initialData ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>اسم المنتج:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={styles.input}
          disabled={formData.isExistingProduct}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>باركود المنتج:</label>
        {scanning ? (
          <div style={styles.scannerContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
            />
            <div style={styles.scanStatus}>{scanStatus}</div>
            <button
              type="button"
              onClick={toggleScanner}
              style={styles.cancelButton}
            >
              إلغاء المسح
            </button>
          </div>
        ) : (
          <div style={styles.barcodeInputContainer}>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              style={styles.input}
              disabled={formData.isExistingProduct}
            />
            <button
              type="button"
              onClick={toggleScanner}
              style={styles.scanButton}
              disabled={formData.isExistingProduct}
            >
              مسح باركود
            </button>
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>سعر المنتج:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>التصنيف:</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          style={styles.input}
          disabled={formData.isExistingProduct}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>الكمية:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          step="1"
          style={styles.input}
        />
      </div>
      
      <button type="submit" style={styles.submitButton}>
        {formData.isExistingProduct ? 'إنشاء طلب انتظار' : 'إضافة منتج'}
      </button>
    </form>
  );
};

const styles = {
  form: {
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9'
  },
  title: {
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    padding: '10px',
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  scannerContainer: {
    position: 'relative',
    marginBottom: '10px'
  },
  video: {
    width: '100%',
    maxWidth: '400px',
    border: '2px solid #3498db',
    borderRadius: '4px'
  },
  scanStatus: {
    margin: '5px 0',
    color: '#3498db',
    textAlign: 'center'
  },
  barcodeInputContainer: {
    display: 'flex',
    gap: '10px'
  },
  scanButton: {
    padding: '10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '100px'
  },
  cancelButton: {
    padding: '8px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%'
  },
  submitButton: {
    padding: '12px 25px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
    marginTop: '10px'
  }
};

export default ProductForm;
