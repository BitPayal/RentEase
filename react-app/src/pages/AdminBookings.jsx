import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAdminBookings, cancelAdminBooking, releaseAdminEscrow, refundAdminEscrow } from "../services/api";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            navigate('/');
            return;
        }
        fetchBookings();
    }, [navigate]);

    const fetchBookings = () => {
        getAdminBookings(localStorage.getItem('token'))
            .then(res => setBookings(res.data.bookings))
            .catch(err => alert("Failed to fetch bookings"));
    };

    const handleCancel = (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        cancelAdminBooking(id, localStorage.getItem('token'))
            .then(() => fetchBookings())
            .catch(err => alert("Failed to cancel booking"));
    };

    const handleRelease = (id) => {
        if (!window.confirm('Release funds to owner? This will transfer earnings and refund the deposit.')) return;
        releaseAdminEscrow(id, localStorage.getItem('token'))
            .then(res => {
                alert(res.data.message);
                fetchBookings();
            })
            .catch(err => alert(err.response?.data?.message || "Failed to release funds"));
    };

    const handleRefund = (id) => {
        if (!window.confirm('WARNING: Full refund to renter? The owner will receive nothing.')) return;
        refundAdminEscrow(id, localStorage.getItem('token'))
            .then(res => {
                alert(res.data.message);
                fetchBookings();
            })
            .catch(err => alert(err.response?.data?.message || "Failed to refund deposit"));
    };

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <h2 className="mb-4 fw-bold">Manage Bookings</h2>
                <div className="card shadow-sm border-0">
                    <table className="table mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Item</th>
                                <th>Renter</th>
                                <th>Dates</th>
                                <th>Escrow Held</th>
                                <th>Commission</th>
                                <th>State</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b._id}>
                                    <td>{b.itemId?.title || 'Deleted Item'}</td>
                                    <td>{b.userId?.username || 'Unknown'}</td>
                                    <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <div className="fw-bold">₹ {b.totalPrice}</div>
                                        <small className="text-muted d-block">Rent: ₹{b.rentAmount || 0}</small>
                                        <small className="text-muted d-block">Dep: ₹{b.depositAmount || 0}</small>
                                    </td>
                                    <td className="text-success fw-bold">₹ {b.platformFee || 0}</td>
                                    <td>
                                        <span className={`badge bg-${b.status === 'Cancelled' ? 'danger' : (b.status === 'Completed' ? 'success' : 'primary')} d-block mb-1`}>
                                            {b.status}
                                        </span>
                                        {b.paymentStatus && (
                                            <span className={`badge ${b.paymentStatus === 'Held' ? 'bg-warning text-dark' : 'bg-secondary'} d-block`}>
                                                Escrow: {b.paymentStatus}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {b.paymentStatus === 'Held' ? (
                                            <div className="d-flex flex-column gap-2">
                                                <button className="btn btn-sm btn-success fw-bold flex-fill" onClick={() => handleRelease(b._id)}>💰 Release Payout</button>
                                                <button className="btn btn-sm btn-outline-danger flex-fill" onClick={() => handleRefund(b._id)}>↩️ Full Refund</button>
                                            </div>
                                        ) : (
                                            ['Pending', 'Confirmed', 'Active'].includes(b.status) && (
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(b._id)}>Force Cancel</button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminBookings;
