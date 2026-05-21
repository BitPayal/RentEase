import './index.css';
import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import Chat from './pages/Chat';
import MyProfile from './pages/MyProfile';
import MyItems from './pages/MyItems';
import LikedItems from './pages/LikedItems';
import MyRentals from './pages/MyRentals';
import OwnerBookings from './pages/OwnerBookings';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import AdminItems from './pages/AdminItems';
import AdminBookings from './pages/AdminBookings';
import AdminVerifications from './pages/AdminVerifications';
import ApprovePrice from './pages/ApprovePrice';
import Checkout from './pages/Checkout';
import BookingSuccess from './pages/BookingSuccess';
import axios from 'axios';

import API_URL from './constants';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Global Axios Interceptor for token expiration handling
axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response && (err.response.status === 401 || err.response.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Request new access token using an independent axios instance
          const refreshRes = await axios.create().post(`${API_URL}/auth/refresh`, { refreshToken });
          const newToken = refreshRes.data.token;
          
          // Store new token and update header
          localStorage.setItem('token', newToken);
          axios.defaults.headers.common['Authorization'] = newToken;
          originalRequest.headers['Authorization'] = newToken;
          
          processQueue(null, newToken);
          isRefreshing = false;
          
          // Retry the original request
          return axios(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          
          // If refresh fails, log out completely
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          toast.error('Session expired. Please login again.');
          setTimeout(() => { window.location.href = '/login'; }, 1500);
          return Promise.reject(refreshErr);
        }
      } else {
        processQueue(new Error("No refresh token"), null);
        isRefreshing = false;
        
        // No refresh token available
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        toast.error('Session expired. Please login again.');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      }
    }
    return Promise.reject(err);
  }
);
const router = createBrowserRouter([
  {
    path: "/",
    element: (<Home />),
  },
  {
    path: "about",
    element: <div>About</div>,
  },
  {
    path: "/login",
    element: (<Login />),
  },
  {
    path: "/signup",
    element: (<Signup />),
  },
  {
    path: "/add-item",
    element: (<ProtectedRoute><AddItem /></ProtectedRoute>),
  },
  {
    path: "/liked-items",
    element: (<ProtectedRoute><LikedItems /></ProtectedRoute>),
  },
  {
    path: "/my-items",
    element: (<ProtectedRoute><MyItems /></ProtectedRoute>),
  },
  {
    path: "/item/:itemId",
    element: (<ItemDetail />),
  },
  {
    path: "/chat/:itemId/:receiverId",
    element: (<ProtectedRoute><Chat /></ProtectedRoute>),
  },
  {
    path: "/my-profile",
    element: (<ProtectedRoute><MyProfile /></ProtectedRoute>),
  },
  {
    path: "/my-rentals",
    element: (<ProtectedRoute><MyRentals /></ProtectedRoute>),
  },
  {
    path: "/owner-bookings",
    element: (<ProtectedRoute><OwnerBookings /></ProtectedRoute>),
  },
  {
    path: "/checkout",
    element: (<ProtectedRoute><Checkout /></ProtectedRoute>),
  },
  {
    path: "/booking-success",
    element: (<ProtectedRoute><BookingSuccess /></ProtectedRoute>),
  },
  {
    path: "/admin",
    element: (<AdminRoute><AdminDashboard /></AdminRoute>),
  },
  {
    path: "/admin/users",
    element: (<AdminRoute><ManageUsers /></AdminRoute>),
  },
  {
    path: "/admin/items",
    element: (<AdminRoute><AdminItems /></AdminRoute>),
  },
  {
    path: "/admin/bookings",
    element: (<AdminRoute><AdminBookings /></AdminRoute>),
  },
  {
    path: "/admin/verifications",
    element: (<AdminRoute><AdminVerifications /></AdminRoute>),
  },
  {
    path: "/approve-price",
    element: (<ApprovePrice />),
  },
]);

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Toaster position="top-right" />
    <RouterProvider router={router} />
  </AuthProvider>
);