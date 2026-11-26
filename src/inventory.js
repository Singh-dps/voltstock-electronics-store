export const storageKey = 'voltstock.inventory.v1';

const examples = [
  { id: 'sample-headphones', name: 'Studio headphones', brand: 'Audio-Technica', price: 7499, image: 'headphones' },
  { id: 'sample-keyboard', name: 'Mechanical keyboard', brand: 'Keychron', price: 6499, image: 'keyboard' },
  { id: 'sample-controller', name: 'Wireless controller', brand: 'Logitech', price: 3299, image: 'controller' },
];

export function loadInventory() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const records = JSON.parse(saved);
      if (Array.isArray(records) && records.every(product =>
        product && typeof product.id === 'string' && typeof product.name === 'string' &&
        typeof product.brand === 'string' && Number.isFinite(product.price) && product.price > 0
      )) return records;
    }
  } catch {
    // Browser storage may be unavailable. The inventory still works in memory.
  }
  return examples;
}

export const formatPrice = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
