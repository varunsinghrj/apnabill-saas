import { useState } from 'react';
import { Check, X, QrCode } from 'lucide-react';

const SettingsBilling = ({ subscription, updateSubscriptionPlan }) => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null); // plan details for checkout modal
  const [checkoutStep, setCheckoutStep] = useState('input'); // input, processing, success
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const plans = [
    {
      name: 'Starter Plan',
      mPrice: 499,
      yPrice: 4788, // 399/month
      users: 2,
      desc: 'Perfect for small retailers & Kirana shops getting started with billing.',
      features: [
        'Unlimited sales billing',
        'Basic stock tracking',
        'AI Assistant (50 questions/day)',
        'Up to 2 staff members',
        'GST invoice templates'
      ],
      notIncluded: [
        'Advanced GST filing reports (GSTR-1, 2)',
        'Multi-Warehouse setups'
      ]
    },
    {
      name: 'Growth Plan',
      mPrice: 999,
      yPrice: 9588, // 799/month
      users: 5,
      desc: 'Ideal for growing retail stores, wholesalers, and general trade stores.',
      features: [
        'Everything in Starter Plan',
        'Batch & Expiry alerts',
        'Full AI Assistant analytics',
        'Up to 5 staff members',
        'GST filing reports (GSTR-1, 2)'
      ],
      notIncluded: [
        'Multi-Warehouse setups'
      ]
    },
    {
      name: 'Wholesaler Pro',
      mPrice: 2499,
      yPrice: 23988, // 1999/month
      users: 999, // unlimited
      desc: 'Best for distributors and heavy wholesalers handling multiple warehouses.',
      features: [
        'Everything in Growth Plan',
        'Unlimited team members',
        'Multi-Warehouse stock transfer',
        'Dedicated account manager',
        'Priority customer support'
      ],
      notIncluded: []
    }
  ];

  const handleOpenUpgrade = (plan) => {
    setSelectedPlanToBuy(plan);
    setCheckoutStep('input');
    setCardName('');
    setCardNumber('');
  };

  const handleProcessUpgrade = (e) => {
    e.preventDefault();
    setCheckoutStep('processing');
    
    // Simulate transaction delay
    setTimeout(() => {
      const price = billingCycle === 'monthly' ? selectedPlanToBuy.mPrice : Math.round(selectedPlanToBuy.yPrice / 12);
      updateSubscriptionPlan(selectedPlanToBuy.name, price, selectedPlanToBuy.users);
      setCheckoutStep('success');
    }, 1800);
  };

  const isCurrentPlan = (planName) => {
    if (subscription.plan === 'Starter Plan' && planName === 'Starter Plan') return true;
    if (subscription.plan === 'Growth Plan' && planName === 'Growth Plan') return true;
    if (subscription.plan === 'Wholesaler Pro' && planName === 'Wholesaler Pro') return true;
    return false;
  };

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Subscription & Billing</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Choose plans, review payment logs, and check package limits</p>
        </div>

        {/* Monthly/Yearly toggle */}
        <div style={{ background: '#e2e8f0', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
          <button 
            className={`btn btn-sm ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setBillingCycle('monthly')}
            style={{ border: 'none', padding: '6px 12px' }}
          >
            Monthly
          </button>
          <button 
            className={`btn btn-sm ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setBillingCycle('yearly')}
            style={{ border: 'none', padding: '6px 12px' }}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Current Subscription Alert */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '8px', fontWeight: 700 }}>CURRENT PLAN</span>
          <h3 style={{ fontSize: '1.4rem', color: '#1e3b8a' }}>{subscription.plan}</h3>
          <p style={{ fontSize: '0.85rem', color: '#1e40af', marginTop: '4px' }}>
            Status: <strong>{subscription.status}</strong> | Monthly cost: <strong>₹{subscription.price}/mo</strong> | Renews/Expires on: <strong>{subscription.expiryDate}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#1e40af', display: 'block', marginBottom: '4px' }}>Dues Limit</span>
          <strong style={{ fontSize: '1.1rem', color: '#1e3b8a' }}>{subscription.usersAllowed === 999 ? 'Unlimited' : `${subscription.usersAllowed} Team Seats`}</strong>
        </div>
      </div>

      {/* Subscription Grid */}
      <div className="plans-grid">
        {plans.map(plan => {
          const price = billingCycle === 'monthly' ? plan.mPrice : Math.round(plan.yPrice / 12);
          const current = isCurrentPlan(plan.name);
          const recommended = plan.name === 'Growth Plan';

          return (
            <div key={plan.name} className={`plan-card ${recommended ? 'recommended' : ''}`}>
              {recommended && <span className="plan-badge">MOST POPULAR</span>}
              
              <div className="plan-name">{plan.name}</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', minHeight: '48px' }}>{plan.desc}</p>
              
              <div className="plan-price-box">
                <span className="plan-price">₹{price}</span>
                <span className="plan-price-period">/ month</span>
              </div>

              {current ? (
                <button className="btn btn-success" style={{ width: '100%', cursor: 'default' }} disabled>
                  <Check size={16} /> Currently Active
                </button>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleOpenUpgrade(plan)}>
                  Upgrade to {plan.name}
                </button>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

              <ul className="plan-features-list">
                {plan.features.map((f, i) => (
                  <li key={i} className="plan-feature-item">
                    <Check className="plan-feature-icon" size={16} />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <li key={i} className="plan-feature-item" style={{ opacity: 0.5 }}>
                    <X size={16} style={{ color: '#ef4444', marginRight: '4px' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Interactive Mock Checkout Modal */}
      {selectedPlanToBuy && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Secure Mock SaaS Payment</h3>
              <button className="icon-btn" onClick={() => setSelectedPlanToBuy(null)}><X size={20} /></button>
            </div>
            
            {checkoutStep === 'input' && (
              <form onSubmit={handleProcessUpgrade}>
                <div className="modal-body">
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Upgrading to:</span>
                      <strong>{selectedPlanToBuy.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: '#64748b' }}>Billing Period:</span>
                      <strong>{billingCycle === 'monthly' ? 'Monthly Billing' : 'Yearly Billing'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#2563eb', borderTop: '1px solid #cbd5e1', paddingTop: '10px', marginTop: '10px' }}>
                      <span>Total Owed:</span>
                      <span>₹{(billingCycle === 'monthly' ? selectedPlanToBuy.mPrice : selectedPlanToBuy.yPrice).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Choose Test Method:</h4>
                  
                  {/* Option 1: Mock Card */}
                  <div className="form-group">
                    <label className="form-label">Test Cardholder Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Varun Gupta" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Number (Simulated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="4000 1234 5678 9010" 
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>

                  {/* Option 2: Mock UPI QR Scan helper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #10b981', marginTop: '12px' }}>
                    <QrCode size={36} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                      No actual money will be charged. This payment gateway simulation automatically provisions subscription features in local storage.
                    </span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedPlanToBuy(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Authorize Test Payment</button>
                </div>
              </form>
            )}

            {checkoutStep === 'processing' && (
              <div className="modal-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px auto' }}></div>
                <h4>Verifying Transaction...</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px' }}>Communicating with simulated bank servers.</p>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="modal-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', display: 'flex', alignItems: 'center', justifyCentert: 'center', margin: '0 auto 20px auto', justifyContent: 'center' }}>
                  <Check size={32} />
                </div>
                <h3 style={{ color: '#0f172a' }}>Payment Successful!</h3>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.5' }}>
                  Your business account has been upgraded to **{selectedPlanToBuy.name}**.<br />
                  All advanced metrics, user roles, and chatbot extensions have been unlocked.
                </p>
                <button 
                  onClick={() => setSelectedPlanToBuy(null)}
                  className="btn btn-primary" 
                  style={{ marginTop: '24px', width: '100%' }}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SettingsBilling;
