import React, { useId, useRef } from 'react';

import { categories, defaultCategory } from '../inventory';

export default function ProductForm({ onAdd }) {
  const nameInput = useRef(null);
  const baseId = useId();
  const nameId = baseId + '-name';
  const brandId = baseId + '-brand';
  const priceId = baseId + '-price';
  const categoryId = baseId + '-category';

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.productName.value.trim();
    const brand = form.elements.brand.value.trim();
    const price = form.elements.price.valueAsNumber;

    for (const [field, value] of [[form.elements.productName, name], [form.elements.brand, brand]]) {
      if (!value) {
        field.setCustomValidity('Please enter more than spaces.');
        field.reportValidity();
        return;
      }
    }
    onAdd({ id: crypto.randomUUID(), name, brand, price, category: form.elements.category.value });
    form.reset();
    nameInput.current.focus();
  }

  return (
    <section className="form-panel panel" aria-labelledby="form-title">
      <div className="panel-bar" aria-hidden="true">
        <span>INPUT // NEW_ENTRY</span>
        <span>MODE:WRITE</span>
      </div>
      <h2 id="form-title">Add a product</h2>
      <form aria-labelledby="form-title" onSubmit={handleSubmit} onInput={e => e.target.setCustomValidity('')}>
        <div className="field">
          <label htmlFor={nameId}>Product name</label>
          <input id={nameId} ref={nameInput} name="productName" placeholder="e.g. Wireless mouse" required maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor={brandId}>Brand name</label>
          <input id={brandId} name="brand" placeholder="e.g. Logitech" required maxLength={80} />
        </div>
        <div className="field">
          <label htmlFor={priceId}>Product price</label>
          <span className="price-field">
            <span className="currency-prefix" aria-hidden="true">₹</span>
            <input id={priceId} aria-label="Product price in rupees" name="price" type="number" inputMode="decimal" placeholder="0.00" min="0.01" max="999999999.99" step="0.01" required />
          </span>
        </div>
        <div className="field">
          <label htmlFor={categoryId}>Category</label>
          <select id={categoryId} className="terminal-select" name="category" defaultValue={defaultCategory}>
            {categories.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
        <button type="submit" className="add-button"><span aria-hidden="true">+</span> Add Product</button>
      </form>
    </section>
  );
}
