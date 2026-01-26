const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing Daily Tasks API...');
        const response = await axios.get('http://localhost:3000/api/reports/daily-tasks?start_date=2024-01-01&end_date=2025-12-31');
        console.log('Status:', response.status);
        console.log('Data count:', response.data.length);
        console.log('First item:', response.data[0]);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testApi();
