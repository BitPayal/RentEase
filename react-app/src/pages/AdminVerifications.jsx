import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getAdminPendingVerifications, updateVerificationStatus } from "../services/api";
import API_URL from "../constants";
import { toast } from 'react-hot-toast';

function AdminVerifications() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchPendingVerifications();
    }, []);

    const fetchPendingVerifications = () => {
        getAdminPendingVerifications(localStorage.getItem('token'))
            .then(res => setUsers(res.data.users))
            .catch(err => toast.error("Failed to fetch verifications"));
    };

    const handleStatus = (userId, status) => {
        const confirmMsg = status === 'approved' ? 'Approve this user?' : 'Reject this user?';
        if (!window.confirm(confirmMsg)) return;

        updateVerificationStatus(userId, status, localStorage.getItem('token'))
            .then(() => {
                toast.success(`User ${status} successfully`);
                fetchPendingVerifications();
            })
            .catch(err => toast.error("Failed to update status"));
    };

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <h2 className="mb-4 fw-bold">Pending User Verifications</h2>
                {users.length === 0 ? (
                    <div className="alert alert-info border-0 shadow-sm p-4 text-center rounded-4">
                        <h4 className="alert-heading fw-bold mb-2">All Caught Up! 🎉</h4>
                        <p className="mb-0">There are no pending identity verifications to review.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {users.map((user) => (
                            <div key={user._id} className="col-md-6 mb-4">
                                <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden bg-white">
                                    <div className="card-header bg-dark text-white p-3">
                                        <h5 className="mb-0 fw-bold">{user.username}</h5>
                                    </div>
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex flex-column gap-3 mb-4">
                                            <div className="d-flex align-items-center justify-content-between p-3 rounded-4 shadow-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span style={{ fontSize: '1.5rem' }}>✉️</span>
                                                    <div>
                                                        <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Email Address</small>
                                                        <span className="text-dark fw-medium">{user.email}</span>
                                                    </div>
                                                </div>
                                                {user.emailVerified && <span className="badge bg-success rounded-pill px-3 py-2 shadow-sm d-flex align-items-center gap-1"><span style={{fontSize: '12px'}}>✅</span> Verified</span>}
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between p-3 rounded-4 shadow-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span style={{ fontSize: '1.5rem' }}>📱</span>
                                                    <div>
                                                        <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Phone Number</small>
                                                        <span className="text-dark fw-medium">{user.phone}</span>
                                                    </div>
                                                </div>
                                                {user.phoneVerified && <span className="badge bg-success rounded-pill px-3 py-2 shadow-sm d-flex align-items-center gap-1"><span style={{fontSize: '12px'}}>✅</span> Verified</span>}
                                            </div>
                                        </div>
                                        
                                        <h6 className="fw-bold text-dark mb-3">Government ID Proof Document</h6>
                                        <div className="text-center bg-light p-3 rounded-4 mb-4 position-relative" style={{ border: '2px dashed #cbd5e1', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={(e) => {e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'}} onMouseOut={(e) => {e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8f9fa'}}>
                                            {user.idProofImage ? (
                                                <a href={`${API_URL.replace('/api', '')}/${user.idProofImage}`} target="_blank" rel="noreferrer" className="d-block text-decoration-none">
                                                    <img src={`${API_URL.replace('/api', '')}/${user.idProofImage}`} alt="ID Proof" className="img-fluid rounded-4 shadow-sm" style={{ maxHeight: '220px', objectFit: 'contain', width: '100%', objectPosition: 'center', transition: 'transform 0.3s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}/>
                                                    <div className="mt-3 text-primary fw-bold p-2 bg-white rounded-pill shadow-sm d-inline-block px-4">
                                                        <span style={{fontSize: '20px', marginRight: '5px'}}>🔍</span> Click to View Full Resolution
                                                    </div>
                                                </a>
                                            ) : (
                                                <span className="text-muted d-block py-5">
                                                    <span style={{fontSize: '30px', display: 'block', marginBottom: '10px'}}>📄</span>
                                                    No ID proof document found.
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-auto d-flex gap-3">
                                            <button className="btn flex-grow-1 fw-bold rounded-pill text-white shadow" style={{ background: '#10b981', padding: '14px', border: 'none', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'none'} onClick={() => handleStatus(user._id, 'approved')}>
                                                <span className="me-2 fw-bold">✓</span> Approve Seller
                                            </button>
                                            <button className="btn flex-grow-1 fw-bold rounded-pill text-white shadow" style={{ background: '#ef4444', padding: '14px', border: 'none', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'none'} onClick={() => handleStatus(user._id, 'rejected')}>
                                                <span className="me-2 fw-bold">✕</span> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminVerifications;
