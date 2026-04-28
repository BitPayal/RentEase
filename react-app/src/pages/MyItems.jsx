import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../constants";
import { acceptItemPrice, rejectItemPrice } from "../services/api";

function MyItems() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        fetchMyItems();
    }, []);

    const fetchMyItems = () => {
        const url = API_URL + "/items/my-items";
        const token = localStorage.getItem('token');
        axios.get(url, { headers: { Authorization: token } })
            .then((res) => {
                if (res.data.products) {
                    setItems(res.data.products);
                }
            })
            .catch(() => alert('Server Err.'));
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            const url = API_URL + "/items/" + id;
            const token = localStorage.getItem('token');
            axios.delete(url, { headers: { Authorization: token } })
                .then((res) => {
                    alert('Item DELETED successfully');
                    fetchMyItems();
                })
                .catch(() => alert('Server Err.'));
        }
    }

    const handleAcceptPrice = (id) => {
        acceptItemPrice(id, localStorage.getItem('token'))
            .then(() => {
                alert("Price accepted! Your item is now approved.");
                fetchMyItems();
            })
            .catch(() => alert("Failed to accept price"));
    };

    const handleRejectPrice = (id) => {
        rejectItemPrice(id, localStorage.getItem('token'))
            .then(() => {
                alert("Price rejected. Your item is marked as rejected.");
                fetchMyItems();
            })
            .catch(() => alert("Failed to reject price"));
    };

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ fontWeight: 800, color: 'var(--text-main)' }}>📦 My Listings</h2>
                    <Link to="/add-item" className="btn btn-primary" style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}>➕ Add New Item</Link>
                </div>

                <div className="d-flex justify-content-center flex-wrap">
                    {items && items.length > 0 ? items.map((item, index) => (
                        <div key={item._id} className="premium-card">
                            <div className="icon-con" onClick={() => handleDelete(item._id)} style={{ color: '#ef4444', cursor: 'pointer' }} title="Delete Listing">
                                🗑️
                            </div>
                            <img 
                                src={item.image ? API_URL.replace('/api', '') + '/' + item.image.replace(/\\/g, '/') : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                                alt={item.title || item.pname}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' }}
                            />
                            
                            <div className="card-content">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h3 className="card-price">₹ {item.price} <span className="text-muted fs-6 fw-normal">/ day</span></h3>
                                </div>
                                
                                <h4 className="card-title" title={item.title || item.pname}>{item.title || item.pname}</h4>
                                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                    <div className="badge-soft">{item.category}</div>
                                    {item.loc && <div className="badge-soft" style={{ background: '#e0f2fe', color: '#0369a1' }}>📍 {item.loc.split(',')[0]}</div>}
                                    {item.status === 'pending' && <div className="badge-warning">🟡 Pending</div>}
                                    {item.status === 'price_pending' && <div className="badge-warning" style={{ background: '#fef3c7', color: '#b45309' }}>🟠 Price Pending</div>}
                                    {item.status === 'final_review' && <div className="badge-soft" style={{ background: '#e0f2fe', color: '#0369a1' }}>🔵 Final Review</div>}
                                    {item.status === 'approved' && <div className="badge-soft" style={{ background: '#dcfce7', color: '#166534' }}>🟢 Approved</div>}
                                    {item.status === 'rejected' && <div className="badge-soft" style={{ background: '#fee2e2', color: '#991b1b' }}>🔴 Rejected</div>}
                                </div>
                                
                                {item.status === 'price_pending' && (
                                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                                        <p className="mb-2 fw-bold text-warning small" style={{ margin: 0 }}>Admin suggested new price: ₹{item.suggestedPrice}</p>
                                        <div className="d-flex gap-2 mt-2">
                                            <button className="btn btn-sm btn-success flex-grow-1" onClick={(e) => { e.stopPropagation(); handleAcceptPrice(item._id); }}>Accept</button>
                                            <button className="btn btn-sm btn-danger flex-grow-1" onClick={(e) => { e.stopPropagation(); handleRejectPrice(item._id); }}>Reject</button>
                                        </div>
                                    </div>
                                )}
                                
                                {item.deposit > 0 && (
                                    <div className="badge-warning mt-1">Refundable Deposit: ₹{item.deposit}</div>
                                )}
                                
                                <p className="card-desc mt-2">{item.description || item.pdesc}</p>
                                
                                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-light text-muted border">Your Listing</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} className="btn btn-outline-danger btn-sm rounded-pill px-3" style={{ fontWeight: 600 }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center w-100 mt-5 p-5 card shadow-sm" style={{ borderRadius: 'var(--radius-lg)', border: 'none', backgroundColor: 'transparent' }}>
                            <h4 className="text-muted">You haven't listed any items yet.</h4>
                            <Link to="/add-item" className="btn mt-3" style={{ background: 'linear-gradient(135deg, var(--primary), #0ea5e9)', color: 'white', borderRadius: '10px', fontWeight: 600, padding: '12px 30px' }}>Start Earning Now!</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyItems;
