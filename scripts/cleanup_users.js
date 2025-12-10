// Native fetch used


async function checkAndDeleteUser() {
    // 1. Login to get token
    try {
        const loginRes = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'readyuser@test.com', password: 'password123' })
        });

        if (!loginRes.ok) throw new Error('Login failed');
        const { access_token } = await loginRes.json();

        // 2. Get Users
        const usersRes = await fetch('http://localhost:3001/users', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        if (!usersRes.ok) throw new Error('Fetch users failed');
        const users = await usersRes.json();

        const zombie = users.find(u => u.email === 'finalcheck@demo.com' || u.email === 'complete@demo.com' || u.email === 'final@demo.com');

        if (zombie) {
            console.log('Found zombie user:', zombie.email, zombie._id);
            // 3. Delete
            const delRes = await fetch(`http://localhost:3001/users/${zombie._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            if (delRes.ok) console.log('Deleted zombie user.');
            else console.error('Failed to delete zombie user.');
        } else {
            console.log('No zombie users found.');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

// Minimal polyfill for fetch if running in Node 18+ without require
if (typeof fetch === 'undefined') {
    console.error('This script requires Node 18+');
} else {
    checkAndDeleteUser();
}
