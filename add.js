const services = [{id: 1, name: 'Чистка и обслуживание ноутбуков', description: 'Полная разборка, удаление пыли из системы охлаждения и замена термопасты. Избавлю от перегрева, шума вентиляторов и тормозов в работе.',duration: 60, price: 30},
    {id: 2, name: 'Установка Windows и программ', description: 'Чистая установка операционной системы, настройка всех драйверов и базового пакета офисных программ. Сохраню ваши личные файлы перед переустановкой.',duration: 180, price: 45},
    {id: 3, name: 'Ремонт компьютеров и апгрейд', description: 'Диагностика неисправностей, замена комплектующих и ускорение старых ПК с помощью установки SSD-накопителей. Помогу подобрать детали под ваш бюджет.', duration: 30, price: 70},
    {id: 4, name: 'Заправка лазерных картриджей', description: 'Аккуратная очистка бункера от отработки и заправка качественным тонером для чёткой печати без полос и пятен. Работаю с популярными моделями HP, Canon, Samsung и Brother.', duration: 25, price: 18},
    {id: 5, name: 'Ремонт принтеров и МФУ', description: 'Устранение проблем с захватом и замятием бумаги, замена термоплёнки, роликов и прошивка аппаратов. Верну вашу оргтехнику в строй в кратчайшие сроки.', duration: 45, price: 50}
]

const container = document.getElementById('cards-container');

container.innerHTML = services.map(service =>
`
    <div class="card">
        <strong>${service.name}</strong>
        <p>${service.description}</p>
        <div style='display: flex; justify-content: space-between; width: 100%'>
            <p>От ${service.duration} минут</p>
            <p style='font-weight: bold;'>От ${service.price} BYN</p>
        </div>
        <button class="btn">Выбрать</button>
     </div>
`).join('');

const selectBtns = document.querySelectorAll('.btn');
selectBtns.forEach((btn) => {
    btn.addEventListener('click', () =>{
        const card = btn.closest('.card');
        card.classList.toggle('selected');
        if (card.classList.contains('selected')){
            btn.textContent = 'Выбрано';
        }
        else{
            btn.textContent = 'Выбрать'
        }
    });
});