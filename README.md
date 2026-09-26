# StockSense — Modular Inventory Management System (IMS)

StockSense is an enterprise-grade, modular Inventory Management System inspired by **Odoo**, purpose-built to replace manual registers, Excel spreadsheets, and scattered tracking methods with a centralized, real-time, transaction-driven platform.

---

## 🚀 Key Features & Modules

### 1. Authentication & Security
- **Role-Based Access Control:** Target user personas for **Inventory Managers** (overview, approvals) and **Warehouse Staff** (transfers, picking, shelving, counting).
- **JWT Authentication:** Secure token-based session management.
- **OTP-Based Password Reset:** Complete recovery workflow (Forgot Password → 6-digit OTP verification → New Password setup).
- **Redirects:** Direct redirect to Inventory Dashboard upon authentication.
- **User Profile Management:** Edit name, contact phone, assigned warehouse facility, and change password.

### 2. Operational Dashboard (KPIs & Dynamic Filters)
- **Top 5 KPIs:**
  - **Total Products in Stock:** Total catalog count and cumulative units in stock.
  - **Low Stock / Out of Stock Items:** Dynamic alerts for items below reorder thresholds.
  - **Pending Receipts:** Incoming vendor shipments pending inspection and validation.
  - **Pending Deliveries:** Outgoing sales shipments pending dispatch.
  - **Internal Transfers Scheduled:** Active inter-facility moves.
- **Dynamic Multi-Filters:**
  - By Document Type: *Receipts*, *Deliveries*, *Internal Transfers*, *Adjustments*.
  - By Status: *Draft*, *Waiting (Picking/In-Transit)*, *Ready (Packed/Staged)*, *Done (Validated)*, *Cancelled*.
  - By Warehouse / Facility: *Main Warehouse*, *Secondary Warehouse*, *Production Facility*.
  - By Search: Instant live filtering across document numbers, suppliers, customers, and locations.
- **Quick Action Bar:** 1-click modal shortcuts for *New Receipt*, *New Delivery*, *New Transfer*, and *Stock Count*.

### 3. Product Master Catalog & Stock Availability
- **Master Product Attributes:** Name, SKU/Code, Category, Unit of Measure (kg, units, boxes, liters, meters), Initial Opening Stock, Reorder Level, and Description.
- **Stock Availability per Location:** Real-time visibility into exact rack/shelf distributions (e.g., `WH-MAIN-RACK-A`, `WH-MAIN-RACK-B`, `WH-PLANT-PROD`).
- **Product Categories:** Management of raw materials, finished goods, hardware, packaging, electronics.
- **Automated Reordering Rules:** Color-coded badges (*In Stock*, *Low Stock*, *Out of Stock*).

### 4. Operations & Transaction Engine
All movements adhere to an enterprise status workflow:
$$\text{Draft} \longrightarrow \text{Waiting} \longrightarrow \text{Ready} \longrightarrow \mathbf{\text{Done (Validated)}}$$

Stock mutations occur **strictly upon reaching the Validated (DONE) stage**, ensuring audit integrity:

1. **Receipts (Incoming Goods):**
   - Create receipt with supplier, destination rack, items, and quantities.
   - Validation automatically increments stock at destination location.
2. **Delivery Orders (Outgoing Goods):**
   - Pick $\rightarrow$ Pack $\rightarrow$ Validate workflow.
   - Atomic pre-validation checks guarantee no negative warehouse balances.
   - Validation automatically deducts stock and records customer dispatch.
3. **Internal Transfers:**
   - Relocate stock between racks or facilities (e.g., `Main Warehouse → Production Floor` or `Rack A → Rack B`).
   - Total company stock remains unchanged; location balances update atomically.
4. **Stock Adjustments (Physical Inventory Audit):**
   - Select product and location $\rightarrow$ system displays recorded quantity.
   - User inputs physical counted quantity $\rightarrow$ system computes exact discrepancy ($\Delta$).
   - Reason classification (*Damaged in transit*, *Misplaced*, *Scrapped/Expired*, *Counting Error*).
   - Reconciles stock and writes difference to ledger.

### 5. Stock Ledger & Move History (The Transactional Core)
Every single inventory change automatically creates an **immutable ledger entry**:
- **Date & Timestamp**
- **Movement Type** (`RECEIPT`, `DELIVERY`, `TRANSFER`, `ADJUSTMENT`)
- **Reference Document #** (`REC-0001`, `DEL-0001`, `TR-0001`, `ADJ-0001`)
- **Product Name & SKU**
- **Route:** Source Location $\rightarrow$ Destination Location
- **Delta:** Quantity change ($+$, $-$, or relocation)
- **Pre-Move Balance $\rightarrow$ Post-Move Balance**
- **User / Operator**
- **Export to CSV:** 1-click download of the complete move history.

### 6. Multi-Warehouse & Multi-Location Support
- Multi-facility configuration: **Main Warehouse**, **Secondary Warehouse**, and **Production Facility**.
- Hierarchical location management: Warehouses contain specific Racks, Input Bays, Output Packing zones, and Production lines.

---

## 🔄 Simplified Inventory Flow Example

```text
Step 1: Receive Goods from Vendor
  └─ Receipt #REC-0001 (+100 kg Steel) → Destination: Main Store (Rack A)
     Result: Stock = +100

Step 2: Move to Production Rack
  └─ Internal Transfer #TR-0001: Main Store (Rack A) → Production Rack
     Result: Total Company Stock = 100 (Unchanged), Location balances shifted

Step 3: Deliver Finished Goods
  └─ Delivery Order #DEL-0001: Deliver 20 Steel to Customer
     Result: Stock = -20 (Total = 80)

Step 4: Adjust Damaged Items
  └─ Stock Adjustment #ADJ-0001: 3 kg damaged during handling
     Result: Stock = -3 (Total = 77)

  * Every single event is permanently logged in the Stock Ledger! *
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7, Axios |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, CORS, dotenv |
| **Data Engine** | Persistent JSON Database Store with automatic seed data & full Mongoose Model schemas for MongoDB |
| **Tooling** | Concurrently, npm scripts |

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
From the root directory:
```bash
# 1. Install all dependencies across root, server, and client
npm run install:all
```

### Running in Development Mode
Run both frontend and backend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Credentials

Quick login buttons are available directly on the login screen for instant testing:

| Role | Email | Password | Assigned Facility |
|---|---|---|---|
| **Inventory Manager** | `admin@stocksense.com` | `admin123` | Main Warehouse |
| **Warehouse Staff** | `staff@stocksense.com` | `admin123` | Main Warehouse |

---

## 🧪 Automated End-to-End Test Suite

Run the comprehensive integration test covering all 10 modules:
```bash
cd server
npm test
```
The test suite validates:
1. Health check & uptime
2. JWT Authentication & profile extraction
3. Dashboard KPIs & aggregations
4. Product catalog & location breakdown
5. Receipt creation & validation (+stock)
6. Delivery order creation & atomic validation (-stock)
7. Internal transfers (location update, total stock conserved)
8. Stock adjustments (discrepancy reconciliation)
9. Stock Ledger immutable audit logging
10. OTP Password recovery workflow (Request $\rightarrow$ Verify $\rightarrow$ Reset)

---

## 📂 Project Structure

```text
StockSense/
├── package.json              # Root script runner (dev, install:all, build)
├── README.md                 # System documentation
│
├── client/                   # React Frontend (Vite + Tailwind v4)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/          # AuthContext (JWT, user state)
│       ├── services/         # Axios API client with bearer token interceptor
│       ├── components/
│       │   ├── layout/       # Sidebar, Navbar, Layout
│       │   └── common/       # Modal, StatusBadge, Toast
│       └── pages/
│           ├── auth/         # Login, Signup, ForgotPassword, ResetPassword
│           ├── dashboard/    # Dashboard with 5 KPIs & dynamic filters
│           ├── products/     # Product Master & Location Stock Breakdown
│           ├── categories/   # Product Categories
│           ├── operations/   # Receipts, Deliveries, Transfers, Adjustments
│           ├── stock/        # Stock Overview & Stock Ledger
│           ├── warehouses/   # Warehouses & Locations
│           ├── profile/      # My Profile & Password Change
│           └── settings/     # Warehouse & Inventory Configuration
│
└── server/                   # Node.js + Express Backend
    ├── package.json
    ├── .env
    ├── .env.example
    ├── test_api.js           # Automated 10-module test runner
    ├── data/                 # Persistent storage (stocksense-data.json)
    └── src/
        ├── server.js         # HTTP server entrypoint
        ├── app.js            # Express app & route definitions
        ├── config/           # Database & environment config
        ├── models/           # Mongoose schemas (User, Product, Receipt, etc.)
        ├── storage/          # Thread-safe persistent JSON database
        ├── services/         # InventoryEngine & OtpService
        ├── middleware/       # AuthMiddleware & ErrorHandler
        ├── controllers/      # Controllers for all 10 resource types
        └── routes/           # REST endpoints
```
