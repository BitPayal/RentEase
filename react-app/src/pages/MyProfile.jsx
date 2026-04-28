import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../constants";

function MyProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState({ rentalsCount: 0, wasteAvoidedKg: 0 });

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        
        const url = API_URL + "/auth/my-profile";
        const token = localStorage.getItem('token');
        setLoading(true);
        setError(null);
        
        axios.get(url, { headers: { Authorization: token } })
            .then((res) => {
                if (res.data.user) {
                    setUser(res.data.user);
                    setMetrics(res.data.metrics);
                } else {
                    setError('Profile not found.');
                }
            })
            .catch((err) => {
                console.error("Profile fetch error: ", err);
                setError('Failed to load profile. Please try again later.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    const handleUpgrade = () => {
        const confirmPay = window.confirm('Upgrade to RentEase Premium for ₹199/month?\n\n- Waived service fees\n- Priority access to listings\n- Featured products');
        if (confirmPay) {
            const url = API_URL + "/auth/upgrade-premium";
            const token = localStorage.getItem('token');
            
            axios.post(url, {}, { headers: { Authorization: token } })
                .then((res) => {
                    alert(res.data.message);
                    setUser(res.data.user); // update the local state to show premium status
                })
                .catch(() => alert('Upgrade failed!'));
        }
    };

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
                <Header />
                <div className="container mt-5 d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
                <Header />
                <div className="container mt-5">
                    <div className="alert alert-danger shadow-sm rounded-4 text-center p-5">
                        <h4 className="alert-heading fw-bold mb-3">Oops!</h4>
                        <p className="mb-0 text-muted">{error || 'Could not find your profile.'}</p>
                        <button className="btn btn-outline-danger mt-4 rounded-pill px-4" onClick={() => navigate('/')}>Return Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <div className="row g-4 mb-5">
                    {/* Profile Information Section */}
                    <div className="col-md-4">
                        <div className="card shadow-lg p-4 text-center" style={{ borderRadius: 'var(--radius-xl)', border: 'none', background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}>
                            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #0ea5e9)', color: 'white', fontSize: '32px', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <h3 style={{ fontWeight: 800 }}>{user.username}</h3>
                            <p className="text-muted mb-4">{user.email} <br/> {user.phone}</p>
                            
                            {user.isPremium ? (
                                <div className="badge p-3 w-100 mb-3" style={{ background: 'linear-gradient(135deg, #fef08a, #facc15)', color: '#854d0e', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold' }}>⭐ Premium Member</div>
                            ) : (
                                <div className="badge bg-secondary p-2 mb-4 w-100" style={{ borderRadius: '10px' }}>Standard Member</div>
                            )}

                            {!user.isPremium && (
                                <button className="btn w-100 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', borderRadius: '10px', padding: '12px' }} onClick={handleUpgrade}>
                                    Upgrade to Premium ⭐
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Earnings Dashboard */}
                    <div className="col-md-8">
                        <div className="card shadow-lg p-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)' }}>
                            <div className="d-flex align-items-center mb-4">
                                <span style={{ fontSize: '32px', marginRight: '15px' }}>💰</span>
                                <div>
                                    <h2 className="text-success fw-bold mb-0">Earnings Dashboard</h2>
                                    <p className="text-muted mb-0">Track your revenue from rented items.</p>
                                </div>
                            </div>
                            
                            <div className="row mt-3 text-center g-3">
                                <div className="col-md-4">
                                    <div className="p-4 rounded h-100" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                        <h2 className="text-success fw-bold">₹ {user.totalEarnings || 0}</h2>
                                        <h6 className="fw-bold text-success mt-2">Total Earnings</h6>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-4 rounded h-100" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                                        <h2 className="text-warning fw-bold">₹ {user.pendingEarnings || 0}</h2>
                                        <h6 className="fw-bold text-warning mt-2">Pending Balance</h6>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-4 rounded h-100" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                        <h2 className="text-primary fw-bold">₹ {user.completedPayouts || 0}</h2>
                                        <h6 className="fw-bold text-primary mt-2">Completed Payouts</h6>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="row mt-4 mb-2 text-center g-3">
                                <div className="col-md-6 offset-md-3">
                                    <div className="p-4 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <h2 className="text-dark fw-bold">{metrics.rentalsCount !== undefined ? metrics.rentalsCount : (user.bookingsCount || 0)}</h2>
                                        <h6 className="fw-bold text-dark mt-2">Total Items Rented Out</h6>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="alert mt-4 text-center border-0" style={{ background: 'var(--text-main)', color: 'white', borderRadius: '12px' }}>
                                🌱 Your items are making a difference! Keep listing to earn more.
                            </div>
                        </div>

                        {/* Setup KYC / Payouts Section */}
                        <div className="card shadow-lg p-5 mt-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)' }}>
                            <div className="d-flex align-items-center mb-4">
                                <span style={{ fontSize: '32px', marginRight: '15px' }}>🏦</span>
                                <div>
                                    <h2 className="text-dark fw-bold mb-0">Payout Details (KYC)</h2>
                                    <p className="text-muted mb-0">Securely link your bank account to receive rental earnings.</p>
                                </div>
                            </div>

                            {user.bankDetailsAdded ? (
                                <div className="p-4 rounded text-center" style={{ background: '#dcfce7', border: '1px solid #86efac' }}>
                                    <div className="mb-2" style={{ fontSize: '40px' }}>✅</div>
                                    <h5 className="fw-bold text-success mb-1">Bank Account Linked Securely</h5>
                                    <p className="text-success mb-0">Razorpay Connected Account ID: <span className="fw-bold">{user.razorpayAccountId}</span></p>
                                    <small className="text-muted d-block mt-2">Your payments will automatically be deposited here.</small>
                                </div>
                            ) : (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const accountName = e.target.accountName.value;
                                    const accountNumber = e.target.accountNumber.value;
                                    const ifsc = e.target.ifsc.value;
                                    
                                    const confirm = window.confirm('Link this bank account to Razorpay Route for payouts?');
                                    if(confirm) {
                                        const url = API_URL + "/auth/bank-details";
                                        const token = localStorage.getItem('token');
                                        axios.post(url, { accountName, accountNumber, ifsc }, { headers: { Authorization: token } })
                                            .then(res => {
                                                alert(res.data.message);
                                                setUser(res.data.user);
                                            })
                                            .catch(err => alert(err.response?.data?.message || 'Failed to link account'));
                                    }
                                }}>
                                    <div className="alert alert-warning mb-4 fw-bold shadow-sm" style={{ borderRadius: '10px' }}>
                                        ⚠️ To withdraw earnings from rentals, you must add your payout account details.
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-muted mb-2">Account Holder Name</label>
                                        <input name="accountName" type="text" className="form-control form-control-lg bg-light border-0" style={{ borderRadius: '10px' }} required placeholder="e.g., John Doe" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-muted mb-2">Account Number</label>
                                        <input name="accountNumber" type="password" className="form-control form-control-lg bg-light border-0" style={{ borderRadius: '10px' }} required placeholder="••••••••••••" />
                                        <small className="text-muted d-block mt-2">🔒 We encrypt and send this directly to Razorpay. We never store raw account numbers.</small>
                                    </div>
                                    <div className="mb-5">
                                        <label className="form-label fw-bold text-muted mb-2">IFSC Code</label>
                                        <input name="ifsc" type="text" className="form-control form-control-lg bg-light border-0" style={{ borderRadius: '10px' }} required placeholder="e.g., HDFC0001234" />
                                    </div>
                                    <button type="submit" className="btn w-100 fw-bold py-3 text-white shadow" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                                        Securely Link Bank Account 🔐
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;
