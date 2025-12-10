// Script to update user with admin role
async function updateUserRole() {
    try {
        // First, login to get a token
        const loginResponse = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'ajabadia@gmail.com',
                password: '111111'
            })
        });

        if (!loginResponse.ok) {
            console.error('Login failed:', loginResponse.status);
            return;
        }

        const { access_token } = await loginResponse.json();
        console.log('✅ Logged in successfully');

        // Get user profile to see current state
        const profileResponse = await fetch('http://localhost:3001/auth/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        if (profileResponse.ok) {
            const profile = await profileResponse.json();
            console.log('📋 Current user profile:', JSON.stringify(profile, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateUserRole();
