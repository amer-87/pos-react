import React from 'react';
import PropTypes from 'prop-types';
import { calculateTotals, formatPrice } from './utils/calcTotals';

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
    <div className="cart-container">
      <h2 className="cart-title">العربة</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart-message">العربة فارغة</div>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-details">
                    <span className="cart-item-price">السعر: {formatPrice(item.product.price)} ر.س</span>
                    <span className="cart-item-quantity">الكمية: {item.quantity}</span>
                  </div>
                </div>
                <div className="cart-item-total">
                  الإجمالي: {formatPrice(item.product.price * item.quantity)} ر.س
                </div>
                <div className="cart-item-buttons">
                  <button
                    onClick={() => handleDecrease(item.product.id, item.quantity)}
                    className="quantity-button decrease-button"
                    aria-label="تقليل الكمية"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleIncrease(item.product.id, item.quantity)}
                    className="quantity-button increase-button"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary-row">
            <span>الإجمالي الفرعي:</span>
            <span>{formatPrice(subtotal)} ر.س</span>
          </div>
          <div className="cart-summary-row">
            <span>الخصم:</span>
            <span>{formatPrice(discountAmount)} ر.س</span>
          </div>
          <div className="cart-summary-row">
            <span>الضريبة:</span>
            <span>{formatPrice(taxAmount)} ر.س</span>
          </div>
          <div className="cart-summary-total">
            <span>الإجمالي:</span>
            <span>{formatPrice(total)} ر.س</span>
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
