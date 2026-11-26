const express = require('express');
const router = express.Router();
const db = require('../database');
router.get('/', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
});
router.get('/:id', (req, res) => {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
        return res.status(404).json({ error: 'Не найдено' });
    }
    res.json(service);
});
module.exports = router;