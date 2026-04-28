import axios from "axios";

// Base API URL config
const API = axios.create({
  baseURL: "http://localhost:4000/api"
});

// Response Interceptor for Token Refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Attempt token refresh
          const res = await axios.post('http://localhost:4000/api/auth/refresh', { refreshToken });
          if (res.data && res.data.token) {
            localStorage.setItem('token', res.data.token);
            window.dispatchEvent(new Event('storage'));
            // Update the authorization header for the original request
            originalRequest.headers['Authorization'] = res.data.token;
            // Retry the original request
            return API(originalRequest);
          }
        } catch (refreshError) {
            // Refresh failed or expired, clean up and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
      } else {
         // No refresh token available, trigger logout
         localStorage.removeItem('token');
         localStorage.removeItem('refreshToken');
         localStorage.removeItem('userId');
         localStorage.removeItem('username');
         localStorage.removeItem('role');
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// === Auth APIs ===
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMyProfile = (token) => API.get("/auth/my-profile", { headers: { Authorization: token } });
export const upgradePremium = (token) => API.post("/auth/upgrade-premium", {}, { headers: { Authorization: token } });

// === Item APIs ===
export const getItems = () => API.get("/items");
export const getItemById = (id) => API.get(`/items/${id}`);
export const searchItems = (query) => API.get(`/items/search?search=${query}`);
export const addItem = (data, token) => API.post("/items", data, { headers: { Authorization: token } });
export const getMyItems = (token) => API.get("/items/my-items", { headers: { Authorization: token } });
export const updateItem = (id, data, token) => API.put(`/items/${id}`, data, { headers: { Authorization: token } });
export const acceptItemPrice = (id, token) => API.put(`/items/${id}/accept-price`, {}, { headers: { Authorization: token } });
export const rejectItemPrice = (id, token) => API.put(`/items/${id}/reject-price`, {}, { headers: { Authorization: token } });
export const getPriceActionItem = (token) => API.get(`/items/price-action?token=${token}`);
export const handlePriceAction = (data) => API.post(`/items/price-action`, data);
export const deleteItem = (id, token) => API.delete(`/items/${id}`, { headers: { Authorization: token } });

// === Booking APIs ===
export const bookItem = (data, token) => API.post("/book", data, { headers: { Authorization: token } });
export const getMyBookings = (token) => API.get("/book/my-bookings", { headers: { Authorization: token } });
export const getOwnerBookings = (token) => API.get("/book/owner-bookings", { headers: { Authorization: token } });

// === Chat APIs ===
export const sendMessage = (data, token) => API.post("/chat/send-message", data, { headers: { Authorization: token } });
export const getMessages = (productId, chatUserId, token) => API.get(`/chat/${productId}/${chatUserId}`, { headers: { Authorization: token } });

// === Admin APIs ===
export const getAdminStats = (token) => API.get("/admin/stats", { headers: { Authorization: token } });
export const getAdminUsers = (token) => API.get("/admin/users", { headers: { Authorization: token } });
export const banAdminUser = (id, token) => API.post(`/admin/users/${id}/ban`, {}, { headers: { Authorization: token } });

// Verifications
export const sendEmailOTP = (token) => API.post("/auth/send-email-otp", {}, { headers: { Authorization: token } });
export const verifyEmailOTP = (otp, token) => API.post("/auth/verify-email-otp", { otp }, { headers: { Authorization: token } });
export const sendPhoneOTP = (token) => API.post("/auth/send-phone-otp", {}, { headers: { Authorization: token } });
export const verifyPhoneOTP = (otp, token) => API.post("/auth/verify-phone-otp", { otp }, { headers: { Authorization: token } });
export const submitIdProof = (formData, token) => API.post("/auth/submit-id", formData, { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } });

// Admin 
export const getAdminPendingVerifications = (token) => API.get("/admin/verifications/pending", { headers: { Authorization: token } });
export const updateVerificationStatus = (id, status, token) => API.post(`/admin/verifications/${id}/status`, { status }, { headers: { Authorization: token } });
export const getAdminPendingItems = (token) => API.get("/admin/items/pending", { headers: { Authorization: token } });
export const updateAdminItem = (id, formData, token) => API.put(`/admin/items/${id}`, formData, { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } });
export const updateAdminItemStatus = (id, status, token) => API.post(`/admin/items/${id}/status`, { status }, { headers: { Authorization: token } });
export const suggestAdminItemPrice = (id, suggestedPrice, token) => API.post(`/admin/items/${id}/suggest-price`, { suggestedPrice }, { headers: { Authorization: token } });
export const getAdminBookings = (token) => API.get("/admin/bookings", { headers: { Authorization: token } });
export const cancelAdminBooking = (id, token) => API.post(`/admin/bookings/${id}/cancel`, {}, { headers: { Authorization: token } });
export const releaseAdminEscrow = (id, token) => API.post(`/admin/bookings/${id}/release`, {}, { headers: { Authorization: token } });
export const refundAdminEscrow = (id, token) => API.post(`/admin/bookings/${id}/refund`, {}, { headers: { Authorization: token } });

// === Payment APIs ===
export const createPaymentOrder = (data, token) => API.post("/payment/create-order", data, { headers: { Authorization: token } });
export const verifyPaymentOrder = (data, token) => API.post("/payment/verify-payment", data, { headers: { Authorization: token } });
export const demoPaymentOrder = (data, token) => API.post("/payment/demo-payment", data, { headers: { Authorization: token } });

export default API;
