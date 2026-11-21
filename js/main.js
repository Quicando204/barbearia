/* ==========================================================================
   Navalha Real · núcleo do site
   Tudo aqui funciona sem GSAP: abas, simulador, formulário, galeria e menu.
   As animações ficam em animations.js e entram por cima.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Configuração (mudem aqui) ---------- */
  const SHOP = {
    name: 'Navalha Real',
    whatsapp: '', // número com indicativo e sem +, ex.: '244923000000'. Vazio abre o WhatsApp sem contacto.
  };
  // Quando as fotos estiverem na pasta img/ (hero.jpg, razor.jpg, g1.jpg...), mudem para true.
  const USE_LOCAL_IMAGES = false;

  /* ---------- Utilitários ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waUrl = (text) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
  const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Kz';
  const plain = (s) => s.replace(/ /g, ' ');

  // Ponte com animations.js
  const Site = (window.Site = window.Site || {});
  Site.config = SHOP;
  Site.money = money;
  Site.reduceMotion = reduceMotion;
  Site.animated = false;
  Site.emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  Site.lock = () => Site.lenis && Site.lenis.stop();
  Site.unlock = () => Site.lenis && Site.lenis.start();

  /* ---------- Pré-carregamento (animations.js conduz; isto é o plano B) ---------- */
  const preloader = $('#preloader');
  Site.hidePreloader = () => {
    if (!preloader || preloader.classList.contains('is-gone')) return;
    preloader.classList.add('is-gone');
    document.documentElement.classList.add('is-ready');
    Site.emit('site:ready');
  };
  if (reduceMotion) Site.hidePreloader();
  window.addEventListener('load', () => { if (!Site.animated) Site.hidePreloader(); });
  setTimeout(Site.hidePreloader, 7000);

  /* ---------- Links do WhatsApp ---------- */
  $$('[data-wa]').forEach((a) => { a.href = waUrl(a.dataset.wa); });

  /* ---------- Imagens ---------- */
  $$('img').forEach((img) => {
    if (USE_LOCAL_IMAGES && img.dataset.local) {
      img.removeAttribute('srcset');
      img.src = img.dataset.local;
    }
    img.addEventListener('error', () => img.classList.add('is-broken'));
  });
  window.addEventListener('load', () => {
    $$('img').forEach((img) => { if (img.complete && !img.naturalWidth) img.classList.add('is-broken'); });
  });

  /* ---------- Cabeçalho e menu ---------- */
  const header = $('.site-header');
  const burger = $('#burger');
  const menu = $('#menu');
  const mq = window.matchMedia('(min-width: 900px)');

  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.querySelector('.sr-only').textContent = open ? 'Fechar o menu' : 'Abrir o menu';
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    open ? Site.lock() : Site.unlock();
    Site.menuOpen = open;
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && Site.menuOpen) { setMenu(false); burger.focus(); } });
  mq.addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Âncoras (com Lenis, se existir) ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = $(a.getAttribute('href'));
    if (!target) return;
    if (Site.lenis) {
      e.preventDefault();
      Site.lenis.scrollTo(target, { offset: -(header.offsetHeight + 8), duration: 1.4 });
      history.replaceState(null, '', a.getAttribute('href'));
    }
  });

  /* ---------- Serviços (abas) ---------- */
  const tabs = $$('[role="tab"]');
  const panels = $$('[role="tabpanel"]');
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    let shown = null;
    panels.forEach((p) => {
      const on = p.id === tab.getAttribute('aria-controls');
      p.hidden = !on;
      if (on) shown = p;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    Site.emit('tabs:change', { panel: shown });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- Números da casa (contados a partir do próprio site) ---------- */
  const counts = {
    services: tabs.length,
    styles: $$('input[name="style"]').length,
    extras: $$('input[name="extra"]').length,
  };
  $$('[data-count]').forEach((el) => {
    const n = counts[el.dataset.count];
    if (n) { el.dataset.value = n; el.textContent = n; }
  });

  /* ---------- Simulador ---------- */
  const builder = $('#builder');
  if (builder) {
    const sum = $('#sum');
    const totalEl = $('#total');
    const nameEl = $('#pv-name');
    const buildWa = $('#build-wa');
    const previews = $$('.preview__img');
    let lastTotal = null;

    const render = () => {
      const style = builder.querySelector('input[name="style"]:checked');
      const beard = builder.querySelector('input[name="beard"]:checked');
      const extras = $$('input[name="extra"]:checked', builder);
      const lines = [[style.dataset.label, +style.dataset.price]];
      if (+beard.dataset.price > 0) lines.push([beard.dataset.label, +beard.dataset.price]);
      extras.forEach((x) => lines.push([x.dataset.label, +x.dataset.price]));
      const total = lines.reduce((acc, l) => acc + l[1], 0);

      nameEl.textContent = style.dataset.label;
      previews.forEach((img) => img.classList.toggle('is-active', img.dataset.style === style.value));

      sum.textContent = '';
      lines.forEach(([label, price]) => {
        const li = document.createElement('li');
        const a = document.createElement('span');
        const b = document.createElement('span');
        a.textContent = label;
        b.textContent = money(price);
        li.append(a, b);
        sum.append(li);
      });

      if (Site.animated && lastTotal !== null) {
        Site.emit('builder:total', { from: lastTotal, to: total, el: totalEl });
      } else {
        totalEl.textContent = money(total);
      }
      lastTotal = total;
      Site.emit('builder:lines', { list: sum });

      const msg = [
        `Olá, ${SHOP.name}! Quero montar o meu corte:`,
        `- Estilo: ${style.dataset.label}`,
        `- Barba: ${beard.dataset.label}`,
        `- Extras: ${extras.length ? extras.map((x) => x.dataset.label).join(', ') : 'nenhum'}`,
        `Total estimado: ${plain(money(total))}`,
        'Que horários têm?',
      ].join('\n');
      buildWa.href = waUrl(msg);
    };
    builder.addEventListener('change', render);
    builder.addEventListener('submit', (e) => e.preventDefault());
    render();
  }

  /* ---------- Marcar horário ---------- */
  const booking = $('#booking');
  if (booking) {
    const status = $('#form-status');
    const dateInput = $('#b-date');
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    dateInput.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const fields = ['name', 'service', 'date', 'time'].map((k) => {
      const input = booking.elements[k];
      return { input, box: input.closest('.field'), error: $('#e-' + k) };
    });
    const check = (f) => {
      const ok = f.input.value.trim() !== '' && f.input.validity.valid;
      f.box.classList.toggle('is-invalid', !ok);
      f.error.hidden = ok;
      f.input.setAttribute('aria-invalid', String(!ok));
      return ok;
    };
    fields.forEach((f) => f.input.addEventListener('change', () => check(f)));

    booking.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = fields.map(check);
      if (results.includes(false)) {
        status.textContent = 'Faltam alguns dados. Confirmem os campos assinalados.';
        fields[results.indexOf(false)].input.focus();
        return;
      }
      const [yyyy, mm, dd] = booking.elements.date.value.split('-');
      const notes = booking.elements.notes.value.trim();
      const text =
        `Olá, ${SHOP.name}! Queria marcar: ${booking.elements.service.value}, ` +
        `no dia ${dd}/${mm}/${yyyy} às ${booking.elements.time.value}. ` +
        `Nome: ${booking.elements.name.value.trim()}.` + (notes ? ` Notas: ${notes}` : '');
      status.textContent = 'A abrir o WhatsApp…';
      window.open(waUrl(text), '_blank', 'noopener');
    });
  }

  /* ---------- Galeria ---------- */
  const lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const items = $$('.gal__btn');
    const lbImg = $('#lb-img');
    const lbCap = $('#lb-cap');
    let current = 0;

    const show = (i) => {
      current = (i + items.length) % items.length;
      const btn = items[current];
      const img = btn.querySelector('img');
      lbImg.src = USE_LOCAL_IMAGES ? img.dataset.local : (img.dataset.full || img.currentSrc || img.src);
      lbImg.alt = btn.getAttribute('aria-label').replace(/^Ampliar foto:\s*/, '');
      lbCap.textContent = lbImg.alt;
      Site.emit('lightbox:show', { img: lbImg });
    };
    items.forEach((btn, i) => btn.addEventListener('click', () => {
      show(i);
      lb.showModal();
      Site.lock();
    }));
    $('#lb-close').addEventListener('click', () => lb.close());
    $('#lb-prev').addEventListener('click', () => show(current - 1));
    $('#lb-next').addEventListener('click', () => show(current + 1));
    lb.addEventListener('close', () => Site.unlock());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Ano ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
