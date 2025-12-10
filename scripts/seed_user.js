// Native fetch is available in Node 18+
async function seedUser() {
    try {
        const response = await fetch('http://localhost:3001/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'readyuser@test.com',
                password: 'password123'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User created successfully:', data);
        } else {
            console.error('Failed to create user:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

seedUser();
