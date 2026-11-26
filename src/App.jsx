import React, { useEffect, useId, useState } from 'react';
import ElectronicsCard from './components/ElectronicsCard';
import ProductForm from './components/ProductForm';
import { categories, filterProducts, formatPrice, loadInventory, sortProducts, storageKey } from './inventory';

export default function App() {
  const [products, setProducts] = useState(loadInventory);
  const [order, setOrder] = useState('default');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  const searchId = useId();
  const filterId = useId();
  const sortId = useId();

  const filteredProducts = filterProducts(products, query, categoryFilter);
  const visibleProducts = sortProducts(filteredProducts, order);
  const hasFilters = query.trim() !== '' || categoryFilter !== 'all';

  const totalValue = products.reduce((sum, item) => sum + item.price, 0);
  const activeCategories = new Set(products.map(item => item.category)).size;

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
    if (hasFilters && !filterProducts([product], query, categoryFilter).length) {
      setQuery('');
      setCategoryFilter('all');
    }
    setMessage(product.name + ' added.');
  }

  function deleteProduct(product) {
    setProducts(current => current.filter(item => item.id !== product.id));
    setMessage(product.name + ' deleted.');
  }

  function clearFilters() {
    setQuery('');
    setCategoryFilter('all');
  }

  return (
    <>
      <header className="site-header">
        <div className="wrapper header-inner">
          <div className="wordmark">
            <span className="logo" aria-hidden="true">ϟ</span>
            <span>Voltstock</span>
            <span className="terminal-path" aria-hidden="true">~/inventory/catalog</span>
          </div>
          <div className="header-meta">
            <span className="sys-status" aria-hidden="true"><span className="status-dot" />SYS:ONLINE</span>
            <span className="nav-item"><span className="grid-icon" aria-hidden="true">▦</span> Inventory</span>
          </div>
        </div>
      </header>

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
            <dl className="telemetry-grid" aria-label="Inventory summary">
              <div className="telemetry-cell">
                <dt>Records</dt>
                <dd>{products.length}</dd>
              </div>
              <div className="telemetry-cell">
                <dt>Categories</dt>
                <dd>{activeCategories}</dd>
              </div>
              <div className="telemetry-cell">
                <dt>Stock value</dt>
                <dd className="telemetry-amber">{formatPrice.format(totalValue)}</dd>
              </div>
            </dl>
          </div>
          <div className="hero-bay" aria-hidden="true">
            <span className="bay-tag">CRT-01 // LIVE</span>
            <img className="hero-art" src="./art/workstation.png" alt="" />
          </div>
        </section>

        <div className="workspace">
          <ProductForm onAdd={addProduct} />
          <section className="catalog panel" aria-labelledby="catalog-title">
            <div className="panel-bar" aria-hidden="true">
              <span>CATALOG // READOUT</span>
              <span>SORT:{order.toUpperCase()}</span>
            </div>
            <div className="catalog-heading">
              <div>
                <h2 id="catalog-title">Product catalog</h2>
                {message && <p className="status-line" aria-hidden="true">&gt; {message}</p>}
              </div>
              <span className="count">
                {hasFilters
                  ? `${visibleProducts.length} of ${products.length} ${products.length === 1 ? 'product' : 'products'}`
                  : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
              </span>
            </div>

            {products.length ? (
              <>
                <search className={'catalog-toolbar' + (hasFilters ? ' has-filters' : '')} aria-label="Filter and sort products">
                  <div className="toolbar-field toolbar-search">
                    <label htmlFor={searchId}>Search</label>
                    <div className="search-input-wrap">
                      <span className="search-prefix" aria-hidden="true">/</span>
                      <input
                        id={searchId}
                        type="search"
                        name="search"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder="Filter name, brand, category..."
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="toolbar-field">
                    <label htmlFor={filterId}>Category</label>
                    <select
                      id={filterId}
                      name="categoryFilter"
                      className="terminal-select"
                      value={categoryFilter}
                      onChange={event => setCategoryFilter(event.target.value)}
                    >
                      <option value="all">All categories</option>
                      {categories.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>

                  <div className="toolbar-field">
                    <label htmlFor={sortId}>Sort by</label>
                    <select
                      id={sortId}
                      name="sortOrder"
                      className="terminal-select"
                      value={order}
                      onChange={event => setOrder(event.target.value)}
                    >
                      <option value="default">Default order</option>
                      <option value="price-asc">Price (low to high)</option>
                      <option value="price-desc">Price (high to low)</option>
                      <option value="brand-asc">Brand (A–Z)</option>
                      <option value="brand-desc">Brand (Z–A)</option>
                      <option value="category-asc">Category (A–Z)</option>
                      <option value="category-desc">Category (Z–A)</option>
                    </select>
                  </div>

                  {hasFilters && (
                    <button type="button" className="reset-button" onClick={clearFilters}>
                      Reset
                    </button>
                  )}
                </search>

                {visibleProducts.length ? (
                  <ul className="product-list">
                    {visibleProducts.map((product, index) => (
                      <ElectronicsCard
                        key={product.id}
                        product={product}
                        index={index + 1}
                        onDelete={deleteProduct}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="empty">
                    <img src="./art/chip.png" alt="" />
                    <h3>No matching products</h3>
                    <p>No records match your current search or category filter.</p>
                    <button type="button" className="reset-button empty-reset" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </div>
                )}
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
