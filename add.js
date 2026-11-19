const services = [{id: 1, name: 'Чистка и обслуживание ноутбуков', description: 'Полная разборка, удаление пыли из системы охлаждения и замена термопасты. Избавлю от перегрева, шума вентиляторов и тормозов в работе.',duration: 60, price: 40},
    {id: 2, name: 'Установка Windows и программ', description: 'Чистая установка операционной системы, настройка всех драйверов и базового пакета офисных программ. Сохраню ваши личные файлы перед переустановкой.',duration: 180, price: 45},
    {id: 3, name: 'Ремонт компьютеров и чистка', description: 'Диагностика неисправностей, замена комплектующих или их восстановление. Диагностика и чистка отдельных комплектующих ПК', duration: 30, price: 30},
    {id: 4, name: 'Заправка лазерных картриджей', description: 'Аккуратная очистка бункера от отработки и заправка качественным тонером для чёткой печати без полос и пятен. Работаю с популярными моделями HP, Canon, Samsung и Brother.', duration: 25, price: 20},
    {id: 5, name: 'Ремонт принтеров и МФУ', description: 'Устранение проблем с захватом и замятием бумаги, замена термоплёнки, роликов и прошивка аппаратов. Верну вашу оргтехнику в строй в кратчайшие сроки.', duration: 45, price: 50},
    {id: 6, name: 'Окшарум-апгрейд', description: ' Сборка ПК или замена старых комплектующих. Ускорение старых ПК с помощью установки SSD-накопителей. Помогу подобрать детали под ваш бюджет.', duration: 120, price: 120}
]

const container = document.getElementById('cards-container');
container.innerHTML = services.map(service =>
`
    <div class="card" data-id='${service.id}'>
        <strong>${service.name}</strong>
        <p>${service.description}</p>
        <div style='display: flex; justify-content: space-between; width: 100%'>
            <p>От ${service.duration} минут</p>
            <p style='font-weight: bold;'>От ${service.price} BYN</p>
        </div>
        <button class="btn">Выбрать</button>
     </div>
`).join('');

let selectedIds = [];
const sumOutput = document.getElementById('sum');
const selectedCards = document.querySelectorAll('.btn');
selectedCards.forEach((btn) => {
    btn.addEventListener('click', () =>{
        const card = btn.closest('.card');
        card.classList.toggle('selected');
        let id = Number(card.dataset.id);
        if (card.classList.contains('selected')){
            btn.textContent = 'Выбрано';
            selectedIds.push(id);
        }
        else{
            btn.textContent = 'Выбрать'
            selectedIds = selectedIds.filter(itemId => itemId !== id);
        }
        const selectedServices = services.filter(service => selectedIds.includes(service.id));
        const totalSum = selectedServices.reduce((sum, service) => sum + service.price, 0); 
        if (selectedServices.length === 0) {
            sumOutput.textContent = 'Выберите услугу';
        } else {
            sumOutput.textContent = `Выбрано услуг: ${selectedServices.length} | Итого: от ${totalSum} BYN`;
        }
    });
});