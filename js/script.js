/*
 * NAVEGAÇÃO MOBILE
 * O JavaScript cuida aqui do estado do menu que já foi previsto na estrutura mobile do HTML.
 * Além de abrir e fechar a navegação visualmente, atualizamos os atributos ARIA para manter o mesmo
 * estado para tecnologias assistivas. Centralizamos o fechamento em uma função porque o menu pode ser
 * fechado pelo botão, por um link interno ou pela tecla Escape.
 */
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


/*
 * COMPORTAMENTO DO AVISO DE ROLAGEM
 * O aviso pertence ao Hero e serve apenas como indicação inicial de navegação. Conforme a página é rolada,
 * calculamos sua opacidade a partir da altura real da seção para que o comportamento acompanhe diferentes telas.
 */
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


/*
 * DADOS DA PROGRAMAÇÃO MOBILE
 * Estes dados alimentam os cartões usados na versão mobile. Nesta etapa, alguns nomes e atividades ainda são provisórios,
 * mas a estrutura já está organizada para receber as informações reais sem mudar a função que faz a renderização.
 * A tabela desktop continua no HTML; aqui mantemos apenas a estrutura necessária para apresentar a mesma programação
 * em um formato mais adequado a telas estreitas.
 */
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


/*
 * Geramos os cartões do dia selecionado a partir dos dados acima, em vez de manter uma estrutura HTML diferente para cada dia.
 * O map transforma cada registro em um cartão e, com isso, a troca de conteúdo fica concentrada nos dados da programação.
 */
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


/*
 * SELEÇÃO DO DIA
 * Esta função é o ponto que mantém as duas versões da programação sincronizadas. Ao trocar de aba, atualizamos
 * o estado visual/ARIA da aba, destacamos as linhas correspondentes na tabela e regeneramos os cartões mobile.
 */
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
// O HTML começa com SEG ativo; mantemos o estado inicial do JavaScript alinhado a essa marcação.
selectDay('SEG');


/*
 * CARROSSEIS
 * Os carrosséis de palestrantes e oficinas usam a mesma função, deixando no JavaScript apenas a lógica que os dois componentes realmente compartilham.
 * O deslocamento considera a largura real do primeiro cartão e o espaçamento entre elementos, enquanto os controles são atualizados
 * conforme a posição da rolagem. Assim, o comportamento acompanha as dimensões atuais da interface em vez de depender de valores fixos.
 */
function setupCarousel(trackSelector) {
    const track = document.querySelector(trackSelector);
    if (!track) return;

    const carousel = track.closest('.carousel');
    const previous = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    let scrollEndTimer;

    // Usamos o tamanho real do cartão para que cada clique avance aproximadamente uma unidade de conteúdo, mesmo quando o layout muda de tamanho.
    const getStep = () => {
        const card = track.firstElementChild;
        if (!card) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.getBoundingClientRect().width + gap;
    };

    // Os controles só ficam disponíveis quando ainda existe conteúdo fora da área visível; quando chegamos a uma extremidade, o respectivo botão é retirado da navegação.
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

// A mesma lógica atende aos dois conjuntos de cartões, evitando manter dois carrosséis com comportamentos diferentes.
setupCarousel('#speakers-track');
setupCarousel('#workshops-track');

/*
 * INTERAÇÃO DAS OFICINAS
 * O CSS já define a expansão do cartão por hover e foco; aqui tratamos principalmente os dispositivos que não trabalham com hover.
 * Nesses casos, clique, Enter e Espaço alternam a classe is-expanded para revelar o mesmo conteúdo. A verificação de hover evita
 * que o clique crie um segundo comportamento em dispositivos onde a expansão já é conduzida pelo mouse.
 */
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

const workshopCards = document.querySelectorAll('.workshop-card');


/*
 * AJUSTE DE LARGURA DAS OFICINAS
 * No desktop, calculamos uma largura mínima a partir do título e reservamos espaço para o restante do cartão. Isso é importante
 * porque alguns nomes de oficinas podem ser maiores e não queremos que o bloco esquerdo corte palavras ou fique estreito demais.
 * No mobile, retiramos essa restrição e deixamos o cartão ocupar a largura disponível.
 */
function updateWorkshopWidths() {
    const desktop = window.matchMedia('(min-width: 761px)').matches;

    workshopCards.forEach((card) => {
        if (!desktop) {
            card.style.removeProperty('--workshop-min-width');
            return;
        }

        const title = card.querySelector('.workshop-title');
        if (!title) return;

        const rightColumnMinimum = 260;
        const titleWidth = Math.max(title.getBoundingClientRect().width, title.scrollWidth);
        card.style.setProperty('--workshop-min-width', `${Math.ceil(titleWidth + rightColumnMinimum)}px`);
    });
}

window.addEventListener('resize', updateWorkshopWidths);
if ('ResizeObserver' in window) {
    const workshopObserver = new ResizeObserver(updateWorkshopWidths);
    workshopCards.forEach((card) => workshopObserver.observe(card));
}
updateWorkshopWidths();


/*
 * INTEGRAÇÃO COM O GOOGLE MAPS
 * O mapa é criado aqui a partir da chave da API e do endereço definidos na página.
 * Codificamos o endereço antes de inseri-lo na URL para garantir que caracteres
 * especiais sejam interpretados corretamente pelo serviço do Google Maps.
 *
 * Como a chave precisa ser enviada ao navegador para carregar o mapa, ela não é
 * tratada como informação privada. O controle adequado é restringir seu uso no
 * Google Cloud ao serviço e aos domínios utilizados pelo projeto.
 */
const mapContainer = document.querySelector('.map-container');

function initMap() {
    if (!mapContainer) return;
    const key = mapContainer.dataset.mapsApiKey?.trim();
    if (!key || key === 'AIzaSyAQ5Dyg3bQ7kBmbrmXxuxat-cfyhdO4t1M') return;

    // Codificamos o endereço antes de incorporá-lo à URL para que espaços e caracteres especiais não quebrem a consulta do mapa.
    const query = encodeURIComponent('Rua Gonçalves Chaves, 373, Pelotas, RS, Brasil');
    const iframe = document.createElement('iframe');
    iframe.title = 'Mapa da Universidade Católica de Pelotas';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${query}`;

    // Só colocamos o iframe na página depois de montar sua configuração, evitando deixar um mapa parcialmente configurado no container.
    mapContainer.replaceChildren(iframe);
}

initMap();