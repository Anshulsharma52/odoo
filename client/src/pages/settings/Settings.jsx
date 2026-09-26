import React, { useState } from 'react';
import { Settings as SettingsIcon, Warehouse, Bell, Shield, Database, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('warehouse');
  const [savedMessage, setSavedMessage] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({
    defaultWarehouse: 'Main Warehouse',
    autoReorderAlerts: true,
    emailAlerts: true,
    requireValidationNotes: true,
    enableMultiWarehouse: true,
    stockValuationMethod: 'FIFO',
    defaultUOM: 'units'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System & Inventory Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure company warehouse parameters, reordering policies, and operational defaults.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 text-xs font-semibold gap-6">
          <button
            onClick={() => setActiveTab('warehouse')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'warehouse'
                ? 'border-odoo-600 text-odoo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Warehouse className="h-4 w-4" />
            <span>Warehouse Defaults</span>
          </button>

          <button
            onClick={() => setActiveTab('reorder')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'reorder'
                ? 'border-odoo-600 text-odoo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Alerts & Reordering</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'system'
                ? 'border-odoo-600 text-odoo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Ledger & System</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {savedMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Settings successfully updated!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 text-xs max-w-2xl">
            {activeTab === 'warehouse' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Primary Default Warehouse</label>
                  <select
                    value={settings.defaultWarehouse}
                    onChange={(e) => setSettings({ ...settings, defaultWarehouse: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
                  >
                    <option value="Main Warehouse">Main Warehouse (WH-MAIN)</option>
                    <option value="Secondary Warehouse">Secondary Warehouse (WH-SEC)</option>
                    <option value="Production Facility">Production Facility (WH-PLANT)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div>
                    <p className="font-semibold text-slate-800">Multi-Warehouse Inventory Routing</p>
                    <p className="text-[11px] text-slate-500">Allow transfers between distinct facilities</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableMultiWarehouse}
                    onChange={(e) => setSettings({ ...settings, enableMultiWarehouse: e.target.checked })}
                    className="h-4 w-4 rounded text-odoo-600 focus:ring-odoo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Default Unit of Measure (UOM)</label>
                  <select
                    value={settings.defaultUOM}
                    onChange={(e) => setSettings({ ...settings, defaultUOM: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-odoo-600/20 focus:border-odoo-600 transition"
                  >
                    <option value="units">units</option>
                    <option value="kg">kg</option>
                    <option value="boxes">boxes</option>
                    <option value="meters">meters</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'reorder' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div>
                    <p className="font-semibold text-slate-800">Automated Low Stock Banners</p>
                    <p className="text-[11px] text-slate-500">Display warning when product falls below reorder level</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoReorderAlerts}
                    onChange={(e) => setSettings({ ...settings, autoReorderAlerts: e.target.checked })}
                    className="h-4 w-4 rounded text-odoo-600 focus:ring-odoo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div>
                    <p className="font-semibold text-slate-800">Delivery Stock Pre-Check Validation</p>
                    <p className="text-[11px] text-slate-500">Prevent validating delivery orders if insufficient balance</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 rounded text-odoo-600 focus:ring-odoo-500 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inventory Engine Architecture:</span>
                    <span className="font-semibold text-slate-800 font-mono">Immutable Double-Entry Ledger</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Storage Backend:</span>
                    <span className="font-semibold text-emerald-700 font-mono">Persistent JSON / MongoDB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">REST API Status:</span>
                    <span className="font-semibold text-emerald-600">Online & Synchronized</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-odoo-600 hover:bg-odoo-700 text-white rounded-xl font-semibold shadow-xs transition cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
