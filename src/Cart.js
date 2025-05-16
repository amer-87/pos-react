import React from 'react';
import PropTypes from 'prop-types';
import { calculateTotals } from './utils/calcTotals';

const Cart = ({ cartItems, onUpdateQuantity, discount = 0, tax = 0 }) => {
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(cartItems, discount, tax);

  const handleDecrease = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(productId, currentQuantity - 1);
    } else {
      // Optionally confirm removal
      if (window.confirm('هل تريد إزالة هذا المنتج من العربة؟')) {
        onUpdateQuantity(productId, 0);
      }
    }
  };

  const handleIncrease = (productId, currentQuantity) => {
    onUpdateQuantity(productId, currentQuantity + 1);
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #eee',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h2 style={{ marginBottom: '15px' }}>العربة</h2>
      
      {cartItems.length === 0 ? (
        <div>العربة فارغة</div>
      ) : (
        <>
          <div style={{ marginBottom: '15px' }}>
            {cartItems.map((item, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{item.product.name}</div>
                  <div style={{ fontSize: '0.9em', color: '#444', marginTop: '4px' }}>
                    <span style={{ marginRight: '15px' }}>السعر: {item.product.price.toFixed(2)} ر.س</span>
                    <span>الكمية: {item.quantity}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1em', minWidth: '80px', textAlign: 'right', color: '#222' }}>
                  الإجمالي: {(item.product.price * item.quantity).toFixed(2)} ر.س
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '15px' }}>
                  <button
                    onClick={() => handleDecrease(item.product.id, item.quantity)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    aria-label="تقليل الكمية"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleIncrease(item.product.id, item.quantity)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            padding: '10px 0',
            borderTop: '1px solid #ddd',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>الإجمالي الفرعي:</span>
            <span>{subtotal.toFixed(2)} ر.س</span>
          </div>
          <div style={{
            padding: '10px 0',
            borderTop: '1px solid #ddd',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>الخصم:</span>
            <span>{discountAmount.toFixed(2)} ر.س</span>
          </div>
          <div style={{
            padding: '10px 0',
            borderTop: '1px solid #ddd',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>الضريبة:</span>
            <span>{taxAmount.toFixed(2)} ر.س</span>
          </div>
          <div style={{
            padding: '10px 0',
            borderTop: '2px solid #000',
            fontWeight: 'bold',
            fontSize: '18px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>الإجمالي:</span>
            <span>{total.toFixed(2)} ر.س</span>
          </div>
        </>
      )}
    </div>
  );
};

Cart.propTypes = {
  cartItems: PropTypes.array.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  discount: PropTypes.number,
  tax: PropTypes.number,
};

export default Cart;
