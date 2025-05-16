import React, { useRef } from 'react';
import ReceiptPrinter from './ReceiptPrinter';
import useBarcodeScanner from './BarcodeScanner';
import Cart from './Cart';

const SellerPage = ({ products, cartItems, onAddToCart, onUpdateQuantity, onReduceWarehouseStock, warehouse, onClearCart }) => {
  const videoRef = useRef(null);

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  const handleUpdateQuantity = (productId, quantity) => {
    onUpdateQuantity(productId, quantity);
  };

  const handlePrintComplete = () => {
    onClearCart();
  };

  const onDetect = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      const stockItem = warehouse.find(item => item.productId === product.id);
      if (stockItem && stockItem.quantity > 0) {
        handleAddToCart(product);
      } else {
        alert('The product is not in stock.');
      }
    } else {
      alert('Product not found for scanned barcode.');
    }
  };

  useBarcodeScanner(videoRef, onDetect, true);

  return (
    <div style={{ padding: '20px' }}>
      <h1>صفحة البيع</h1>
      <div>
        <video ref={videoRef} style={{ width: '100%', maxWidth: '400px', border: '1px solid black' }} />
      </div>
      {products.length === 0 ? (
        <p>لا توجد منتجات متاحة للبيع.</p>
      ) : (
        <div>
          <h2>السلة</h2>
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            discount={0}
            tax={0}
          />
          <ReceiptPrinter cartItems={cartItems} onPrintComplete={handlePrintComplete} />
        </div>
      )}
    </div>
  );
};

export default SellerPage;
