import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";

function BookingSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, item } = location.state || {};

    useEffect(() => {
        if (!booking) {
            navigate("/");
        }
    }, [booking, navigate]);

    if (!booking) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
            <Header />
            
            <div className="container mt-5 d-flex justify-content-center">
                <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '600px', width: '100%', overflow: 'hidden' }}>
                    <div className="bg-success text-white text-center p-5 position-relative">
                        <div style={{ fontSize: '80px', lineHeight: '1', zIndex: 2, position: 'relative' }}>✅</div>
                        <h2 className="fw-bold mt-3 position-relative" style={{ zIndex: 2 }}>Booking Confirmed!</h2>
                        <p className="mb-0 opacity-75 position-relative" style={{ zIndex: 2 }}>Your rental has been successfully secured.</p>
                        
                        {/* Decorative semi-circles */}
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}></div>
                        <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}></div>
                    </div>

                    <div className="p-5 bg-white">
                        <div className="text-center mb-5">
                            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill fs-6 fw-normal shadow-sm">
                                Booking ID: <strong className="text-dark">{booking._id}</strong>
                            </span>
                        </div>

                        <div className="border rounded-4 p-4 mb-4 bg-light">
                            <h5 className="fw-bold mb-3 border-bottom pb-2">Rental Details</h5>
                            
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Item</span>
                                <span className="fw-bold text-end">{item ? (item.title || item.pname) : 'Rental Item'}</span>
                            </div>
                            
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Start Date</span>
                                <span className="fw-bold">{formatDate(booking.startDate)}</span>
                            </div>
                            
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">End Date</span>
                                <span className="fw-bold">{formatDate(booking.endDate)}</span>
                            </div>

                            <hr className="my-3"/>
                            
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted fs-5">Amount Paid</span>
                                <span className="fw-bold fs-4 text-primary">₹{booking.totalPrice}</span>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-3 mt-5">
                            <Link to="/my-rentals" className="btn btn-primary py-3 rounded-pill fw-bold fs-5 shadow-sm w-100" style={{ transition: 'transform 0.2s ease' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                                Go to My Rentals 🎟️
                            </Link>
                            <Link to="/" className="btn btn-light border py-3 rounded-pill fw-bold text-muted w-100">
                                Explore More Items
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingSuccess;
