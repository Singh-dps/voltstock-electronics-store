# Voltstock · Electronics Store Management System

Voltstock is a single-page React application for maintaining a store's electronic product records. Each record has a product name, brand, and price in Indian rupees. The first visit opens with three removable sample products.

**[Open the live demo on Vercel](https://voltstock-inventory-5154.vercel.app)** · **[Read the LISA project report](output/pdf/LISA-Electronics-Store.pdf)**

## Run locally

Install Node.js 22.12 or later and npm. Clone this repository using the URL under GitHub's **Code** button, or download and extract its ZIP. Open a terminal in the folder containing `package.json` and run:

```sh
npm ci
npm run dev
```

Open the local address Vite prints in the terminal. To check the production build, stop the development server and run:

```sh
npm run build
npm run preview
```

No API keys, environment variables, or database setup are required.

## Features

- **Add a product.** Enter a name, brand, and positive price with up to two decimal places. The form trims surrounding spaces and rejects blank names or brands.
- **View records.** Each reusable product card displays the name, brand, and formatted price. New records appear first and the count updates immediately.
- **Delete a product.** Use the bin button on its card. A unique ID identifies each record, so two products can share a name.
- **Start again from an empty catalog.** Removing the last product shows an empty-state message. The same form remains available.
- **Keep changes on refresh.** Records use this browser's local storage. Each browser profile maintains its own inventory. If browser storage is unavailable, the page displays a notice and continues working in memory.

## Screenshots

### Inventory with three sample records

![Product form alongside headphones, keyboard, and controller records](docs/screenshots/inventory.png)

### After deleting the last record

![Empty catalog with the add-product form still available](docs/screenshots/empty-inventory.png)

## Tech stack and component structure

React manages the interface, Vite serves and builds it, and CSS Grid adapts the layout for desktop and mobile. Vercel serves the production build. The pixel-art illustrations were drawn for this project.

| Source file | Responsibility |
| --- | --- |
| `src/main.jsx` | Mounts the React application and loads the stylesheet. |
| `src/App.jsx` | Owns the product array with `useState`, adds and removes records, and chooses between cards and the empty state. A `useEffect` saves changes to browser storage. |
| `src/components/ProductForm.jsx` | Validates input and passes a new record to the parent through `onAdd`. |
| `src/components/ElectronicsCard.jsx` | Receives a product and an `onDelete` callback through props. |
| `src/inventory.js` | Loads saved or sample products and provides the INR price formatter. |
| `src/styles.css` | Defines the responsive layout, visual states, and keyboard focus indicators. |

## Verify the core flow

1. Open the live demo in a fresh browser profile. The catalog shows three sample products.
2. Enter **USB-C hub**, **Anker**, and **2499.50**. Select **Add Product**. The new card appears first and the count rises to four.
3. Reload the page. The new record remains.
4. Delete the hub and check that the three other records remain. Delete those records and reload. The page displays **No products available**.
5. Add a product to the empty catalog. Its card replaces the empty message.
