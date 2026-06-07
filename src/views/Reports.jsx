import { useState } from 'react';
import { FileSpreadsheet, Percent, BarChart3, TrendingUp } from 'lucide-react';

const Reports = ({ products, invoices, purchases }) => {
  const [activeReportTab, setActiveReportTab] = useState('stock-val');

  // Math Calculations for Reports
  
  // 1. Stock Valuation Report
  const totalStockQty = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalCostVal = products.reduce((acc, curr) => acc + (curr.stock * curr.costPrice), 0);
  const totalRetailVal = products.reduce((acc, curr) => acc + (curr.stock * curr.sellingPrice), 0);
  const potentialProfit = Math.max(0, totalRetailVal - totalCostVal);

  // 2. GST Summary Report (GSTR-1 & GSTR-2 mock)
  const outputGSTCollected = invoices.reduce((acc, curr) => acc + curr.taxAmount, 0);
  const inputGSTCredit = purchases.reduce((acc, curr) => acc + curr.taxAmount, 0);
  const netGSTLiability = outputGSTCollected - inputGSTCredit;

  // Invoice GST Details
  const taxableSales = invoices.reduce((acc, curr) => acc + curr.subtotal, 0);
  const taxablePurchases = purchases.reduce((acc, curr) => acc + curr.subtotal, 0);

  return (
    <div>
      {/* Mobile View Header */}
      <div className="mobile-view-header">
        <h1>Reports</h1>
        <p>Performance Summary</p>
        <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: 8, padding: 3, marginTop: 12 }}>
          <button 
            className={`mobile-chip ${activeReportTab === 'stock-val' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('stock-val')}
            style={{ flex: 1, border: 'none', borderRadius: 6 }}
          >
            Stock
          </button>
          <button 
            className={`mobile-chip ${activeReportTab === 'gst-ledger' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('gst-ledger')}
            style={{ flex: 1, border: 'none', borderRadius: 6 }}
          >
            GST
          </button>
          <button 
            className={`mobile-chip ${activeReportTab === 'profit-margin' ? 'active' : ''}`}
            onClick={() => setActiveReportTab('profit-margin')}
            style={{ flex: 1, border: 'none', borderRadius: 6 }}
          >
            Sales
          </button>
        </div>
      </div>

      {/* Mobile Bento Summary */}
      <div className="mobile-bento">
        <div className="mobile-bento-card full-width">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="mobile-bento-label">Net Revenue</div>
              <div className="mobile-bento-value large" style={{ color: 'var(--primary)' }}>₹{totalRetailVal.toLocaleString('en-IN')}</div>
            </div>
            <span style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              +{totalCostVal > 0 ? Math.round((potentialProfit / totalCostVal) * 100) : 0}%
            </span>
          </div>
          <div className="mobile-progress" style={{ marginTop: 8 }}>
            <div className="mobile-progress-fill primary" style={{ width: '70%' }}></div>
          </div>
        </div>
        <div className="mobile-bento-card">
          <div className="mobile-bento-label">Inventory</div>
          <div className="mobile-bento-value">₹{(totalCostVal / 100000).toFixed(1)}L</div>
          <div className="mobile-progress" style={{ marginTop: 6 }}>
            <div className="mobile-progress-fill success" style={{ width: '65%' }}></div>
          </div>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Optimal Stock</span>
        </div>
        <div className="mobile-bento-card">
          <div className="mobile-bento-label">Sales Velocity</div>
          <div className="mobile-bento-value">{invoices.length}/mo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}></span>
            <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 600 }}>Active</span>
          </div>
        </div>
      </div>

      {/* Desktop View Header */}
      <div className="view-header">
        <div>
          <h2>Reports & Financials</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Generate GST tax statements, audit stock assets, and trace business margins</p>
        </div>
      </div>

      {/* Desktop Reports Navigation Tabs */}
      <div className="desktop-only-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', paddingBottom: '1px' }}>
        <button 
          className={`btn ${activeReportTab === 'stock-val' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('stock-val')}
          style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          <FileSpreadsheet size={16} /> Stock Valuation
        </button>
        <button 
          className={`btn ${activeReportTab === 'gst-ledger' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('gst-ledger')}
          style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          <Percent size={16} /> GSTR Tax Ledger
        </button>
        <button 
          className={`btn ${activeReportTab === 'profit-margin' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('profit-margin')}
          style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          <BarChart3 size={16} /> Sales Performance
        </button>
      </div>

      {/* Report 1: Stock Valuation */}
      {activeReportTab === 'stock-val' && (
        <div>
          {/* Summary Cards */}
          <div className="kpi-grid responsive-grid-3" style={{ marginBottom: '24px' }}>
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Total Asset Cost</span>
                <span className="kpi-value">₹{totalCostVal.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock quantity: {totalStockQty}</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Potential Retail Value</span>
                <span className="kpi-value">₹{totalRetailVal.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>If sold at current MRR</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Expected Profit Margin</span>
                <span className="kpi-value" style={{ color: '#059669' }}>₹{potentialProfit.toLocaleString('en-IN')}</span>
                <span className="kpi-trend trend-up">
                  <TrendingUp size={12} /> Avg Markup: {totalCostVal > 0 ? Math.round((potentialProfit / totalCostVal) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="table-container">
            <div className="table-header-controls">
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Warehouse Stock Valuation Summary</h4>
            </div>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Warehouse</th>
                  <th style={{ textAlign: 'right' }}>Stock Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Cost (₹)</th>
                  <th style={{ textAlign: 'right' }}>Unit Retail (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Asset Cost (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Retail Value (₹)</th>
                  <th style={{ textAlign: 'right' }}>Est Margin (₹)</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const assetCost = p.stock * p.costPrice;
                  const retailVal = p.stock * p.sellingPrice;
                  const margin = retailVal - assetCost;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.warehouse}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{p.stock}</td>
                      <td style={{ textAlign: 'right' }}>₹{p.costPrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>₹{p.sellingPrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{assetCost.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, color: '#2563eb' }}>₹{retailVal.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>₹{margin.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: GST Ledger */}
      {activeReportTab === 'gst-ledger' && (
        <div>
          {/* Summary Cards */}
          <div className="kpi-grid responsive-grid-3" style={{ marginBottom: '24px' }}>
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Output Tax Collected (Sales)</span>
                <span className="kpi-value" style={{ color: '#2563eb' }}>₹{outputGSTCollected.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Filing form GSTR-1 liability</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Input Tax Credit (Purchases)</span>
                <span className="kpi-value" style={{ color: '#059669' }}>₹{inputGSTCredit.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Claimed via GSTR-2B logs</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Net GST Cash Liability</span>
                <span className="kpi-value" style={{ color: netGSTLiability >= 0 ? '#b45309' : '#059669' }}>
                  ₹{netGSTLiability.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {netGSTLiability >= 0 ? 'Cash payment required' : 'Excess Credit (Carry-forward)'}
                </span>
              </div>
            </div>
          </div>

          <div className="responsive-grid-2" style={{ gap: '24px' }}>
            {/* GSTR-1 Sales Breakdown */}
            <div className="table-container">
              <div className="table-header-controls">
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Sales (GSTR-1 Liability Accounts)</h4>
              </div>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th style={{ textAlign: 'right' }}>Taxable Sales (₹)</th>
                    <th style={{ textAlign: 'right' }}>GST Rate</th>
                    <th style={{ textAlign: 'right' }}>Tax Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.invoiceNo}>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNo}</td>
                      <td style={{ textAlign: 'right' }}>₹{inv.subtotal.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>Mixed</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>₹{inv.taxAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700, background: '#f8fafc' }}>
                    <td>Total</td>
                    <td style={{ textAlign: 'right' }}>₹{taxableSales.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>-</td>
                    <td style={{ textAlign: 'right', color: '#2563eb' }}>₹{outputGSTCollected.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GSTR-2 Purchase Breakdown */}
            <div className="table-container">
              <div className="table-header-controls">
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Purchases (GSTR-2 ITC Accounts)</h4>
              </div>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>PO No</th>
                    <th style={{ textAlign: 'right' }}>Taxable Purchase (₹)</th>
                    <th style={{ textAlign: 'right' }}>GST Rate</th>
                    <th style={{ textAlign: 'right' }}>ITC Claimed (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(po => (
                    <tr key={po.poNo}>
                      <td style={{ fontWeight: 600 }}>{po.poNo}</td>
                      <td style={{ textAlign: 'right' }}>₹{po.subtotal.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>Mixed</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>₹{po.taxAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700, background: '#f8fafc' }}>
                    <td>Total</td>
                    <td style={{ textAlign: 'right' }}>₹{taxablePurchases.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>-</td>
                    <td style={{ textAlign: 'right', color: '#059669' }}>₹{inputGSTCredit.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 3: Sales Performance */}
      {activeReportTab === 'profit-margin' && (
        <div className="card">
          <h3 className="card-title">Top Selling SKU Performance</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            {products.slice(0, 5).map((p, idx) => {
              // Mock product performance values
              const unitsSold = 50 + (idx * 22);
              const maxUnits = 200;
              const barWidth = (unitsSold / maxUnits) * 100;
              
              return (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    <span>{p.name} ({p.category})</span>
                    <span style={{ color: '#2563eb' }}>{unitsSold} Units Sold - Revenue: ₹{(unitsSold * p.sellingPrice).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${barWidth}%`, 
                        background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                        borderRadius: '6px'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
