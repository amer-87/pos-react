import React, { useRef, useState } from 'react';
import ReceiptPrinter from './ReceiptPrinter';
import useBarcodeScanner from './BarcodeScanner';
import Cart from './Cart';

const SellerPage = ({ products, cartItems, onAddToCart, onUpdateQuantity, onReduceWarehouseStock, warehouse, onClearCart }) => {
  const videoRef = useRef(null);
  const [productName, setProductName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories from products for filter dropdown
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

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

  const handleAddByName = () => {
    if (!productName.trim()) {
      alert('Please enter a product name.');
      return;
    }
    const product = products.find(p => p.name.toLowerCase() === productName.trim().toLowerCase());
    if (product) {
      const stockItem = warehouse.find(item => item.productId === product.id);
      if (stockItem && stockItem.quantity > 0) {
        handleAddToCart(product);
        setProductName('');
      } else {
        alert('The product is not in stock.');
      }
    } else {
      alert('Product not found with the given name.');
    }
  };

  useBarcodeScanner(videoRef, onDetect, true);

  return (
    <div className="seller-page-container">
      <h1 className="seller-page-title">صفحة البيع</h1>
      <div className="product-name-entry">
      <input
          type="text"
          placeholder="أدخل اسم المنتج للبيع"
          value={productName}
      onChange={(e) => setProductName(e.target.value)}
      className="product-name-input"
      onInput={(e) => {
        const input = e.target.value.toLowerCase();
        setProductName(e.target.value);
        setActiveSuggestionIndex(-1);
        if (input.length === 0) {
          setSuggestions([]);
          return;
        }
        // Filter products by category if selectedCategory is not 'All'
        const filteredProducts = products.filter(p => {
          const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
          const inStock = warehouse.find(item => item.productId === p.id && item.quantity > 0);
          return matchesCategory && inStock;
        });

        // Fuzzy search or partial matching for product name
        const filtered = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(input)
        ).map(p => p.name);

        setSuggestions(filtered);
      }}
      onKeyDown={(e) => {
        if (suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            if (nextIndex >= suggestions.length) return 0;
            return nextIndex;
          });
          setProductName(suggestions[(activeSuggestionIndex + 1) % suggestions.length]);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) => {
            const nextIndex = prevIndex - 1;
            if (nextIndex < 0) return suggestions.length - 1;
            return nextIndex;
          });
          setProductName(suggestions[(activeSuggestionIndex - 1 + suggestions.length) % suggestions.length]);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
            setProductName(suggestions[activeSuggestionIndex]);
            setSuggestions([]);
            handleAddByName();
          }
        }
      }}
    />
    <button onClick={handleAddByName} className="add-product-button">إضافة المنتج</button>
      {suggestions.length > 0 && (
      <ul className="suggestions-list">
        {suggestions.map((name, index) => (
          <li key={index} onClick={() => {
            setProductName(name);
            setSuggestions([]);
          }} className={index === activeSuggestionIndex ? 'active-suggestion' : ''}>
            {name}
          </li>
        ))}
      </ul>
      )}
  </div>
  <div className="main-content-row">
    <div className="barcode-scanner">  
      <div className="video-container">
        <video ref={videoRef} className="barcode-video" />
      </div>
    </div>
    {products.length === 0 ? (
      <p className="no-products-message">لا توجد منتجات متاحة للبيع.</p>
    ) : (
      <div className="cart-receipt-container">
        <h2 className="cart-title">السلة</h2>
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
</div>
  );
};

export default SellerPage;
