import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquarePlus, RefreshCw } from 'lucide-react';

const AIAssistant = ({ 
  products, 
  customers, 
  suppliers, 
  invoices,
  purchases,
  settings,
  openPurchaseModal 
}) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am your Vyapora AI Business Copilot. I can analyze your inventory, track customer dues, calculate tax liabilities, suggest reorders, and answer questions about your entire business. Ask me anything, or pick a question below.',
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presetQueries = [
    { label: '📦 Low Stock Items', query: 'Which products are low on stock?' },
    { label: '💰 Who owes us money?', query: 'Who owes us the most money?' },
    { label: '📊 Reorder Recommendations', query: 'Generate stock reorder recommendations' },
    { label: '⚠️ Expiring Batches', query: 'Which items are expiring next month?' },
    { label: '📈 Sales Summary', query: 'Show sales summary of this month' },
    { label: '🚛 Supplier Dues', query: 'Which suppliers do we owe money to?' },
    { label: '💼 Profit Analysis', query: 'Show me profit analysis' },
    { label: '📋 All Customers', query: 'List all customers' },
    { label: '🏭 Warehouse Stock', query: 'Show stock by warehouse' },
    { label: '🧾 GST Tax Report', query: 'Show GST tax collected' },
    { label: '🏆 Top Products', query: 'Which are my top selling products?' },
    { label: '❓ How to use', query: 'What can you do?' }
  ];

  const handleQuerySubmit = (queryText) => {
    if (!queryText.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: queryText, type: 'text' }]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const response = generateAIResponse(queryText.toLowerCase());
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800);
  };

  const generateAIResponse = (query) => {
    const today = new Date();

    // ── WHAT CAN YOU DO ──
    if (query.includes('what can you do') || query.includes('help') || query.includes('how to') || query.includes('features') || query.includes('capabilities')) {
      return {
        sender: 'ai',
        text: `I am your **Vyapora AI Business Copilot**, here to help you manage your entire wholesale business. Here's what I can do:\n\n` +
              `**Inventory Management:**\n` +
              `• Which products are low on stock?\n` +
              `• Which items are expiring soon?\n` +
              `• Show stock by warehouse location\n` +
              `• What is my total stock valuation?\n` +
              `• Generate reorder recommendations\n` +
              `• How many SKUs do I have?\n\n` +
              `**Sales & Invoices:**\n` +
              `• Show sales summary\n` +
              `• What is my revenue?\n` +
              `• Which invoices are unpaid?\n` +
              `• Show pending payments\n\n` +
              `**Customers:**\n` +
              `• Who owes us money?\n` +
              `• List all customers\n` +
              `• Who is my best customer?\n` +
              `• Show customer balances\n\n` +
              `**Suppliers:**\n` +
              `• Which suppliers do we owe?\n` +
              `• Show supplier payables\n\n` +
              `**Finance & Tax:**\n` +
              `• Show GST tax collected\n` +
              `• Show profit analysis\n` +
              `• Calculate margins\n\n` +
              `Just type your question naturally and I'll find the answer!`,
        type: 'text'
      };
    }

    // ── LOW STOCK ──
    if (query.includes('low stock') || query.includes('stock alert') || query.includes('out of stock') || query.includes('running out')) {
      const lowStockItems = products.filter(p => p.stock <= p.minStock);
      if (lowStockItems.length === 0) {
        return { sender: 'ai', text: 'Great news! All products in your inventory have healthy stock levels. No low stock warnings.', type: 'text' };
      }
      return {
        sender: 'ai',
        text: `You have ${lowStockItems.length} products that are below their minimum stock levels. I recommend ordering them soon.`,
        type: 'table',
        headers: ['Product', 'Stock', 'Min Limit', 'Warehouse'],
        rows: lowStockItems.map(p => [p.name, p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} units`, `${p.minStock} units`, p.warehouse || 'N/A']),
        hasAction: true,
        actionLabel: 'Create Purchase Order',
        actionType: 'purchase'
      };
    }

    // ── CUSTOMER DUES ──
    if ((query.includes('owe') || query.includes('due') || query.includes('pending') || query.includes('dues') || query.includes('receivable')) && (query.includes('customer') || query.includes('client') || query.includes('money') || query.includes('balance') || query.includes('who'))) {
      const debtors = customers.filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);
      if (debtors.length === 0) {
        return { sender: 'ai', text: 'Excellent! There are no outstanding customer balances. All bills have been cleared.', type: 'text' };
      }
      const totalRec = debtors.reduce((sum, d) => sum + d.balance, 0);
      return {
        sender: 'ai',
        text: `You have ${debtors.length} clients with outstanding balances, totaling ₹${totalRec.toLocaleString('en-IN')}. Here are the top pending accounts:`,
        type: 'table',
        headers: ['Customer Name', 'Phone No.', 'Outstanding Balance (₹)'],
        rows: debtors.map(d => [d.name, d.phone, `₹${d.balance.toLocaleString('en-IN')}`]),
        hasAction: false
      };
    }

    // ── EXPIRING ──
    if (query.includes('expir') || query.includes('expiry') || query.includes('expire') || query.includes('shelf life')) {
      const expiringItems = products.filter(p => {
        if (!p.expiryDate) return false;
        const exp = new Date(p.expiryDate);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      });
      if (expiringItems.length === 0) {
        return { sender: 'ai', text: 'I checked your warehouse batches. No products are expiring within the next 30 days.', type: 'text' };
      }
      return {
        sender: 'ai',
        text: `Warning: You have ${expiringItems.length} batches expiring soon or already expired. Please check their shelves:`,
        type: 'table',
        headers: ['Product Name', 'Batch No', 'Expiry Date', 'Status'],
        rows: expiringItems.map(p => {
          const exp = new Date(p.expiryDate);
          const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          return [p.name, p.batchNo, p.expiryDate, diffDays < 0 ? 'EXPIRED' : `Expires in ${diffDays} days`];
        })
      };
    }

    // ── REORDER ──
    if (query.includes('recommend') || query.includes('reorder') || query.includes('suggest') || query.includes('restock')) {
      const lowStockItems = products.filter(p => p.stock <= p.minStock);
      if (lowStockItems.length === 0) {
        return { sender: 'ai', text: 'Stock levels are optimal. No reorders needed at the moment.', type: 'text' };
      }
      const recommendations = lowStockItems.map(p => {
        const suggestQty = Math.max(10, (p.minStock * 3) - p.stock);
        return { name: p.name, current: p.stock, suggest: suggestQty, cost: suggestQty * p.costPrice };
      });
      const totalCost = recommendations.reduce((sum, r) => sum + r.cost, 0);
      return {
        sender: 'ai',
        text: `Here is a suggested replenishment list. Total estimated procurement cost: ₹${totalCost.toLocaleString('en-IN')}`,
        type: 'table',
        headers: ['Product', 'Current Stock', 'Recommended Order', 'Est. Cost'],
        rows: recommendations.map(r => [r.name, `${r.current} units`, `${r.suggest} units`, `₹${r.cost.toLocaleString('en-IN')}`]),
        hasAction: true,
        actionLabel: 'Open Purchase PO Modal',
        actionType: 'purchase'
      };
    }

    // ── SUPPLIER DUES ──
    if (query.includes('supplier') && (query.includes('owe') || query.includes('due') || query.includes('debt') || query.includes('payable') || query.includes('pay'))) {
      const dueSuppliers = suppliers.filter(s => s.dues > 0);
      if (dueSuppliers.length === 0) {
        return { sender: 'ai', text: 'Great! You have cleared all dues with your wholesale suppliers.', type: 'text' };
      }
      const totalPay = dueSuppliers.reduce((sum, s) => sum + s.dues, 0);
      return {
        sender: 'ai',
        text: `You have ₹${totalPay.toLocaleString('en-IN')} outstanding payables across ${dueSuppliers.length} suppliers:`,
        type: 'table',
        headers: ['Supplier Name', 'Contact', 'Dues Owed (₹)'],
        rows: dueSuppliers.map(s => [s.name, s.contactPerson, `₹${s.dues.toLocaleString('en-IN')}`])
      };
    }

    // ── SALES / REVENUE ──
    if (query.includes('sales') || query.includes('revenue') || query.includes('summary') || query.includes('turnover') || query.includes('income')) {
      const salesCount = invoices.length;
      const salesVol = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
      const collected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
      const pending = Math.max(0, salesVol - collected);
      const paidCount = invoices.filter(i => i.paymentStatus === 'Paid').length;
      const unpaidCount = invoices.filter(i => i.paymentStatus !== 'Paid').length;
      const avgOrder = salesCount > 0 ? Math.round(salesVol / salesCount) : 0;
      return {
        sender: 'ai',
        text: `**Sales & Revenue Summary:**\n\n` +
              `• **Total Invoices**: ${salesCount} (${paidCount} paid, ${unpaidCount} pending)\n` +
              `• **Total Revenue**: ₹${salesVol.toLocaleString('en-IN')}\n` +
              `• **Payments Collected**: ₹${collected.toLocaleString('en-IN')} (${salesVol > 0 ? Math.round((collected / salesVol)*100) : 0}%)\n` +
              `• **Outstanding Dues**: ₹${pending.toLocaleString('en-IN')}\n` +
              `• **Average Order Value**: ₹${avgOrder.toLocaleString('en-IN')}\n\n` +
              `Would you like to know who owes you money?`,
        type: 'text'
      };
    }

    // ── STOCK VALUATION ──
    if (query.includes('valuation') || query.includes('value of stock') || query.includes('worth') || query.includes('stock value') || query.includes('total stock')) {
      const val = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
      const sellVal = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
      const potentialProfit = sellVal - val;
      return {
        sender: 'ai',
        text: `**Stock Valuation Report:**\n\n` +
              `• **Total SKUs**: ${products.length}\n` +
              `• **Total Units in Stock**: ${products.reduce((sum, p) => sum + p.stock, 0).toLocaleString('en-IN')}\n` +
              `• **Cost Price Valuation**: ₹${val.toLocaleString('en-IN')}\n` +
              `• **Selling Price Valuation**: ₹${sellVal.toLocaleString('en-IN')}\n` +
              `• **Potential Gross Profit**: ₹${potentialProfit.toLocaleString('en-IN')}\n\n` +
              `This is calculated as: Current Qty × Price for all ${products.length} active SKUs.`,
        type: 'text'
      };
    }

    // ── PROFIT ANALYSIS ──
    if (query.includes('profit') || query.includes('margin') || query.includes('earnings') || query.includes('gain') || query.includes('analysis')) {
      const totalCost = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
      const totalSell = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
      const grossProfit = totalSell - totalCost;
      const marginPct = totalSell > 0 ? ((grossProfit / totalSell) * 100).toFixed(1) : 0;
      const salesRevenue = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
      const collectedRevenue = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
      return {
        sender: 'ai',
        text: `**Profit & Margin Analysis:**\n\n` +
              `**Inventory Margins:**\n` +
              `• Cost Price Total: ₹${totalCost.toLocaleString('en-IN')}\n` +
              `• Selling Price Total: ₹${totalSell.toLocaleString('en-IN')}\n` +
              `• Gross Profit on Stock: ₹${grossProfit.toLocaleString('en-IN')}\n` +
              `• Gross Margin: ${marginPct}%\n\n` +
              `**Sales Performance:**\n` +
              `• Total Revenue (Invoiced): ₹${salesRevenue.toLocaleString('en-IN')}\n` +
              `• Cash Collected: ₹${collectedRevenue.toLocaleString('en-IN')}\n` +
              `• Outstanding Dues: ₹${Math.max(0, salesRevenue - collectedRevenue).toLocaleString('en-IN')}\n\n` +
              `Tip: Your average markup is ~${marginPct}% across all SKUs.`,
        type: 'text'
      };
    }

    // ── ALL CUSTOMERS ──
    if (query.includes('list all customer') || query.includes('all customer') || query.includes('show customer') || query.includes('customer list') || query.includes('customer name')) {
      if (customers.length === 0) {
        return { sender: 'ai', text: 'No customers found in the system yet. Add your first customer from the Customers page.', type: 'text' };
      }
      return {
        sender: 'ai',
        text: `Here are all ${customers.length} registered customers in your system:`,
        type: 'table',
        headers: ['Customer Name', 'Phone', 'Outstanding (₹)', 'Type'],
        rows: customers.map(c => [c.name, c.phone, `₹${c.balance.toLocaleString('en-IN')}`, c.gstin ? 'B2B (GST)' : 'B2C (Retail)'])
      };
    }

    // ── BEST CUSTOMER ──
    if (query.includes('best customer') || query.includes('top customer') || query.includes('biggest customer') || query.includes('most purchase')) {
      const customerTotals = {};
      invoices.forEach(inv => {
        if (!customerTotals[inv.customerName]) customerTotals[inv.customerName] = 0;
        customerTotals[inv.customerName] += inv.grandTotal;
      });
      const sorted = Object.entries(customerTotals).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) {
        return { sender: 'ai', text: 'No invoice data available to determine top customers yet.', type: 'text' };
      }
      return {
        sender: 'ai',
        text: `Your top customers by total purchase volume:`,
        type: 'table',
        headers: ['Rank', 'Customer Name', 'Total Purchases (₹)'],
        rows: sorted.slice(0, 5).map(([name, total], i) => [`#${i + 1}`, name, `₹${total.toLocaleString('en-IN')}`])
      };
    }

    // ── WAREHOUSE STOCK ──
    if (query.includes('warehouse') || query.includes('godown') || query.includes('stock by location') || query.includes('stock by warehouse') || query.includes('storage')) {
      const warehouseMap = {};
      products.forEach(p => {
        const loc = p.warehouse || 'Unassigned';
        if (!warehouseMap[loc]) warehouseMap[loc] = { count: 0, units: 0, value: 0 };
        warehouseMap[loc].count += 1;
        warehouseMap[loc].units += p.stock;
        warehouseMap[loc].value += p.stock * p.costPrice;
      });
      const warehouseList = Object.entries(warehouseMap);
      if (warehouseList.length === 0) {
        return { sender: 'ai', text: 'No warehouse data found. Assign warehouse locations to products in the Inventory.', type: 'text' };
      }
      return {
        sender: 'ai',
        text: `Here's your stock distribution across ${warehouseList.length} warehouse location(s):`,
        type: 'table',
        headers: ['Warehouse', 'Products', 'Total Units', 'Stock Value (₹)'],
        rows: warehouseList.map(([name, data]) => [name, `${data.count} SKUs`, `${data.units.toLocaleString('en-IN')} units`, `₹${data.value.toLocaleString('en-IN')}`])
      };
    }

    // ── GST / TAX ──
    if (query.includes('gst') || query.includes('tax') || query.includes('cgst') || query.includes('sgst') || query.includes('igst') || query.includes('tax report')) {
      const taxByRate = {};
      invoices.forEach(inv => {
        inv.items.forEach(item => {
          if (!taxByRate[item.taxRate]) taxByRate[item.taxRate] = { taxable: 0, tax: 0 };
          taxByRate[item.taxRate].taxable += item.total;
          taxByRate[item.taxRate].tax += (item.total * item.taxRate) / 100;
        });
      });
      const rates = Object.entries(taxByRate).sort((a, b) => Number(b[0]) - Number(a[0]));
      const totalTax = rates.reduce((sum, [, data]) => sum + data.tax, 0);
      if (rates.length === 0) {
        return { sender: 'ai', text: 'No invoice data with GST calculations found yet. Create invoices to see GST reports.', type: 'text' };
      }
      return {
        sender: 'ai',
        text: `**GST Tax Collection Report:**\n\nTotal tax collected across all invoices: **₹${totalTax.toLocaleString('en-IN')}**`,
        type: 'table',
        headers: ['GST Rate', 'Taxable Value (₹)', 'Tax Amount (₹)'],
        rows: rates.map(([rate, data]) => [`${rate}%`, `₹${data.taxable.toLocaleString('en-IN')}`, `₹${data.tax.toLocaleString('en-IN')}`])
      };
    }

    // ── INVOICE DETAILS ──
    if (query.includes('unpaid invoice') || query.includes('pending invoice') || query.includes('overdue') || query.includes('outstanding invoice')) {
      const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'Paid');
      if (unpaidInvoices.length === 0) {
        return { sender: 'ai', text: 'All invoices are fully paid! No pending or overdue invoices.', type: 'text' };
      }
      const totalDue = unpaidInvoices.reduce((sum, i) => sum + (i.grandTotal - i.amountPaid), 0);
      return {
        sender: 'ai',
        text: `You have ${unpaidInvoices.length} unpaid/partially paid invoices with total outstanding: ₹${totalDue.toLocaleString('en-IN')}:`,
        type: 'table',
        headers: ['Invoice No', 'Customer', 'Total (₹)', 'Paid (₹)', 'Due (₹)', 'Status'],
        rows: unpaidInvoices.map(i => [i.invoiceNo, i.customerName, `₹${i.grandTotal.toLocaleString('en-IN')}`, `₹${i.amountPaid.toLocaleString('en-IN')}`, `₹${(i.grandTotal - i.amountPaid).toLocaleString('en-IN')}`, i.paymentStatus])
      };
    }

    // ── SKU COUNT ──
    if (query.includes('how many sku') || query.includes('total product') || query.includes('total item') || query.includes('how many product') || query.includes('product count') || query.includes('total inventory')) {
      const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
      const categories = [...new Set(products.map(p => p.category))];
      return {
        sender: 'ai',
        text: `**Inventory Overview:**\n\n` +
              `• **Total SKUs**: ${products.length}\n` +
              `• **Total Units in Stock**: ${totalUnits.toLocaleString('en-IN')}\n` +
              `• **Categories**: ${categories.length} (${categories.join(', ')})\n` +
              `• **Warehouses**: ${[...new Set(products.map(p => p.warehouse || 'Unassigned'))].length}\n\n` +
              `Low Stock Items: ${products.filter(p => p.stock <= p.minStock).length}\n` +
              `Out of Stock: ${products.filter(p => p.stock === 0).length}`,
        type: 'text'
      };
    }

    // ── TOP PRODUCTS ──
    if (query.includes('top product') || query.includes('best product') || query.includes('most selling') || query.includes('highest selling') || query.includes('top selling')) {
      const sorted = [...products].sort((a, b) => (b.stock * b.sellingPrice) - (a.stock * a.sellingPrice));
      return {
        sender: 'ai',
        text: `Your top products by inventory value (stock × selling price):`,
        type: 'table',
        headers: ['Product Name', 'Stock', 'Selling Price', 'Inventory Value (₹)'],
        rows: sorted.slice(0, 5).map(p => [p.name, `${p.stock} units`, `₹${p.sellingPrice}`, `₹${(p.stock * p.sellingPrice).toLocaleString('en-IN')}`])
      };
    }

    // ── PURCHASES ──
    if (query.includes('purchase') && !query.includes('reorder') && !query.includes('supplier')) {
      const totalPurchases = purchases.length;
      const purchaseVol = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
      const purchasePaid = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
      return {
        sender: 'ai',
        text: `**Purchase Summary:**\n\n` +
              `• **Total Purchase Orders**: ${totalPurchases}\n` +
              `• **Total Purchase Value**: ₹${purchaseVol.toLocaleString('en-IN')}\n` +
              `• **Amount Paid to Suppliers**: ₹${purchasePaid.toLocaleString('en-IN')}\n` +
              `• **Pending Supplier Dues**: ₹${Math.max(0, purchaseVol - purchasePaid).toLocaleString('en-IN')}`,
        type: 'text'
      };
    }

    // ── CONTACT / BUSINESS INFO ──
    if (query.includes('business name') || query.includes('my business') || query.includes('company name') || query.includes('gstin') || query.includes('business info')) {
      return {
        sender: 'ai',
        text: `**Business Information:**\n\n` +
              `• **Business Name**: ${settings.businessName || 'Not Set'}\n` +
              `• **GSTIN**: ${settings.gstin || 'Unregistered'}\n` +
              `• **Phone**: ${settings.contactNo || 'Not Set'}\n` +
              `• **Email**: ${settings.email || 'Not Set'}\n` +
              `• **Address**: ${settings.address || 'Not Set'}\n` +
              `• **Currency**: ${settings.currency || 'INR'}`,
        type: 'text'
      };
    }

    // ── BALANCE SHEET ──
    if (query.includes('balance sheet') || query.includes('financial') || query.includes('cash flow') || query.includes('net worth')) {
      const totalReceivable = customers.reduce((sum, c) => sum + c.balance, 0);
      const totalPayable = suppliers.reduce((sum, s) => sum + s.dues, 0);
      const stockValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
      const salesCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
      return {
        sender: 'ai',
        text: `**Quick Financial Snapshot:**\n\n` +
              `**Assets:**\n` +
              `• Cash Collected from Sales: ₹${salesCollected.toLocaleString('en-IN')}\n` +
              `• Stock Inventory Value: ₹${stockValue.toLocaleString('en-IN')}\n` +
              `• Customer Receivables: ₹${totalReceivable.toLocaleString('en-IN')}\n\n` +
              `**Liabilities:**\n` +
              `• Supplier Payables: ₹${totalPayable.toLocaleString('en-IN')}\n\n` +
              `**Net Position:** ₹${(salesCollected + stockValue + totalReceivable - totalPayable).toLocaleString('en-IN')}`,
        type: 'text'
      };
    }

    // ── HOW TO / APP USAGE ──
    if (query.includes('how to create') || query.includes('how do i') || query.includes('where can i') || query.includes('invoice kaise') || query.includes('product kaise')) {
      return {
        sender: 'ai',
        text: `**Quick Guide - How to use Vyapora:**\n\n` +
              `**Create an Invoice:**\n` +
              `Go to Sales & Invoices → Click "Create Invoice" → Select customer → Add items → Save\n\n` +
              `**Add a Product:**\n` +
              `Go to Inventory → Click "Add Product" → Fill details (name, price, stock, HSN, GST rate) → Save\n\n` +
              `**Record a Payment:**\n` +
              `Go to Sales & Invoices → Click "Record Payment" → Select customer → Enter amount → Choose mode (UPI/Cash/Card) → Submit\n\n` +
              `**Add a Customer:**\n` +
              `Go to Customers → Click "Add Customer" → Fill name, phone, state, GSTIN → Save\n\n` +
              `**Create Purchase Order:**\n` +
              `Go to Purchases → Click "Create PO" → Select supplier → Add items → Save\n\n` +
              `**Check Reports:**\n` +
              `Go to Reports & Analytics → View GST reports, stock valuation, and sales velocity\n\n` +
              `Ask me anything specific and I'll guide you step by step!`,
        type: 'text'
      };
    }

    // ── HELLO / GREETINGS ──
    if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('namaste') || query === 'hii' || query === 'hey' || query === 'hello') {
      return {
        sender: 'ai',
        text: `Namaste! Welcome to Vyapora AI Copilot. 🙏\n\nI'm here to help you manage your business. You can ask me about:\n\n• Inventory & stock levels\n• Customer dues & payments\n• Supplier payables\n• Sales & revenue\n• GST tax reports\n• Profit margins\n\nOr just type your question naturally!`,
        type: 'text'
      };
    }

    // ── THANKS ──
    if (query.includes('thank') || query.includes('thanks') || query.includes('dhanyavaad') || query.includes('shukriya')) {
      return {
        sender: 'ai',
        text: `You're welcome! I'm always here to help you manage your business. Feel free to ask anything else about your inventory, sales, customers, or finances!`,
        type: 'text'
      };
    }

    // ── DEFAULT FALLBACK ──
    return {
      sender: 'ai',
      text: "I couldn't match that query exactly. Here are some things I can help with:\n\n" +
            "1. *Which products are low on stock?*\n" +
            "2. *Who owes us the most money?*\n" +
            "3. *Generate stock reorder recommendations*\n" +
            "4. *Which items are expiring next month?*\n" +
            "5. *Show sales summary*\n" +
            "6. *Show GST tax report*\n" +
            "7. *Show profit analysis*\n" +
            "8. *List all customers*\n" +
            "9. *Show stock by warehouse*\n" +
            "10. *What can you do?*\n\n" +
            "Try rephrasing your question or pick one of the quick buttons below!",
      type: 'text'
    };
  };

  return (
    <div>
      <div className="mobile-view-header">
        <h1>AI Business Copilot</h1>
        <p>Ask me anything about your business data</p>
        <button className="btn btn-secondary" onClick={() => setMessages([{
          sender: 'ai',
          text: 'Chat reset! Ask me anything about your business.',
          type: 'text'
        }])} style={{ marginTop: 8 }}>
          <MessageSquarePlus size={16} /> Reset Chat
        </button>
      </div>

      <div className="ai-layout">
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message-row ${msg.sender}`}>
                <div className="chat-bubble">
                  {msg.sender === 'ai' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.8rem', marginBottom: '6px' }}>
                      <Sparkles size={14} /> Vyapora Copilot
                    </div>
                  )}
                  {msg.type === 'text' && (
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{msg.text}</div>
                  )}
                  {msg.type === 'table' && (
                    <div>
                      <p style={{ marginBottom: '12px', fontSize: '0.9rem' }}>{msg.text}</p>
                      <div className="table-container" style={{ border: '1px solid #bfdbfe', background: 'white', borderRadius: '6px', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
                              {msg.headers.map((h, i) => (
                                <th key={i} style={{ padding: '8px 12px', fontWeight: 600, color: '#1e3a8a', whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.rows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                {row.map((cell, cidx) => (
                                  <td key={cidx} style={{ padding: '8px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {msg.hasAction && msg.actionType === 'purchase' && (
                        <button onClick={openPurchaseModal} className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                          Create PO & Add Stock Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message-row ai">
                <div className="chat-bubble" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1.5s linear infinite' }} /> 
                  Analyzing business data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
            <div className="preset-queries-box">
              {presetQueries.map((item, idx) => (
                <button key={idx} className="preset-btn" onClick={() => handleQuerySubmit(item.query)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="chat-input"
                placeholder="Ask me anything about your business..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuerySubmit(inputValue)}
              />
              <button className="btn btn-primary btn-icon" onClick={() => handleQuerySubmit(inputValue)} disabled={!inputValue.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
