const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login via HTTP...');
        const response = await axios.post('http://localhost:3000/api/auth-debug', {
            email: 'admin@example.com',
            password: 'password123'
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testLogin();
