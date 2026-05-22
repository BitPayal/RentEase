import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useState } from "react";
import axios from "axios";
import API_URL from "../constants";
import toast from "react-hot-toast";

function Signup() {
    const navigate = useNavigate();

    const [username, setusername] = useState('');
    const [password, setpassword] = useState('');
    const [email, setemail] = useState('');
    const [mobile, setmobile] = useState('');


    const handleApi = () => {
        if (!API_URL || API_URL === 'undefined') {
            toast.error('Backend API URL is not configured.');
            return;
        }
        
        const url = API_URL + "/auth/register";
        const data = { username, password, phone: mobile, email };
        const loadToast = toast.loading('Creating account...');
        
        axios.post(url, data)
            .then((res) => {
                if (res.data.message) {
                    toast.success(res.data.message, { id: loadToast });
                    setTimeout(() => navigate('/login'), 1500);
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
                <h3> Welcome to Signup Page </h3>
                <br></br>
                USERNAME
                <input className="form-control" type="text" value={username}
                    onChange={(e) => {
                        setusername(e.target.value)
                    }} />
                <br></br>
                MOBILE
                <input className="form-control" type="text" value={mobile}
                    onChange={(e) => {
                        setmobile(e.target.value)
                    }} />
                <br></br>
                EMAIL
                <input className="form-control" type="text" value={email}
                    onChange={(e) => {
                        setemail(e.target.value)
                    }} />
                <br></br>
                PASSWORD
                <input className="form-control" type="text" value={password}
                    onChange={(e) => {
                        setpassword(e.target.value)
                    }} />
                <br></br>
                <button className="btn btn-primary mr-3" onClick={handleApi}> SIGNUP </button>
                <Link className="m-3" to="/login">  LOGIN </Link>
            </div>
        </div>
    )
}

export default Signup;