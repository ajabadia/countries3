// Native fetch
async function testCreateEditor() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'readyuser@test.com', password: 'password123' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const { access_token } = await loginRes.json();

        // 2. Create User
        const createRes = await fetch('http://localhost:3001/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                email: 'scripteditor@demo.com',
                firstName: 'Script',
                lastName: 'Editor',
                password: 'password123',
                role: 'user',
                isActive: true
            })
        });

        if (createRes.ok) {
            console.log('User created successfully:', await createRes.json());
        } else {
            console.error('Failed to create user:', createRes.status, createRes.statusText);
            console.error('Response:', await createRes.text());
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testCreateEditor();
