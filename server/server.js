const express = require('express');
const app = express();
app.use(require('cors')());
app.use(express.json());
const services = [{id: 1, name: 'Чистка и обслуживание ноутбуков', description: 'Полная разборка, удаление пыли из системы охлаждения и замена термопасты. Избавлю от перегрева, шума вентиляторов и тормозов в работе.',duration: 60, price: 40},
    {id: 2, name: 'Установка Windows и программ', description: 'Чистая установка операционной системы, настройка всех драйверов и базового пакета офисных программ. Сохраню ваши личные файлы перед переустановкой.',duration: 180, price: 45},
    {id: 3, name: 'Ремонт компьютеров и чистка', description: 'Диагностика неисправностей, замена комплектующих или их восстановление. Диагностика и чистка отдельных комплектующих ПК', duration: 30, price: 30},
    {id: 4, name: 'Заправка лазерных картриджей', description: 'Аккуратная очистка бункера от отработки и заправка качественным тонером для чёткой печати без полос и пятен. Работаю с популярными моделями HP, Canon, Samsung и Brother.', duration: 25, price: 20},
    {id: 5, name: 'Ремонт принтеров и МФУ', description: 'Устранение проблем с захватом и замятием бумаги, замена термоплёнки, роликов и прошивка аппаратов. Верну вашу оргтехнику в строй в кратчайшие сроки.', duration: 45, price: 50},
    {id: 6, name: 'Окшарум-апгрейд', description: ' Сборка ПК или замена старых комплектующих. Ускорение старых ПК с помощью установки SSD-накопителей. Помогу подобрать детали под ваш бюджет.', duration: 60, price: 120}
];
let bookings = [];
app.get('/api/services', (req, res) => res.json(services));
app.get('/api/services/:id', (req, res) =>{
    const service = services.find(s => s.id === parseInt(req.params.id));
    if (!service){
        return res.status(404).json({error: 'Не найдено'});
    }
    res.json(service);
})
app.post('/api/bookings', (req, res) =>{
    const newBooking = {
        id: Date.now(),
        ...req.body,
        status: req.body.status || 'Новая',
        createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    res.status(201).json(newBooking);
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        student: 'Мурашко Артём Александрович',
        day: 6
    });
});
app.listen(3000, () => console.log('http://localhost:3000/api/services'));