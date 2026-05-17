import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Categories from "../components/Categories";
import { FaHeart } from "react-icons/fa";
import '../components/Home.css';
import API_URL from "../constants";
import { toast } from 'react-hot-toast';


function Home() {

    const navigate = useNavigate()

    const [products, setproducts] = useState([]);
    const [search, setsearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [issearch, setissearch] = useState(false);
    const [userLoc, setUserLoc] = useState(localStorage.getItem('userLoc') || '');
    const [activeCategory, setActiveCategory] = useState('All Categories');

    const fetchProducts = (loc, cat, searchText) => {
        const categoryParam = cat === 'All Categories' ? '' : cat;
        
        let url;
        if (!searchText && !categoryParam) {
            url = API_URL + `/items?location=${loc || ''}`;
        } else {
            url = API_URL + `/items/search?loc=${loc || ''}&category=${categoryParam}&search=${searchText || ''}`;
        }

        axios.get(url)
            .then((res) => {
                if (res.data.products) {
                    setproducts(res.data.products);
                }
            })
            .catch((err) => {
                toast.error('Server Err.')
            })
    }

    useEffect(() => {
        fetchProducts(userLoc, activeCategory, appliedSearch);
    }, [userLoc, activeCategory, appliedSearch])

    const handlesearch = (value) => {
        setsearch(value);
    }

    const handleLoc = (value) => {
        setUserLoc(value);
    }

    const handleClick = () => {
        setAppliedSearch(search);
        if (search) {
            setissearch(true);
        } else if (activeCategory === 'All Categories') {
            setissearch(false);
        }
    }

    const handleCategory = (value) => {
        setActiveCategory(value);
        if (value === 'All Categories' && !appliedSearch) {
            setissearch(false);
        } else {
            setissearch(true);
        }
    }

    const clearSearch = () => {
        setsearch('');
        setAppliedSearch('');
        setActiveCategory('All Categories');
        setissearch(false);
    }

    const handleLike = (productId, e) => {
        e.stopPropagation();
        let userId = localStorage.getItem('userId');

        if (!userId) {
            toast.error('Please Login first.')
            return;
        }

        const url = API_URL + '/like-product';
        const data = { userId, productId }
        axios.post(url, data)
            .then((res) => {
                if (res.data.message) {
                    toast.info(res.data.message)
                }
            })
            .catch((err) => {
                toast.error('Server Err.')
            })

    }


    const handleItem = (id) => {
        navigate('/item/' + id)
    }


    return (
        <div style={{ paddingBottom: '60px', background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Header search={search} handlesearch={handlesearch} handleClick={handleClick} handleLoc={handleLoc} handleCategory={handleCategory} activeCategory={activeCategory} />
            {/* Hero Section */}
            {!issearch && (
                <div className="d-flex align-items-center justify-content-between" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', gap: '40px' }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                        <h1 className="hero-title" style={{ fontSize: '56px', lineHeight: 1.1, color: '#0f172a', fontWeight: 800 }}>
                            Rent <span style={{ color: 'var(--primary)' }}>anything</span>,<br/>anytime.
                        </h1>
                        <p className="hero-subtitle mt-4 mb-5" style={{ fontSize: '20px', color: '#475569', lineHeight: 1.6, maxWidth: '500px' }}>
                            Avoid the hassle of buying. Rent high-end cameras, bikes, clothing, and electronics from your campus community instantly.
                        </p>
                        <div className="d-flex gap-3">
                            <button className="btn btn-primary rounded-pill px-4 py-3" style={{ background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600, fontSize: '18px' }} onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>Browse Items</button>
                            <Link to="/add-item" className="btn btn-outline-dark rounded-pill px-4 py-3" style={{ fontWeight: 600, fontSize: '18px' }}>List Your Item</Link>
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                        {/* Soft background blob for the image */}
                        <div style={{ position: 'absolute', width: '400px', height: '400px', background: '#d1fae5', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0, opacity: 0.6, top: '20px', right: '20px' }}></div>
                        <div style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-hover)', zIndex: 1, aspectRatio: '4/3', position: 'relative' }}>
                            <img 
                                src="https://img.freepik.com/free-vector/flat-university-concept_23-2148184535.jpg" 
                                alt="Student gear" 
                                style={{ width: '100%', height: '115%', objectFit: 'cover', objectPosition: 'top', background: 'white', border: 'none' }} 
                            />
                        </div>
                    </div>
                </div>
            )}
            
            <Categories handleCategory={handleCategory} activeCategory={activeCategory} />

            <div className="container mt-4">
                {issearch && (
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold m-0">🔍 Search Results</h4>
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={clearSearch}>Clear Search</button>
                    </div>
                )}

                {issearch && products && products.length === 0 && (
                    <div className="text-center mt-5 text-muted">
                        <h5>No rentals found matching your search.</h5>
                        <p>Try searching for electronics, bikes, or furniture.</p>
                    </div>
                )}

                <div className="d-flex justify-content-start flex-wrap gap-4" style={{ margin: '0 auto', maxWidth: '1200px' }}>
                    {products.map((item) => (
                        <div onClick={() => handleItem(item._id)} key={item._id} className="premium-card">
                            <div onClick={(e) => handleLike(item._id, e)} className="icon-con">
                                <FaHeart className="icons" />
                            </div>
                            
                            <img 
                                src={item.image ? API_URL.replace('/api', '') + '/' + item.image.replace(/\\/g, '/') : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                                alt={item.title}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' }}
                            />
                            
                            <div className="card-content">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h3 className="card-price">₹ {item.pricePerDay || item.price} <span className="text-muted fs-6 fw-normal">/ day</span></h3>
                                </div>
                                
                                <h4 className="card-title" title={item.title || item.pname}>{item.title || item.pname}</h4>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className="badge-soft">{item.category}</div>
                                    {(item.location || item.loc) && <div className="badge-soft" style={{ background: '#e0f2fe', color: '#0369a1' }}>📍 {(item.location || item.loc).split(',')[0]}</div>}
                                </div>
                                
                                {(item.deposit || 0) > 0 && (
                                    <div className="badge-warning mt-1">Refundable Deposit: ₹{item.deposit}</div>
                                )}
                                
                                <p className="card-desc mt-2">{item.description || item.pdesc}</p>
                                
                                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                                    {item.ownerId ? (
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold' }}>
                                                {item.ownerId.username.charAt(0).toUpperCase()}
                                            </div>
                                            <small className="text-muted fw-medium">{item.ownerId.username.split(' ')[0]}</small>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}
                                    <button className="btn btn-dark btn-sm rounded-pill px-3" style={{ background: '#0f172a', border: 'none', fontWeight: 600 }}>Rent Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home;