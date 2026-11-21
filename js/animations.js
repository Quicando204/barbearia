/* ==========================================================================
   Navalha Real · animações
   GSAP + ScrollTrigger + Lenis (scroll suave). Se as bibliotecas não carregarem
   ou o visitante preferir menos movimento, o site fica completo e estático.
   ========================================================================== */
(() => {
  'use strict';

  const Site = window.Site || (window.Site = {});
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined' || Site.reduceMotion) return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  Site.animated = true;

  const header = $('.site-header');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Plano B: se algo falhar, deixa tudo visível e normal */
  const fallback = (err) => {
    if (err) console.error('[animations]', err);
    try {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.globalTimeline.clear();
      gsap.set(
        '[data-reveal], [data-clip], [data-clip] img, .hero__line > span, .hero__lead, .hero__cta > *, .ticker, .ticker__track, .site-header, .hero__bg img, .w__i, #progress',
        { clearProps: 'all' }
      );
      if (Site.lenis) { Site.lenis.destroy(); Site.lenis = null; }
    } catch (e) { /* nada a fazer */ }
    Site.animated = false;
    Site.hidePreloader();
  };

  try { init(); } catch (err) { fallback(err); }

  function init() {
    /* ---------- Lenis: scroll suave ---------- */
    if (typeof window.Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      Site.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop(); // só arranca depois da abertura
    }

    /* ---------- Estados iniciais da abertura ---------- */
    const lines = $$('.hero__line > span');
    const heroTexts = $$('.hero__lead, .hero__cta > *');
    gsap.set(lines, { yPercent: 115 });
    gsap.set(heroTexts, { autoAlpha: 0, y: 26 });
    gsap.set('.ticker', { yPercent: 100 });
    gsap.set(header, { yPercent: -100 });
    gsap.set('.hero__bg img', { scale: 1.25 });

    const playIntro = () => {
      if (Site.lenis) Site.lenis.start();
      gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: () => ScrollTrigger.refresh() })
        .to('.hero__bg img', { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
        .to(header, { yPercent: 0, duration: 1 }, 0.25)
        .to(lines, { yPercent: 0, duration: 1.15, stagger: 0.14 }, 0.1)
        .to(heroTexts, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.65)
        .to('.ticker', { yPercent: 0, duration: 0.9 }, 0.75);
    };

    /* ---------- Pré-carregamento ---------- */
    const pre = $('#preloader');
    if (!pre || pre.classList.contains('is-gone')) {
      playIntro();
    } else {
      const fill = $('#pre-fill');
      const pct = $('#pct');
      const counter = { v: 0 };
      const exit = () => {
        gsap.timeline({ onComplete: Site.hidePreloader })
          .to('.preloader__box', { autoAlpha: 0, y: -24, duration: 0.45, ease: 'power2.in' })
          .to(pre, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '>-0.05')
          .add(playIntro, '-=0.5');
      };
      gsap.timeline({ onComplete: exit })
        .to(counter, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { pct.textContent = Math.round(counter.v) + '%'; } }, 0)
        .to(fill, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0);
    }

    /* ---------- Hero: parallax e saída ---------- */
    gsap.to('.hero__bg img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__in', {
      yPercent: -10, opacity: 0.1, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '25% top', end: 'bottom top', scrub: true },
    });

    /* ---------- Faixa em movimento (acelera com o scroll) ---------- */
    const track = $('#ticker');
    if (track) {
      const loop = gsap.to(track, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (self) => {
          loop.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 350, 6));
          gsap.to(loop, { timeScale: 1, duration: 0.9, overwrite: true });
        },
      });
    }

    /* ---------- Barra de progresso (risca do poste) ---------- */
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

    /* ---------- Cabeçalho: esconde a descer, mostra a subir ---------- */
    let headerHidden = false;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        if (Site.menuOpen) return;
        const y = self.scroll();
        const hide = y > 240 && self.direction === 1;
        const show = self.direction === -1 || y <= 240;
        if (hide && !headerHidden) { headerHidden = true; gsap.to(header, { yPercent: -100, duration: 0.45, ease: 'power3.out', overwrite: 'auto' }); }
        else if (show && headerHidden) { headerHidden = false; gsap.to(header, { yPercent: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' }); }
      },
    });

    /* ---------- Menu: secção atual ---------- */
    $$('main section[id]').forEach((sec) => {
      const link = $(`.nav__list a[href="#${sec.id}"]`);
      if (!link) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => link.classList.toggle('is-current', self.isActive),
      });
    });

    /* ---------- Títulos: palavra a palavra, em máscara ---------- */
    $$('[data-split]').forEach((el) => {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      el.textContent = '';
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = text;
      el.append(sr);
      const words = text.split(' ').map((word, i, all) => {
        const outer = document.createElement('span');
        const inner = document.createElement('span');
        outer.className = 'w';
        outer.setAttribute('aria-hidden', 'true');
        inner.className = 'w__i';
        inner.textContent = word;
        outer.append(inner);
        el.append(outer);
        if (i < all.length - 1) el.append(document.createTextNode(' '));
        return inner;
      });
      gsap.set(words, { yPercent: 120 });
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(words, { yPercent: 0, duration: 1, stagger: 0.06, ease: 'power4.out' }),
      });
    });

    /* ---------- Entradas em grupo ---------- */
    const reveals = $$('[data-reveal]');
    reveals.forEach((el) => {
      const fromRight = el.dataset.reveal === 'right';
      gsap.set(el, { autoAlpha: 0, x: fromRight ? 60 : 0, y: fromRight ? 0 : 34 });
    });
    ScrollTrigger.batch(reveals, {
      start: 'top 90%', once: true, batchMax: 6,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, x: 0, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.11, overwrite: true }),
    });

    /* ---------- Fotos: cortina + zoom ---------- */
    $$('[data-clip]').forEach((el) => {
      const img = $('img', el);
      gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
      if (img) gsap.set(img, { scale: 1.25 });
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => {
          gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.inOut', onComplete: () => gsap.set(el, { clearProps: 'clipPath' }) });
          if (img) {
            gsap.to(img, {
              scale: 1, duration: 1.7, ease: 'power3.out',
              onComplete: () => { if (!img.hasAttribute('data-parallax')) gsap.set(img, { clearProps: 'transform' }); },
            });
          }
        },
      });
    });

    /* ---------- Parallax em fotos largas ---------- */
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* ---------- Números ---------- */
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.value) || Number(el.textContent) || 0;
      const o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(o, { v: end, duration: 1.5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }),
      });
    });

    /* ---------- Abas dos serviços ---------- */
    document.addEventListener('tabs:change', (e) => {
      const panel = e.detail.panel;
      if (!panel) return;
      const media = $('.svc__img', panel);
      const img = $('.svc__img img', panel);
      const body = $$('.svc__body > *', panel);
      gsap.fromTo(media, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power4.inOut', clearProps: 'clipPath' });
      gsap.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 1.3, ease: 'power3.out', clearProps: 'transform' });
      gsap.fromTo(body, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
    });

    /* ---------- Simulador ---------- */
    let totalTween = null;
    document.addEventListener('builder:total', (e) => {
      const { from, to, el } = e.detail;
      const o = { v: from };
      if (totalTween) totalTween.kill();
      totalTween = gsap.to(o, {
        v: to, duration: 0.7, ease: 'power2.out',
        onUpdate: () => { el.textContent = Site.money(o.v); },
        onComplete: () => { el.textContent = Site.money(to); },
      });
      gsap.fromTo(el, { scale: 1.1 }, { scale: 1, duration: 0.5, ease: 'back.out(2)', transformOrigin: 'right center', clearProps: 'transform' });
    });
    document.addEventListener('builder:lines', (e) => {
      gsap.from(e.detail.list.children, { autoAlpha: 0, x: -16, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' });
    });

    /* ---------- Galeria ampliada ---------- */
    document.addEventListener('lightbox:show', (e) => {
      gsap.fromTo(e.detail.img, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'power3.out' });
    });

    /* ---------- Botões com atração do rato ---------- */
    if (finePointer) {
      $$('[data-magnetic]').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        btn.addEventListener('pointermove', (e) => {
          const r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
        });
        btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
      });
    }

    /* ---------- Recalcular quando fontes e fotos assentam ---------- */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
