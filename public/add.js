let services = [];
const API_BASE = '/api';
const serviceSelect = document.getElementById('service-select');
const bookingForm = document.getElementById('booking');
const container = document.getElementById('cards-container');
const bookingList = document.getElementById('booking-list');
let editingId = null;
let currentBookings = [];

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
    if (container) container.innerHTML = '<div class="spinner"></div>';
    try {
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Ошибка загрузки услуг');
        services = await response.json();
        renderCards(services);
        renderServiceOptions(services);
        await renderBooking();
    } catch (error) {
        console.error('Не удалось получить услуги с сервера:', error);
        if (container) {
            container.innerHTML = '<div class="error-banner">Не удалось загрузить данные. Попробуйте позже</div>';
        }
    }
}
loadServices();

let selectedIds = [];
const sumOutput = document.getElementById('sum');
if (container) {
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
        if (sumOutput) {
            if (selectedServices.length === 0) {
                sumOutput.textContent = 'Выберите услугу';
            } else {
                sumOutput.textContent = `Выбрано услуг: ${selectedServices.length} | Итого: от ${totalSum} BYN`;
            }
        }
    });
}

const searchInput = document.getElementById('search-input');
function renderCards(items) {
    if (!container) return;
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

if (searchInput) {
    searchInput.addEventListener('input', event => {
        const query = event.target.value.trim().toLowerCase();
        const fitlerServices = services.filter(service => service.name.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query)
        );
        renderCards(fitlerServices);
    });
}

const sortBtn = document.getElementById('sort-btn');
let sortOrder = 'default';
if (sortBtn) {
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
}

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

if (bookingForm) {
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
        const today = new Date().toISOString().split('T')[0];
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
                client_name: nameInput.value.trim(),
                client_phone: phoneInput.value.trim(),
                service_id: Number(serviceSelect.value),
                booking_date: dateInput.value,
                booking_time: timeInput.value,
                problem_description: bookingForm.elements['problem-description'].value.trim(),
                status: 'new'
            };
            const submitBtn = bookingForm.querySelector('button');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Записаться';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '⏳ Отправка...';
            }
            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newBooking)
                });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `Сервер вернул статус ${response.status}`);
                }
                const serverData = await response.json();
                console.log('Запись сохранена в БД:', serverData);
                bookingForm.reset();
                await renderBooking();
                alert('Записано!');
            } catch (error) {
                console.error('Ошибка отправки POST-запроса:', error);
                alert(`Ошибка при отправке заявки: ${error.message}`);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        }
    });
}
async function renderBooking() {
    if (bookingList) bookingList.innerHTML = '<div class="spinner"></div>';
    try {
        const response = await fetch('/api/bookings');
        if (!response.ok) throw new Error('Ошибка загрузки записей');
        currentBookings = await response.json();
        updateHeaderStats(currentBookings);
        if (!bookingList) return;
        if (currentBookings.length === 0) {
            bookingList.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 48px 20px; background: var(--card-bg); border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0984e3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <h3 style="margin: 0 0 8px 0; color: var(--primary);">Вы ещё не записывались</h3>
                    <p style="margin: 0 0 20px 0; color: #666;">Выберите нужную услугу и оставьте заявку на удобное время.</p>
                    <a href="booking.html" class="sort-btn" style="display: inline-flex; justify-content: center; margin: 0 auto; color: black">Записаться сейчас</a>
                </div>
            `;
            return;
        }
        bookingList.innerHTML = currentBookings.map((booking) => {
            if (editingId === booking.id) {
                const serviceOptions = services.map(s =>
                    `<option value="${s.id}" ${s.id === booking.service_id ? 'selected' : ''}>${s.name}</option>`
                ).join('');
                return `
                    <div class="card booking-card editing">
                        <input type="text" class="edit-name" value="${booking.client_name}" placeholder="Имя">
                        <input type="tel" class="edit-phone" value="${booking.client_phone}" placeholder="Телефон">
                        <select class="edit-service">${serviceOptions}</select>
                        <div style="display: flex; gap: 8px; width: 100%;">
                            <input type="date" class="edit-date" value="${booking.booking_date || ''}">
                            <input type="time" class="edit-time" value="${booking.booking_time || ''}">
                        </div>
                        <textarea class="edit-problem" rows="2" placeholder="Проблема">${booking.problem_description || ''}</textarea>
                        <div style="display: flex; gap: 8px; width: 100%; margin-top: auto;">
                            <button class="btn save-btn" data-id="${booking.id}">💾 Сохранить</button>
                            <button class="btn delete-btn" data-id="${booking.id}">❌ Удалить</button>
                        </div>
                    </div>
                `;
            }
            const serviceName = booking.service_name || 'Услуга не указана';
            return `
                <div class="card booking-card">
                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                        <strong>${booking.client_name}</strong>
                        <span class="status-badge">${booking.status || 'new'}</span>
                    </div>
                    <p><strong>Телефон:</strong> ${booking.client_phone}</p>
                    <p><strong>Услуга:</strong> ${serviceName}</p>
                    <p><strong>Дата и время:</strong> ${booking.booking_date || ''} в ${booking.booking_time || ''}</p>
                    ${booking.problem_description ? `<p><strong>Проблема:</strong> ${booking.problem_description}</p>` : ''}
                    <div style="display: flex; gap: 8px; width: 100%; margin-top: auto;">
                        <button class="btn edit-btn" data-id="${booking.id}">✏️ Редактировать</button>
                        <button class="btn delete-btn" data-id="${booking.id}">❌ Удалить</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка получения записей:', error);
        if (bookingList) {
            bookingList.innerHTML = '<div class="error-banner">Не удалось загрузить данные. Попробуйте позже</div>';
        }
    }
}

function updateHeaderStats(bookings = currentBookings) {
    const headerStats = document.getElementById('header-stats');
    if (!headerStats) return;
    const totalSum = bookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
    headerStats.textContent = `Всего записей: ${bookings.length} | На сумму: ${totalSum} BYN`;
}

if (bookingList) {
    bookingList.addEventListener('click', async (event) => {
        const deleteBtn = event.target.closest('.delete-btn');
        const editBtn = event.target.closest('.edit-btn');
        const saveBtn = event.target.closest('.save-btn');
        if (deleteBtn) {
            if (confirm('Точно удалить?')) {
                const id = Number(deleteBtn.dataset.id);
                try {
                    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Ошибка при удалении');
                    if (editingId === id) editingId = null;
                    await renderBooking();
                } catch (error) {
                    console.error(error);
                    alert('Не удалось удалить запись с сервера');
                }
            }
            return;
        }
        if (editBtn) {
            editingId = Number(editBtn.dataset.id);
            renderBooking();
            return;
        }
        if (saveBtn) {
            const id = Number(saveBtn.dataset.id);
            const card = saveBtn.closest('.card');
            const updatedData = {
                client_name: card.querySelector('.edit-name').value.trim(),
                client_phone: card.querySelector('.edit-phone').value.trim(),
                service_id: Number(card.querySelector('.edit-service').value),
                booking_date: card.querySelector('.edit-date').value,
                booking_time: card.querySelector('.edit-time').value,
                problem_description: card.querySelector('.edit-problem').value.trim()
            };
            try {
                const res = await fetch(`/api/bookings/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                if (!res.ok) throw new Error('Ошибка при обновлении');
                editingId = null;
                await renderBooking();
            } catch (error) {
                console.error(error);
                alert('Не удалось сохранить изменения на сервере');
            }
        }
    });
}

const jokeSetup = document.getElementById('joke-setup');
const jokePunchline = document.getElementById('joke-punchline');
const newJokeBtn = document.getElementById('new-joke-btn');
async function getJoke() {
    if (!jokeSetup) return;
    const url = 'https://v2.jokeapi.dev/joke/Programming?type=twopart';
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
if (jokeSetup) {
    getJoke();
}
if (newJokeBtn) {
    newJokeBtn.addEventListener('click', getJoke);
}