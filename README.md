# StockSense IMS

StockSense IMS is an inventory management app with a React dashboard and an Express API scaffold.

The client currently runs with demo data in browser memory. You can search and filter products and add items, but changes are not saved after a page reload, and the client is not connected to the API yet.

## Features

- Responsive inventory dashboard
- Product search and stock status filters
- Summary cards for product counts, stock alerts, and inventory value
- Add product form with stock status calculated from quantity
- Express API scaffold with an intended health endpoint at `/api/health`

## Technology

- React 19 and Vite
- Node.js and Express 5
- Mongoose for optional MongoDB connectivity

## Project structure

```text
.
├── client/             # React and Vite frontend
│   ├── src/
│   └── package.json
├── server/             # Express API scaffold
│   ├── src/services/
│   ├── app.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Run the frontend

Install dependencies and start the Vite development server:

```bash
cd client
npm install
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

Available client scripts:

```bash
npm run dev      # Start the development server
npm run build    # Build the frontend for production
npm run preview  # Preview a production build
npm run lint     # Run ESLint
```

## API status

The Express server is not runnable yet. `server/app.js` imports route modules and error middleware that are not currently present in the repository, so starting `server/server.js` fails with a module-not-found error. The client uses local demo data and does not call the API.

The server is configured to connect to MongoDB only when `USE_MONGOOSE=true` and `MONGODB_URI` is set. For example, after the missing API modules are implemented, create `server/.env` with:

```env
PORT=5000
NODE_ENV=development
USE_MONGOOSE=true
MONGODB_URI=mongodb://127.0.0.1:27017/stocksense
```

The intended API base URL is `http://localhost:5000/api`; the intended health endpoint is `GET /api/health`.

## Requirements

- Node.js
- npm
- MongoDB only if you enable the Mongoose connection

## Contributing

Keep frontend and backend changes scoped to their respective directories. Before opening a pull request, run the relevant client lint and build commands.
