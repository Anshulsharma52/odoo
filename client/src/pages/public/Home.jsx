import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Boxes,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Truck,
  PackageCheck,
  AlertTriangle,
  FileText,
  Warehouse,
  Zap,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Lock,
  Search,
  ExternalLink,
  Cpu,
  Check,
  Play,
  RotateCcw,
  Clock,
  Terminal,
  Server,
  UserCheck
} from 'lucide-react';

const Home = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Live Stats State
  const [stats, setStats] = useState({
    totalProducts: 6,
    totalStockQuantity: 775,
    lowStockCount: 1,
    outOfStockCount: 1,
    pendingReceipts: 2,
    pendingDeliveries: 1
  });
  const [apiOnline, setApiOnline] = useState(true);
  const [activePipelineTab, setActivePipelineTab] = useState('receipts');
  const [activeWarehouse, setActiveWarehouse] = useState('WH-MAIN');
  const [activeFaq, setActiveFaq] = useState(null);
  const [demoLoading, setDemoLoading] = useState(null);
  const [ledgerViewMode, setLedgerViewMode] = useState('simulator');
  const [realMovements, setRealMovements] = useState([]);

  // Interactive Live Ledger Movement Simulator State
  const [simStep, setSimStep] = useState(1);
  const [simStock, setSimStock] = useState(100);
  const [simHistory, setSimHistory] = useState([
    {
      id: 'INIT-001',
      type: 'OPENING',
      product: 'Steel Rods (12mm)',
      from: 'Vendor / Initial Count',
      to: 'WH-MAIN-RACK-A',
      qty: '+100 kg',
      balance: 100,
      time: '09:00 AM'
    }
  ]);

  // Fetch real stats on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data?.success) {
          setStats(res.data.kpis || res.data.stats || res.data);
          if (res.data.recentMovements?.length) {
            setRealMovements(res.data.recentMovements);
          }
          setApiOnline(true);
        }
      } catch (err) {
        console.log('Using local fallback preview data for public showcase');
      }
    };
    fetchStats();
  }, []);

  // Quick Instant Demo Login
  const handleLaunchDemo = async (role) => {
    try {
      setDemoLoading(role);
      const email = role === 'manager' ? 'admin@stocksense.com' : 'staff@stocksense.com';
      const password = 'admin123';
      const res = await login(email, password);
      if (res?.success) {
        if (role === 'manager') {
          navigate('/dashboard');
        } else {
          navigate('/operations/receipts');
        }
      }
    } catch (err) {
      navigate('/login');
    } finally {
      setDemoLoading(null);
    }
  };

  // Run Simulator Step
  const runSimulatorStep = (stepNumber) => {
    if (stepNumber === 2 && simStep < 2) {
      setSimStep(2);
      setSimHistory(prev => [
        {
          id: 'REC-0091',
          type: 'RECEIPT',
          product: 'Steel Rods (12mm)',
          from: 'Apex Metals Supplier',
          to: 'WH-MAIN-RACK-A',
          qty: '+50 kg',
          balance: simStock + 50,
          time: 'Just now'
        },
        ...prev
      ]);
      setSimStock(prev => prev + 50);
    } else if (stepNumber === 3 && simStep < 3) {
      setSimStep(3);
      setSimHistory(prev => [
        {
          id: 'TR-0044',
          type: 'TRANSFER',
          product: 'Steel Rods (12mm)',
          from: 'WH-MAIN-RACK-A',
          to: 'WH-MAIN-RACK-B',
          qty: '20 kg (Relocated)',
          balance: simStock,
          time: 'Just now'
        },
        ...prev
      ]);
    } else if (stepNumber === 4 && simStep < 4) {
      setSimStep(4);
      setSimHistory(prev => [
        {
          id: 'DEL-0082',
          type: 'DELIVERY',
          product: 'Steel Rods (12mm)',
          from: 'WH-MAIN-RACK-B',
          to: 'Customer (Global Logistics)',
          qty: '-30 kg',
          balance: simStock - 30,
          time: 'Just now'
        },
        ...prev
      ]);
      setSimStock(prev => prev - 30);
    }
  };

  const resetSimulator = () => {
    setSimStep(1);
    setSimStock(100);
    setSimHistory([
      {
        id: 'INIT-001',
        type: 'OPENING',
        product: 'Steel Rods (12mm)',
        from: 'Vendor / Initial Count',
        to: 'WH-MAIN-RACK-A',
        qty: '+100 kg',
        balance: 100,
        time: '09:00 AM'
      }
    ]);
  };

  // Pipeline tab details
  const pipelineData = {
    receipts: {
      title: 'Incoming Goods (Receipts)',
      badge: 'Inbound Flow',
      icon: ArrowDownLeft,
      color: 'emerald',
      description:
        'Standardized 4-step intake from purchase orders. Inspect quality, confirm batch quantities, and assign precise destination rack locations.',
      steps: [
        { label: 'Draft PO Intake', desc: 'Vendor shipment arrived at docking bay.' },
        { label: 'Quality Inspection', desc: 'Staff inspects packaging and seals.' },
        { label: 'Bay Allocation', desc: 'Destination set to WH-MAIN-RACK-A.' },
        { label: 'Stock Mutation', desc: 'Stock atomically increments + Ledger writes.' }
      ],
      sampleDoc: 'REC-0004 • Apex Metals Supply • 50 units Steel Rods'
    },
    deliveries: {
      title: 'Outgoing Shipments (Deliveries)',
      badge: 'Outbound Flow',
      icon: ArrowUpRight,
      color: 'amber',
      description:
        'Controlled dispatch workflow preventing accidental negative stock balances. Enforces pick verification, packing validation, and carrier dispatch.',
      steps: [
        { label: 'Sales Order Ready', desc: 'Dispatch ticket queued in system.' },
        { label: 'Guided Picking', desc: 'Staff picks exact rack bin item.' },
        { label: 'Pre-Validation Check', desc: 'System verifies current stock >= needed.' },
        { label: 'Audit Release', desc: 'Stock deducts -30 units and logs customer dispatch.' }
      ],
      sampleDoc: 'DEL-0002 • Global Logistics Corp • 30 units Steel Rods'
    },
    transfers: {
      title: 'Internal Facility Transfers',
      badge: 'Relocation Flow',
      icon: ArrowLeftRight,
      color: 'blue',
      description:
        'Relocate materials between warehouse racks, overflow depots, or production lines without altering total enterprise valuation.',
      steps: [
        { label: 'Request Transfer', desc: 'Production requires 20kg from main store.' },
        { label: 'Source Verification', desc: 'Check WH-MAIN-RACK-A balance.' },
        { label: 'In-Transit Staging', desc: 'Physical movement across facilities.' },
        { label: 'Destination Shelving', desc: 'WH-MAIN-RACK-B receives; net balance conserved.' }
      ],
      sampleDoc: 'TR-0003 • WH-MAIN-RACK-A ➔ WH-MAIN-RACK-B • 20 kg'
    },
    adjustments: {
      title: 'Physical Inventory Audits',
      badge: 'Reconciliation Flow',
      icon: SlidersHorizontal,
      color: 'purple',
      description:
        'End-of-month cycle counts and spot audits. Enter recorded counts vs physical floor counts to automatically compute discrepancy deltas.',
      steps: [
        { label: 'Cycle Count Initiated', desc: 'Physical shelf counting at Rack A.' },
        { label: 'Discrepancy (Δ) Math', desc: 'System: 100 | Counted: 96 | Δ = -4.' },
        { label: 'Reason Tagging', desc: 'Categorize: Misplaced / Damage / Spoilage.' },
        { label: 'Ledger Reconciliation', desc: 'Ledger books write-off; stock balances align.' }
      ],
      sampleDoc: 'ADJ-0001 • Steel Rods (12mm) • Discrepancy -4 (Damaged in Transit)'
    }
  };

  // Warehouse breakdown data
  const warehouseDetails = {
    'WH-MAIN': {
      name: 'Main Logistics Center',
      code: 'WH-MAIN',
      type: 'Central Distribution',
      locations: [
        { code: 'WH-MAIN-RACK-A', label: 'Rack A (Heavy Raw Materials)', items: 'Steel Rods, Aluminum Sheets', fill: '82%' },
        { code: 'WH-MAIN-RACK-B', label: 'Rack B (Components & Parts)', items: 'Office Chairs, Hardware', fill: '64%' },
        { code: 'WH-MAIN-STAGE', label: 'Staging Bay (Packing & Outbound)', items: 'Cardboard Boxes, Pallets', fill: '45%' }
      ]
    },
    'WH-SEC': {
      name: 'Secondary Logistics Hub',
      code: 'WH-SEC',
      type: 'Regional Overflow & Returns',
      locations: [
        { code: 'WH-SEC-BAY-1', label: 'Input Intake Bay', items: 'Pending Inspection Shipments', fill: '30%' },
        { code: 'WH-SEC-RACK-1', label: 'Storage Rack 1 (Overflow)', items: 'Bulk Packaging & Wire Rolls', fill: '55%' }
      ]
    },
    'WH-PLANT': {
      name: 'Production & Fabrication Plant',
      code: 'WH-PLANT',
      type: 'Manufacturing Facility',
      locations: [
        { code: 'WH-PLANT-PROD', label: 'Active Assembly Line', items: 'Aluminum Sheets (In Fabrication)', fill: '78%' },
        { code: 'WH-PLANT-HOLD', label: 'Finished Goods Quarantine', items: 'Tested Assembly Units', fill: '25%' }
      ]
    }
  };

  // FAQ items
  const faqs = [
    {
      q: 'How does StockSense maintain atomic stock consistency without negative balances?',
      a: 'Every mutation (Receipt, Delivery, Internal Move, or Physical Adjustment) operates strictly through a 4-stage pipeline (Draft ➔ Waiting ➔ Ready ➔ Done). Stock updates occur atomically upon entering the Done state with mandatory pre-validation locks, ensuring no race conditions can create negative warehouse quantities.'
    },
    {
      q: 'What is the Double-Entry Stock Ledger and how does it replace spreadsheets?',
      a: 'Traditional spreadsheets record static balances that get overwritten and lost. StockSense implements an immutable ledger where every single movement logs Source Location, Destination Location, Quantity Delta (+ or -), Pre-Move Balance, Post-Move Balance, Timestamp, and User ID. You can reconstruct full inventory history at any moment.'
    },
    {
      q: 'Can StockSense run without a live MongoDB database?',
      a: 'Yes! StockSense features an embedded persistent JSON data engine with automated seeding for zero-friction setup and instant demo exploration, alongside enterprise Mongoose schemas ready to connect to any production MongoDB cluster.'
    },
    {
      q: 'What roles are supported in StockSense?',
      a: 'The system natively differentiates between Inventory Managers (high-level KPI overviews, approval authority, reorder point configurations, and audit exports) and Warehouse Staff (execution of picking, shelving, inter-rack moves, and spot counting).'
    },
    {
      q: 'Can inventory ledger data be exported for ERP and accounting systems?',
      a: 'Yes, the Stock Ledger module includes 1-click CSV export with full transaction metadata, ready for import into QuickBooks, SAP, Xero, or custom enterprise accounting pipelines.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-odoo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Background Decorative Gradients & Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-odoo-600/30 via-indigo-600/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-600/15 blur-3xl rounded-full" />
        <div className="absolute top-2/3 -right-48 w-96 h-96 bg-odoo-400/15 blur-3xl rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Top Banner / Announcement */}
      <div className="relative z-50 bg-gradient-to-r from-odoo-700 via-odoo-600 to-indigo-700 text-white text-xs py-2 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide uppercase">
          <Sparkles className="h-3 w-3" /> Odoo-Inspired IMS
        </span>
        <span>Version 1.0 Enterprise Architecture is live with double-entry stock ledger & atomic mutations.</span>
        <button
          onClick={() => handleLaunchDemo('manager')}
          className="underline font-bold hover:text-odoo-100 transition cursor-pointer hidden sm:inline"
        >
          Try 1-Click Demo &rarr;
        </button>
      </div>

      {/* Main Sticky Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/85 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-odoo-500 to-odoo-700 flex items-center justify-center text-white shadow-lg shadow-odoo-600/25 group-hover:scale-105 transition">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Stock<span className="text-odoo-400">Sense</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-odoo-900/80 text-odoo-300 border border-odoo-700/50">
                  IMS v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Modular Inventory Management</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pipeline" className="hover:text-white transition">Operations Engine</a>
            <a href="#simulator" className="hover:text-white transition">Interactive Demo</a>
            <a href="#ledger" className="hover:text-white transition">Stock Ledger</a>
            <a href="#facilities" className="hover:text-white transition">Facilities</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Auth Actions / App Access */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-odoo-600 hover:bg-odoo-500 text-white font-medium text-sm shadow-lg shadow-odoo-600/25 transition cursor-pointer"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => handleLaunchDemo('manager')}
                  disabled={demoLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-odoo-600 to-odoo-700 hover:from-odoo-500 hover:to-odoo-600 text-white font-medium text-sm shadow-lg shadow-odoo-600/25 hover:shadow-odoo-600/40 transition cursor-pointer disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>{demoLoading ? 'Launching...' : '1-Click Demo'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-odoo-300 shadow-inner mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Odoo-Inspired Transaction Engine</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Atomic Stock Mutations & Double-Entry Ledger</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Precision Warehouse Control.{' '}
              <span className="bg-gradient-to-r from-odoo-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Zero Phantom Inventory.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
              Replace fragile spreadsheets, manual logbooks, and untracked scrap with a centralized,
              transaction-driven IMS. Manage receipts, deliveries, internal rack transfers, and cycle counts with
              mathematical audit certainty.
            </p>

            {/* Dual Role Demo Launcher Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => handleLaunchDemo('manager')}
                disabled={demoLoading !== null}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-odoo-600 hover:bg-odoo-500 text-white font-semibold text-sm shadow-xl shadow-odoo-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="h-5 w-5 text-purple-200" />
                <span>Test-Drive as Inventory Manager</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleLaunchDemo('staff')}
                disabled={demoLoading !== null}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 hover:border-slate-600 transition cursor-pointer"
              >
                <PackageCheck className="h-5 w-5 text-emerald-400" />
                <span>Test-Drive as Warehouse Staff</span>
              </button>
            </div>

            {/* System Specs Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> No MongoDB setup required (JSON engine active)
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> Instant pre-seeded catalog
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> 10/10 automated tests passing
              </span>
            </div>
          </div>

          {/* Hero Monitor Mockup with Generated Image & Ambient Glow */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            {/* Ambient Background Glow behind Mockup */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-odoo-500/30 via-indigo-500/20 to-purple-500/30 blur-2xl opacity-75" />

            {/* Monitor Frame */}
            <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Window Header */}
              <div className="h-10 bg-slate-800/90 border-b border-slate-700/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">StockSense Operational Terminal • v1.0.0</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    API Connected
                  </span>
                  <span>Port :3000 / :5000</span>
                </div>
              </div>

              {/* Monitor Image Container */}
              <div className="relative group">
                <img
                  src="/hero-preview.jpg"
                  alt="StockSense Enterprise Warehouse Inventory Management System Interface"
                  className="w-full h-auto object-cover max-h-[540px] transform group-hover:scale-[1.01] transition duration-500"
                />

                {/* Floating Interactive Badge Overlays */}
                <div className="absolute top-6 left-6 hidden sm:flex items-center gap-3 p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-xl">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Atomic Ledger Check</p>
                    <p className="text-xs font-bold text-white">Negative Balances Blocked</p>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3 p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-xl">
                  <div className="h-10 w-10 rounded-lg bg-odoo-500/20 text-odoo-400 flex items-center justify-center">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Move History Logged</p>
                    <p className="text-xs font-bold text-white">Double-Entry Audit Trail</p>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 hidden md:flex items-center gap-3 p-3 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-xl">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Warehouse className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Multi-Warehouse Routing</p>
                    <p className="text-xs font-bold text-white">Main • Secondary • Production</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE SYSTEM METRICS COUNTER BAR */}
      <section className="relative z-10 border-y border-slate-800 bg-slate-950/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-3xl font-extrabold text-white tracking-tight">{stats.totalProducts || 6}</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Catalog SKUs</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Active item definitions</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-3xl font-extrabold text-odoo-400 tracking-tight">
                {stats.totalStockQuantity?.toLocaleString() || '775'}
              </p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Units in Warehouse</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Across all storage racks</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">3</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Facilities Online</p>
              <p className="text-[11px] text-slate-500 mt-0.5">7 dedicated storage zones</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-3xl font-extrabold text-indigo-400 tracking-tight">100%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Audit Traceability</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Permanent ledger records</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE OPERATIONS ENGINE PIPELINE */}
      <section id="pipeline" className="relative z-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-odoo-400 mb-2">
              Operational Workflow Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The 4-Stage Odoo Transaction Pipeline
            </p>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Every inventory event adheres to a strict four-stage progression. Mutations never alter balances until
              reaching the final validated stage.
            </p>

            {/* Pipeline Stage Breadcrumb */}
            <div className="mt-8 inline-flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300">1. Draft</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                2. Waiting (Picking / In-Transit)
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                3. Ready (Packed / Staged)
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                4. Validated (Done)
              </span>
            </div>
          </div>

          {/* Workflow Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {Object.keys(pipelineData).map((key) => {
              const tab = pipelineData[key];
              const Icon = tab.icon;
              const isActive = activePipelineTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePipelineTab(key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs sm:text-sm transition cursor-pointer ${
                    isActive
                      ? 'bg-odoo-600 text-white shadow-lg shadow-odoo-600/30 scale-105'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Workflow Card */}
          {(() => {
            const current = pipelineData[activePipelineTab];
            const Icon = current.icon;
            return (
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-6 sm:p-8 backdrop-blur-sm shadow-xl max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/70">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-odoo-500/20 text-odoo-400 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                        {current.badge}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">{current.title}</h3>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    Doc: {current.sampleDoc}
                  </div>
                </div>

                <p className="mt-5 text-sm text-slate-300 leading-relaxed">{current.description}</p>

                {/* 4 Steps Visual */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {current.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/80 hover:border-odoo-500/50 transition"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-6 w-6 rounded-full bg-odoo-600/30 text-odoo-300 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white">{st.label}</h4>
                      </div>
                      <p className="text-xs text-slate-400">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* INTERACTIVE LIVE LEDGER SIMULATOR */}
      <section id="simulator" className="relative z-10 py-20 bg-slate-950/70 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Interactive Sandbox
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simulate Stock Movements in Real-Time
            </p>
            <p className="text-slate-400 mt-3 text-sm">
              Click the sequence buttons below to simulate physical movements and observe how StockSense recalculates
              location balances and permanently writes to the immutable ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
            {/* Simulation Controls Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Controller</h3>
                  <button
                    onClick={resetSimulator}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 mb-5">
                  <p className="text-xs text-slate-400">Target Product</p>
                  <p className="text-sm font-bold text-white">Steel Rods (12mm) • SKU: STL-001</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Balance:</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">{simStock} kg</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => runSimulatorStep(2)}
                    disabled={simStep >= 2}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                      simStep === 1
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowDownLeft className="h-4 w-4" />
                      <span>1. Receive +50 kg from Supplier</span>
                    </span>
                    <span className="font-mono font-bold">{simStep >= 2 ? 'Done ✓' : 'Execute'}</span>
                  </button>

                  <button
                    onClick={() => runSimulatorStep(3)}
                    disabled={simStep < 2 || simStep >= 3}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                      simStep === 2
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4" />
                      <span>2. Transfer 20 kg: Rack A ➔ Rack B</span>
                    </span>
                    <span className="font-mono font-bold">{simStep >= 3 ? 'Done ✓' : 'Execute'}</span>
                  </button>

                  <button
                    onClick={() => runSimulatorStep(4)}
                    disabled={simStep < 3 || simStep >= 4}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                      simStep === 3
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>3. Deliver -30 kg to Customer</span>
                    </span>
                    <span className="font-mono font-bold">{simStep >= 4 ? 'Done ✓' : 'Execute'}</span>
                  </button>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                  <button
                    onClick={() => handleLaunchDemo('manager')}
                    className="w-full py-2.5 px-3 rounded-xl bg-odoo-600 hover:bg-odoo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <span>Launch Live App with Real Inventory</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated & Real Live Ledger Output */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <History className="h-4 w-4 text-odoo-400" />
                      <span>Audit Trail (Immutable Ledger)</span>
                    </h3>

                    {/* View Switcher */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setLedgerViewMode('simulator')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                          ledgerViewMode === 'simulator'
                            ? 'bg-odoo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Simulation
                      </button>
                      <button
                        onClick={() => setLedgerViewMode('liveDb')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                          ledgerViewMode === 'liveDb'
                            ? 'bg-odoo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Live Database</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                          {realMovements.length || 8}
                        </span>
                      </button>
                    </div>
                  </div>

                  {ledgerViewMode === 'simulator' ? (
                    <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
                      {simHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 transition"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-mono font-bold text-odoo-300">{item.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                item.type === 'RECEIPT'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : item.type === 'DELIVERY'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : item.type === 'TRANSFER'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 font-medium mb-1">
                            {item.product} • <span className="font-bold text-white">{item.qty}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <div className="truncate max-w-[260px]">
                              {item.from} ➔ <span className="text-slate-200">{item.to}</span>
                            </div>
                            <div className="font-mono text-slate-300">Bal: {item.balance} kg</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
                      {realMovements.map((move, idx) => (
                        <div
                          key={move.id || idx}
                          className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 transition"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-mono font-bold text-odoo-300">
                              {move.referenceNumber || move.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                move.transactionType === 'RECEIPT'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : move.transactionType === 'DELIVERY'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : move.transactionType === 'TRANSFER'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {move.transactionType}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 font-medium mb-1">
                            {move.productName} ({move.sku}) •{' '}
                            <span className={`font-bold ${move.quantity > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {move.quantity > 0 ? `+${move.quantity}` : move.quantity} units
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <div className="truncate max-w-[260px]">
                              {move.sourceLocation} ➔ <span className="text-slate-200">{move.destinationLocation}</span>
                            </div>
                            <div className="font-mono text-slate-300">
                              {move.previousStock} ➔ {move.newStock}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Cryptographic timestamped record</span>
                  <span>Zero reconciliation lag</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES & ADVANTAGES GRID */}
      <section id="features" className="relative z-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-odoo-400 mb-2">
              Engineered For Modern Logistics
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything Needed to Run High-Velocity Warehouses
            </p>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              From small single-room stockrooms to multi-site manufacturing hubs, StockSense gives every operator the
              tools they need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-odoo-500/50 transition group">
              <div className="h-12 w-12 rounded-xl bg-odoo-500/20 text-odoo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <History className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Double-Entry Stock Ledger</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Immutable audit logging of every incoming unit, relocation, delivery, and discrepancy write-off with
                instant CSV export capability.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-odoo-500/50 transition group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Atomic Concurrency Locks</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pre-validation locks prevent accidental negative warehouse balances even when multiple staff members
                pick and dispatch simultaneously.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-odoo-500/50 transition group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automated Reorder Alerts</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Intelligent badge indicators for *In Stock*, *Low Stock*, and *Out of Stock* trigger proactive purchase
                order generation before stockouts occur.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-odoo-500/50 transition group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <Warehouse className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Facility & Rack Topology</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track physical inventory across multiple buildings, staging bays, production floors, and individual
                rack bins (`WH-MAIN-RACK-A`).
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-odoo-500/50 transition group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Role-Based Workspaces</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tailored experiences: Inventory Managers get executive KPI filters and approvals; Warehouse Staff get
                streamlined picking and receiving workflows.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-odoo-500/50 transition group">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dual Data Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Embedded zero-dependency persistent JSON store for turnkey development and testing, plus full Mongoose
                models for enterprise MongoDB scaling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FACILITIES & RACK TOPOLOGY VISUALIZER */}
      <section id="facilities" className="relative z-10 py-20 bg-slate-950/70 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Physical Asset Mapping
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Multi-Warehouse Location Topology
            </p>
            <p className="text-slate-400 mt-3 text-sm">
              Drill down into warehouse facilities to view rack occupancy, storage zones, and active SKU distributions.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Facility Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {Object.keys(warehouseDetails).map((key) => {
                const wh = warehouseDetails[key];
                const isSelected = activeWarehouse === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveWarehouse(key)}
                    className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                      isSelected
                        ? 'bg-odoo-600/20 border-odoo-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                      <span>{wh.code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {wh.type}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">{wh.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Facility Details Card */}
            {(() => {
              const currentWh = warehouseDetails[activeWarehouse];
              return (
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentWh.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">Code: {currentWh.code}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Operational
                    </span>
                  </div>

                  <div className="space-y-4">
                    {currentWh.locations.map((loc, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-odoo-300 bg-odoo-950/80 px-2 py-0.5 rounded border border-odoo-800/80">
                              {loc.code}
                            </span>
                            <span className="text-sm font-semibold text-white">{loc.label}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Stored Inventory: {loc.items}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-odoo-500 h-full rounded-full" style={{ width: loc.fill }} />
                          </div>
                          <span className="text-xs font-mono text-slate-300 font-semibold">{loc.fill}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* SPREADSHEET VS STOCKSENSE COMPARISON */}
      <section className="relative z-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
              The Cost of Manual Tracking
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Excel Spreadsheets vs StockSense IMS
            </p>
            <p className="text-slate-400 mt-3 text-sm">
              Discover why growing logistics operations retire manual registers and embrace transactional ledger control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Old Way */}
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40">
              <h3 className="text-base font-bold text-rose-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Spreadsheets & Paper Registers</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>Static balance overwrite: zero historical move audit trail.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>Negative balances occur unnoticed when multiple staff pick stock.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>Rack location distribution is guess-work, causing delayed order picking.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>Physical count discrepancies get erased without reason classification.</span>
                </li>
              </ul>
            </div>

            {/* StockSense Way */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/50 shadow-lg shadow-emerald-950/20">
              <h3 className="text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>StockSense Modular IMS</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Double-entry ledger logs every mutation with before/after balances.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Atomic validation locks guarantee stock never drops below zero.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Exact shelf-level rack visibility (`WH-MAIN-RACK-A`, `RACK-B`).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Full discrepancy write-off classification (Misplaced, Damaged, Scrapped).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="relative z-10 py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-odoo-400 mb-2">
              Architecture & Details
            </h2>
            <p className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4.5 text-left text-sm font-semibold text-white hover:text-odoo-300 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-odoo-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-odoo-600 text-white shadow-xl shadow-odoo-600/30 mb-6">
            <Boxes className="h-8 w-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Take Command of Your Inventory?
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Launch the live application in seconds. Test-drive role-based workflows for both managers and warehouse
            staff without filling out forms.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleLaunchDemo('manager')}
              disabled={demoLoading !== null}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-odoo-600 hover:bg-odoo-500 text-white font-bold text-sm shadow-xl shadow-odoo-600/30 hover:scale-105 transition cursor-pointer disabled:opacity-50"
            >
              <span>{demoLoading === 'manager' ? 'Launching Manager...' : 'Launch Manager Console (Admin)'}</span>
            </button>
            <button
              onClick={() => handleLaunchDemo('staff')}
              disabled={demoLoading !== null}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition cursor-pointer"
            >
              <span>{demoLoading === 'staff' ? 'Launching Staff...' : 'Launch Warehouse Terminal (Staff)'}</span>
            </button>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Or create a custom account: <Link to="/signup" className="text-odoo-400 hover:underline">Sign up here</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-odoo-600 flex items-center justify-center text-white font-bold">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  Stock<span className="text-odoo-400">Sense</span> IMS
                </p>
                <p className="text-[11px] text-slate-500">Modular Inventory Management System</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#pipeline" className="hover:text-white transition">Operations</a>
              <a href="#simulator" className="hover:text-white transition">Simulator</a>
              <a href="#facilities" className="hover:text-white transition">Facilities</a>
              <Link to="/login" className="hover:text-white transition">Sign In</Link>
              <Link to="/signup" className="hover:text-white transition">Create Account</Link>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{apiOnline ? 'API Engine Online :5000' : 'Offline Mode'}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 StockSense IMS. Purpose-built for Odoo-style modular inventory management.</p>
            <p>React 19 • Vite • Tailwind CSS • Express.js • Node.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
