import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { getOwnerBookings } from "../services/api";
import API_URL from "../constants";
import { toast } from 'react-hot-toast';

function OwnerBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        fetchOwnerBookings();
    }, [navigate]);

    const fetchOwnerBookings = () => {
        const token = localStorage.getItem('token');
        getOwnerBookings(token)
            .then((res) => {
                if (res.data.bookings) {
                    setBookings(res.data.bookings);
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
                    <h2 style={{ fontWeight: 800, color: 'var(--text-main)' }}>💰 Earnings Dashboard</h2>
                    <Link to="/my-items" className="btn btn-outline-primary" style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}>Manage Listings</Link>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '30vh' }}>
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {bookings && bookings.length > 0 ? bookings.map((booking) => (
                            <div key={booking._id} className="col-12">
                                <div className="card shadow-sm p-4 d-flex flex-row align-items-center gap-4" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', background: 'white' }}>
                                    <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                                        <img 
                                            src={booking.itemId?.image ? API_URL.replace('/api', '') + '/' + booking.itemId.image.replace(/\\/g, '/') : (booking.itemId?.pimage ? API_URL.replace('/api', '') + '/' + booking.itemId.pimage.replace(/\\/g, '/') : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80')} 
                                            alt={booking.itemId?.title || booking.itemId?.pname || "Item"}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' }}
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{booking.itemId?.title || booking.itemId?.pname || "Deleted Item"}</h4>
                                            <div className="text-end">
                                                <span className="badge mb-1 d-block" style={{ background: booking.status === 'Completed' ? '#10b981' : (booking.status === 'Cancelled' ? '#ef4444' : '#3b82f6'), fontSize: '13px', padding: '6px 10px', borderRadius: '6px' }}>
                                                    Status: {booking.status || 'Pending'}
                                                </span>
                                                {booking.paymentStatus && (
                                                    <span className="badge text-dark" style={{ background: booking.paymentStatus === 'Held' ? '#fde047' : '#e2e8f0', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>
                                                        Escrow: {booking.paymentStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block"><strong className="text-dark">Renter:</strong> {booking.userId?.username} ({booking.userId?.email})</small>
                                            <small className="text-muted d-block"><strong className="text-dark">Dates:</strong> {formatDate(booking.startDate)} <span className="mx-1">→</span> {formatDate(booking.endDate)}</small>
                                        </div>
                                        <div className="d-flex align-items-center gap-5 p-3 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div>
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Rent Amount</small>
                                                <strong className="fs-6" style={{ color: 'var(--text-main)' }}>₹{booking.rentAmount || 0}</strong>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Platform Fee</small>
                                                <strong className="fs-6 text-danger">- ₹{booking.platformFee || 0}</strong>
                                            </div>
                                            <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '20px' }}>
                                                <small className="text-success d-block text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Your Net Earnings</small>
                                                <strong className="fs-4 text-success fw-bold">₹{booking.ownerEarning || (booking.rentAmount - booking.platformFee) || 0}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center w-100 mt-5 p-5 card shadow-sm" style={{ borderRadius: 'var(--radius-lg)', border: 'dashed 2px var(--border-light)', backgroundColor: '#f8fafc' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                                <h4 className="fw-bold" style={{ color: 'var(--text-main)' }}>No bookings yet</h4>
                                <p className="text-muted">When users book your listings, their reservations will appear here along with your earnings.</p>
                                <div><Link to="/add-item" className="btn btn-primary mt-3 px-4 py-2" style={{ borderRadius: '8px', fontWeight: 600 }}>List Another Item</Link></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OwnerBookings;
