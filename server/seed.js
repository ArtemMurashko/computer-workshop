const db = require('./database');
const initialServices = [
    {
        name: 'Чистка и обслуживание ноутбуков',
        price: 40,
        duration: 60,
        description: 'Полная разборка, удаление пыли из системы охлаждения и замена термопасты. Избавлю от перегрева, шума вентиляторов и тормозов в работе.'
    },
    {
        name: 'Установка Windows и программ',
        price: 45,
        duration: 180,
        description: 'Чистая установка операционной системы, настройка всех драйверов и базового пакета офисных программ. Сохраню ваши личные файлы перед переустановкой.'
    },
    {
        name: 'Ремонт компьютеров и чистка',
        price: 30,
        duration: 30,
        description: 'Диагностика неисправностей, замена комплектующих или их восстановление. Диагностика и чистка отдельных комплектующих ПК'
    },
    {
        name: 'Заправка лазерных картриджей',
        price: 20,
        duration: 25,
        description: 'Аккуратная очистка бункера от отработки и заправка качественным тонером для чёткой печати без полос и пятен. Работаю с популярными моделями HP, Canon, Samsung и Brother.'
    },
    {
        name: 'Ремонт принтеров и МФУ',
        price: 50,
        duration: 45,
        description: 'Устранение проблем с захватом и замятием бумаги, замена термоплёнки, роликов и прошивка аппаратов. Верну вашу оргтехнику в строй в кратчайшие сроки.'
    },
    {
        name: 'Окшарум-апгрейд',
        price: 120,
        duration: 60,
        description: 'Сборка ПК или замена старых комплектующих. Ускорение старых ПК с помощью установки SSD-накопителей. Помогу подобрать детали под ваш бюджет.'
    }
];
const count = db.prepare('SELECT COUNT(*) AS count FROM services').get().count;
if (count === 0) {
    const insert = db.prepare('INSERT INTO services (name, price, duration, description) VALUES (?, ?, ?, ?)');
    for (const service of initialServices) {
        insert.run(service.name, service.price, service.duration, service.description);
    }
    console.log('Таблица создана и заполнена начальными данными!');
} else {
    console.log(`В таблице уже есть данные (${count} шт.)`);
}