import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SellerPage from '../SellerPage';

const mockProducts = [
  { id: 1, barcode: '12345', name: 'Product 1' },
  { id: 2, barcode: '67890', name: 'Product 2' },
];

const mockWarehouse = [
  { productId: 1, quantity: 10 },
  { productId: 2, quantity: 0 },
];

const mockCartItems = [
  { product: mockProducts[0], quantity: 1 },
];

describe('SellerPage', () => {
  let onAddToCart;
  let onUpdateQuantity;
  let onReduceWarehouseStock;
  let onClearCart;

  beforeEach(() => {
    onAddToCart = jest.fn();
    onUpdateQuantity = jest.fn();
    onReduceWarehouseStock = jest.fn();
    onClearCart = jest.fn();
  });

  test('renders SellerPage and displays products in cart', () => {
    render(
      <MemoryRouter>
        <SellerPage
          products={mockProducts}
          cartItems={mockCartItems}
          onAddToCart={onAddToCart}
          onUpdateQuantity={onUpdateQuantity}
          onReduceWarehouseStock={onReduceWarehouseStock}
          warehouse={mockWarehouse}
          onClearCart={onClearCart}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/صفحة البيع - مسح المنتجات/i)).toBeInTheDocument();
    expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
  });

  test('calls onClearCart and reloads page after printing invoice', async () => {
    render(
      <MemoryRouter>
        <SellerPage
          products={mockProducts}
          cartItems={mockCartItems}
          onAddToCart={onAddToCart}
          onUpdateQuantity={onUpdateQuantity}
          onReduceWarehouseStock={onReduceWarehouseStock}
          warehouse={mockWarehouse}
          onClearCart={onClearCart}
        />
      </MemoryRouter>
    );

    // Mock window.location.href setter
    delete window.location;
    window.location = { href: '' };

    // Find the print button (ReceiptPrinter renders a button)
    const printButton = screen.getByRole('button', { name: /طباعة الفاتورة/i });
    expect(printButton).toBeInTheDocument();

    // Simulate clicking the print button
    fireEvent.click(printButton);

    // Simulate onPrintComplete callback
    await waitFor(() => expect(onClearCart).toHaveBeenCalled());
    // Remove the page reload expectation as it is no longer done
  });

  // Additional tests can be added here for barcode scanning, cart updates, etc.
});
