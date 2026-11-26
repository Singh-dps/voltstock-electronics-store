import React, { useEffect, useId, useState } from 'react';
import ElectronicsCard from './components/ElectronicsCard';
import ProductForm from './components/ProductForm';
import { loadInventory, sortProducts, storageKey } from './inventory';

export default function App() {
  const [products, setProducts] = useState(loadInventory);
  const [order, setOrder] = useState('default');
  const visibleProducts = sortProducts(products, order);
  const [message, setMessage] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const sortId = useId();

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
        <div className="wordmark">
          <span className="logo" aria-hidden="true">ϟ</span>
          <span>Voltstock</span>
          <span className="terminal-path" aria-hidden="true">~/inventory</span>
        </div>
        <div className="header-meta">
          <span className="sys-status" aria-hidden="true"><span className="status-dot" />SYS:ONLINE</span>
          <span className="nav-item"><span className="grid-icon" aria-hidden="true">▦</span> Inventory</span>
        </div>
      </div></header>
      <main className="wrapper">
        <section className="hero" aria-label="Inventory overview">
          <div className="hero-copy">
            <div className="terminal-chrome" aria-hidden="true">
              <span className="chrome-dots"><i /><i /><i /></span>
              <span className="chrome-label">tty1 · VOLTSTOCK-OS</span>
              <span className="chrome-badge">READY</span>
            </div>
            <h1>Product inventory<span className="cursor" aria-hidden="true">_</span></h1>
            <p><span className="prompt-prefix" aria-hidden="true">&gt; </span>Manage the electronics on your shelves.</p>
          </div>
          <img className="hero-art" src="./art/workstation.png" alt="" />
        </section>
        <div className="workspace">
          <ProductForm onAdd={addProduct} />
          <section className="catalog panel" aria-labelledby="catalog-title">
            <div className="panel-bar" aria-hidden="true">
              <span>CATALOG // READOUT</span>
              <span>SORT:{order.toUpperCase()}</span>
            </div>
            <div className="catalog-heading">
              <h2 id="catalog-title">Product catalog</h2>
              <span className="count">{products.length} {products.length === 1 ? 'product' : 'products'}</span>
            </div>
            {products.length ? (
              <>
                <div className="catalog-toolbar">
                  <label className="sort-control" htmlFor={sortId}>
                    <span className="prompt-prefix" aria-hidden="true">$</span> Sort by
                  </label>
                  <select id={sortId} name="sortOrder" className="terminal-select" value={order} onChange={event => setOrder(event.target.value)}>
                    <option value="default">Default order</option>
                    <option value="price-asc">Price (low to high)</option>
                    <option value="price-desc">Price (high to low)</option>
                    <option value="brand-asc">Brand (A–Z)</option>
                    <option value="brand-desc">Brand (Z–A)</option>
                    <option value="category-asc">Category (A–Z)</option>
                    <option value="category-desc">Category (Z–A)</option>
                  </select>
                </div>
                <ul>{visibleProducts.map(product => <ElectronicsCard key={product.id} product={product} onDelete={deleteProduct} />)}</ul>
              </>
            ) : (
              <div className="empty">
                <img src="./art/chip.png" alt="" />
                <h3>No products available</h3>
                <p>Add your first product using the form.</p>
              </div>
            )}
          </section>
        </div>
        {storageUnavailable && <p className="storage-alert" role="alert">Browser storage is unavailable. Changes will last for this session.</p>}
        <div className="sr-only" role="status">{message}</div>
      </main>
    </>
  );
}
