async function testLogin() {
    try {
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'readyuser@test.com',
                password: 'password123'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
        } else {
            console.error('Login failed:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

testLogin();
