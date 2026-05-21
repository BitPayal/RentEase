import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../constants";
import { toast } from 'react-hot-toast';
import { 
  CheckCircle2, 
  Calendar, 
  Settings,
  Package, 
  Banknote,
  Heart,
  Star,
  Activity,
  PlusCircle,
  ChevronRight
} from 'lucide-react';

function MyProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState({ rentalsCount: 0, wasteAvoidedKg: 0 });

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        
        const url = API_URL + "/auth/my-profile";
        const token = localStorage.getItem('token');
        setLoading(true);
        setError(null);
        
        axios.get(url, { headers: { Authorization: token } })
            .then((res) => {
                if (res.data.user) {
                    setUser(res.data.user);
                    setMetrics(res.data.metrics);
                } else {
                    setError('Profile not found.');
                }
            })
            .catch((err) => {
                console.error("Profile fetch error: ", err);
                setError('Failed to load profile. Please try again later.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    const handleUpgrade = () => {
        const confirmPay = window.confirm('Upgrade to RentEase Premium for ₹199/month?\n\n- Waived service fees\n- Priority access to listings\n- Featured products');
        if (confirmPay) {
            const url = API_URL + "/auth/upgrade-premium";
            const token = localStorage.getItem('token');
            
            axios.post(url, {}, { headers: { Authorization: token } })
                .then((res) => {
                    toast.success(res.data.message);
                    setUser(res.data.user);
                })
                .catch(() => toast.error('Upgrade failed!'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="max-w-2xl mx-auto mt-12 p-6">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center shadow-sm">
                        <h4 className="text-xl font-bold text-red-700 mb-2">Oops!</h4>
                        <p className="text-red-600 mb-6">{error || 'Could not find your profile.'}</p>
                        <button 
                            className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
                            onClick={() => navigate('/')}
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const memberSince = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                {user.isPremium && (
                                    <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-900 p-1.5 rounded-full shadow-sm ring-2 ring-white">
                                        <Star size={16} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-slate-900">{user.username}</h2>
                            <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                            
                            <div className="flex items-center gap-2 mb-6">
                                {user.isVerified ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 size={14} /> Verified Account
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                        Unverified
                                    </span>
                                )}
                            </div>
                            
                            <div className="w-full space-y-3 mb-6 text-left">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                                    Joined {memberSince}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Settings className="w-4 h-4 mr-3 text-slate-400" />
                                        {user.phone}
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm mb-3">
                                Edit Profile
                            </button>

                            {!user.isPremium && (
                                <button 
                                    onClick={handleUpgrade}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm"
                                >
                                    Upgrade to Premium ⭐
                                </button>
                            )}
                        </div>

                        {/* Quick Stats side card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Quick Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 text-sm">Total Listings</span>
                                    <span className="font-semibold text-slate-900">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 text-sm">Active Rentals</span>
                                    <span className="font-semibold text-slate-900">{(metrics.rentalsCount !== undefined ? metrics.rentalsCount : (user.bookingsCount || 0))}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 text-sm">Wishlist Items</span>
                                    <span className="font-semibold text-slate-900">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        
                        {/* Stats Grid */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Dashboard</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-default">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                            <Banknote size={20} />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Revenue</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 mb-1">₹{user.totalEarnings || 0}</h4>
                                    <p className="text-sm text-emerald-600 font-medium">+₹{user.pendingEarnings || 0} pending</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-default">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <Package size={20} />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Items</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 mb-1">{(metrics.rentalsCount !== undefined ? metrics.rentalsCount : (user.bookingsCount || 0))}</h4>
                                    <p className="text-sm text-slate-500">Items currently rented out</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-default">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                            <Star size={20} />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reviews</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 mb-1">0.0</h4>
                                    <p className="text-sm text-slate-500">Average rating</p>
                                </div>
                            </div>
                        </section>

                        {/* Two Column Layout for Activity and Listings */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* My Listings */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900">My Listings</h3>
                                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                        View All <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Package size={32} />
                                    </div>
                                    <h4 className="text-slate-900 font-semibold mb-2">No items listed yet</h4>
                                    <p className="text-slate-500 text-sm mb-6">Start renting and earn from your unused products.</p>
                                    <button onClick={() => navigate('/add-product')} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">
                                        <PlusCircle size={18} /> List New Item
                                    </button>
                                </div>
                            </section>

                            {/* Recent Activity */}
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                                <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
                                    <div className="p-6 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                            <Activity size={24} />
                                        </div>
                                        <p className="text-slate-500 text-sm">No recent activity to show.</p>
                                        <button className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700" onClick={() => navigate('/')}>
                                            Browse Rentals
                                        </button>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Wishlist / Saved Items */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Saved Items</h3>
                            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm flex flex-col items-center">
                                <Heart className="text-slate-300 w-12 h-12 mb-3" />
                                <h4 className="text-slate-900 font-semibold mb-1">Your wishlist is empty</h4>
                                <p className="text-slate-500 text-sm mb-0">Save items you like to view them later.</p>
                            </div>
                        </section>
                        
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MyProfile;
