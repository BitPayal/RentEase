const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
    try {
        let res = await axios.post('http://localhost:4000/api/auth/login', { username: 'testuser1', password: 'password123' }).catch(err => {
            console.log('Login error:', err.response?.data?.message || err.message);
            return null;
        });
        
        let token;
        
        if (res && res.data && res.data.token) {
            token = res.data.token;
        } else {
            console.log('Login failed, registering...');
            res = await axios.post('http://localhost:4000/api/auth/register', { username: 'testuser1', password: 'password123', email: 't@t.com', phone: '123' }).catch(err => {
                console.log('Register error:', err.response?.data?.message || err.message);
                return null;
            });
            res = await axios.post('http://localhost:4000/api/auth/login', { username: 'testuser1', password: 'password123' });
            token = res.data.token;
        }
        
        console.log('Got token, adding item...');
        
        const form = new FormData();
        form.append('title', 'Item');
        form.append('description', 'Desc');
        form.append('pricePerDay', '100');
        form.append('category', 'Electronics');
        form.append('location', 'Delhi');
        
        // Simulating second image
        form.append('image2', fs.createReadStream(__filename));

        let addRes = await axios.post('http://localhost:4000/api/items', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Success:', addRes.data);
    } catch (e) {
        if (e.response) {
            console.log('Error data:', e.response.data);
            console.log('Error status:', e.response.status);
        } else {
            console.error('Error:', e.message);
        }
    }
}
run();
