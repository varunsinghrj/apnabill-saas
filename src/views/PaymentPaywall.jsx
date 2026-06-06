import { useState } from 'react';
import { Check, X, QrCode, LogOut, ArrowRight, Info } from 'lucide-react';

const PaymentPaywall = ({ updateSubscriptionPlan, logoutUser }) => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null); // plan details for checkout modal
  const [checkoutStep, setCheckoutStep] = useState('input'); // input, processing, success
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');

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
      desc: 'Best for large distributors and wholesalers with multiple warehouse locations.',
      features: [
        'Everything in Growth Plan',
        'Unlimited team members',
        'Multi-Warehouse stock transfers',
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
    setCvv('');
    setExpiry('');
  };

  const handleProcessUpgrade = (e) => {
    e.preventDefault();
    setCheckoutStep('processing');
    
    // Simulate payment transaction
    setTimeout(() => {
      const price = billingCycle === 'monthly' ? selectedPlanToBuy.mPrice : Math.round(selectedPlanToBuy.yPrice / 12);
      updateSubscriptionPlan(selectedPlanToBuy.name, price, selectedPlanToBuy.users);
      setCheckoutStep('success');
    }, 2000);
  };

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .paywall-wrapper { width: 100%; max-width: 1200px; margin: 0 auto; padding: 20px; color: #0f172a; }
        .paywall-header-section { text-align: center; margin-bottom: 40px; position: relative; }
        .paywall-badge-alert { display: inline-flex; align-items: center; gap: 6px; background: #fee2e2; border: 1px solid #fecaca; color: #ef4444; padding: 6px 16px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; margin-bottom: 16px; }
        .paywall-title { font-size: 2.5rem; fontWeight: 800; color: #0f172a; letter-spacing: -0.025em; }
        .paywall-subtitle { font-size: 1.05rem; color: #64748b; margin-top: 10px; }
        .cycle-toggle { display: inline-flex; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px; border-radius: 100px; margin: 30px 0 10px 0; }
        .cycle-toggle button { border: none; outline: none; padding: 8px 24px; border-radius: 99px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .cycle-toggle button.active { background: #2563eb; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
        .cycle-toggle button.inactive { background: transparent; color: #64748b; }
        .paywall-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-top: 20px; }
        .pricing-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; display: flex; flex-direction: column; position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .pricing-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border-color: #cbd5e1; }
        .pricing-card.featured { border: 2.5px solid #2563eb; box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.08); }
        .pricing-card.featured::before { content: 'MOST POPULAR'; position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #2563eb; color: #ffffff; padding: 4px 16px; border-radius: 99px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; }
        .plan-price-large { font-size: 3rem; font-weight: 800; color: #0f172a; }
        .features-bullet { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #334155; }
        .features-bullet.not-included { opacity: 0.45; }
        .logout-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
      `}</style>
      <div className="paywall-wrapper">
        
        {/* Top Logout bar */}
        <div className="logout-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              AB
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Vyapora SaaS</span>
          </div>
          <button 
            onClick={logoutUser}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="paywall-header-section">
          <div className="paywall-badge-alert">
            <Info size={14} />
            <span>Active Plan Required</span>
          </div>
          <h1 className="paywall-title">Choose your Vyapora SaaS Plan</h1>
          <p className="paywall-subtitle">
            Your business account is registered. Please select one of our premium Indian wholesale billing packages below to unlock ledger management, GST formatting, and AI analytics.
          </p>

          <div className="cycle-toggle">
            <button 
              className={billingCycle === 'monthly' ? 'active' : 'inactive'} 
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly billing
            </button>
            <button 
              className={billingCycle === 'yearly' ? 'active' : 'inactive'} 
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly billing (Save 20%)
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="paywall-grid">
          {plans.map(plan => {
            const price = billingCycle === 'monthly' ? plan.mPrice : Math.round(plan.yPrice / 12);
            const totalAnnual = plan.yPrice;
            const isFeatured = plan.name === 'Growth Plan';

            return (
              <div key={plan.name} className={`pricing-card ${isFeatured ? 'featured' : ''}`}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{plan.name}</div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', minHeight: '40px', lineHeight: '1.4' }}>{plan.desc}</p>
                
                <div style={{ margin: '24px 0 16px 0', display: 'flex', alignItems: 'baseline' }}>
                  <span className="plan-price-large">₹{price}</span>
                  <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: '6px' }}>/mo</span>
                </div>

                {billingCycle === 'yearly' && (
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '16px' }}>
                    Billed ₹{totalAnnual.toLocaleString('en-IN')}/year
                  </div>
                )}

                <button 
                  className={`btn ${isFeatured ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}
                  onClick={() => handleOpenUpgrade(plan)}
                >
                  Get Started with {plan.name} <ArrowRight size={16} />
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '24px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="features-bullet">
                      <Check size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <div key={idx} className="features-bullet not-included">
                      <X size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Simulated Payment Gateway Modal */}
        {selectedPlanToBuy && (
          <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }}>
            <div className="modal-content" style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
              
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Secure Vyapora Checkout</h3>
                <button className="icon-btn" onClick={() => setSelectedPlanToBuy(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              {checkoutStep === 'input' && (
                <form onSubmit={handleProcessUpgrade}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Package:</span>
                      <strong style={{ color: '#0f172a' }}>{selectedPlanToBuy.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Cycle:</span>
                      <strong style={{ color: '#0f172a' }}>{billingCycle === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#2563eb', borderTop: '1px solid #cbd5e1', paddingTop: '8px', marginTop: '8px' }}>
                      <span>Amount:</span>
                      <span>₹{(billingCycle === 'monthly' ? selectedPlanToBuy.mPrice : selectedPlanToBuy.yPrice).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>Enter Simulated Card Details:</h4>
                  
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Cardholder Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Varun Singh" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Card Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="4000 1234 5678 9010" 
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                  </div>

                  <div className="form-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Expiry Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="MM/YY" 
                        maxLength="5"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>CVV</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="•••" 
                        maxLength="3"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    <QrCode size={20} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.4' }}>
                      <strong>Developer Sandbox Mode:</strong> This checkout process is simulated. Any inputs will succeed, triggering lowdb subscription updates.
                    </span>
                  </div>

                  <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedPlanToBuy(null)} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Process Test Payment</button>
                  </div>
                </form>
              )}

              {checkoutStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div style={{ width: '40px', height: '40px', border: '3.5px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }}></div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Processing Payment...</h4>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px' }}>Validating transaction tokens with simulated gateway.</p>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Check size={28} />
                  </div>
                  <h3 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>Payment Received!</h3>
                  <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '8px', lineHeight: '1.5' }}>
                    Thank you! Your Vyapora account has been upgraded to **{selectedPlanToBuy.name}**.<br />
                    Enjoy full access to billing, invoicing, and team settings.
                  </p>
                  <button 
                    onClick={() => setSelectedPlanToBuy(null)}
                    className="btn btn-primary" 
                    style={{ marginTop: '20px', width: '100%', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Enter Platform Dashboard
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

export default PaymentPaywall;
