import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAdminUsers, deleteAdminUser, updateAdminUserStatus } from "../services/api";
import toast from "react-hot-toast";

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    
    // Modals state
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await getAdminUsers(token);
            setUsers(res.data?.users || []);
        } catch (err) {
            console.error("Fetch users error:", err);
            toast.error("Failed to fetch users. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        updateAdminUserStatus(id, newStatus, localStorage.getItem('token'))
            .then(res => {
                toast.success(res.data.message);
                setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
            })
            .catch(err => toast.error("Failed to update user status"));
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedUser) return;
        deleteAdminUser(selectedUser._id, localStorage.getItem('token'))
            .then(res => {
                toast.success(res.data.message);
                setUsers(users.filter(u => u._id !== selectedUser._id));
                setShowDeleteModal(false);
                setSelectedUser(null);
            })
            .catch(err => toast.error("Failed to delete user"));
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    // Derived filtered users
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone?.includes(searchQuery);
        
        const matchesStatus = filterStatus === "all" || 
                              (filterStatus === "active" && user.status === "active") ||
                              (filterStatus === "banned" && user.status === "banned");
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-light min-vh-100">
            <Header />
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold m-0">Manage Users</h2>
                </div>

                {/* Filters & Search */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body row g-3 align-items-center">
                        <div className="col-12 col-md-6 col-lg-4">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search by name, email, or phone..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-4 col-lg-3">
                            <select 
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="banned">Blocked</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-2 col-lg-5 text-md-end">
                            <button className="btn btn-outline-secondary" onClick={() => fetchUsers()}>
                                ↻ Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* User List Data */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="card border-0 shadow-sm text-center py-5">
                        <div className="card-body">
                            <h5 className="text-muted mb-0">No users found.</h5>
                            <p className="text-muted">Try adjusting your search or filters.</p>
                        </div>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">User</th>
                                        <th>Contact</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Registration Date</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user._id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                        <span className="fw-bold text-secondary">
                                                            {user.username?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{user.username}</div>
                                                        <small className="text-muted d-block" style={{marginTop: '-2px'}}>{user.isPremium ? 'Premium Member' : 'Standard Member'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>{user.email || 'N/A'}</div>
                                                <small className="text-muted">{user.phone || 'N/A'}</small>
                                            </td>
                                            <td>
                                                <span className="text-capitalize">{user.role}</span>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${user.status === 'banned' ? 'danger' : 'success'} bg-opacity-10 text-${user.status === 'banned' ? 'danger' : 'success'} px-2 py-1`}>
                                                    {user.status === 'banned' ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="text-end pe-4">
                                                <button 
                                                    className="btn btn-sm btn-light me-2 text-primary"
                                                    onClick={() => handleViewDetails(user)}
                                                    title="View Details"
                                                >
                                                    👁️
                                                </button>
                                                <button 
                                                    className={`btn btn-sm btn-light me-2 text-${user.status === 'active' ? 'warning' : 'success'}`}
                                                    onClick={() => handleStatusToggle(user._id, user.status)}
                                                    title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                                >
                                                    {user.status === 'active' ? '⏸️' : '▶️'}
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-light text-danger"
                                                    onClick={() => handleDeleteClick(user)}
                                                    title="Delete User"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedUser && (
                <div className="modal d-block bg-dark bg-opacity-25" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-light">
                                <h5 className="modal-title fw-bold">User Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '60px', height: '60px', fontSize: '24px'}}>
                                        {selectedUser.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <h4 className="fw-bold mb-0">{selectedUser.username}</h4>
                                    <span className={`badge bg-${selectedUser.status === 'banned' ? 'danger' : 'success'} mt-2`}>
                                        {selectedUser.status === 'banned' ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 border-bottom pb-2">
                                        <small className="text-muted d-block">ID</small>
                                        <span className="text-break">{selectedUser._id}</span>
                                    </div>
                                    <div className="col-sm-6 border-bottom pb-2">
                                        <small className="text-muted d-block">Email</small>
                                        <span>{selectedUser.email || 'N/A'}</span>
                                    </div>
                                    <div className="col-sm-6 border-bottom pb-2">
                                        <small className="text-muted d-block">Phone</small>
                                        <span>{selectedUser.phone || 'N/A'}</span>
                                    </div>
                                    <div className="col-sm-6 border-bottom pb-2">
                                        <small className="text-muted d-block">Registration Date</small>
                                        <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="col-sm-6 border-bottom pb-2">
                                        <small className="text-muted d-block">Verification Status</small>
                                        <span className={`text-${selectedUser.verificationStatus === 'approved' ? 'success' : 'warning'}`}>
                                            {selectedUser.verificationStatus || 'unverified'}
                                        </span>
                                    </div>
                                    <div className="col-sm-6 mt-3">
                                        <small className="text-muted d-block">Total Earnings</small>
                                        <span className="fw-bold text-success">₹{selectedUser.totalEarnings || 0}</span>
                                    </div>
                                    <div className="col-sm-6 mt-3">
                                        <small className="text-muted d-block">Pending Earnings</small>
                                        <span className="fw-bold text-warning">₹{selectedUser.pendingEarnings || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="modal d-block bg-dark bg-opacity-25" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-danger text-white border-0">
                                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <p className="mb-1 text-danger display-5">⚠️</p>
                                <h5 className="mb-3">Are you absolutely sure?</h5>
                                <p className="text-muted mb-0">
                                    You are about to permanently delete <strong>{selectedUser.username}</strong>'s account. This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer border-0 pb-4 justify-content-center">
                                <button type="button" className="btn btn-light px-4" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>Yes, Delete User</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
