import React, { useState, useRef, useCallback } from 'react';
import Cart from './Cart';
import useBarcodeScanner from './BarcodeScanner';
import ReceiptPrinter from './ReceiptPrinter';

const SellerPage = ({ products, cartItems, onAddToCart, onUpdateQuantity, onReduceWarehouseStock, warehouse }) => {
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const videoRef = useRef(null);

  const handleBarcodeDetected = useCallback((code) => {
    console.log('handleBarcodeDetected called with code:', code);
    setScanStatus('تم اكتشاف الباركود: ' + code);
    const foundProduct = products.find(product => product.barcode === code);
    if (foundProduct) {
      console.log('Product found for barcode:', code, foundProduct);
      // Check warehouse stock before adding to cart
      const warehouseEntry = warehouse.find(item => item.productId === foundProduct.id);
      if (warehouseEntry && warehouseEntry.quantity > 0) {
        onAddToCart(foundProduct);
        if (onReduceWarehouseStock) {
          onReduceWarehouseStock(foundProduct.id, 1);
        }
      } else {
        // Allow adding product to cart even if not in warehouse stock
        onAddToCart(foundProduct);
        alert('المنتج غير متوفر في المخزن، تم إضافته إلى السلة بدون تحديث المخزون.');
      }
    } else {
      console.log('No product found for barcode:', code);
      alert('المنتج غير موجود في القائمة!');
    }
    setScanning(false);
    setTimeout(() => setScanStatus(''), 3000);
  }, [products, onAddToCart, warehouse, onReduceWarehouseStock]);

  useBarcodeScanner(videoRef, handleBarcodeDetected, scanning);

  const toggleScanner = () => {
    console.log('toggleScanner called. Current scanning state:', scanning);
    setScanning(!scanning);
    if (!scanning) {
      setScanStatus('جاري البحث عن باركود...');
    } else {
      setScanStatus('');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  return (
    <div style={{ padding: '20px' }}>
      <h1>صفحة البيع - مسح المنتجات</h1>
      <div style={{ marginBottom: '20px' }}>
        {scanning ? (
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxWidth: '400px', border: '2px solid #3498db', borderRadius: '4px' }}
            />
            <div style={{ margin: '10px 0', color: '#3498db', textAlign: 'center' }}>{scanStatus}</div>
            <button
              onClick={toggleScanner}
              style={{
                padding: '8px 15px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              إلغاء المسح
            </button>
          </div>
        ) : (
          <button
            onClick={toggleScanner}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            بدء مسح الباركود
          </button>
        )}
      </div>

      <Cart cartItems={cartItems} onUpdateQuantity={onUpdateQuantity} />

      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>الخصم (%) :</label>
          <input
            type="number"
            value={discount}
            onChange={e => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            min="0"
            max="100"
            step="0.01"
            style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>الضريبة (%) :</label>
          <input
            type="number"
            value={tax}
            onChange={e => setTax(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            min="0"
            max="100"
            step="0.01"
            style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>
          الإجمالي: {total.toFixed(2)} ر.س
        </div>
        <ReceiptPrinter cartItems={cartItems} onPrintComplete={() => alert('تمت طباعة الفاتورة')} />
      </div>
    </div>
  );
};

export default SellerPage;
