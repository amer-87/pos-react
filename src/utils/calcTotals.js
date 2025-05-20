export function calculateTotals(cartItems, discount = 0, tax = 0) {
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.product.price || 0) * item.quantity;
  }, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}

export function formatPrice(price) {
  if (price % 1 === 0) {
    return price.toFixed(0);
  } else {
    return price.toFixed(2);
  }
}
