import React from 'react';

const Cart = ({ cartItems, onUpdateQuantity, discount = 0, tax = 0 }) => {
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price || 0) * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

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
                <div>
                  <div>{item.product.name}</div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>
                    {item.product.price} ر.س × {item.quantity}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  <span>{item.quantity}</span>
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
                  <div>
                    {(item.product.price * item.quantity).toFixed(2)} ر.س
                  </div>
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

export default Cart;
