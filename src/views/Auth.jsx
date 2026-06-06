import { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, Building, User, AlertCircle, Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
);

const Auth = ({ loginUser, registerUser, onboardUser, setActiveView, setSettings }) => {
  const [authMode, setAuthMode] = useState('login'); // login, signup, onboarding
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  
  // Onboarding states
  const [contactNo, setContactNo] = useState('');
  const [gstin, setGstin] = useState('');
  const [gstType, setGstType] = useState('Regular');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [address, setAddress] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await loginUser(email, password);
      setActiveView('dashboard');
    } catch {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !businessName || !name) return;
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await registerUser(name, email, password, businessName);
      // Move to onboarding
      setAuthMode('onboarding');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const settingsData = {
        businessName,
        gstin: gstin || 'Unregistered',
        gstType,
        contactNo,
        email,
        address: address || `${city}, ${state}`,
        currency: 'INR',
        financialYearStart: `${new Date().getFullYear()}-04-01`
      };
      
      // Call backend onboard endpoint
      if (onboardUser) {
        await onboardUser(settingsData);
      }
      // Also update local settings state
      if (setSettings) {
        await setSettings(settingsData);
      }
      
      setActiveView('dashboard');
    } catch (err) {
      setError(err.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Step 1: Try login first
      try {
        await loginUser('admin@vyapora.co.in', 'demo1234');
      } catch {
        // Step 2: If login fails, register (ignore 409 = already exists)
        try {
          await registerUser('Varun Singh', 'admin@vyapora.co.in', 'demo1234', 'Apna Bazaar Wholesalers');
        } catch {
          // Account may already exist, try login again
          await loginUser('admin@vyapora.co.in', 'demo1234');
        }
        // Step 3: Onboard business settings
        if (onboardUser) {
          await onboardUser({
            businessName: 'Apna Bazaar Wholesalers',
            gstin: '09AAAAA1111A1Z1',
            gstType: 'Regular',
            contactNo: '9999888877',
            email: 'admin@vyapora.co.in',
            address: 'Shop No. 14, Main Market, Sector 62, Noida, UP - 201301',
            currency: 'INR',
            financialYearStart: '2026-04-01'
          });
        }
      }
      // Step 4: Load demo data
      const token = localStorage.getItem('vyapora_token');
      if (token) {
        await fetch('/api/auth/demo', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      }
      setActiveView('dashboard');
    } catch {
      setError('Could not load demo. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Puducherry', 'Chandigarh', 'Daman and Diu', 'Dadra and Nagar Haveli', 'Lakshadweep', 'Andaman and Nicobar Islands'
  ];

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .error-box { display: flex; align-items: flex-start; gap: 8px; background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .demo-btn { width: 100%; padding: 10px 18px; border: 1.5px dashed #2563eb; border-radius: 8px; background: #eff6ff; color: #2563eb; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px; }
        .demo-btn:hover { background: #dbeafe; }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: #94a3b8; font-size: 0.8rem; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
      `}</style>
      <div className="auth-wrapper">
        <div className="auth-container">

          {/* ── LOGIN ── */}
          {authMode === 'login' && (
            <div>
              <div className="auth-header">
                <div className="auth-logo">V</div>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Log in to manage billing and inventory</p>
              </div>

              {error && (
                <div className="error-box">
                  <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#dc2626' }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email" className="form-control"
                      placeholder="e.g. admin@vyapora.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '36px' }} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Password</label>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer' }}>Forgot?</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="password" className="form-control"
                      placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '36px' }} required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                  {loading ? <><LoadingSpinner /> Signing in...</> : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
                Don't have a business account?{' '}
                <span onClick={() => { setAuthMode('signup'); setError(''); }} style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Sign Up Free
                </span>
              </div>
            </div>
          )}

          {/* ── SIGNUP ── */}
          {authMode === 'signup' && (
            <div>
              <div className="auth-header">
                <div className="auth-logo">V</div>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Get started with Vyapora SaaS today</p>
              </div>

              {error && (
                <div className="error-box">
                  <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#dc2626' }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text" className="form-control"
                      placeholder="e.g. Varun Singh"
                      value={name} onChange={(e) => setName(e.target.value)}
                      style={{ paddingLeft: '36px' }} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Business / Shop Name *</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text" className="form-control"
                      placeholder="e.g. Verma Wholesalers"
                      value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                      style={{ paddingLeft: '36px' }} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email" className="form-control"
                      placeholder="e.g. contact@verma.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '36px' }} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Security Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="password" className="form-control"
                      placeholder="Min 6 characters"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '36px' }} required minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                  {loading ? <><LoadingSpinner /> Creating Account...</> : <>Next: Business Setup <ArrowRight size={16} /></>}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
                Already registered?{' '}
                <span onClick={() => { setAuthMode('login'); setError(''); }} style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Log In
                </span>
              </div>
            </div>
          )}

          {/* ── ONBOARDING ── */}
          {authMode === 'onboarding' && (
            <div>
              <div className="auth-header">
                <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>OB</div>
                <h2 className="auth-title">Business Onboarding</h2>
                <p className="auth-subtitle">Configure your Indian taxation and billing address</p>
              </div>

              {error && (
                <div className="error-box">
                  <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#dc2626' }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleOnboardingSubmit}>
                <div className="form-group">
                  <label className="form-label">Billing Mobile Number *</label>
                  <input
                    type="text" className="form-control"
                    placeholder="10 digit mobile"
                    value={contactNo} onChange={(e) => setContactNo(e.target.value)}
                    maxLength="10" required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GSTIN (Optional)</label>
                    <input
                      type="text" className="form-control"
                      placeholder="15-digit GSTIN"
                      value={gstin} onChange={(e) => setGstin(e.target.value)}
                      maxLength="15" style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax Category</label>
                    <select value={gstType} onChange={(e) => setGstType(e.target.value)} className="form-control">
                      <option value="Regular">Regular GST Scheme</option>
                      <option value="Composition">Composition Scheme</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text" className="form-control"
                      placeholder="e.g. Noida"
                      value={city} onChange={(e) => setCity(e.target.value)} required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <select value={state} onChange={(e) => setState(e.target.value)} className="form-control">
                      {states.sort().map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Business Address *</label>
                  <textarea
                    className="form-control" rows="2"
                    placeholder="Street address, shop name, pincode"
                    value={address} onChange={(e) => setAddress(e.target.value)} required
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <ShieldCheck size={20} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.4' }}>
                    These settings affect whether SGST/CGST or IGST is applied to billing invoices.
                  </span>
                </div>

                <button type="submit" className="btn btn-success" style={{ width: '100%' }} disabled={loading}>
                  {loading ? <><LoadingSpinner /> Setting up...</> : 'Launch Platform Dashboard'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Auth;
