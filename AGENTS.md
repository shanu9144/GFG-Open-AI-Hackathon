# ShopLedger

## Stack

- Node.js, CommonJS modules, Express 4, and `body-parser` JSON middleware.
- The browser UI is static HTML, CSS, and plain JavaScript served from `public/`.
- Application state is stored in `data/db.json` through synchronous filesystem reads and writes; there is no external database.

## Module map

- `server.js` configures Express, serves the UI, mounts API routers, and serves the invoice route.
- `routes/products.js`, `routes/orders.js`, `routes/customers.js`, and `routes/reports.js` implement the product, order, customer, and reporting endpoints.
- `lib/store.js` reads and writes JSON state and appends audit entries. `lib/orders.js`, `lib/inventory.js`, `lib/pricing.js`, `lib/tax.js`, `lib/coupons.js`, `lib/ledger.js`, `lib/reports.js`, `lib/invoice.js`, and `lib/dates.js` hold order, inventory, pricing, tax, coupon, Khata, report, invoice, and date logic.
- `config.js` contains the port, shop details, tax slabs, inventory defaults, and coupons.
- `data/db.json` contains the application's current products, orders, customers, settlements, and audit log.

## Commands

- `npm start` runs `node server.js` and listens on `PORT` or port `3000`.
- `npm test` is currently a placeholder that prints `Error: no test specified` and exits with status 1. No automated test suite is currently configured.

## Working rules

- Write characterization tests before changing behaviour.
- Change only the module the ticket is about.
- Tests must never read, write, or otherwise touch `data/db.json`; use in-memory data instead.
- Add no dependencies.
