import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAdminUsers, banAdminUser } from "../services/api";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = () => {
        getAdminUsers(localStorage.getItem('token'))
            .then(res => setUsers(res.data.users))
            .catch(err => alert("Failed to fetch users"));
    };

    const handleBan = (id) => {
        banAdminUser(id, localStorage.getItem('token'))
            .then(() => fetchUsers())
            .catch(err => alert("Failed to ban/unban user"));
    };

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <h2 className="mb-4 fw-bold">Manage Users</h2>
                <div className="card shadow-sm border-0">
                    <table className="table mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Earnings</th>
                                <th>Verification</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">No users found</td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>{u.phone}</td>
                                        <td>₹ {u.totalEarnings}</td>
                                        <td>
                                            <span className={`badge bg-${u.verificationStatus === 'approved' ? 'success' : u.verificationStatus === 'pending' ? 'warning' : 'secondary'}`}>
                                                {u.verificationStatus || 'unverified'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge bg-${u.status === 'banned' ? 'danger' : 'success'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className={`btn btn-sm btn-${u.status === 'banned' ? 'success' : 'danger'}`}
                                                onClick={() => handleBan(u._id)}
                                            >
                                                {u.status === 'banned' ? 'Unban' : 'Ban'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminUsers;
