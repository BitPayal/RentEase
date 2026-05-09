import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../constants";
import { sendEmailOTP, verifyEmailOTP, sendPhoneOTP, verifyPhoneOTP, submitIdProof } from "../services/api";
import { toast } from "react-hot-toast";

function VerificationGate({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [emailOtpCode, setEmailOtpCode] = useState('');
    const [phoneOtpCode, setPhoneOtpCode] = useState('');
    const [idProofFile, setIdProofFile] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const res = await axios.get(API_URL + "/auth/my-profile", { 
                    headers: { Authorization: token },
                    timeout: 5000 // 5 second timeout to prevent infinite hang
                });
                
                const u = res.data.user;
                if (u) {
                    setUser(u);
                    if (u.emailVerified && u.phoneVerified) setCurrentStep(3);
                    else if (u.emailVerified) setCurrentStep(2);
                    else setCurrentStep(1);
                }
            } catch (error) {
                console.error("Failed to fetch profile API:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSendEmailOTP = () => {
        sendEmailOTP(localStorage.getItem('token')).then(res => {
            toast.success(res.data.message + (res.data.mockOTP ? ` (Mock: ${res.data.mockOTP})` : ''));
            setEmailOtpSent(true);
        }).catch(() => toast.error("Failed to send Email OTP"));
    };

    const handleVerifyEmailOTP = () => {
        verifyEmailOTP(emailOtpCode, localStorage.getItem('token')).then(res => {
            toast.success(res.data.message);
            setUser(res.data.user);
            setTimeout(() => setCurrentStep(2), 300);
        }).catch(err => toast.error(err.response?.data?.message || "Verification Failed"));
    };

    const handleSendPhoneOTP = () => {
        sendPhoneOTP(localStorage.getItem('token')).then(res => {
            toast.success(res.data.message + (res.data.mockOTP ? ` (Mock: ${res.data.mockOTP})` : ''));
            setPhoneOtpSent(true);
        }).catch(() => toast.error("Failed to send Phone OTP"));
    };

    const handleVerifyPhoneOTP = () => {
        verifyPhoneOTP(phoneOtpCode, localStorage.getItem('token')).then(res => {
            toast.success(res.data.message);
            setUser(res.data.user);
            setTimeout(() => setCurrentStep(3), 300);
        }).catch(err => toast.error(err.response?.data?.message || "Verification Failed"));
    };

    const handleSubmitId = () => {
        if (!idProofFile) return toast.error("Please select an ID image first.");
        const formData = new FormData();
        formData.append('idProof', idProofFile);
        submitIdProof(formData, localStorage.getItem('token')).then(res => {
            toast.success(res.data.message);
            setUser(res.data.user);
        }).catch(err => toast.error(err.response?.data?.message || "Failed to submit ID"));
    };

    if (loading) return <div className="text-center mt-5">Loading Verification Data...</div>;

    const renderPendingState = () => (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card shadow-lg p-5 text-center" style={{ borderRadius: 'var(--radius-lg)', border: 'none', maxWidth: '600px', width: '100%' }}>
                <div style={{ fontSize: '50px' }}>⏳</div>
                <h3 className="mt-3 text-warning fw-bold">Verification Pending</h3>
                <p className="text-muted mt-2">Your identity verification details have been received and are currently under review by our administration team. This process usually takes 1-2 business days.</p>
                <p className="fw-bold mt-2">You will be granted full access once approved.</p>
            </div>
        </div>
    );

    const renderVerificationFlow = () => {
        const steps = [
            { id: 1, label: 'Email Verification', icon: '✉️' },
            { id: 2, label: 'Phone Verification', icon: '📱' },
            { id: 3, label: 'ID Verification', icon: '🆔' }
        ];

        return (
            <div className="container mt-5 d-flex justify-content-center">
                <style>
                    {`
                    .step-circle {
                        width: 45px; height: 45px;
                        border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        font-weight: bold; font-size: 16px;
                        transition: all 0.3s ease;
                        z-index: 2; position: relative;
                    }
                    .step-completed { background: #10b981; color: white; border: 2px solid #10b981; }
                    .step-active { background: #2563eb; color: white; border: 4px solid #bfdbfe; box-shadow: 0 0 0 4px rgba(37,99,235,0.2); }
                    .step-pending { background: white; color: #94a3b8; border: 2px solid #e2e8f0; }
                    .step-line {
                        position: absolute; top: 22.5px; left: 0; height: 4px;
                        background: #e2e8f0; z-index: 1; transform: translateY(-50%); width: 100%;
                    }
                    .step-line-progress {
                        position: absolute; top: 22.5px; left: 0; height: 4px;
                        background: #10b981; z-index: 1; transform: translateY(-50%);
                        transition: width 0.4s ease;
                    }
                    `}
                </style>
                <div className="card shadow-lg p-0" style={{ borderRadius: 'var(--radius-xl)', border: 'none', maxWidth: '700px', width: '100%', overflow: 'hidden' }}>
                    
                    <div className="text-white p-5 text-center" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
                        <h2 className="fw-bold mb-2">User Verification Required</h2>
                        <p className="mb-0 opacity-75">To ensure marketplace safety, all active users must complete identity verification.</p>
                    </div>

                    <div className="p-5 bg-white">
                        {user?.verificationStatus === 'rejected' && (
                            <div className="alert alert-danger shadow-sm rounded-3 mb-4 border-0">
                                ⚠️ Your previous verification request was rejected. Please resubmit valid details.
                            </div>
                        )}

                        <div className="d-flex justify-content-between position-relative mb-5 px-3">
                            <div className="step-line"></div>
                            <div className="step-line-progress" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
                            
                            {steps.map((s) => {
                                const isCompleted = currentStep > s.id || (s.id === 1 && user?.emailVerified) || (s.id === 2 && user?.phoneVerified);
                                const isActive = currentStep === s.id && !isCompleted;
                                const stateClass = isCompleted ? 'step-completed' : isActive ? 'step-active' : 'step-pending';
                                return (
                                    <div key={s.id} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>
                                        <div className={`step-circle ${stateClass}`}>
                                            {isCompleted ? '✓' : s.id}
                                        </div>
                                        <div className={`mt-2 fw-bold text-center ${isActive ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '13px' }}>{s.label}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {currentStep === 1 && (
                            <div className="fade-in">
                                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2"><span style={{fontSize: '24px'}}>✉️</span> Email Verification</h4>
                                {user?.emailVerified ? (
                                    <div className="alert alert-success border-0 rounded-3 shadow-sm d-flex align-items-center gap-3 p-4">
                                        <span style={{fontSize: '30px'}}>✅</span>
                                        <div>
                                            <h5 className="fw-bold mb-1">Email Verified</h5>
                                            <p className="mb-0 text-success opacity-75">{user.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 border border-light rounded-4 bg-light shadow-sm">
                                        <p className="text-muted mb-4">We will send a one-time password (OTP) to <strong>{user?.email}</strong> to verify your account.</p>
                                        
                                        {!emailOtpSent ? (
                                            <button className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow" onClick={handleSendEmailOTP}>
                                                Send Verification Code
                                            </button>
                                        ) : (
                                            <div>
                                                <div className="alert alert-info border-0 rounded-3 mb-4">OTP sent to your email! Please check your inbox.</div>
                                                <label className="fw-bold text-muted mb-2">Enter OTP</label>
                                                <input type="text" className="form-control form-control-lg mb-3" style={{letterSpacing: '5px', textAlign: 'center', fontWeight: 'bold'}} placeholder="••••••" value={emailOtpCode} onChange={(e) => setEmailOtpCode(e.target.value)} />
                                                <button className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow" onClick={handleVerifyEmailOTP}>Verify Email</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="d-flex justify-content-end mt-4">
                                    <button className="btn btn-outline-primary px-5 py-2 fw-bold rounded-pill" onClick={() => setCurrentStep(2)} disabled={!user?.emailVerified}>
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="fade-in">
                                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2"><span style={{fontSize: '24px'}}>📱</span> Phone Verification</h4>
                                {user?.phoneVerified ? (
                                    <div className="alert alert-success border-0 rounded-3 shadow-sm d-flex align-items-center gap-3 p-4">
                                        <span style={{fontSize: '30px'}}>✅</span>
                                        <div>
                                            <h5 className="fw-bold mb-1">Phone Verified</h5>
                                            <p className="mb-0 text-success opacity-75">{user.phone}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 border border-light rounded-4 bg-light shadow-sm">
                                        <p className="text-muted mb-4">We will send a secure SMS verification code to <strong>{user?.phone}</strong>.</p>
                                        
                                        {!phoneOtpSent ? (
                                            <button className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow" onClick={handleSendPhoneOTP}>
                                                Send SMS OTP
                                            </button>
                                        ) : (
                                            <div>
                                                <div className="alert alert-info border-0 rounded-3 mb-4">SMS OTP sent! Please check your messages.</div>
                                                <label className="fw-bold text-muted mb-2">Enter OTP</label>
                                                <input type="text" className="form-control form-control-lg mb-3" style={{letterSpacing: '5px', textAlign: 'center', fontWeight: 'bold'}} placeholder="••••••" value={phoneOtpCode} onChange={(e) => setPhoneOtpCode(e.target.value)} />
                                                <button className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow" onClick={handleVerifyPhoneOTP}>Verify Phone</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="d-flex justify-content-between mt-4">
                                    <button className="btn btn-light px-4 py-2 fw-bold text-dark rounded-pill shadow-sm" style={{ border: '1px solid #ccc'}} onClick={() => setCurrentStep(1)}>
                                        ← Back
                                    </button>
                                    <button className="btn btn-outline-primary px-5 py-2 fw-bold rounded-pill" onClick={() => setCurrentStep(3)} disabled={!user?.phoneVerified}>
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="fade-in">
                                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2"><span style={{fontSize: '24px'}}>🆔</span> Government ID Proof</h4>
                                <div className="p-4 border border-light rounded-4 bg-light shadow-sm text-center">
                                    <div className="mb-4 text-muted">
                                        <span style={{fontSize: '48px', opacity: 0.5}}>📄</span>
                                        <p className="mt-2 mb-0 fw-bold">Upload an Official Document</p>
                                        <small>Aadhar / PAN / Passport</small>
                                    </div>
                                    <div className="mb-4 text-start">
                                        <label className="form-label fw-bold text-muted">Select Image File</label>
                                        <input type="file" className="form-control form-control-lg bg-white" style={{borderRadius: '10px'}} onChange={(e) => setIdProofFile(e.target.files[0])} />
                                    </div>
                                    <button className="btn btn-warning w-100 py-3 rounded-3 fw-bold shadow" onClick={handleSubmitId} disabled={!idProofFile}>
                                        Submit for Admin Approval 🚀
                                    </button>
                                </div>
                                <div className="d-flex justify-content-start mt-4">
                                    <button className="btn btn-light px-4 py-2 fw-bold text-dark rounded-pill shadow-sm" style={{ border: '1px solid #ccc'}} onClick={() => setCurrentStep(2)}>
                                        ← Back
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        );
    };

    if (user?.verificationStatus === 'pending') return renderPendingState();
    if (user?.verificationStatus !== 'approved') return renderVerificationFlow();
    
    return <>{children}</>;
}

export default VerificationGate;
