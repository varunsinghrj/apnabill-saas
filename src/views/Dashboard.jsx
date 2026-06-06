import { 
  IndianRupee, 
  PackageCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertOctagon, 
  FilePlus2, 
  PlusCircle, 
  PlusSquare, 
  Users2 
} from 'lucide-react';

const Dashboard = ({ 
  products, 
  customers, 
  suppliers, 
  invoices, 
  notifications, 
  setActiveView,
  openInvoiceModal,
  openPurchaseModal,
  openProductModal
}) => {
  // Math Calculations for KPIs
  const totalSales = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalReceivables = customers.reduce((acc, curr) => curr.balance > 0 ? acc + curr.balance : acc, 0);
  const totalPayables = suppliers.reduce((acc, curr) => acc + curr.dues, 0);
  const stockValuation = products.reduce((acc, curr) => acc + (curr.stock * curr.costPrice), 0);

  // Recent transactions list
  const recentInvoices = invoices.slice(0, 5);

  // Chart data: Group sales by date for last 5 sales
  const salesByDate = invoices.reduce((acc, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.grandTotal;
    return acc;
  }, {});
  
  const dates = Object.keys(salesByDate).sort().slice(-5);
  const salesValues = dates.map(d => salesByDate[d]);
  const maxSalesVal = Math.max(...salesValues, 1000);

  // Top Products: Sort products by velocity (stock left vs initial estimate, or just sort by price for dummy)
  const topProducts = [...products]
    .sort((a, b) => b.sellingPrice - a.sellingPrice)
    .slice(0, 4);

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Business Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time overview of Vyapora</p>
        </div>
        
        {/* Quick Action buttons */}
        <div className="view-header-actions">
          <button className="btn btn-primary btn-sm" onClick={openInvoiceModal}>
            <FilePlus2 size={16} /> Invoice
          </button>
          <button className="btn btn-success btn-sm" onClick={openPurchaseModal}>
            <PlusSquare size={16} /> Purchase
          </button>
          <button className="btn btn-secondary btn-sm" onClick={openProductModal}>
            <PlusCircle size={16} /> Product
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-left">
            <span className="kpi-title">Total Sales</span>
            <span className="kpi-value">₹{totalSales.toLocaleString('en-IN')}</span>
            <span className="kpi-trend trend-up">
              <ArrowUpRight size={14} /> +12.4% vs last month
            </span>
          </div>
          <div className="kpi-icon-wrapper success">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left">
            <span className="kpi-title">Receivables (Dues)</span>
            <span className="kpi-value">₹{totalReceivables.toLocaleString('en-IN')}</span>
            <span className="kpi-trend trend-down">
              <ArrowDownRight size={14} /> -3.2% collection rate
            </span>
          </div>
          <div className="kpi-icon-wrapper warning">
            <Users2 size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left">
            <span className="kpi-title">Purchase Payables</span>
            <span className="kpi-value">₹{totalPayables.toLocaleString('en-IN')}</span>
            <span className="kpi-trend trend-up">
              <ArrowUpRight size={14} /> +5.8% inventory credit
            </span>
          </div>
          <div className="kpi-icon-wrapper danger">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left">
            <span className="kpi-title">Stock Valuation</span>
            <span className="kpi-value">₹{stockValuation.toLocaleString('en-IN')}</span>
            <span className="kpi-trend trend-up">
              <ArrowUpRight size={14} /> {products.length} active SKUs
            </span>
          </div>
          <div className="kpi-icon-wrapper primary">
            <PackageCheck size={24} />
          </div>
        </div>
      </div>

      {/* Charts & Alerts Row */}
      <div className="dashboard-middle-row">
        {/* Revenue Analytics (SVG Bar Chart) */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">Sales Revenue Trend (₹)</h3>
          {dates.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Create invoices to generate sales trend charts.
            </div>
          ) : (
            <div className="chart-container">
              <div className="bar-chart-flex">
                {dates.map((date, idx) => {
                  const val = salesByDate[date];
                  const heightPercent = (val / maxSalesVal) * 150; // Max height 150px
                  return (
                    <div key={idx} className="bar-column">
                      <div 
                        className="bar-rect" 
                        style={{ height: `${heightPercent}px` }}
                      >
                        <span className="bar-value-tooltip">₹{Math.round(val)}</span>
                      </div>
                      <span className="bar-label">{date.substring(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Needed / Alerts */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Attention Required</h3>
            {notifications.length > 0 && (
              <span className="badge badge-danger">{notifications.length} Alerts</span>
            )}
          </div>
          
          <div className="alerts-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 10px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                <PackageCheck size={36} style={{ color: '#059669', opacity: 0.5, marginBottom: '8px' }} />
                <p>Everything is perfectly set up. All stocks are healthy and invoices are settled!</p>
              </div>
            ) : (
              notifications.map(alert => (
                <div 
                  key={alert.id} 
                  className={`alert-item-card ${alert.type}`}
                  onClick={() => setActiveView(alert.targetLink)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ color: alert.type === 'low_stock' ? '#d97706' : alert.type === 'expiry' ? '#dc2626' : '#2563eb' }}>
                    <AlertOctagon size={16} style={{ marginTop: '2px' }} />
                  </div>
                  <div className="alert-item-text">
                    <div className="alert-item-title" style={{ color: '#0f172a' }}>{alert.title}</div>
                    <div style={{ color: '#475569', fontSize: '0.75rem' }}>{alert.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Sales & Top Products */}
      <div className="responsive-grid-2" style={{ marginTop: '24px', gap: '24px' }}>
        
        {/* Recent Invoices Log */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Invoices</h3>
            <span 
              onClick={() => setActiveView('sales')} 
              style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
            >
              View All
            </span>
          </div>

          <div className="table-container" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Inv No</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                      No billing invoices yet.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map(inv => (
                    <tr key={inv.invoiceNo}>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNo}</td>
                      <td>{inv.customerName}</td>
                      <td>{inv.date}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          inv.paymentStatus === 'Paid' ? 'badge-success' : 
                          inv.paymentStatus === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Catalog Overview / Hot Selling items */}
        <div className="card">
          <h3 className="card-title">Top Value Inventory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topProducts.map(p => (
              <div 
                key={p.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock: {p.stock} units | HSN: {p.hsn}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>₹{p.sellingPrice}</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>{p.taxRate}% GST</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
