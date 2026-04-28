import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../constants";
import { FaHeart } from "react-icons/fa";

function LikedItems() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        fetchLikedItems();
    }, [navigate]);

    const fetchLikedItems = () => {
        const url = API_URL + "/liked-items";
        const token = localStorage.getItem('token');
        axios.get(url, { headers: { Authorization: token } })
            .then((res) => {
                if (res.data.products) {
                    setItems(res.data.products);
                }
            })
            .catch((err) => alert('Server Err: ' + (err.response?.data?.message || err.message)));
    }

    const handleItem = (id) => {
        navigate('/item/' + id)
    }

    return (
        <div style={{ paddingBottom: '60px' }}>
            <Header />
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ fontWeight: 800, color: 'var(--text-main)' }}>❤️ Liked Items</h2>
                    <Link to="/" className="btn btn-primary" style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}>Explore More Items</Link>
                </div>

                <div className="d-flex justify-content-start flex-wrap gap-4" style={{ margin: '0 auto', maxWidth: '1200px' }}>
                    {items && items.length > 0 ? items.map((item, index) => (
                        <div onClick={() => handleItem(item._id)} key={item._id} className="premium-card">
                            <div className="icon-con" style={{ color: '#ef4444' }}>
                                <FaHeart className="icons" />
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
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className="badge-soft">{item.category}</div>
                                    {item.loc && <div className="badge-soft" style={{ background: '#e0f2fe', color: '#0369a1' }}>📍 {item.loc.split(',')[0]}</div>}
                                </div>
                                
                                {item.deposit > 0 && (
                                    <div className="badge-warning mt-1">Refundable Deposit: ₹{item.deposit}</div>
                                )}
                                
                                <p className="card-desc mt-2">{item.description || item.pdesc}</p>
                                
                                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                                    {item.ownerId ? (
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold' }}>
                                                {item.ownerId.username ? item.ownerId.username.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <small className="text-muted fw-medium">{item.ownerId.username ? item.ownerId.username.split(' ')[0] : 'User'}</small>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}
                                    <button className="btn btn-dark btn-sm rounded-pill px-3" style={{ background: '#0f172a', border: 'none', fontWeight: 600 }}>Rent Now</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center w-100 mt-5 p-5 card shadow-sm" style={{ borderRadius: 'var(--radius-lg)', border: 'none', backgroundColor: 'transparent' }}>
                            <h4 className="text-muted">You haven't liked any items yet.</h4>
                            <Link to="/" className="btn mt-3" style={{ background: 'linear-gradient(135deg, var(--primary), #0ea5e9)', color: 'white', borderRadius: '10px', fontWeight: 600, padding: '12px 30px' }}>Browse Items</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LikedItems;
