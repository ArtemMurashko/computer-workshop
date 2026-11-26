const express = require('express');
const app = express();
const db = require('./database');
app.use(require('cors')());
app.use(express.json());
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.url);
    next();
});
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.get('/api/stats', (req, res) => {
    const totalBookings = db.prepare('SELECT COUNT(*) AS count FROM bookings').get().count;
    const byStatus = db.prepare('SELECT status, COUNT(*) AS count FROM bookings GROUP BY status').all();
    const totalRevenue = db.prepare(`
        SELECT COALESCE(SUM(s.price), 0) AS total
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
    `).get().total;
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    res.json({
        totalBookings,
        byStatus,
        totalRevenue,
        _db_tables: tables
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        student: 'Мурашко Артём Александрович',
        day: 6
    });
});
app.listen(3000, () => console.log('http://localhost:3000/api/services'));