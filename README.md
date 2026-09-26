# StockSense IMS

StockSense IMS is an inventory-management project with a React/Vite client and an Express API.

> **Project status:** This repository is currently a scaffold. The client source files are placeholders, and the API entry point refers to routes and middleware that have not yet been added. The client can be installed and run; the server will need those missing modules before it can start successfully.

## Tech stack

- React 19 and Vite 8
- Node.js and Express 5
- MongoDB/Mongoose (optional; the server is configured to use it only when enabled)

## Repository structure

```
.
├── client/              # React single-page application
│   ├── src/             # Application source code
│   └── package.json
├── server/              # Express API
│   ├── src/services/    # Server-side services
│   ├── app.js           # Express application configuration
│   ├── server.js        # Server entry point
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 20 or later
- npm
- MongoDB only if you plan to enable the Mongoose connection

## Run the client

```bash
cd client
npm install
npm run dev
```

Vite will print the local development URL, usually `http://localhost:5173`.

Other client commands:

```bash
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Server configuration

Create `server/.env` with the settings you need:

```env
PORT=5000
NODE_ENV=development

# Set both values to use MongoDB.
USE_MONGOOSE=true
MONGODB_URI=mongodb://127.0.0.1:27017/stocksense
```

When `USE_MONGOOSE` is not `true`, the server skips the MongoDB connection attempt.

After the missing route and middleware modules have been implemented, install and start the API with:

```bash
cd server
npm install
node server.js
```

The intended API base URL is `http://localhost:5000/api`; the health endpoint is `GET /api/health`.

## Current backend implementation note

`server/app.js` imports authentication, inventory, warehouse, transaction, ledger, dashboard, and error-handling modules. Those paths are not yet in this repository, so running `node server.js` currently results in a module-not-found error. Add the referenced `routes/` and `middleware/` files before enabling the API in development or deployment.

## Contributing

1. Create a branch for your change.
2. Keep client and server changes scoped to their respective directories.
3. Run the relevant lint/build checks before opening a pull request.
