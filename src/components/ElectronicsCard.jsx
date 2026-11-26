import React from 'react';
import { formatPrice } from '../inventory';

const images = new Set(['headphones', 'keyboard', 'controller']);

export default function ElectronicsCard({ product, onDelete }) {
  const illustration = images.has(product.image) ? product.image : 'chip';
  return (
    <li className="product-card">
      <div className={'thumbnail ' + illustration}><img src={'./art/' + illustration + '.png'} alt="" /></div>
      <div className="product-detail"><h3>{product.name}</h3><p>{product.brand}</p></div>
      <strong className="amount">{formatPrice.format(product.price)}</strong>
      <button type="button" className="delete-button" aria-label={'Delete ' + product.name} title={'Delete ' + product.name} onClick={() => onDelete(product)}>
        <span className="bin" aria-hidden="true" />
      </button>
    </li>
  );
}
