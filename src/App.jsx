import React, { useEffect, useState } from 'react';
import ElectronicsCard from './components/ElectronicsCard';
import ProductForm from './components/ProductForm';
import { loadInventory, sortProducts, storageKey } from './inventory';

export default function App() {
  const [products, setProducts] = useState(loadInventory);
  const [order, setOrder] = useState('default');
  const visibleProducts = sortProducts(products, order);
  const [message, setMessage] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(products));
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
  }, [products]);

  function addProduct(product) {
    setProducts(current => [product, ...current]);
    setMessage(product.name + ' added.');
  }

  function deleteProduct(product) {
    setProducts(current => current.filter(item => item.id !== product.id));
    setMessage(product.name + ' deleted.');
  }

  return (
    <>
      <header><div className="wrapper header-inner">
        <div className="wordmark"><span className="logo" aria-hidden="true">ϟ</span>Voltstock</div>
        <span className="nav-item"><span className="grid-icon" aria-hidden="true">▦</span> Inventory</span>
      </div></header>
      <main className="wrapper">
        <section className="hero">
          <div><h1>Product inventory</h1><p>Manage the electronics on your shelves.</p></div>
          <img className="hero-art" src="./art/workstation.png" alt="" />
        </section>
        <div className="workspace">
          <ProductForm onAdd={addProduct} />
          <section className="catalog panel" aria-labelledby="catalog-title">
            <div className="catalog-heading"><h2 id="catalog-title">Product catalog</h2><span className="count">{products.length} {products.length === 1 ? 'product' : 'products'}</span></div>
            {products.length ? (
              <>
                <label className="sort-control">
                  Sort by
                  <select value={order} onChange={event => setOrder(event.target.value)}>
                    <option value="default">Default order</option>
                    <option value="price-asc">Price (low to high)</option>
                    <option value="price-desc">Price (high to low)</option>
                    <option value="brand-asc">Brand (A–Z)</option>
                    <option value="brand-desc">Brand (Z–A)</option>
                    <option value="category-asc">Category (A–Z)</option>
                    <option value="category-desc">Category (Z–A)</option>
                  </select>
                </label>
                <ul>{visibleProducts.map(product => <ElectronicsCard key={product.id} product={product} onDelete={deleteProduct} />)}</ul>
              </>
            ) : (
              <div className="empty"><img src="./art/chip.png" alt="" /><h3>No products available</h3><p>Add your first product using the form.</p></div>
            )}
          </section>
        </div>
        {storageUnavailable && <p role="alert">Browser storage is unavailable. Changes will last for this session.</p>}
        <div className="sr-only" role="status">{message}</div>
      </main>
    </>
  );
}
