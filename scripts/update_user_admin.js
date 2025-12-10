// Update user role directly via MongoDB connection
const { MongoClient } = require('mongodb');

async function updateUserToAdmin() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('auth_db');
        const usersCollection = db.collection('users');

        // Update ajabadia@gmail.com to have admin role
        const result = await usersCollection.updateOne(
            { email: 'ajabadia@gmail.com' },
            { $set: { roles: ['admin'] } }
        );

        console.log('📝 Update result:', result);

        // Verify the update
        const user = await usersCollection.findOne(
            { email: 'ajabadia@gmail.com' },
            { projection: { email: 1, username: 1, roles: 1 } }
        );

        console.log('✅ Updated user:', user);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

updateUserToAdmin();
