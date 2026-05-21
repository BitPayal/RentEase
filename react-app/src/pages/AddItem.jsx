import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import categories from '../components/CategoriesList';
import { locations } from '../utils/locations';
import API_URL from "../constants";
import VerificationGate from "../components/VerificationGate";
import { toast } from 'react-hot-toast';

function AddItem() {

    const navigate = useNavigate();
    const [title, settitle] = useState('');
    const [description, setdescription] = useState('');
    const [price, setprice] = useState('');
    const [deposit, setdeposit] = useState('');
    const [category, setcategory] = useState('');
    const [image, setimage] = useState('');
    const [loc, setloc] = useState('');
    
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
    }, [navigate]);

    const handleApi = () => {
        if (!title || !description || !price || !deposit || !category || !loc || !image) {
            toast.error('Please fill all the required fields including the image.');
            return;
        }

        const formData = new FormData();
        formData.append('location', loc);
        formData.append('title', title)
        formData.append('description', description)
        formData.append('pricePerDay', price)
        formData.append('deposit', deposit)
        formData.append('category', category)
        formData.append('image', image)

        const url =  API_URL + "/items/create";
        const token = localStorage.getItem('token');
        axios.post(url, formData, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                if (res.data.message) {
                    toast.info(res.data.message); 
                    navigate('/')
                }
            })
        .catch((err) => {
            console.log(err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || 'Server Err';
            toast.error(errorMsg);
        })
    }

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '60px' }}>
            <Header />
            <VerificationGate>
                <div className="container mt-5 d-flex justify-content-center">
                    <div className="card shadow-lg p-5" style={{ borderRadius: 'var(--radius-lg)', border: 'none', maxWidth: '800px', width: '100%', background: 'white' }}>
                        <h2 className="mb-4 text-center" style={{ color: 'var(--text-main)', fontWeight: 800 }}>➕ List a New Item</h2>
                        
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold text-muted">Item Title</label>
                                <input className="form-control" type="text" value={title}
                                    onChange={(e) => { settitle(e.target.value) }} placeholder="e.g. Sony A7III Camera" style={{ borderRadius: '10px' }} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold text-muted">Category</label>
                                <select className="form-select" value={category}
                                    onChange={(e) => { setcategory(e.target.value) }} style={{ borderRadius: '10px' }}>
                                    <option value="">Select a Category</option>
                                    { categories && categories.length > 0 && categories.map((item, index) => {
                                        if (item.name === 'All Categories') return null;
                                        return <option key={'option' + index} value={item.name}> {item.name} </option>
                                    })}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold text-muted">Location</label>
                                <select className="form-select" value={loc}
                                    onChange={(e) => { setloc(e.target.value) }} style={{ borderRadius: '10px' }}>
                                    <option value="">Select Item Location</option>
                                    { locations.map((item, index) => (
                                        <option key={'loc' + index} value={item.placeName}> {item.placeName} </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-12">
                                <label className="form-label fw-bold text-muted">Description</label>
                                <textarea className="form-control" rows="3" value={description}
                                    onChange={(e) => { setdescription(e.target.value) }} placeholder="Describe the condition, specs, and any accessories included..." style={{ borderRadius: '10px' }}></textarea>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold text-muted">Price Per Day (₹)</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={{ borderRadius: '10px 0 0 10px' }}>₹</span>
                                    <input className="form-control" type="number" value={price}
                                        onChange={(e) => { setprice(e.target.value) }} placeholder="500" style={{ borderRadius: '0 10px 10px 0' }} />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold text-muted">Security Deposit (₹)</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={{ borderRadius: '10px 0 0 10px' }}>₹</span>
                                    <input className="form-control" type="number" value={deposit}
                                        onChange={(e) => { setdeposit(e.target.value) }} placeholder="5000" style={{ borderRadius: '0 10px 10px 0' }} />
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="form-label fw-bold text-muted">Primary Image</label>
                                <input className="form-control" type="file"
                                    onChange={(e) => { setimage(e.target.files[0]) }} style={{ borderRadius: '10px' }} />
                            </div>

                            <div className="col-md-12 mt-5">
                                <button onClick={handleApi} className="btn w-100 py-3" style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '18px', border: 'none' }}> 
                                    Publish Listing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </VerificationGate>
        </div>
    )
}

export default AddItem;