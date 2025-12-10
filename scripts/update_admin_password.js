// Script to update admin user password with bcryptjs hash
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'auth_db';

async function updateAdminPassword() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const users = db.collection('users');

        // Hash the password
        const password = '111111';
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Update admin user
        const result = await users.updateOne(
            { email: 'ajabadia@gmail.com' },
            { $set: { passwordHash } }
        );

        console.log(`Updated ${result.modifiedCount} user(s)`);
        console.log('Admin password updated successfully!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

updateAdminPassword();
