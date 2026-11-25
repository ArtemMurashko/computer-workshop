const express = require('express');
const router = express.Router();
let bookings = [];
router.post('/', (req, res) => {
    const clientName = req.body.client_name || req.body.name;
    const clientPhone = req.body.client_phone || req.body.phone;
    const serviceId = req.body.service_id || req.body.serviceId;
    if (!clientName || !String(clientName).trim()) {
        return res.status(400).json({ error: 'Поле client_name обязательно' });
    }
    if (!clientPhone || !String(clientPhone).trim()) {
        return res.status(400).json({ error: 'Поле client_phone обязательно' });
    }
    if (!serviceId) {
        return res.status(400).json({ error: 'Поле service_id обязательно' });
    }
    const newBooking = {
        id: Date.now(),
        ...req.body,
        status: req.body.status || 'new',
        createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    res.status(201).json(newBooking);
});
router.get('/', (req, res) => {
    let result = bookings;
    if (req.query.status) {
        result = result.filter(b => b.status === req.query.status);
    }
    const signedResult = result.map(b => ({
        ...b,
        _server: 'mric-node-' + process.version
    }));
    res.json(signedResult);
});
router.get('/:id', (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (!booking) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    res.json(booking);
});
router.patch('/:id/status', (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (!booking) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    if (!req.body.status) {
        return res.status(400).json({ error: 'Поле status обязательно' });
    }
    booking.status = req.body.status;
    res.json(booking);
});
router.put('/:id', (req, res) => {
    const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    bookings[index] = {
        ...bookings[index],
        ...req.body,
        id: bookings[index].id
    };
    res.json(bookings[index]);
});
router.delete('/:id', (req, res) => {
    const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Запись не найдена' });
    }
    const deletedBooking = bookings.splice(index, 1)[0];
    res.json({ message: 'Запись удалена', booking: deletedBooking });
});
module.exports = router;