import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from './productForm';
import ProductList from './productList';

const OwnerPage = ({ products, warehouse, onAddProduct, onDeleteProduct, onAddToCart, cartItems, onAddToWarehouse }) => {
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleAddProduct = async (product) => {
    const newProduct = await onAddProduct(product);
    if (newProduct && onAddToWarehouse) {
      onAddToWarehouse(newProduct.id, product.quantity || 1);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1000);
    }
    // Removed navigation to warehouse page to stay on OwnerPage
    // navigate('/warehouse');
  };

  const handleAddToWarehouse = (productId, quantity) => {
    onAddToWarehouse(productId, quantity);
    // Removed navigation to warehouse page to stay on OwnerPage
    // navigate('/warehouse');
  };

  // Merge products with warehouse quantities
  const productsWithQuantity = products.map(product => {
    const warehouseItem = warehouse.find(item => item.productId === product.id);
    return {
      ...product,
      quantity: warehouseItem ? warehouseItem.quantity : 0
    };
  });

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
      <ProductForm onAdd={handleAddProduct} onAddToWarehouse={handleAddToWarehouse} products={products} />
      {/* Removed ProductList from OwnerPage as it is moved to WarehousePage */}
    </div>
  );
};

export default OwnerPage;
