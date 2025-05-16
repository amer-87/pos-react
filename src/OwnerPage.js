import React, { useState } from 'react';
import ProductForm from './productForm';

const OwnerPage = ({ products, warehouse, onAddProduct, onDeleteProduct, onAddToCart, cartItems, onAddToWarehouse }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const handleAddProduct = async (product) => {
    // Check if product barcode exists and is in stock
    const existingProduct = products.find(p => p.barcode === product.barcode);
    if (existingProduct) {
      const inStock = warehouse.some(item => item.productId === existingProduct.id && item.quantity > 0);
      if (inStock) {
        // Switch to edit mode with existing product data, disable barcode editing
        setInitialData({
          ...existingProduct,
          quantity: product.quantity || 1
        });
        return;
      }
    }

    const newProduct = await onAddProduct(product);
    if (newProduct && onAddToWarehouse) {
      onAddToWarehouse(newProduct.id, product.quantity || 1);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1000);
    }
    setInitialData(null);
  };

  const handleAddToWarehouse = (productId, quantity) => {
    onAddToWarehouse(productId, quantity);
  };

  const clearInitialData = () => {
    setInitialData(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>الصفحة الرئيسية - إدارة المنتجات</h1>
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(46, 204, 113, 0.9)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '10px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          تم اضافة المنتج الى المخزن بنجاح
        </div>
      )}
      <ProductForm 
        onAdd={handleAddProduct} 
        onAddToWarehouse={handleAddToWarehouse} 
        products={products} 
        disableEditOnExistingBarcode={true}
        initialData={initialData}
        clearInitialData={clearInitialData}
      />
    </div>
  );
};

export default OwnerPage;
