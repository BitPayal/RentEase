import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../components/Header";
import { getPriceActionItem, handlePriceAction } from "../services/api";
import toast from "react-hot-toast";

function ApprovePrice() {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionCompleted, setActionCompleted] = useState(false);
    
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError("No token provided");
            setLoading(false);
            return;
        }

        getPriceActionItem(token)
            .then(res => {
                setItem(res.data.item);
                setLoading(false);
            })
            .catch(err => {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError("Failed to validate link. Please try again.");
                }
                setLoading(false);
            });
    }, [token]);

    const handleAction = (action) => {
        handlePriceAction({ token, action })
            .then(() => {
                toast.success(`Price ${action}ed successfully!`);
                setActionCompleted(true);
            })
            .catch(err => {
                toast.error(err.response?.data?.message || `Failed to ${action} price.`);
            });
    };

    return (
        <div>
            <Header />
            <div className="container mt-5 pt-5">
                <div className="row justify-content-center mt-5">
                    <div className="col-md-6 border rounded shadow-sm p-4 text-center bg-white">
                        <h3 className="mb-4">Review Price Suggestion</h3>
                        
                        {loading && <p>Loading details...</p>}

                        {error && !loading && (
                            <div className="alert alert-danger">
                                <h5>Link is Invalid or Expired</h5>
                                <p>{error}</p>
                                <Link to="/" className="btn btn-primary mt-3">Go to Home</Link>
                            </div>
                        )}

                        {item && !loading && !actionCompleted && (
                            <div>
                                <p>Admin has reviewed your item and suggested a new price.</p>
                                <hr />
                                <h4 className="text-primary">{item.title}</h4>
                                <div className="d-flex justify-content-between my-4 px-4">
                                    <div className="text-start">
                                        <h5 className="text-muted mb-0">Original Price</h5>
                                        <p className="fs-4">${item.originalPrice} / day</p>
                                    </div>
                                    <div className="text-end">
                                        <h5 className="text-muted mb-0">Suggested Price</h5>
                                        <p className="fs-4 text-warning">${item.suggestedPrice} / day</p>
                                    </div>
                                </div>
                                <hr />
                                <div className="d-flex gap-3 justify-content-center mt-4">
                                    <button 
                                        onClick={() => handleAction('accept')} 
                                        className="btn btn-success px-4"
                                    >
                                        Accept New Price
                                    </button>
                                    <button 
                                        onClick={() => handleAction('reject')} 
                                        className="btn btn-danger px-4"
                                    >
                                        Reject
                                    </button>
                                </div>
                                <p className="text-muted small mt-3">Link expires 1 hour after it was generated.</p>
                            </div>
                        )}

                        {actionCompleted && (
                            <div className="alert alert-success">
                                <h5>Success!</h5>
                                <p>Your decision has been recorded and the item status has been updated.</p>
                                <div className="mt-3">
                                    <Link to="/my-items" className="btn btn-primary">Go to My Items</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApprovePrice;
