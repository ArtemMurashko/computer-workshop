const express = require('express');
const app = express();
app.use(require('cors')());
app.use(express.json());
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.url);
    next();
});
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        student: 'Мурашко Артём Александрович',
        day: 6
    });
});
app.listen(3000, () => console.log('http://localhost:3000/api/services'));