import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquarePlus, RefreshCw } from 'lucide-react';

const AIAssistant = ({ 
  products, 
  customers, 
  suppliers, 
  invoices, 
  openPurchaseModal 
}) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am your Vyapora AI Assistant. I can analyze your inventory, track customer dues, calculate tax liabilities, and suggest reorders. Ask me anything, or pick a question below.',
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presetQueries = [
    { label: '📦 Low Stock Items', query: 'Which products are low on stock?' },
    { label: '💰 Who owes us money?', query: 'Who owes us the most money?' },
    { label: '📊 Stock Reorder Recommendations', query: 'Generate stock reorder recommendations' },
    { label: '⚠️ Expiring Batches', query: 'Which items are expiring next month?' },
    { label: '📈 Month Sales Summary', query: 'Show sales summary of this month' },
    { label: '🚛 Supplier Dues', query: 'Which suppliers do we owe money to?' }
  ];

  const handleQuerySubmit = (queryText) => {
    if (!queryText.trim()) return;

    // 1. Add User Message
    setMessages(prev => [...prev, { sender: 'user', text: queryText, type: 'text' }]);
    setInputValue('');
    setIsTyping(true);

    // 2. Simulate AI Processing Delay
    setTimeout(() => {
      const response = generateAIResponse(queryText.toLowerCase());
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800);
  };

  // NLP Mock Parser
  const generateAIResponse = (query) => {
    // Helper today reference
    const today = new Date();

    // Query 1: Low stock
    if (query.includes('low stock') || query.includes('stock alert') || query.includes('out of stock')) {
      const lowStockItems = products.filter(p => p.stock <= p.minStock);
      if (lowStockItems.length === 0) {
        return {
          sender: 'ai',
          text: 'Great news! All products in your inventory have healthy stock levels. There are no low stock warnings.',
          type: 'text'
        };
      }
      return {
        sender: 'ai',
        text: `Here are the ${lowStockItems.length} products that are currently below their minimum stock levels. I recommend ordering them soon.`,
        type: 'table',
        headers: ['Product', 'Stock', 'Min Limit', 'Warehouse'],
        rows: lowStockItems.map(p => [
          p.name, 
          p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} units`, 
          `${p.minStock} units`, 
          p.warehouse
        ]),
        hasAction: true,
        actionLabel: 'Create Purchase Order',
        actionType: 'purchase'
      };
    }

    // Query 2: Debts / Customer Dues
    if (query.includes('owe') && (query.includes('customer') || query.includes('client') || query.includes('people') || query.includes('money'))) {
      const debtors = customers.filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);
      if (debtors.length === 0) {
        return {
          sender: 'ai',
          text: 'Excellent! There are no outstanding customer balances. All bills have been cleared.',
          type: 'text'
        };
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

    // Query 3: Expiring soon
    if (query.includes('expir') || query.includes('expiry') || query.includes('expire')) {
      const expiringItems = products.filter(p => {
        if (!p.expiryDate) return false;
        const exp = new Date(p.expiryDate);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // within 30 days or past
      });

      if (expiringItems.length === 0) {
        return {
          sender: 'ai',
          text: 'I checked your warehouse batches. No products are expiring within the next 30 days.',
          type: 'text'
        };
      }

      return {
        sender: 'ai',
        text: `Warning: You have ${expiringItems.length} batches expiring soon or already expired. Please check their shelves:`,
        type: 'table',
        headers: ['Product Name', 'Batch No', 'Expiry Date', 'Status'],
        rows: expiringItems.map(p => {
          const exp = new Date(p.expiryDate);
          const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          const status = diffDays < 0 ? 'EXPIRED' : `Expires in ${diffDays} days`;
          return [p.name, p.batchNo, p.expiryDate, status];
        })
      };
    }

    // Query 4: Reorder Recommendations
    if (query.includes('recommend') || query.includes('reorder') || query.includes('suggest')) {
      const lowStockItems = products.filter(p => p.stock <= p.minStock);
      if (lowStockItems.length === 0) {
        return {
          sender: 'ai',
          text: 'Stock levels are optimal. No reorders are needed at the moment. I will monitor sales velocity and let you know when replenishment is required.',
          type: 'text'
        };
      }

      // Generate suggested quantities: (Min stock * 3) - Current stock
      const recommendations = lowStockItems.map(p => {
        const suggestQty = Math.max(10, (p.minStock * 3) - p.stock);
        const estCost = suggestQty * p.costPrice;
        return {
          name: p.name,
          current: p.stock,
          suggest: suggestQty,
          cost: estCost
        };
      });

      const totalCost = recommendations.reduce((sum, r) => sum + r.cost, 0);

      return {
        sender: 'ai',
        text: `Based on your low stock alerts and minimum quantities, here is a suggested replenishment list. Total estimated stock procurement cost: ₹${totalCost.toLocaleString('en-IN')}`,
        type: 'table',
        headers: ['Product', 'Current Stock', 'Recommended Order', 'Estimated Cost'],
        rows: recommendations.map(r => [
          r.name, 
          `${r.current} units`, 
          `${r.suggest} units`, 
          `₹${r.cost.toLocaleString('en-IN')}`
        ]),
        hasAction: true,
        actionLabel: 'Open Purchase PO Modal',
        actionType: 'purchase'
      };
    }

    // Query 5: Supplier dues
    if (query.includes('supplier') && (query.includes('owe') || query.includes('due') || query.includes('debt') || query.includes('payables'))) {
      const dueSuppliers = suppliers.filter(s => s.dues > 0);
      if (dueSuppliers.length === 0) {
        return {
          sender: 'ai',
          text: 'Great! You have cleared all dues with your wholesale suppliers. Payables balance is ₹0.',
          type: 'text'
        };
      }
      const totalPay = dueSuppliers.reduce((sum, s) => sum + s.dues, 0);
      return {
        sender: 'ai',
        text: `You have ₹${totalPay.toLocaleString('en-IN')} outstanding payables across ${dueSuppliers.length} wholesalers. Here are the dues detail:`,
        type: 'table',
        headers: ['Supplier Name', 'Contact', 'Dues Owed (₹)'],
        rows: dueSuppliers.map(s => [s.name, s.contactPerson, `₹${s.dues.toLocaleString('en-IN')}`])
      };
    }

    // Query 6: Sales summary
    if (query.includes('sales') || query.includes('revenue') || query.includes('summary')) {
      const salesCount = invoices.length;
      const salesVol = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
      const collected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
      const pending = Math.max(0, salesVol - collected);

      return {
        sender: 'ai',
        text: `**Month Sales Summary:**\n\n` +
             `- **Total Invoices Generated**: ${salesCount} Bills\n` +
             `- **Cumulative Sales Volume**: ₹${salesVol.toLocaleString('en-IN')}\n` +
             `- **Payments Collected**: ₹${collected.toLocaleString('en-IN')} (Success rate: ${Math.round((collected / salesVol)*100)}%)\n` +
             `- **Uncollected Outstanding**: ₹${pending.toLocaleString('en-IN')}\n\n` +
             `Would you like to look up who owes you money next?`,
        type: 'text'
      };
    }

    // Query 7: Stock Valuation
    if (query.includes('valuation') || query.includes('value of stock') || query.includes('worth')) {
      const val = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
      return {
        sender: 'ai',
        text: `Your current warehouse stock valuation is **₹${val.toLocaleString('en-IN')}** (calculated as: Current Qty × Wholesale Cost Price for all ${products.length} active SKUs).`,
        type: 'text'
      };
    }

    // Default Fallback
    return {
      sender: 'ai',
      text: "I couldn't match that query exactly. I am trained on your inventory logs, supplier registers, and customer sales ledger accounts. You can ask me:\n\n" +
            "1. *Which products are low on stock?*\n" +
            "2. *Who owes us the most money?*\n" +
            "3. *Generate stock reorder recommendations*\n" +
            "4. *Which items are expiring next month?*\n" +
            "5. *Show sales summary of this month*",
      type: 'text'
    };
  };

  return (
    <div>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>AI Business Copilot</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Conversational assistant to query sales ledger and inventory details</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => setMessages([{
            sender: 'ai',
            text: 'Conversations reset! Pick a question below or enter your own business query.',
            type: 'text'
          }])}
        >
          <MessageSquarePlus size={16} /> Reset Chat
        </button>
      </div>

      {/* AI layout */}
      <div className="ai-layout">
        <div className="chat-panel">
          {/* Messages area */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message-row ${msg.sender}`}>
                <div className="chat-bubble">
                  {msg.sender === 'ai' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.8rem', marginBottom: '6px' }}>
                      <Sparkles size={14} /> Vyapora Copilot
                    </div>
                  )}
                  
                  {/* Text message */}
                  {msg.type === 'text' && (
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </div>
                  )}

                  {/* Table message */}
                  {msg.type === 'table' && (
                    <div>
                      <p style={{ marginBottom: '12px', fontSize: '0.9rem' }}>{msg.text}</p>
                      <div className="table-container" style={{ border: '1px solid #bfdbfe', background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
                              {msg.headers.map((h, i) => (
                                <th key={i} style={{ padding: '8px 12px', fontWeight: 600, color: '#1e3a8a' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.rows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                {row.map((cell, cidx) => (
                                  <td key={cidx} style={{ padding: '8px 12px', color: '#334155' }}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {msg.hasAction && msg.actionType === 'purchase' && (
                        <button 
                          onClick={openPurchaseModal}
                          className="btn btn-primary btn-sm" 
                          style={{ marginTop: '12px' }}
                        >
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
                  Analyzing business databases...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input area */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
            {/* Preset Query Chips */}
            <div className="preset-queries-box">
              {presetQueries.map((item, idx) => (
                <button 
                  key={idx} 
                  className="preset-btn"
                  onClick={() => handleQuerySubmit(item.query)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="chat-input"
                placeholder="Ask e.g. Which products expire next month? Who do we owe money to?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuerySubmit(inputValue)}
              />
              <button 
                className="btn btn-primary btn-icon"
                onClick={() => handleQuerySubmit(inputValue)}
                disabled={!inputValue.trim()}
              >
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
