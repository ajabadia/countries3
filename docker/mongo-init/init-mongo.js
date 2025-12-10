db = db.getSiblingDB('admin');
db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD);

// Create databases
db = db.getSiblingDB('world');
db.createCollection('areas');
db.createCollection('languages');

// Load and insert languages data
const languagesData = cat('/docker-entrypoint-initdb.d/world.languages.json');
const languages = JSON.parse(languagesData);
db.languages.insertMany(languages);
print(`Inserted ${languages.length} languages into world.languages`);

db = db.getSiblingDB('auth_db');
db.createCollection('users');

db = db.getSiblingDB('audit_db');
db.createCollection('audit_logs');

print('Databases initialized: world, auth_db, audit_db');
