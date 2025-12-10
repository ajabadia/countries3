// Reset all user passwords to "111111" with bcryptjs hash
// Run from backend directory: node ../../scripts/reset_all_passwords.js

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://root:example@localhost:27017/?authSource=admin';
const DB_NAME = 'auth_db';
const NEW_PASSWORD = '111111';

async function resetAllPasswords() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        const users = db.collection('users');

        // Hash the password
        const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
        console.log('✅ Password hashed with bcryptjs');

        // Update ALL users
        const result = await users.updateMany(
            {},  // Empty filter = all documents
            { $set: { passwordHash } }
        );

        console.log(`\n✅ Updated ${result.modifiedCount} user(s)`);
        console.log(`All users now have password: "${NEW_PASSWORD}"`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

resetAllPasswords();
