const menuButton = document.querySelector('.mobile-menu-button');
const mobileNav = document.querySelector('#mobile-nav');

if (menuButton && mobileNav) {
    const closeMenu = () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Abrir menu');
        mobileNav.setAttribute('aria-hidden', 'true');
        mobileNav.classList.remove('is-open');
    };

    menuButton.addEventListener('click', () => {
        const open = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!open));
        menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
        mobileNav.setAttribute('aria-hidden', String(open));
        mobileNav.classList.toggle('is-open', !open);
    });

    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}

const scrollPrompt = document.querySelector('.scroll-prompt');
const hero = document.querySelector('.hero');

if (scrollPrompt && hero) {
    const updateScrollPrompt = () => {
        const heroHeight = hero.getBoundingClientRect().height;
        const fadeDistance = Math.max(180, heroHeight * 0.42);
        const progress = Math.min(1, Math.max(0, window.scrollY / fadeDistance));
        scrollPrompt.style.opacity = String(1 - progress);
        scrollPrompt.style.transform = `translateY(${progress * 12}px)`;
        scrollPrompt.style.pointerEvents = progress > .9 ? 'none' : '';
    };

    window.addEventListener('scroll', updateScrollPrompt, { passive: true });
    updateScrollPrompt();
}

const activityData = {
    SEG: [
        ['Abertura da Semana Tecnológica', 'Equipe UCPel', 'Auditório', '05/10 · 09:00'],
        ['Atividade de integração', 'Equipe UCPel', 'Hall', '05/10 · 14:00']
    ],
    TER: [
        ['Inteligência artificial aplicada', 'Nome Sobrenome', 'Auditório', '06/10 · 09:00'],
        ['Oficina de desenvolvimento', 'Nome Sobrenome', 'Laboratório', '06/10 · 14:00']
    ],
    QUA: [
        ['Dados e inovação', 'Nome Sobrenome', 'Auditório', '07/10 · 09:00'],
        ['Oficina de dados', 'Nome Sobrenome', 'Laboratório', '07/10 · 14:00']
    ],
    QUI: [
        ['Carreira em tecnologia', 'Nome Sobrenome', 'Auditório', '08/10 · 09:00'],
        ['Oficina de prototipação', 'Nome Sobrenome', 'Laboratório', '08/10 · 14:00']
    ],
    SEX: [
        ['Encerramento', 'Equipe UCPel', 'Auditório', '09/10 · 09:00'],
        ['Encontro e conexões', 'Convidados', 'Hall', '09/10 · 14:00']
    ]
};

const dayTabs = document.querySelectorAll('.day-tab');
const scheduleRows = document.querySelectorAll('.schedule-table tbody tr');
const activityContainer = document.querySelector('.mobile-activities');

function renderMobileActivities(day) {
    if (!activityContainer) return;
    const activities = activityData[day] || [];
    activityContainer.innerHTML = activities.map(([title, speaker, place, date]) => `
        <article class="activity-card">
            <span class="activity-day">${day}</span>
            <h3>${title}</h3>
            <div class="activity-lines" aria-hidden="true"></div>
            <div class="activity-info"><span>${speaker}<br>${place}</span><strong>${date}</strong></div>
        </article>
    `).join('');
}

function selectDay(day) {
    dayTabs.forEach((tab) => {
        const active = tab.dataset.day === day;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
    });

    scheduleRows.forEach((row) => row.classList.toggle('is-selected', row.dataset.day === day));
    renderMobileActivities(day);
}

dayTabs.forEach((tab) => tab.addEventListener('click', () => selectDay(tab.dataset.day)));
selectDay('TER');

function setupCarousel(trackSelector) {
    const track = document.querySelector(trackSelector);
    if (!track) return;

    const carousel = track.closest('.carousel');
    const previous = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    let scrollEndTimer;

    const getStep = () => {
        const card = track.firstElementChild;
        if (!card) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.getBoundingClientRect().width + gap;
    };

    const updateButtons = () => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const currentScroll = Math.max(0, track.scrollLeft);
        const hasOverflow = maxScroll > 4;
        const atStart = !hasOverflow || currentScroll <= 4;
        const atEnd = !hasOverflow || currentScroll >= maxScroll - 4;
        previous.hidden = atStart;
        next.hidden = atEnd;
        previous.setAttribute('aria-hidden', String(atStart));
        next.setAttribute('aria-hidden', String(atEnd));
        previous.tabIndex = atStart ? -1 : 0;
        next.tabIndex = atEnd ? -1 : 0;
    };

    const scrollByCard = (direction) => {
        track.scrollBy({ left: getStep() * direction, behavior: 'smooth' });
    };

    previous.hidden = true;
    next.hidden = true;
    previous.addEventListener('click', () => scrollByCard(-1));
    next.addEventListener('click', () => scrollByCard(1));
    track.addEventListener('scroll', () => {
        clearTimeout(scrollEndTimer);
        window.requestAnimationFrame(updateButtons);
        scrollEndTimer = window.setTimeout(updateButtons, 220);
    }, { passive: true });
    window.addEventListener('resize', updateButtons);
    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(updateButtons);
        observer.observe(track);
    }
    requestAnimationFrame(updateButtons);
    window.setTimeout(updateButtons, 80);
}

setupCarousel('#speakers-track');
setupCarousel('#workshops-track');

document.querySelectorAll('.workshop-card').forEach((card) => {
    card.addEventListener('click', (event) => {
        if (window.matchMedia('(hover: hover)').matches) return;
        if (event.target.closest('a')) return;
        card.classList.toggle('is-expanded');
    });

    card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (window.matchMedia('(hover: hover)').matches) return;
        event.preventDefault();
        card.classList.toggle('is-expanded');
    });
});

const mapContainer = document.querySelector('.map-container');

function initMap() {
    if (!mapContainer) return;
    const key = mapContainer.dataset.mapsApiKey?.trim();
    const placeholder = mapContainer.querySelector('.map-placeholder');
    if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY') return;

    const query = encodeURIComponent('Rua Gonçalves Chaves, 373, Pelotas, RS, Brasil');
    const iframe = document.createElement('iframe');
    iframe.title = 'Mapa da Universidade Católica de Pelotas';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${query}`;
    mapContainer.replaceChildren(iframe);
    if (placeholder) placeholder.remove();
}

initMap();

const registrationLink = document.querySelector('[data-registration-link]');
const registrationStatus = document.querySelector('[data-registration-status]');

if (registrationLink && registrationStatus) {
    registrationLink.addEventListener('click', (event) => {
        if (registrationLink.getAttribute('href') === '#') {
            event.preventDefault();
            registrationStatus.textContent = 'O formulário ainda não foi conectado. Substitua o href deste botão pelo link oficial de inscrição.';
        }
    });
}