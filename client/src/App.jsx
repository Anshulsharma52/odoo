import { useMemo, useState } from 'react'
import './App.css'

const initialItems = [
  { name: 'Wireless Headphones', sku: 'WH-2048', category: 'Electronics', stock: 42, price: 89.99, status: 'In stock', color: 'violet', icon: '◉' },
  { name: 'Ceramic Coffee Mug', sku: 'HM-1082', category: 'Home & Living', stock: 8, price: 18.5, status: 'Low stock', color: 'orange', icon: '◒' },
  { name: 'Everyday Backpack', sku: 'AC-3091', category: 'Accessories', stock: 0, price: 64, status: 'Out of stock', color: 'blue', icon: '▱' },
  { name: 'Desk Lamp, Matte Black', sku: 'HM-1074', category: 'Home & Living', stock: 26, price: 42.99, status: 'In stock', color: 'yellow', icon: '◐' },
  { name: 'Linen Notebook Set', sku: 'ST-4402', category: 'Stationery', stock: 5, price: 14, status: 'Low stock', color: 'pink', icon: '▤' },
]

const navItems = [
  { section: 'WORKSPACE', items: [['Overview', '▦'], ['Inventory', '▧'], ['Orders', '⇄'], ['Suppliers', '♧']] },
  { section: 'INSIGHTS', items: [['Reports', '▥'], ['Activity', '◷']] },
]

function Icon({ children, className = '' }) { return <span className={`icon ${className}`} aria-hidden="true">{children}</span> }

function App() {
  const [items, setItems] = useState(initialItems)
  const [activeNav, setActiveNav] = useState('Inventory')
  const [filter, setFilter] = useState('All items')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', sku: '', category: 'Electronics', stock: '', price: '' })

  const lowCount = items.filter((item) => item.stock > 0 && item.stock <= 10).length
  const outCount = items.filter((item) => item.stock === 0).length
  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All items' || (filter === 'Low stock' && item.stock > 0 && item.stock <= 10) || (filter === 'Out of stock' && item.stock === 0)
    return matchesQuery && matchesFilter
  }), [filter, items, query])

  function addItem(event) {
    event.preventDefault()
    const stock = Number(form.stock)
    setItems((current) => [{ ...form, stock, price: Number(form.price), status: stock === 0 ? 'Out of stock' : stock <= 10 ? 'Low stock' : 'In stock', color: 'green', icon: '◇' }, ...current])
    setForm({ name: '', sku: '', category: 'Electronics', stock: '', price: '' })
    setModalOpen(false)
    setNotice('Item added to your inventory')
    window.setTimeout(() => setNotice(''), 3000)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActiveNav('Overview')}><span className="brand-mark">S</span><span>stocksense<span className="brand-period">.</span></span></a>
        <button className="workspace-switch"><span className="workspace-avatar">A</span><span className="workspace-name">Acme Studio<small>Free plan</small></span><Icon>⌄</Icon></button>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((group) => <div className="nav-group" key={group.section}><p className="nav-label">{group.section}</p>{group.items.map(([label, glyph]) => <button key={label} className={`nav-link ${activeNav === label ? 'active' : ''}`} onClick={() => setActiveNav(label)}><Icon>{glyph}</Icon><span>{label}</span>{label === 'Inventory' && <span className="nav-count">{items.length}</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom"><div className="plan-card"><div className="plan-top"><span>Monthly usage</span><span>68%</span></div><div className="progress"><span /></div><p>340 of 500 items</p><button onClick={() => setNotice('You’re on the Free plan')}>Upgrade plan <span>↗</span></button></div><button className="nav-link help-link" onClick={() => setNotice('Help center coming soon')}><Icon>?</Icon><span>Help & support</span></button><button className="profile"><span className="profile-avatar">JD</span><span className="profile-name">Jordan Davis<small>jordan@acme.co</small></span><Icon>···</Icon></button></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search" onClick={() => document.querySelector('#inventory-search')?.focus()}>⌕</button><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up')}><span>♧</span><i /></button><span className="top-divider" /><span className="top-avatar">JD</span></div></header>
        <div className="page-wrap">
          <div className="page-heading"><div><div className="eyebrow">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div><h1>{activeNav === 'Inventory' ? 'Inventory' : activeNav}</h1><p className="page-subtitle">Keep track of your products and stock levels.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => setNotice('Your inventory report is ready to export')}><Icon>↓</Icon> Export</button><button className="button button-primary" onClick={() => setModalOpen(true)}><span>＋</span> Add item</button></div></div>

          <section className="stats-grid" aria-label="Inventory summary"><article className="stat-card"><div className="stat-heading">Total products <span className="stat-icon lavender">▧</span></div><div className="stat-value">{String(items.length + 124).padStart(3, '0')}</div><div className="stat-foot"><span className="trend">↗ 12.8%</span><span>vs. last month</span></div></article><article className="stat-card"><div className="stat-heading">Low stock <span className="stat-icon peach">⌁</span></div><div className="stat-value">{String(lowCount + 12).padStart(2, '0')}</div><div className="stat-foot"><span className="subtle-dot orange-dot" /> <span>{lowCount + 12} items need attention</span></div></article><article className="stat-card"><div className="stat-heading">Out of stock <span className="stat-icon rose">⊘</span></div><div className="stat-value">{String(outCount + 3).padStart(2, '0')}</div><div className="stat-foot"><span className="subtle-dot red-dot" /> <span>{outCount + 3} items unavailable</span></div></article><article className="stat-card"><div className="stat-heading">Inventory value <span className="stat-icon mint">＄</span></div><div className="stat-value">$24,680<span className="value-decimal">.50</span></div><div className="stat-foot"><span className="trend">↗ 8.2%</span><span>vs. last month</span></div></article></section>

          <section className="inventory-panel"><div className="panel-heading"><div><h2>All products</h2><p>A list of all products in your inventory.</p></div><button className="more-button" aria-label="More options" onClick={() => setNotice('Inventory options')}>···</button></div><div className="table-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter products">{['All items', 'Low stock', 'Out of stock'].map((tab) => <button key={tab} className={filter === tab ? 'selected' : ''} onClick={() => setFilter(tab)}>{tab}{tab === 'Low stock' && <span className="tab-badge">{lowCount + 12}</span>}{tab === 'Out of stock' && <span className="tab-badge">{outCount + 3}</span>}</button>)}</div><label className="search-field"><Icon>⌕</Icon><input id="inventory-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => setNotice('Showing products across all categories')}><Icon>☷</Icon><span>Filter</span></button></div>
            <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all products" /></th><th>PRODUCT <span className="sort">↕</span></th><th>SKU</th><th>CATEGORY</th><th>STOCK <span className="sort">↕</span></th><th>PRICE <span className="sort">↕</span></th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredItems.map((item) => <tr key={item.sku}><td><input type="checkbox" aria-label={`Select ${item.name}`} /></td><td><div className="product-cell"><span className={`product-art ${item.color}`}>{item.icon}</span><span className="product-name">{item.name}</span></div></td><td className="sku">{item.sku}</td><td className="category">{item.category}</td><td className="stock-number">{item.stock}</td><td className="price">${item.price.toFixed(2)}</td><td><span className={`status ${item.status.toLowerCase().replaceAll(' ', '-')}`}><i />{item.status}</span></td><td><button className="row-menu" aria-label={`Actions for ${item.name}`} onClick={() => setNotice(`${item.name} options`)}>···</button></td></tr>)}</tbody></table>{filteredItems.length === 0 && <div className="empty-state">No products match your search.</div>}</div><div className="table-footer"><span>Showing <strong>{filteredItems.length ? 1 : 0}–{filteredItems.length}</strong> of <strong>{filteredItems.length}</strong> products</span><div className="pagination"><button disabled>← Previous</button><button className="page-number">1</button><button disabled>Next →</button></div></div>
          </section>
          <div className="activity-note"><span className="activity-dot" /><span>Last synced 2 minutes ago</span><span className="note-divider">·</span><span>All changes saved</span></div>
        </div>
      </main>
      {notice && <div className="toast" role="status"><span>✓</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}><form className="item-modal" onSubmit={addItem}><div className="modal-top"><div><span className="modal-kicker">INVENTORY</span><h2>Add a product</h2><p>Add a new item to your stock.</p></div><button type="button" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">×</button></div><label>Product name<input required autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Wireless Headphones" /></label><div className="form-row"><label>SKU<input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="e.g. WH-2048" /></label><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Electronics</option><option>Home & Living</option><option>Accessories</option><option>Stationery</option></select></label></div><div className="form-row"><label>Quantity<input required min="0" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="0" /></label><label>Unit price<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="$0.00" /></label></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="button button-primary">Add product</button></div></form></div>}
    </div>
  )
}

export default App
