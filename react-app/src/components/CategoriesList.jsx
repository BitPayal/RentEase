import React from 'react';
import { FaBicycle, FaCamera, FaLaptop, FaTshirt, FaPlug, FaBox } from 'react-icons/fa';

const categories = [
    { name: 'All Categories', icon: <FaBox /> },
    { name: 'Bikes', icon: <FaBicycle /> },
    { name: 'Cameras', icon: <FaCamera /> },
    { name: 'Laptops', icon: <FaLaptop /> },
    { name: 'Clothing', icon: <FaTshirt /> },
    { name: 'Electronics', icon: <FaPlug /> }
];

export default categories;