import { additionalSamples, originalSamples } from './sampleProducts.js';

export const storageKey = 'voltstock.inventory.v2';
const previousStorageKey = 'voltstock.inventory.v1';

function readRecords(key) {
  const saved = localStorage.getItem(key);
  if (saved === null) return null;
  const records = JSON.parse(saved);
  const valid = Array.isArray(records) && records.every(product =>
    product && typeof product.id === 'string' && typeof product.name === 'string' &&
    typeof product.brand === 'string' && Number.isFinite(product.price) && product.price > 0
  );
  return valid ? records : null;
}

export function loadInventory() {
  try {
    const current = readRecords(storageKey);
    if (current !== null) return current;

    const previous = readRecords(previousStorageKey);
    if (previous !== null) {
      if (previous.length === 0) return [];
      return [...previous, ...additionalSamples];
    }
  } catch {
    // The starter catalog also works when browser storage is unavailable.
  }
  return [...originalSamples, ...additionalSamples];
}

export const formatPrice = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
