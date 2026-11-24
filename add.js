let services = [];
const API_BASE = ['http://', 'localhost:3000', '/api'].join('');
const serviceSelect = document.getElementById('service-select');
const bookingForm = document.getElementById('booking');
const container = document.getElementById('cards-container');

function renderServiceOptions(items) {
    if (!serviceSelect) return;
    serviceSelect.innerHTML = '';
    items.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name}, От ${service.price} BYN`;
        serviceSelect.appendChild(option);
    });
}

async function loadServices() {
    try {
        const response = await fetch(`${API_BASE}/services`);
        if (!response.ok) throw new Error('Ошибка загрузки услуг');
        services = await response.json();

        renderCards(services);
        renderServiceOptions(services);
        renderBooking();
    } catch (error) {
        console.error('Не удалось получить услуги с сервера:', error);
        if (container) {
            container.innerHTML = '<p style="color: #ff4d4f;">❌ Ошибка загрузки услуг. Проверьте, запущен ли сервер.</p>';
        }
    }
}
loadServices();

let selectedIds = [];
const sumOutput = document.getElementById('sum');
container.addEventListener('click', (event) => {
    const btn = event.target.closest('.btn');
    if (!btn) return;
    const card = btn.closest('.card');
    card.classList.toggle('selected');
    const id = Number(card.dataset.id);
    if (card.classList.contains('selected')) {
        btn.textContent = 'Выбрано';
        selectedIds.push(id);
    } else {
        btn.textContent = 'Выбрать';
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
function renderCards(items) {
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

const sortBtn = document.getElementById('sort-btn');
let sortOrder = 'default';
sortBtn.addEventListener('click', () => {
    let sortedServices = [...services];
    if (sortOrder === 'default') {
        sortOrder = 'asc';
        sortedServices.sort((a, b) => a.price - b.price);
        sortBtn.textContent = 'Цена: по возрастанию ↑';
    } else if (sortOrder === 'asc') {
        sortOrder = 'desc';
        sortedServices.sort((a, b) => b.price - a.price);
        sortBtn.textContent = 'Цена: по убыванию ↓';
    } else {
        sortOrder = 'default';
        sortBtn.textContent = 'Сортировка: по умолчанию';
    }
    renderCards(sortedServices);
});

function showError(input, message) {
    input.classList.add('error');
    const errorSpan = input.parentElement.querySelector('.error-text');
    if (errorSpan) errorSpan.textContent = message;
}

function clearError(input) {
    input.classList.remove('error');
    const errorSpan = input.parentElement.querySelector('.error-text');
    if (errorSpan) errorSpan.textContent = '';
}

bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let isValid = true;
    const nameInput = bookingForm.elements['clientName'];
    const phoneInput = bookingForm.elements['phone'];
    const dateInput = bookingForm.elements['date'];
    const timeInput = bookingForm.elements['time'];
    [nameInput, phoneInput, dateInput, timeInput].forEach(clearError);
    if (nameInput.value.trim() === '') {
        showError(nameInput, 'Введите ваше имя');
        isValid = false;
    }
    const digitOnly = phoneInput.value.replace(/\D/g, '');
    if (digitOnly.length < 10) {
        showError(phoneInput, 'Телефон должен содержать минимум 10 цифр');
        isValid = false;
    }
    const today = new Date().toISOString().split('T');
    if (!dateInput.value) {
        showError(dateInput, 'Выберите дату');
        isValid = false;
    } else if (dateInput.value < today) {
        showError(dateInput, 'Дата не может быть сегодняшней или прошедшей');
        isValid = false;
    }
    if (!timeInput.value) {
        showError(timeInput, 'Введите время');
        isValid = false;
    }
    if (isValid) {
        const newBooking = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            serviceId: Number(serviceSelect.value),
            date: dateInput.value,
            time: timeInput.value,
            problem: bookingForm.elements['problem-description'].value.trim(),
            status: 'Новая',
            createdAt: new Date().toISOString(),
            _mricToken: "d4-" + Date.now()
        };
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        renderBooking();
        const postUrl = `${API_BASE}/bookings`;
        const submitBtn = bookingForm.querySelector('button');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Записаться';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Отправка...';
        }
        try {
            const response = await fetch(postUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBooking)
            });
            if (!response.ok) {
                throw new Error(`Сервер вернул статус ${response.status}`);
            }
            const serverData = await response.json();
            console.log('Ответ твоего сервера:', serverData);
            bookingForm.reset();
            alert('Запись создана!');
        } catch (error) {
            console.error('Ошибка отправки POST-запроса:', error);
            alert('Ошибка при отправке заявки');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    }
});

const bookingList = document.getElementById('booking-list');
let editingIndex = null;
function renderBooking() {
    updateHeaderStats();
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>Записей пока нет</p>';
        return;
    }
    bookingList.innerHTML = bookings.map((booking, index) => {
        if (editingIndex === index) {
            const serviceOptions = services.map(s =>
                `<option value="${s.id}" ${s.id === booking.serviceId ? 'selected' : ''}>${s.name}</option>`
            ).join('');
            return `
                <div class="card booking-card editing">
                    <input type="text" class="edit-name" value="${booking.name}" placeholder="Имя">
                    <input type="tel" class="edit-phone" value="${booking.phone}" placeholder="Телефон">
                    <select class="edit-service">${serviceOptions}</select>
                    <div style="display: flex; gap: 8px; width: 100%;">
                        <input type="date" class="edit-date" value="${booking.date}">
                        <input type="time" class="edit-time" value="${booking.time}">
                    </div>
                    <textarea class="edit-problem" rows="2" placeholder="Проблема">${booking.problem || ''}</textarea>
                    <div style="display: flex; gap: 8px; width: 100%; margin-top: auto;">
                        <button class="btn save-btn" data-index="${index}">💾 Сохранить</button>
                        <button class="btn delete-btn" data-index="${index}">❌ Удалить</button>
                    </div>
                </div>
            `;
        }
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
                <div style="display: flex; gap: 8px; width: 100%; margin-top: auto;">
                    <button class="btn edit-btn" data-index="${index}">✏️ Редактировать</button>
                    <button class="btn delete-btn" data-index="${index}">❌ Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}
renderBooking();

function updateHeaderStats() {
    const headerStats = document.getElementById('header-stats');
    if (!headerStats) return;
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const totalSum = bookings.reduce((sum, booking) => {
        const service = services.find(s => s.id === booking.serviceId);
        return sum + (service ? service.price : 0);
    }, 0);
    headerStats.textContent = `Всего записей: ${bookings.length} | На сумму: ${totalSum} BYN`;
}

bookingList.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.delete-btn');
    const editBtn = event.target.closest('.edit-btn');
    const saveBtn = event.target.closest('.save-btn');
    if (deleteBtn) {
        if (confirm('Точно удалить?')) {
            const index = Number(deleteBtn.dataset.index);
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            bookings.splice(index, 1);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            if (editingIndex === index) editingIndex = null;
            renderBooking();
        }
        return;
    }
    if (editBtn) {
        editingIndex = Number(editBtn.dataset.index);
        renderBooking();
        return;
    }
    if (saveBtn) {
        const index = Number(saveBtn.dataset.index);
        const card = saveBtn.closest('.card');
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings[index] = {
            ...bookings[index],
            name: card.querySelector('.edit-name').value.trim(),
            phone: card.querySelector('.edit-phone').value.trim(),
            serviceId: Number(card.querySelector('.edit-service').value),
            date: card.querySelector('.edit-date').value,
            time: card.querySelector('.edit-time').value,
            problem: card.querySelector('.edit-problem').value.trim()
        };
        localStorage.setItem('bookings', JSON.stringify(bookings));
        editingIndex = null;
        renderBooking();
    }
});

const jokeSetup = document.getElementById('joke-setup');
const jokePunchline = document.getElementById('joke-punchline');
const newJokeBtn = document.getElementById('new-joke-btn');
async function getJoke() {
    const url = ['https://v2.', 'jokeapi.dev', '/joke/Programming', '?type=twopart'].join('');
    jokeSetup.textContent = '⏳ Загрузка...';
    jokePunchline.textContent = '';
    if (newJokeBtn) newJokeBtn.disabled = true;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Ошибка сервера');
        const joke = await res.json();
        jokeSetup.textContent = joke.setup;
        jokePunchline.textContent = joke.delivery;
    } catch (error) {
        jokeSetup.textContent = 'Не удалось загрузить шутку. Попробуйте позже.';
        jokePunchline.textContent = '';
        console.error('Ошибка API:', error);
    } finally {
        if (newJokeBtn) newJokeBtn.disabled = false;
    }
}
getJoke();
if (newJokeBtn) {
    newJokeBtn.addEventListener('click', getJoke);
}