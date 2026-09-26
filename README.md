# StockSense IMS

**StockSense IMS** is a modern inventory management system built with **React, Vite, Node.js, Express, and MongoDB**. It provides a dashboard for managing products, monitoring stock levels, and tracking inventory information.

> **Project Status:** 🚧 Currently under development.
> The frontend is functional with demo data, while the backend API is being developed and integrated.

---

## ✨ Features

* 📊 Responsive inventory dashboard
* 🔎 Product search and filtering
* 📦 Product and inventory management
* ⚠️ Low-stock and stock-status monitoring
* 💰 Inventory value summary
* ➕ Add new products
* 📈 Dashboard summary cards
* 🔐 Backend API scaffold
* 🗄️ Optional MongoDB/Mongoose integration
* ⚡ Fast development with Vite

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite 8
* JavaScript
* HTML5
* CSS3

### Backend

* Node.js
* Express 5

### Database

* MongoDB
* Mongoose

### Development Tools

* npm
* Git
* GitHub
* ESLint

---

## 📁 Project Structure

```text
StockSense-IMS/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   └── services/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚙️ Requirements

Before running the project, make sure you have:

* **Node.js 20+**
* **npm**
* **MongoDB** *(optional — required only when database integration is enabled)*
* Git

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <repository-url>
cd StockSense-IMS
```

---

## 2. Run the Frontend

Navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL, usually:

```text
http://localhost:5173
```

### Frontend Commands

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

# 🖥️ Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
NODE_ENV=development

USE_MONGOOSE=true
MONGODB_URI=mongodb://127.0.0.1:27017/stocksense
```

Then start the server:

```bash
node server.js
```

The intended API base URL is:

```text
http://localhost:5000/api
```

Health-check endpoint:

```text
GET /api/health
```

---

## 🗄️ MongoDB Configuration

MongoDB is optional.

To enable MongoDB:

```env
USE_MONGOOSE=true
MONGODB_URI=mongodb://127.0.0.1:27017/stocksense
```

To run the server without MongoDB:

```env
USE_MONGOOSE=false
```

Make sure `.env` is included in `.gitignore` so credentials and connection strings are not committed to GitHub.

---

# 🔌 API

The backend is designed around a REST API structure.

### Base URL

```text
http://localhost:5000/api
```

### Health Check

```http
GET /api/health
```

Additional API modules are planned for:

* Authentication
* Inventory
* Products
* Warehouses
* Transactions
* Ledger
* Dashboard

---

# 📌 Current Project Status

### Frontend

The React frontend currently supports:

* Dashboard UI
* Product listing
* Product search
* Stock filtering
* Adding products
* Inventory summary
* Demo data stored in browser memory

> **Note:** Product changes are currently not persisted after a page reload.

### Backend

The Express backend is currently under development.

Planned backend functionality includes:

* Authentication
* Product management
* Inventory management
* Warehouse management
* Stock transactions
* Ledger management
* Dashboard APIs
* MongoDB persistence

The frontend is **not yet fully connected to the backend API**.

---

# 🗺️ Roadmap

* [x] React/Vite frontend setup
* [x] Inventory dashboard
* [x] Product search and filtering
* [x] Stock status calculation
* [ ] Connect frontend with Express API
* [ ] Implement authentication
* [ ] Implement product CRUD APIs
* [ ] Implement inventory APIs
* [ ] Implement warehouse management
* [ ] Implement transaction management
* [ ] Connect MongoDB
* [ ] Add persistent data storage
* [ ] Add role-based access control
* [ ] Add production deployment

---

# 🤝 Contributing

Contributions are welcome.

1. Create a new branch:

```bash
git checkout -b feature/your-feature
```

2. Make your changes.

3. Test the changes:

```bash
npm run lint
npm run build
```

4. Commit your changes:

```bash
git add .
git commit -m "Add your feature"
```

5. Push your branch:

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

---

# 📄 License

This project is currently intended for educational and development purposes.
