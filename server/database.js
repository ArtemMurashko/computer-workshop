const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'master.db'));
db.pragma('foreign_key = ON');
db.exec(`
    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER,
        duration INTEGER,
        description TEXT
    );
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        service_id INTEGER,
        booking_date TEXT,
        booking_time TEXT,
        problem_description TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id)
    );
`);
module.exports = db;