import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import API_URL from "../constants";



function ItemDetail() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(null);
        const url = API_URL + '/items/' + itemId;
        axios.get(url)
            .then((res) => {
                if (res.data.product) {
                    setProduct(res.data.product);
                } else {
                    setError('Product not found.');
                }
            })
            .catch((err) => {
                console.error("Item fetch error: ", err);
                setError('Failed to load item details. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [itemId]);

    const handleBooking = () => {
        if (!startDate || !endDate) {
            alert('Please select start and end dates.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
            alert('End date must be after start date!');
            return;
        }

        navigate("/checkout", { state: { item: product, startDate, endDate, diffDays } });
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

    if (error || !product) {
        return (
            <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
                <Header />
                <div className="container mt-5">
                    <div className="alert alert-danger shadow-sm rounded-4 text-center p-5">
                        <h4 className="alert-heading fw-bold mb-3">Oops!</h4>
                        <p className="mb-0 text-muted">{error || 'Could not find the requested item.'}</p>
                        <button className="btn btn-outline-danger mt-4 rounded-pill px-4" onClick={() => navigate('/')}>Return Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '60px' }}>
            <Header />
            <div className="container mt-5">
                <div className="card shadow-lg p-0" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: 'none' }}>
                    <div className="row g-0">
                        <div className="col-md-6 bg-light d-flex align-items-center justify-content-center p-4">
                            <img 
                                src={product.image ? API_URL.replace('/api', '') + '/' + product.image.replace(/\\/g, '/') : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'} 
                                alt={product.title || product.pname || "Product"} 
                                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' }}
                            />
                        </div>
                        <div className="col-md-6 p-5 d-flex flex-column">
                            <div className="mb-2">
                                <span className="badge-soft">{product.category}</span>
                                {product.loc && <span className="badge-soft ms-2" style={{ background: '#e0f2fe', color: '#0369a1' }}>📍 {product.loc.split(',')[0]}</span>}
                            </div>
                            
                            <h2 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '36px' }}>{product.title || product.pname}</h2>
                            <h3 className="mt-2" style={{ color: 'var(--primary)', fontWeight: 700 }}>₹ {product.pricePerDay || product.price} <span className="fs-5 text-muted fw-normal">/ day</span></h3>
                            
                            {parseFloat(product.deposit) > 0 && <p className="badge-warning mt-2 d-inline-block">Security Deposit: ₹ {product.deposit || 0}</p>}
                            
                            <hr className="my-4" style={{ borderColor: 'var(--border-light)' }}/>
                            
                            <h5 className="fw-bold mb-3">About this item</h5>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{product.description || product.pdesc}</p>
                            
                            <div className="mt-4 p-4 border rounded" style={{ background: '#f8fafc', borderColor: 'var(--border-light)' }}>
                                <h5 className="fw-bold mb-3">Book Your Rental</h5>
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <label className="form-label text-muted fw-bold small">Start Date</label>
                                        <input className="form-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ borderRadius: '10px' }} />
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label text-muted fw-bold small">End Date</label>
                                        <input className="form-control" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ borderRadius: '10px' }} />
                                    </div>
                                </div>
                                <button className="btn w-100 mt-4 py-3 shadow" onClick={handleBooking} style={{ backgroundColor: '#0f172a', color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '16px', transition: 'all 0.2s ease', transform: 'scale(1)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                    Calculate & Confirm Booking
                                </button>
                            </div>
                            
                            {product.ownerId && (
                                <div className="mt-auto pt-4 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold' }}>
                                            {product.ownerId.username ? product.ownerId.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">{product.ownerId.username || 'User'}</h6>
                                            <small className="text-muted">Item Owner</small>
                                        </div>
                                    </div>
                                    
                                    {product.ownerId._id !== localStorage.getItem('userId') && (
                                        <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate(`/chat/${product._id}/${product.ownerId._id}`)} style={{ fontWeight: 600 }}>
                                            💬 Message
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ItemDetail;
