import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { getAdminPendingItems, updateAdminItemStatus, suggestAdminItemPrice, updateAdminItem } from "../services/api";
import API_URL from "../constants";
import toast from 'react-hot-toast';

function AdminItems() {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [suggestedPrice, setSuggestedPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editItemData, setEditItemData] = useState({ id: "", title: "", description: "", pricePerDay: "", category: "" });
    const [editImage, setEditImage] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            navigate('/');
            return;
        }
        fetchPendingItems();
    }, [navigate]);

    const fetchPendingItems = () => {
        getAdminPendingItems(localStorage.getItem('token'))
            .then(res => setItems(res.data.items))
            .catch(err => alert("Failed to fetch pending items"));
    };

    const handleStatus = (id, status) => {
        updateAdminItemStatus(id, status, localStorage.getItem('token'))
            .then(() => fetchPendingItems())
            .catch(err => alert("Failed to update item status"));
    };

    const handleEditClick = (item) => {
        setEditItemData({
            id: item._id,
            title: item.title,
            description: item.description,
            pricePerDay: item.pricePerDay,
            category: item.category
        });
        setEditImage(null);
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", editItemData.title);
        formData.append("description", editItemData.description);
        formData.append("pricePerDay", editItemData.pricePerDay);
        formData.append("category", editItemData.category);
        if (editImage) {
            formData.append("image", editImage);
        }

        updateAdminItem(editItemData.id, formData, localStorage.getItem('token'))
            .then(() => {
                alert("Item updated successfully");
                setShowEditModal(false);
                fetchPendingItems();
            })
            .catch(err => {
                console.error("Update error:", err);
                alert("Failed to update item: " + (err.response?.data?.message || err.message));
            });
    };

    const handleSuggestPrice = () => {
        if (!suggestedPrice || isNaN(suggestedPrice)) {
            toast.error("Please enter a valid price");
            return;
        }
        setIsSubmitting(true);
        suggestAdminItemPrice(selectedItemId, suggestedPrice, localStorage.getItem('token'))
            .then(() => {
                toast.success("Price suggested and email sent!");
                setShowModal(false);
                setSuggestedPrice("");
                setSelectedItemId(null);
                fetchPendingItems();
            })
            .catch(error => {
                console.log(error.response?.data);
                console.log(error.message);
                toast.error(error.response?.data?.message || "Failed to suggest price");
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold m-0">Review Pending Items</h2>
                </div>
                {items.length === 0 ? (
                    <div className="alert alert-info border-0 shadow-sm">No pending items to review.</div>
                ) : (
                    <div className="row g-4">
                        {items.map(item => (
                            <div className="col-md-4" key={item._id}>
                                <div className="card shadow-sm border-0 h-100">
                                    <img 
                                        src={item.image ? API_URL.replace('/api', '') + '/' + item.image.replace(/\\/g, '/') : ''} 
                                        alt={item.title}
                                        className="card-img-top"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fw-bold">{item.title}</h5>
                                        <p className="card-text text-muted small">{item.description}</p>
                                        <ul className="list-unstyled mb-4">
                                            <li><strong>Owner:</strong> {item.ownerId?.username || 'Unknown'}</li>
                                            <li><strong>Original Price:</strong> ₹ {item.pricePerDay}</li>
                                            <li><strong>Category:</strong> {item.category}</li>
                                            <li><strong>Status:</strong> {
                                                item.status === 'price_pending' ? 'Waiting Admin/User' : 
                                                item.status === 'final_review' ? 'Ready to Publish' : 
                                                'Pending'
                                            }</li>
                                        </ul>
                                        <div className="mt-auto d-flex gap-2 flex-wrap">
                                            <button className="btn btn-success flex-grow-1 border-0" onClick={() => handleStatus(item._id, 'approved')}>Approve</button>
                                            <button className="btn btn-danger flex-grow-1 border-0" onClick={() => handleStatus(item._id, 'rejected')}>Reject</button>
                                            <button className="btn btn-info flex-grow-1 border-0 w-100 text-white" onClick={() => handleEditClick(item)}>Edit / Upload Image</button>
                                            <button className="btn btn-warning flex-grow-1 border-0 w-100" onClick={() => { setSelectedItemId(item._id); setShowModal(true); }}>Suggest Price</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Edit Item */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Item</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input type="text" className="form-control" value={editItemData.title} onChange={(e) => setEditItemData({...editItemData, title: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" value={editItemData.description} onChange={(e) => setEditItemData({...editItemData, description: e.target.value})} required></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Price per Day (₹)</label>
                                        <input type="number" className="form-control" value={editItemData.pricePerDay} onChange={(e) => setEditItemData({...editItemData, pricePerDay: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Category</label>
                                        <input type="text" className="form-control" value={editItemData.category} onChange={(e) => setEditItemData({...editItemData, category: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Upload New Image (Optional)</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={(e) => setEditImage(e.target.files[0])} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Suggest Price */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Suggest New Price</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Suggested Price (₹ / day)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={suggestedPrice} 
                                    onChange={(e) => setSuggestedPrice(e.target.value)}
                                    placeholder="Enter new price"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSuggestPrice} disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : "Send Suggestion"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminItems;
