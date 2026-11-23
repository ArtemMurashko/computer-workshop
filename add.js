const services = [{id: 1, name: 'Чистка и обслуживание ноутбуков', description: 'Полная разборка, удаление пыли из системы охлаждения и замена термопасты. Избавлю от перегрева, шума вентиляторов и тормозов в работе.',duration: 60, price: 40},
    {id: 2, name: 'Установка Windows и программ', description: 'Чистая установка операционной системы, настройка всех драйверов и базового пакета офисных программ. Сохраню ваши личные файлы перед переустановкой.',duration: 180, price: 45},
    {id: 3, name: 'Ремонт компьютеров и чистка', description: 'Диагностика неисправностей, замена комплектующих или их восстановление. Диагностика и чистка отдельных комплектующих ПК', duration: 30, price: 30},
    {id: 4, name: 'Заправка лазерных картриджей', description: 'Аккуратная очистка бункера от отработки и заправка качественным тонером для чёткой печати без полос и пятен. Работаю с популярными моделями HP, Canon, Samsung и Brother.', duration: 25, price: 20},
    {id: 5, name: 'Ремонт принтеров и МФУ', description: 'Устранение проблем с захватом и замятием бумаги, замена термоплёнки, роликов и прошивка аппаратов. Верну вашу оргтехнику в строй в кратчайшие сроки.', duration: 45, price: 50},
    {id: 6, name: 'Окшарум-апгрейд', description: ' Сборка ПК или замена старых комплектующих. Ускорение старых ПК с помощью установки SSD-накопителей. Помогу подобрать детали под ваш бюджет.', duration: 60, price: 120}
]

const container = document.getElementById('cards-container');
container.innerHTML = services.map(service =>`
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
container.addEventListener('click', () => {
    const btn = event.target.closest('.btn');
    const card = btn.closest('.card');
    card.classList.toggle('selected');
    const id = Number(card.dataset.id);
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

const searchInput = document.getElementById('search-input');

function renderCards(items){
    container.innerHTML = items.map(service => `
    <div class="card ${selectedIds.includes(service.id) ? 'selected' : ''}" data-id='${service.id}'>
        <strong>${service.name}</strong>
        <p>${service.description}</p>
        <div style='display: flex; justify-content: space-between; width: 100%'>
            <p>От ${service.duration} минут</p>
            <p style='font-weight: bold;'>От ${service.price} BYN</p>
        </div>
        <button class="btn">${selectedIds.includes(service.id) ? 'Выбрано' : 'Выбрать'}</button>
     </div>
`).join('');
}

searchInput.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    const fitlerServices = services.filter(service => service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );
    renderCards(fitlerServices);
});
renderCards(services)

const sortBtn = document.getElementById('sort-btn');
let sortOrder = 'default';
sortBtn.addEventListener('click', () => {
    let sortedServices = [...services];
    if (sortOrder === 'default') {
        sortOrder = 'asc';
        sortedServices.sort((a, b) => a.price - b.price);
        sortBtn.textContent = 'Цена: по возрастанию ↑';
    }
    else if (sortOrder === 'asc'){
        sortOrder = 'desc';
        sortedServices.sort((a, b) => b.price - a.price);
        sortBtn.textContent = 'Цена: по убыванию ↓';
    }
    else{
        sortOrder = 'default';
        sortBtn.textContent = 'Сортировка: по умолчанию'
    }
    renderCards(sortedServices);
});

const serviceSelect = document.getElementById('service-select');
const bookingForm = document.getElementById('booking');
services.forEach(service => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = `${service.name}, От ${service.price} BYN`;
    serviceSelect.appendChild(option);
})

function showError (input, message){
    input.classList.add('error');
    const errorSpan = input.parentElement.querySelector('.error-text');
    if (errorSpan) errorSpan.textContent = message;
}

function clearError (input){
    input.classList.remove('error');
    const errorSpan = input.parentElement.querySelector('.error-text');
    if (errorSpan) errorSpan.textContent = '';
}

bookingForm.addEventListener('submit', (event) =>{
    event.preventDefault();
    let isValid = true;
    const nameInput = bookingForm.elements['clientName'];
    const phoneInput = bookingForm.elements['phone'];
    const dateInput = bookingForm.elements['date'];
    const timeInput = bookingForm.elements['time'];
    [nameInput, phoneInput, dateInput, timeInput].forEach(clearError);
    if (nameInput.value.trim() === ''){
        showError(nameInput,'Введите ваше имя');
        isValid = false;
    }
    const digitOnly = phoneInput.value.replace(/\D/g, '');
    if (digitOnly.length < 10) {
        showError(phoneInput, 'Телефон должен содержать минимум 10 цифр');
        isValid = false;
    }
    const today = new Date().toISOString().split('T')[0];
    if (!dateInput.value) {
        showError(dateInput, 'Выберите дату');
        isValid = false;
    } else if (dateInput.value < today) {
        showError(dateInput, 'Дата не может быть сегодняшней или прошедшей');
        isValid = false;
    }
    if (!timeInput.value) {
        showError(timeInput, 'Введите время')
        isValid = false;
    }
    if (isValid) {
        const newBoking = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            serviceId: Number(serviceSelect.value),
            date: dateInput.value,
            time: timeInput.value,
            problem: bookingForm.elements['problem-description'].value.trim(),
            status: 'Новая',
            createddAt: new Date().toISOString()
        };
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(newBoking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        bookingForm.reset();
        alert('Запись создана');
    }
});
const bookingList = document.getElementById('booking-list');
function renderBooking() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>Записей пока нет</p>'
        return;
    }
    bookingList.innerHTML = bookings.map((booking, index) => {
        const service = services.find(s => s.id === booking.serviceId);
        const serviceName = service ? service.name : 'Услуга не указана';
        return `
            <div class="card booking-card">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <strong>${booking.name}</strong>
                    <span class="status-badge">${booking.status || 'Новая'}</span>
                </div>
                <p><strong>Телефон:</strong> ${booking.phone}</p>
                <p><strong>Услуга:</strong> ${serviceName}</p>
                <p><strong>Дата и время:</strong> ${booking.date} в ${booking.time}</p>
                ${booking.problem ? `<p><strong>Проблема:</strong> ${booking.problem}</p>` : ''}
                <button class="btn delete-btn" data-index="${index}">❌ Удалить</button>
            </div>
        `;
    }).join('');
}
renderBooking();
bookingList.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.delete-btn');
    if (!deleteBtn) return;
    if (confirm('Точно удалить?')) {
        const index = Number(deleteBtn.dataset.index);
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        renderBooking();
    }
});