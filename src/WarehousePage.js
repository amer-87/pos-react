import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProductList from './productList';

const WarehousePage = ({ products = [], warehouse = [], onDeleteProduct, onAddToCart, cartItems, onUpdateWarehouse, onEditProduct, onDeleteAllProducts }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ productId: '', quantity: '', name: '', price: '', category: '' });

  // إنشاء خريطة للمنتجات
  const productMap = products.reduce((map, product) => {
    if (product && product.id) map[product.id] = product;
    return map;
  }, {});

  // معالجة عناصر المخزن
  const processedItems = warehouse.reduce((acc, item) => {
    if (item && item.productId && productMap[item.productId]) {
      const existingItem = acc.find(i => i.productId === item.productId);
      if (item.quantity > 0) {
        existingItem 
          ? existingItem.quantity += item.quantity 
          : acc.push({ ...item, productData: productMap[item.productId] });
      }
    }
    return acc;
  }, []);

  // حساب إجمالي الكمية
  const totalQuantity = warehouse.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // حساب إجمالي السعر
  const totalPrice = warehouse.reduce((sum, item) => {
    const product = productMap[item.productId];
    if (product && product.price) {
      return sum + product.price * item.quantity;
    }
    return sum;
  }, 0);

  // معالجة الحذف
  const handleDelete = (productId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      onDeleteProduct(productId);
    }
  };

  // معالجة التعديل
  const handleEdit = (item) => {
    const product = productMap[item.productId];
    setEditingItem(item);
    setEditForm({
      productId: item.productId,
      quantity: item.quantity,
      name: product?.name || '',
      price: 250 * item.quantity, // Start price at 250 * quantity
      category: product?.category || ''
    });
  };

  // حفظ التعديلات
  const handleSaveEdit = () => {
    const quantity = Number(editForm.quantity);
    const price = Number(editForm.price);
    if (isNaN(quantity) || quantity < 0) {
      alert('الرجاء إدخال كمية صحيحة');
      return;
    }
    if (isNaN(price) || price < 0) {
      alert('الرجاء إدخال سعر صحيح');
      return;
    }
    onUpdateWarehouse(editingItem.productId, quantity);
    onEditProduct({
      id: editingItem.productId,
      name: editForm.name,
      price: price,
      category: editForm.category,
      barcode: productMap[editingItem.productId]?.barcode || ''
    });
    setEditingItem(null);
  };

  // Helper function to format numbers with commas as thousand separators
  const formatPrice = (num) => {
    if (num === null || num === undefined) return '0.00';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>صفحة المخزن</h1>
      
      {/* زر إجمالي الكمية والسعر وزر حذف كل المنتجات */}
      <div style={styles.totalQuantityContainer}>
        <button style={styles.totalQuantityButton}>
          إجمالي الكمية: {totalQuantity}
        </button>
        <button style={{...styles.totalQuantityButton, marginLeft: '10px'}}>
          إجمالي السعر: {formatPrice(totalPrice.toFixed(2))}
        </button>
        <button
          style={{...styles.totalQuantityButton, marginLeft: '10px', backgroundColor: '#e74c3c'}}
          onClick={() => {
            if (window.confirm('هل أنت متأكد من حذف كل منتجات المخزن؟')) {
              onDeleteAllProducts();
            }
          }}
        >
          حذف كل منتجات المخزن
        </button>
      </div>

      {processedItems.length === 0 ? (
        <p style={styles.noProducts}>لا توجد منتجات في المخزن.</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>اسم المنتج</th>
                <th style={styles.th}>الباركود</th>
                <th style={styles.th}>الكمية</th>
                <th style={styles.th}>السعر</th>
                <th style={styles.th}>التصنيف</th>
                <th style={styles.th}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item, index) => {
                const product = productMap[item.productId];
                return (
                  <tr key={`${item.productId}-${index}`} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{product?.name || '--'}</td>
                    <td style={styles.td}>{product?.barcode || '--'}</td>
                    <td style={styles.td}>
                      {editingItem?.productId === item.productId ? (
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) => {
                            const newQuantity = e.target.value;
                            setEditForm(prev => ({
                              ...prev,
                              quantity: newQuantity,
                              price: (250 * newQuantity).toFixed(2) // Price increments by 250 per quantity
                            }));
                          }}
                          style={styles.input}
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingItem?.productId === item.productId ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                          style={styles.input}
                        />
                      ) : (
                        formatPrice(product?.price?.toFixed(2)) || '0.00'
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingItem?.productId === item.productId ? (
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          style={styles.input}
                        />
                      ) : (
                        product?.category || '--'
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingItem?.productId === item.productId ? (
                        <>
                          <button onClick={handleSaveEdit} style={styles.saveButton}>
                            حفظ
                          </button>
                          <button 
                            onClick={() => setEditingItem(null)} 
                            style={styles.cancelButton}
                          >
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(item)} 
                            style={styles.editButton}
                          >
                            تعديل
                          </button>
                          <button 
                            onClick={() => handleDelete(item.productId)} 
                            style={styles.deleteButton}
                          >
                            حذف
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// الأنماط المحدثة
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '20px'
  },
  totalQuantityContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  totalQuantityButton: {
    padding: '12px 24px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '30px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  th: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '12px',
    textAlign: 'right',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ecf0f1',
    textAlign: 'right'
  },
  tr: {
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  input: {
    width: '60px',
    padding: '5px',
    textAlign: 'center'
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '5px'
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '5px'
  },
  saveButton: {
    padding: '5px 10px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '5px'
  },
  cancelButton: {
    padding: '5px 10px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '5px'
  },
  noProducts: {
    textAlign: 'center',
    color: '#e74c3c',
    padding: '20px',
    fontSize: '18px',
    backgroundColor: '#f8d7da',
    borderRadius: '5px'
  }
};

// التحقق من أنواع الخصائص
WarehousePage.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      barcode: PropTypes.string,
      price: PropTypes.number,
      category: PropTypes.string
    })
  ).isRequired,
  warehouse: PropTypes.arrayOf(
    PropTypes.shape({
      productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      quantity: PropTypes.number.isRequired
    })
  ).isRequired,
  onDeleteProduct: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onUpdateWarehouse: PropTypes.func.isRequired,
  cartItems: PropTypes.array.isRequired,
};

export default WarehousePage;