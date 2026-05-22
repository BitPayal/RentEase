import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useState } from "react";
import axios from "axios";
import API_URL from "../constants";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setusername] = useState('');
    const [password, setpassword] = useState('');

    const handleApi = () => {
        if (!API_URL || API_URL === 'undefined') {
            toast.error('Backend API URL is not configured.');
            return;
        }

        const url = API_URL + "/auth/login";
        const data = { username, password };
        const loadToast = toast.loading('Logging in...');
        
        axios.post(url, data)
            .then((res) => {
                if (res.data.token) {
                    toast.success('Login Successful!', { id: loadToast });
                    login(res.data.user, res.data.token, res.data.refreshToken);
                    navigate('/');
                } else if (res.data.message) {
                    toast.error(res.data.message, { id: loadToast });
                }
            })
            .catch((err) => {
                let errMsg = 'Server Error';
                if (err.response && err.response.data && err.response.data.message) {
                    errMsg = err.response.data.message;
                } else if (err.message) {
                    errMsg = err.message;
                }
                toast.error(errMsg, { id: loadToast });
            })
    }

    return (
        <div>
            <Header />
            <div className="p-3 m-3">
                <h3> Welocme to Login Page </h3>
                <br></br>
                USERNAME
                <input className="form-control" type="text" value={username}
                    onChange={(e) => {
                        setusername(e.target.value)
                    }} />
                <br></br>
                PASSWORD
                <input className="form-control" type="text" value={password}
                    onChange={(e) => {
                        setpassword(e.target.value)
                    }} />
                <br></br>
                <button className="btn btn-primary mr-3" onClick={handleApi}> LOGIN </button>
                <Link className="m-3" to="/signup">  SIGNUP </Link>
            </div>
        </div>
    )
}

export default Login;