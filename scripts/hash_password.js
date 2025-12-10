// Run this script from apps/backend directory: node ../../scripts/hash_password.js
const bcrypt = require('bcryptjs');

const password = '111111';
bcrypt.hash(password, 10).then(hash => {
    console.log('\nBcryptjs hash for password "111111":');
    console.log(hash);
    console.log('\nRun this in MongoDB shell:');
    console.log(`db.users.updateOne({ email: "ajabadia@gmail.com" }, { $set: { passwordHash: "${hash}" } })`);
});
