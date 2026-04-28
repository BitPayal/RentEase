import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAdminStats } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            navigate('/');
            return;
        }

        getAdminStats(localStorage.getItem('token'))
            .then(res => setStats(res.data.stats))
            .catch(err => {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    toast.error("Session expired. Please log in again.");
                    logout();
                } else {
                    toast.error("Failed to fetch admin stats");
                }
            });
    }, [navigate, logout]);

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <h2 className="mb-4 fw-bold">Admin Dashboard</h2>
                <div className="mb-4 d-flex gap-3">
                    <Link to="/admin/users" className="btn btn-outline-primary">Manage Users</Link>
                    <Link to="/admin/items" className="btn btn-outline-primary">Manage Items</Link>
                    <Link to="/admin/bookings" className="btn btn-outline-primary">Manage Bookings</Link>
                    <Link to="/admin/verifications" className="btn btn-outline-primary">Review Verifications</Link>
                </div>
                {stats && (
                    <div className="row g-4">
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 p-4 bg-light">
                                <h5 className="text-muted">Total Users</h5>
                                <h2 className="fw-bold">{stats.totalUsers}</h2>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 p-4 bg-light">
                                <h5 className="text-muted">Total Items</h5>
                                <h2 className="fw-bold">{stats.totalItems}</h2>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 p-4 bg-light">
                                <h5 className="text-muted">Total Bookings</h5>
                                <h2 className="fw-bold">{stats.totalBookings}</h2>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 p-4 bg-light">
                                <h5 className="text-muted">Platform Revenue</h5>
                                <h2 className="fw-bold text-success">₹ {stats.totalRevenue.toFixed(2)}</h2>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
