import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OwnerPage from './OwnerPage';
import SellerPage from './SellerPage';
import WarehousePage from './WarehousePage';

// تحقق من دعم BarcodeDetector وإضافة polyfill إذا لزم الأمر
if (!('BarcodeDetector' in window)) {
  // console.warn('Barcode Detection API is not supported in this browser');
  class BarcodeDetector {
    async detect() {
      return [];
    }
    async getSupportedFormats() {
      return [];
    }
  }
  window.BarcodeDetector = BarcodeDetector;
}

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  CART: 'cart',
  WAREHOUSE: 'warehouse'
};

const checkStorageQuota = (data) => {
  try {
    const testData = JSON.stringify(data);
    if (testData.length > 5 * 1024 * 1024) {
      console.warn("حجم البيانات تجاوز الحد المسموح به");
      return false;
    }
    return true;
  } catch (e) {
    console.error("خطأ في التحقق من حجم البيانات:", e);
    return false;
  }
};

const saveData = (key, data) => {
  try {
    if (checkStorageQuota(data)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error(`حدث خطأ أثناء تخزين البيانات في ${key}:`, e);
  }
};

const loadData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`حدث خطأ أثناء تحميل البيانات من ${key}:`, e);
    return [];
  }
};

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const quaggaInitialized = useRef(false);

  // تحميل البيانات عند التحميل الأولي مع تنظيف بيانات المخزن غير المتوافقة
  useEffect(() => {
    const loadedProducts = loadData(STORAGE_KEYS.PRODUCTS);
    const loadedWarehouse = loadData(STORAGE_KEYS.WAREHOUSE);

    // إنشاء مجموعة من معرفات المنتجات لتحقق التوافق
    const productIds = new Set(loadedProducts.map(p => p.id));

    // تصفية عناصر المخزن التي لها معرف منتج صالح فقط مع إزالة العناصر الفارغة أو غير الصالحة
    const filteredWarehouse = loadedWarehouse.filter(item => item && item.productId && productIds.has(item.productId));

    setProducts(loadedProducts);
    setCart(loadData(STORAGE_KEYS.CART));
    setWarehouse(filteredWarehouse);
  }, []);

  // حفظ البيانات عند التغيير
  useEffect(() => {
    saveData(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveData(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    saveData(STORAGE_KEYS.WAREHOUSE, warehouse);
  }, [warehouse]);

  // تهيئة Quagga.js إذا لزم الأمر
  useEffect(() => {
    if (!('BarcodeDetector' in window) && !quaggaInitialized.current) {
      import('@ericblade/quagga2').then((Quagga) => {
        window.Quagga = Quagga.default;
        quaggaInitialized.current = true;
      });
    }
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      // Always add a new entry for the product to have its own row
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId, quantity) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        // Remove item if quantity is zero or less
        return prevCart.filter(item => item.product.id !== productId);
      }
      return prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const addProduct = useCallback((product) => {
    return new Promise((resolve, reject) => {
      setProducts(prevProducts => {
        const isDuplicate = prevProducts.some(p => p.barcode === product.barcode);
        if (isDuplicate) {
          alert('الباركود موجود مسبقاً!');
          resolve(null);
          return prevProducts;
        }
        const newProduct = { ...product, id: Date.now() };
        resolve(newProduct);
        return [...prevProducts, newProduct];
      });
    });
  }, []);

  const deleteProduct = useCallback((id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(prev => prev.filter(prod => prod.id !== id));
      setCart(prev => prev.filter(item => item.product.id !== id));
      setWarehouse(prev => prev.filter(item => item.productId !== id));
    }
  }, []);

  const addToWarehouse = useCallback((productId, quantity) => {
    setWarehouse(prevWarehouse => {
      // Check if productId already exists in warehouse
      const existingEntryIndex = prevWarehouse.findIndex(item => item.productId === productId);
      if (existingEntryIndex !== -1) {
        // Update quantity of existing entry
        const updatedWarehouse = [...prevWarehouse];
        updatedWarehouse[existingEntryIndex] = {
          ...updatedWarehouse[existingEntryIndex],
          quantity: updatedWarehouse[existingEntryIndex].quantity + quantity
        };
        return updatedWarehouse;
      } else {
        // Add new entry for productId
        return [...prevWarehouse, { productId, quantity }];
      }
    });
  }, []);

  const reduceWarehouseStock = useCallback((productId, quantity) => {
    setWarehouse(prevWarehouse => {
      return prevWarehouse.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity - quantity;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      });
    });
  }, []);

  const setWarehouseQuantity = useCallback((productId, quantity) => {
    setWarehouse(prevWarehouse => {
      const index = prevWarehouse.findIndex(item => item.productId === productId);
      if (index !== -1) {
        const updatedWarehouse = [...prevWarehouse];
        updatedWarehouse[index] = { ...updatedWarehouse[index], quantity };
        return updatedWarehouse;
      }
      // If productId not found, add new entry
      return [...prevWarehouse, { productId, quantity }];
    });
  }, []);

  const clearAllData = () => {
    if (window.confirm('هل أنت متأكد أنك تريد مسح جميع البيانات؟')) {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.WAREHOUSE);
      setProducts([]);
      setCart([]);
      setWarehouse([]);
    }
  };

  const editProduct = useCallback((updatedProduct) => {
    setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);

  const deleteAllWarehouseProducts = () => {
    if (window.confirm('هل أنت متأكد من حذف كل منتجات المخزن؟')) {
      setWarehouse([]);
      localStorage.setItem(STORAGE_KEYS.WAREHOUSE, JSON.stringify([]));
    }
  };

  return (
    <Router>
      <nav style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', display: 'flex', gap: '20px' }}>
        <Link to="/owner" style={{ color: 'white', textDecoration: 'none' }}>الصفحة الرئيسية</Link>
        <Link to="/warehouse" style={{ color: 'white', textDecoration: 'none' }}>صفحة المخزن</Link>
        <Link to="/seller" style={{ color: 'white', textDecoration: 'none' }}>صفحة البيع</Link>
      </nav>
      <Routes>
        <Route path="/" element={<OwnerPage products={products} warehouse={warehouse} onAddProduct={addProduct} onDeleteProduct={deleteProduct} onAddToCart={addToCart} cartItems={cart} onAddToWarehouse={addToWarehouse} />} />
        <Route path="/owner" element={<OwnerPage products={products} warehouse={warehouse} onAddProduct={addProduct} onDeleteProduct={deleteProduct} onAddToCart={addToCart} cartItems={cart} onAddToWarehouse={addToWarehouse} />} />
        <Route path="/warehouse" element={<WarehousePage products={products} warehouse={warehouse} onAddProduct={addProduct} onAddToWarehouse={addToWarehouse} onDeleteProduct={deleteProduct} onAddToCart={addToCart} onUpdateWarehouse={setWarehouseQuantity} cartItems={cart} onEditProduct={editProduct} onDeleteAllProducts={deleteAllWarehouseProducts} />} />
        <Route path="/seller" element={<SellerPage products={products} cartItems={cart} onAddToCart={addToCart} onUpdateQuantity={updateCartQuantity} onReduceWarehouseStock={reduceWarehouseStock} warehouse={warehouse} />} />
      </Routes>
      {/* Removed the red "مسح كل منتجات المخزن" button as per user request */}
      {/* <div style={{ padding: '20px' }}>
        <button
          onClick={clearAllData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#c0392b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🗑️ مسح كل منتجات المخزن
        </button>
      </div> */}
    </Router>
  );
};

export default App;
