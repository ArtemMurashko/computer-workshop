const express = require('express');
const router = express.Router();
const db = require('../database');
router.post('/', (req, res) => {
    const client_name = req.body.client_name || req.body.name;
    const client_phone = req.body.client_phone || req.body.phone;
    const service_id = req.body.service_id || req.body.serviceId;
    const booking_date = req.body.booking_date || req.body.date || null;
    const booking_time = req.body.booking_time || req.body.time || null;
    const problem_description = req.body.problem_description || req.body.problem || null;
    const status = req.body.status || 'new';
    if (!client_name || !String(client_name).trim()) {
        return res.status(400).json({ error: 'Поле client_name обязательно' });
    }
    if (!client_phone || !String(client_phone).trim()) {
        return res.status(400).json({ error: 'Поле client_phone обязательно' });
    }
    if (!service_id) {
        return res.status(400).json({ error: 'Поле service_id обязательно' });
    }
    const stmt = db.prepare(`
        INSERT INTO bookings (client_name, client_phone, service_id, booking_date, booking_time, problem_description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
        String(client_name).trim(),
        String(client_phone).trim(),
        Number(service_id),
        booking_date,
        booking_time,
        problem_description,
        status
    );
    const newBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newBooking);
});
router.get('/', (req, res) => {
    let rows;
    const baseQuery = `
        SELECT b.*, s.name AS service_name, s.price
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
    `;
    if (req.query.status) {
        rows = db.prepare(`${baseQuery} WHERE b.status = ?`).all(req.query.status);
    } else {
        rows = db.prepare(baseQuery).all();
    }
    const signedResilt = rows.map(b => ({
        ...b,
        _server: 'mric-node-' + process.version
    }));
    res.json(signedResilt);
});
router.get('/:id', (req, res) => {
    const booking = db.prepare(`
        SELECT b.*, s.name AS service_name, s.price
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.id = ?
    `).get(req.params.id);
    if (!booking) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    res.json(booking);
});
router.patch('/:id/status', (req, res) => {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    if (!req.body.status) {
        return res.status(400).json({ error: 'Поле status обязательно' });
    }
    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    const update = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json(update);
});
router.put('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!existing) {
        return res.status(404).json({error: 'Запись не найдена'});
    }
    const client_name = req.body.client_name ?? req.body.name ?? existing.client_name;
    const client_phone = req.body.client_phone ?? req.body.phone ?? existing.client_phone;
    const service_id = req.body.service_id ?? req.body.serviceId ?? existing.service_id;
    const booking_date = req.body.booking_date ?? req.body.date ?? existing.booking_date;
    const booking_time = req.body.booking_time ?? req.body.time ?? existing.booking_time;
    const problem_description = req.body.problem_description ?? req.body.problem ?? existing.problem_description;
    const status = req.body.status ?? existing.status;
    db.prepare(`
        UPDATE bookings
        SET client_name = ?, client_phone = ?, service_id = ?, booking_date = ?, booking_time = ?, problem_description = ?, status = ?
        WHERE id = ?
        `).run(client_name, client_phone, service_id, booking_date, booking_time, problem_description, status, req.params.id);
        const update = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json(update);
});
router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Запись удалена', booking: existing });
});
module.exports = router;