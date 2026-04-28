const axios = require('axios');

async function test() {
    try {
        const res1 = await axios.get('http://127.0.0.1:4000/api/items/search?loc=New Delhi, Delhi');
        console.log('Location only test: ', res1.status, res1.data.message);

        const res2 = await axios.get('http://127.0.0.1:4000/api/items/search?category=Cameras');
        console.log('Category only test: ', res2.status, res2.data.message);

        const res3 = await axios.get('http://127.0.0.1:4000/api/items/search?loc=Mumbai, Maharashtra&category=Bikes&search=Royal');
        console.log('Combined test: ', res3.status, res3.data.message);

    } catch(err) {
        console.error('Error during testing: ', err.message);
    }
}

test();
