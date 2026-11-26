import { additionalSamples, originalSamples } from './sampleProducts.js';

export const storageKey = 'voltstock.inventory.v2';
const previousStorageKey = 'voltstock.inventory.v1';

const samples = [...originalSamples, ...additionalSamples];
const sampleCategories = new Map(samples.map(product => [product.id, product.category]));
export const defaultCategory = 'Other';
export const categories = [...new Set(sampleCategories.values())].sort().concat(defaultCategory);

const alphabetic = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

export function sortProducts(products, order) {
  if (order === 'default') return products;
  const [field, direction] = order.split('-');
  const multiplier = direction === 'desc' ? -1 : 1;
  return [...products].sort((a, b) => {
    const comparison = field === 'price'
      ? a.price - b.price
      : alphabetic.compare(a[field], b[field]);
    return multiplier * comparison;
  });
}

function readRecords(key) {
  const saved = localStorage.getItem(key);
  if (saved === null) return null;
  const records = JSON.parse(saved);
  const valid = Array.isArray(records) && records.every(product =>
    product && typeof product.id === 'string' && typeof product.name === 'string' &&
    typeof product.brand === 'string' && Number.isFinite(product.price) && product.price > 0
  );
  if (!valid) return null;
  return records.map(product => ({
    ...product,
    category: categories.includes(product.category)
      ? product.category
      : sampleCategories.get(product.id) ?? defaultCategory,
  }));
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
  return samples;
}

export const formatPrice = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
