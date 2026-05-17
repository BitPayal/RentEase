import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../constants";
import { toast } from 'react-hot-toast';

function MyRentals() {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        fetchMyRentals();
    }, [navigate]);

    const fetchMyRentals = () => {
        const url = API_URL + "/book/my-bookings";
        const token = localStorage.getItem('token');
        axios.get(url, { headers: { Authorization: token } })
            .then((res) => {
                if (res.data.rentals) {
                    setRentals(res.data.rentals);
                }
            })
            .catch((err) => toast.error('Server Err: ' + (err.response?.data?.message || err.message)))
            .finally(() => setLoading(false));
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '60px' }}>
            <Header />
            <div className="container mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 style={{ fontWeight: 800, color: 'var(--text-main)' }}>🎟️ My Rentals</h2>
                        <Link to="/" className="btn btn-primary" style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}>Explore More Items</Link>
                    </div>

                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '30vh' }}>
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {rentals && rentals.length > 0 ? rentals.map((rental) => (
                                <div key={rental._id} className="col-12">
                                    <div className="card shadow-sm p-4 d-flex flex-row align-items-center gap-4" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', background: 'white' }}>
                                        <div style={{ width: '150px', height: '150px', flexShrink: 0 }}>
                                            <img 
                                                src={rental.itemId?.image ? API_URL.replace('/api', '') + '/' + rental.itemId.image.replace(/\\/g, '/') : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                                                alt={rental.itemId?.title || rental.itemId?.pname || "Item"}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' }}
                                            />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{rental.itemId?.title || rental.itemId?.pname || "Deleted Item"}</h4>
                                                <span className="badge" style={{ background: rental.status === 'Completed' ? '#10b981' : (rental.status === 'Active' ? '#3b82f6' : '#f59e0b'), fontSize: '14px', padding: '8px 12px', borderRadius: '8px' }}>
                                                    {rental.status || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-3 text-muted mb-3">
                                                <span><strong>Start:</strong> {formatDate(rental.startDate)}</span>
                                                <span><strong>End:</strong> {formatDate(rental.endDate)}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-4">
                                                <div>
                                                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '12px' }}>Total Paid</small>
                                                    <strong className="fs-5" style={{ color: 'var(--primary)' }}>₹{rental.totalPrice}</strong>
                                                </div>
                                                {parseFloat(rental.depositAmount) > 0 && (
                                                    <div>
                                                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '12px' }}>Deposit Included</small>
                                                        <strong className="fs-6 text-warning">₹{rental.depositAmount}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center w-100 mt-5 p-5 card shadow-sm" style={{ borderRadius: 'var(--radius-lg)', border: 'none', backgroundColor: 'transparent' }}>
                                    <h4 className="text-muted">You haven't booked any items yet.</h4>
                                    <Link to="/" className="btn mt-3" style={{ background: 'linear-gradient(135deg, var(--primary), #0ea5e9)', color: 'white', borderRadius: '10px', fontWeight: 600, padding: '12px 30px' }}>Start Exploring</Link>
                                </div>
                            )}
                        </div>
                    )}
               </div>
        </div>
    );
}

export default MyRentals;
