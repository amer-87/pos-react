import React from 'react';
import ProductForm from './productForm';

const ProductList = ({ products, onDelete, onModify, cartItems = [], editingProductId, onCancelEdit, onSaveEdit, products: allProducts }) => {
  if (products.length === 0) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '8px', 
        textAlign: 'center'
      }}>
        لا يوجد منتجات متاحة
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #eee',
      borderRadius: '8px'
    }}>
      <h2 style={{ marginBottom: '15px' }}>قائمة المنتجات</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={styles.th}>اسم المنتج</th>
            <th style={styles.th}>الباركود</th>
            <th style={styles.th}>التصنيف</th>
            <th style={styles.th}>الكمية</th>
            <th style={styles.th}>السعر</th>
            <th style={styles.th}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            editingProductId === product.id ? (
              <tr key={product.id} style={styles.tr}>
                <td colSpan="6" style={styles.td}>
                  <ProductForm
                    initialData={product}
                    products={allProducts}
                    onEdit={(updatedProduct) => onSaveEdit(updatedProduct)}
                    onAddToWarehouse={() => {}}
                    existingBarcodes={allProducts.filter(p => p.id !== product.id).map(p => p.barcode)}
                  />
                  <button
                    onClick={onCancelEdit}
                    style={{
                      marginTop: '10px',
                      padding: '10px 20px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    إلغاء
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={product.id} style={styles.tr}>
                <td style={styles.td}>{product.name}</td>
                <td style={styles.td}>{product.barcode}</td>
                <td style={styles.td}>{product.category}</td>
                <td style={styles.td}>{product.quantity}</td>
                <td style={styles.td}>{product.price} دينار عراقي</td>
                <td style={styles.td}>
                  <button 
                    onClick={() => onModify(product.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                    aria-label="تعديل المنتج"
                  >
                    تعديل المنتج
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#3498db',
    color: 'white',
    textAlign: 'left'
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px'
  },
  tr: {
    ':nth-child(even)': {
      backgroundColor: '#f2f2f2'
    }
  }
};

export default ProductList;
