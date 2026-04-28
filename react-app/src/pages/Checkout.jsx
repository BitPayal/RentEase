import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import API_URL from "../constants";
import { demoPaymentOrder } from "../services/api";
import VerificationGate from "../components/VerificationGate";

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { item, startDate, endDate, diffDays } = location.state || {};

    const [isBooking, setIsBooking] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [paymentError, setPaymentError] = useState(null);
    const [liveUser, setLiveUser] = useState(null);

    useEffect(() => {
        if (!item || !startDate || !endDate) {
            navigate("/");
            return;
        }

        const token = localStorage.getItem('token');
        if (token) {
            axios.get(API_URL + "/auth/my-profile", { headers: { Authorization: token } })
                .then(res => {
                    setLiveUser(res.data.user);
                    setCheckingProfile(false);
                })
                .catch(err => {
                    console.error("Failed to fetch user profile", err);
                    setCheckingProfile(false);
                });
        } else {
            setCheckingProfile(false);
        }
    }, [item, startDate, endDate, navigate]);

    if (!item) return null;

    const priceNum = parseFloat(item.pricePerDay || item.price) || 0;
    const totalRent = diffDays * priceNum;
    const depositNum = parseFloat(item.deposit) || 0;
    const totalPrice = totalRent + depositNum;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleProceedToPayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first to book an item.');
            navigate('/login');
            return;
        }

        if (liveUser && liveUser.verificationStatus !== 'verified') {
             // Failsafe in case button is somehow clicked
             setShowVerificationModal(true);
             return;
        }

        triggerPayment(token);
    };

    const triggerPayment = (token) => {
        setIsBooking(true);
        setPaymentError(null);
        
        const url = API_URL + "/book";
        const data = {
            itemId: item._id,
            ownerId: item.ownerId._id || item.ownerId,
            startDate,
            endDate,
            totalPrice,
            depositAmount: depositNum
        };

        axios.post(url, data, { headers: { Authorization: token } })
            .then(async (res) => {
                try {
                    const booking = res.data.booking;
                    
                    // SIMULATE PAYMENT
                    await demoPaymentOrder({ bookingId: booking._id }, token);
                    
                    // Redirect directly to Success Page
                    navigate('/booking-success', { state: { booking, item } });

                } catch (error) {
                    console.error("Payment failed", error);
                    const backendMsg = error.response?.data?.error || error.response?.data?.message || error.message;
                    setPaymentError("Payment failed: " + backendMsg);
                    setIsBooking(false);
                }
            })
            .catch((err) => {
                console.error("Booking error: ", err);
                setPaymentError('Booking failed! ' + (err.response?.data?.message || 'Please try again.'));
                setIsBooking(false);
            });
    };

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '60px' }}>
            <Header />

            {showVerificationModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered mt-5 mb-5">
                        <div className="modal-content shadow-lg border-0 rounded-4" style={{ overflow: 'hidden' }}>
                            <div className="modal-header border-0 bg-light p-4">
                                <h4 className="modal-title fw-bold">User Verification Required 🛡️</h4>
                                <button type="button" className="btn-close fs-5" onClick={() => setShowVerificationModal(false)}></button>
                            </div>
                            <div className="modal-body p-0 pb-4 bg-light">
                                <VerificationGate>
                                    <div className="p-5 text-center">
                                        <div style={{fontSize: '60px'}}>✅</div>
                                        <h3 className="text-success fw-bold mt-3">Identity Verified!</h3>
                                        <p className="text-muted fs-5">Thank you. You can now securely proceed with your payment.</p>
                                        <div className="mt-4">
                                            <button className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow" onClick={() => {
                                                setShowVerificationModal(false);
                                                handleProceedToPayment();
                                            }}>
                                                Continue to Payment →
                                            </button>
                                        </div>
                                    </div>
                                </VerificationGate>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mt-5">
                <h2 className="fw-bold mb-4">Checkout Summary</h2>
                
                <div className="row g-4">
                    {/* Left Column: Item Details & Dates */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-4 border-bottom pb-3">Item Details</h5>
                            
                            <div className="d-flex flex-column flex-md-row gap-4 align-items-center align-items-md-start">
                                <div style={{ width: '200px', height: '150px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden' }}>
                                    <img 
                                        src={item.image ? API_URL.replace('/api', '') + '/' + item.image.replace(/\\/g, '/') : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'} 
                                        alt="Product" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' }}
                                    />
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-2">{item.title || item.pname}</h4>
                                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill me-2">{item.category}</span>
                                    {item.ownerId?.username && (
                                        <span className="text-muted small">
                                            Owned by <strong>{item.ownerId.username}</strong>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 p-4">
                            <h5 className="fw-bold mb-4 border-bottom pb-3">Rental Duration</h5>
                            <div className="row text-center">
                                <div className="col-5">
                                    <div className="p-3 bg-light rounded-3">
                                        <small className="text-muted text-uppercase fw-bold d-block mb-1">Start Date</small>
                                        <span className="fs-5 fw-bold text-dark">{formatDate(startDate)}</span>
                                    </div>
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-center">
                                    <span className="fs-3 text-muted">→</span>
                                </div>
                                <div className="col-5">
                                    <div className="p-3 bg-light rounded-3">
                                        <small className="text-muted text-uppercase fw-bold d-block mb-1">End Date</small>
                                        <span className="fs-5 fw-bold text-dark">{formatDate(endDate)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <span className="badge bg-primary px-4 py-2 fs-6 rounded-pill">Total: {diffDays} {diffDays === 1 ? 'Day' : 'Days'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="col-lg-4">
                        <div className="card shadow-lg border-0 rounded-4 sticky-top" style={{ top: '100px' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4 border-bottom pb-3">Price Breakdown</h5>
                                
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">₹{priceNum} x {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
                                    <span className="fw-bold">₹{totalRent}</span>
                                </div>
                                
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted d-flex align-items-center gap-1">
                                        Security Deposit
                                        <span title="Fully refundable upon item return" style={{ cursor: 'help', fontSize: '14px' }}>ⓘ</span>
                                    </span>
                                    <span className="fw-bold text-warning">₹{depositNum}</span>
                                </div>
                                
                                <hr className="my-4" />
                                
                                <div className="d-flex justify-content-between mb-4 align-items-center">
                                    <h4 className="fw-bold mb-0">Total Pay</h4>
                                    <h3 className="fw-bold text-primary mb-0">₹{totalPrice}</h3>
                                </div>

                                {paymentError && (
                                    <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3 d-flex align-items-center gap-2">
                                        <span style={{ fontSize: '18px' }}>⚠️</span> 
                                        {paymentError}
                                    </div>
                                )}

                                {checkingProfile ? (
                                    <div className="text-center p-3 text-muted">Checking account status...</div>
                                ) : liveUser?.verificationStatus === 'pending' ? (
                                    <div className="alert alert-info py-3 px-3 border-0 rounded-3 shadow-sm mb-0">
                                        <h6 className="fw-bold mb-1">⏳ Verification Pending</h6>
                                        <p className="mb-0 small">Your identity verification has been submitted and is waiting for admin approval.</p>
                                    </div>
                                ) : liveUser?.verificationStatus !== 'verified' ? (
                                    <div className="alert alert-warning py-3 px-3 border-0 rounded-3 shadow-sm mb-0">
                                        <h6 className="fw-bold mb-1">⚠️ Verification Required</h6>
                                        <p className="mb-3 small">Complete identity verification to proceed with booking securely.</p>
                                        <button className="btn btn-warning w-100 fw-bold shadow-sm" onClick={() => setShowVerificationModal(true)}>
                                            Verify Now
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            className="btn w-100 py-3 shadow-sm" 
                                            onClick={handleProceedToPayment} 
                                            disabled={isBooking}
                                            style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '18px', transition: 'all 0.2s' }}
                                        >
                                            {isBooking ? 'Processing secure payment...' : 'Confirm Booking'}
                                        </button>
                                        
                                        <p className="text-center text-muted mt-3 small">
                                            <span className="d-block mb-1">🏦 Secure via Rentalis</span>
                                            You will bypass external gateway billing for testing.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
