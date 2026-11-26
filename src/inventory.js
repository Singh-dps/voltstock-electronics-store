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

export function isListAllQuery(query) {
  const trimmed = query.trim().toLowerCase();
  return trimmed === '--all' || trimmed === 'ls' || trimmed === '*';
}

function matchesToken(product, token) {
  if (token.startsWith('brand:')) {
    const term = token.slice(6);
    return !term || product.brand.toLowerCase().includes(term);
  }
  if (token.startsWith('cat:') || token.startsWith('category:')) {
    const term = token.slice(token.indexOf(':') + 1);
    return !term || product.category.toLowerCase().includes(term);
  }
  const priceMatch = token.match(/^price(<=|>=|<|>|=)(\d+(?:\.\d+)?)$/);
  if (priceMatch) {
    const [, op, rawAmount] = priceMatch;
    const amount = Number(rawAmount);
    if (op === '<') return product.price < amount;
    if (op === '<=') return product.price <= amount;
    if (op === '>') return product.price > amount;
    if (op === '>=') return product.price >= amount;
    return product.price === amount;
  }
  return (
    product.name.toLowerCase().includes(token) ||
    product.brand.toLowerCase().includes(token) ||
    product.category.toLowerCase().includes(token)
  );
}

export function filterProducts(products, query, category) {
  const trimmed = query.trim().toLowerCase();
  const listAll = isListAllQuery(trimmed);
  const tokens = listAll || !trimmed ? [] : trimmed.split(/\s+/);

  return products.filter(product => {
    if (category !== 'all' && product.category !== category) return false;
    return tokens.every(token => matchesToken(product, token));
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
