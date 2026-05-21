import { Link } from 'react-router-dom';
import './Header.css'
import { FaSearch } from "react-icons/fa";
import { FiUser, FiPlus, FiBox, FiLogOut } from "react-icons/fi";
import { useState } from 'react';
import { locations } from '../utils/locations';
import { useAuth } from '../context/AuthContext';

function Header(props) {
    const { token, user, logout } = useAuth();

    const [loc, setLoc] = useState(localStorage.getItem('userLoc') || '')
    const [showOver, setshowOver] = useState(false)



    const handleLogout = () => {
        logout();
    }

    return (
        <div className='glass-header d-flex justify-content-between align-items-center'>
            {/* Logo */}
            <Link to="/">
                <div className="logo-text">RentEase</div>
            </Link>

            {/* Smart Search Bar */}
            <div className="search-wrapper">
                <select value={props.activeCategory || ''} onChange={(e) => {
                    if (props.handleCategory) {
                        props.handleCategory(e.target.value);
                    }
                }}>
                    <option value="All Categories">All Categories</option>
                    <option value="Bikes">Bikes</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Electronics">Electronics</option>
                </select>
                <div style={{width: '1px', height: '20px', background: '#e2e8f0', margin: '0 10px'}}></div>
                <select value={loc} onChange={(e) => {
                    localStorage.setItem('userLoc', e.target.value);
                    setLoc(e.target.value);
                    if (props.handleLoc) {
                        props.handleLoc(e.target.value);
                    }
                }}>
                    <option value="">All Locations</option>
                    {locations.map((item, index) => (
                        <option key={index} value={item.placeName}>
                            {item.placeName}
                        </option>
                    ))}
                </select>
                <input 
                    placeholder="Search bikes, cameras, laptops..."
                    type='text'
                    value={props && props.search}
                    onChange={(e) => props.handlesearch && props.handlesearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && props.handleClick && props.handleClick()}
                />
                <button className='search-btn' onClick={() => props.handleClick && props.handleClick()}>
                    <FaSearch />
                </button>
            </div>

            {/* User Controls */}
            <div>
                <div className="d-flex align-items-center gap-3">
                    {!token && (
                        <div className="d-flex gap-2">
                            <Link to="/login" className="btn btn-outline-dark rounded-pill px-4" style={{fontWeight: 600}}>Log In</Link>
                            <Link to="/signup" className="btn btn-dark rounded-pill px-4" style={{background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600}}>Sign Up</Link>
                        </div>
                    )}
                    
                    {token && (
                        <div className="avatar-btn" onClick={() => setshowOver(!showOver)}>
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                </div>

                {showOver && (
                    <div className="dropdown-menu-custom text-start">
                        {!!token && (
                            <>
                                {user?.role === 'admin' ? (
                                    <Link to="/admin" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}><FiBox className="me-2" style={{color: '#ef4444', fontSize: '18px'}}/> Admin Panel</Link>
                                ) : (
                                    <>
                                        <Link to="/my-profile" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}><FiUser className="me-2" style={{color: '#6366f1', fontSize: '18px'}}/> My Profile</Link>
                                        <Link to="/my-rentals" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}><FiBox className="me-2" style={{color: '#10b981', fontSize: '18px'}}/> My Rentals</Link>
                                        <Link to="/my-items" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}><FiBox className="me-2" style={{color: '#d97706', fontSize: '18px'}}/> My Listings</Link>
                                        <Link to="/owner-bookings" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}>💰 Earnings Dashboard</Link>
                                        <Link to="/add-item" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}><FiPlus className="me-2" style={{color: '#8b5cf6', fontSize: '18px'}}/> List an Item</Link>
                                        <Link to="/liked-items" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}>❤️ Liked Items</Link>
                                    </>
                                )}
                                <button className="dropdown-item-custom logout-btn-custom" onClick={() => { setshowOver(false); handleLogout(); }}><FiLogOut className="me-2" style={{color: '#ef4444', fontSize: '18px'}}/> Logout</button>
                            </>
                        )}
                        {!token && (
                            <>
                                <Link to="/login" className="dropdown-item-custom" onClick={() => setshowOver(false)} style={{ display: 'block' }}>🔑 Login / Register</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}


export default Header;