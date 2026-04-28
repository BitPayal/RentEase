import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import API_URL from "../constants";

function Chat() {
    const { productId, receiverId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [product, setProduct] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        // Fetch product info quickly for context
        axios.get(`${API_URL}/items/${productId}`)
            .then(res => setProduct(res.data.product))
            .catch(console.error);

        fetchMessages();
        // Simple HTTP Polling simulation for Real-Time MVP Chat
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [productId, receiverId]);

    const fetchMessages = () => {
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/chat/${productId}/${receiverId}`, { headers: { Authorization: token } })
            .then(res => setMessages(res.data.messages || []))
            .catch(console.error);
    };

    const handleSend = () => {
        if (!text.trim()) return;
        const token = localStorage.getItem('token');
        axios.post(`${API_URL}/chat/send-message`, { receiverId, productId, text }, { headers: { Authorization: token } })
            .then(() => {
                setText('');
                fetchMessages();
            })
            .catch(() => alert('Failed to send message.'));
    };

    const myUserId = localStorage.getItem('userId');

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <Header />
            <div className="container mt-4 mb-4">
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white pt-3 pb-3">
                        <h5 className="mb-0">
                            💬 Chat about <span className="text-primary">{product ? product.pname : '...'}</span>
                        </h5>
                    </div>
                    
                    <div className="card-body" style={{ height: '60vh', overflowY: 'auto', backgroundColor: '#eef2f3' }}>
                        {messages.length === 0 ? (
                            <div className="text-center text-muted mt-5 mt-md-5 pt-5">
                                <p>No messages yet. Send a message to start coordinating your rental!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === myUserId;
                                return (
                                    <div key={idx} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`p-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`} style={{ maxWidth: '75%' }}>
                                            {msg.text}
                                            <br/>
                                            <small className={isMe ? 'text-light' : 'text-muted'} style={{ fontSize: '10px' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    <div className="card-footer bg-white border-0 p-3">
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                placeholder="Type a message..." 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="btn btn-primary px-4 fw-bold" onClick={handleSend}>Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;
