import React, { useEffect, useId, useRef, useState } from 'react';
import ElectronicsCard from './components/ElectronicsCard';
import ProductForm from './components/ProductForm';
import { categories, filterProducts, formatPrice, isListAllQuery, loadInventory, sortProducts, storageKey } from './inventory';

const quickCommands = [
  { label: 'sony', hint: 'Brand or name' },
  { label: 'cat:audio', hint: 'Audio category' },
  { label: 'price<3000', hint: 'Under ₹3,000' },
  { label: 'brand:logitech', hint: 'By brand' },
  { label: 'ls', hint: 'List all' },
];

export default function App() {
  const [products, setProducts] = useState(loadInventory);
  const [order, setOrder] = useState('default');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [lastAddedName, setLastAddedName] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  const searchInputRef = useRef(null);
  const searchId = useId();
  const filterId = useId();
  const sortId = useId();

  const hasQuery = query.trim() !== '';
  const showResults = hasQuery || categoryFilter !== 'all';
  const filteredProducts = showResults ? filterProducts(products, query, categoryFilter) : [];
  const visibleProducts = showResults ? sortProducts(filteredProducts, order) : [];

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

  useEffect(() => {
    function handleShortcut(event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable) return;
      if (!searchInputRef.current) return;
      event.preventDefault();
      searchInputRef.current.focus();
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  function addProduct(product) {
    setProducts(current => [product, ...current]);
    setLastAddedName(product.name);
    if (showResults && !isListAllQuery(query) && !filterProducts([product], query, categoryFilter).length) {
      setQuery(product.name);
      setCategoryFilter('all');
    }
    setMessage(product.name + ' added.');
  }

  function deleteProduct(product) {
    setProducts(current => current.filter(item => item.id !== product.id));
    if (lastAddedName === product.name) setLastAddedName('');
    setMessage(product.name + ' deleted.');
  }

  function clearFilters() {
    setQuery('');
    setCategoryFilter('all');
    searchInputRef.current?.focus();
  }

  function runCommand(command) {
    setQuery(command);
    searchInputRef.current?.focus();
  }

  return (
    <>
      <header className="site-header">
        <div className="wrapper header-inner">
          <div className="wordmark">
            <span className="logo" aria-hidden="true">ϟ</span>
            <span>Voltstock</span>
            <span className="terminal-path" aria-hidden="true">~/inventory/search</span>
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
              <span className="chrome-badge">QUERY MODE</span>
            </div>
            <h1>Product inventory<span className="cursor" aria-hidden="true">_</span></h1>
            <p><span className="prompt-prefix" aria-hidden="true">&gt; </span>Query electronics by name, brand, category, or price threshold.</p>
            <dl className="telemetry-grid" aria-label="Inventory summary">
              <div className="telemetry-cell">
                <dt>Indexed</dt>
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
              <span>TERMINAL // QUERY</span>
              <span>{showResults ? `MATCHES:${visibleProducts.length}` : 'STATE:STANDBY'}</span>
            </div>
            <div className="catalog-heading">
              <div>
                <h2 id="catalog-title">Terminal search</h2>
                {message && (
                  <p className="status-line" aria-hidden="true">
                    &gt; {message}
                    {!showResults && lastAddedName && (
                      <button type="button" className="inline-locate" onClick={() => runCommand(lastAddedName)}>
                        Locate
                      </button>
                    )}
                  </p>
                )}
              </div>
              <span className="count">
                {showResults
                  ? `${visibleProducts.length} of ${products.length} ${products.length === 1 ? 'match' : 'matches'}`
                  : `${products.length} ${products.length === 1 ? 'record' : 'records'} indexed`}
              </span>
            </div>

            {products.length ? (
              <>
                <search className="terminal-console" aria-label="Terminal product search">
                  <div className="prompt-row">
                    <label className="sr-only" htmlFor={searchId}>Search terminal query</label>
                    <span className="terminal-prompt" aria-hidden="true">voltstock:~$</span>
                    <input
                      ref={searchInputRef}
                      id={searchId}
                      type="search"
                      name="search"
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Escape' && query) {
                          event.preventDefault();
                          setQuery('');
                        }
                      }}
                      placeholder="type query (e.g. sony, cat:audio, price<3000, ls)..."
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                    {showResults && (
                      <button type="button" className="reset-button" onClick={clearFilters}>
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="terminal-controls">
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
                  </div>
                </search>

                {!showResults ? (
                  <div className="terminal-standby">
                    <p className="standby-title">
                      <span className="prompt-prefix" aria-hidden="true">&gt; </span>
                      Awaiting search query across {products.length} {products.length === 1 ? 'record' : 'records'}.
                    </p>
                    <p className="standby-help">
                      Press <kbd>/</kbd> to focus the prompt. Combine terms with spaces, use <code>brand:</code>, <code>cat:</code>, <code>price&lt;3000</code>, or run <code>ls</code> to show everything.
                    </p>
                    <div className="quick-commands" aria-label="Sample search commands">
                      {quickCommands.map(cmd => (
                        <button
                          key={cmd.label}
                          type="button"
                          className="cmd-chip"
                          onClick={() => runCommand(cmd.label)}
                        >
                          <span className="cmd-syntax">{cmd.label}</span>
                          <span className="cmd-hint">{cmd.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : visibleProducts.length ? (
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
                    <h3>No matching records</h3>
                    <p>No products matched <code>{query.trim() || categoryFilter}</code>.</p>
                    <button type="button" className="reset-button empty-reset" onClick={clearFilters}>
                      Clear query
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
