import React, { useRef } from 'react';

export default function ProductForm({ onAdd }) {
  const nameInput = useRef(null);

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
    onAdd({ id: crypto.randomUUID(), name, brand, price });
    form.reset();
    nameInput.current.focus();
  }

  return (
    <section className="form-panel panel" aria-labelledby="form-title">
      <h2 id="form-title">Add a product</h2>
      <form onSubmit={handleSubmit} onInput={e => e.target.setCustomValidity('')}>
        <label>Product name<input ref={nameInput} name="productName" placeholder="e.g. Wireless mouse" required maxLength={100} /></label>
        <label>Brand name<input name="brand" placeholder="e.g. Logitech" required maxLength={80} /></label>
        <label>Product price
          <span className="price-field"><span aria-hidden="true">₹</span><input aria-label="Product price in rupees" name="price" type="number" inputMode="decimal" placeholder="0.00" min="0.01" max="999999999.99" step="0.01" required /></span>
        </label>
        <button type="submit" className="add-button"><span aria-hidden="true">+</span> Add Product</button>
      </form>
    </section>
  );
}
