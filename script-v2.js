/* ═══════════════════════════════════════════
   OLI Mobile Valet — v2 Interactions
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis smooth scroll ── */
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', () => ScrollTrigger.update());
  }

  /* ── Header on scroll ── */
  const header = document.getElementById('header');
  ScrollTrigger.create({
    start: 80,
    onEnter:     () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled'),
  });

  /* ── Mobile nav ── */
  const menuBtn    = document.getElementById('menuBtn');
  const navOverlay = document.getElementById('navOverlay');
  const navClose   = document.getElementById('navClose');

  function openNav() {
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  menuBtn.addEventListener('click', openNav);
  navClose.addEventListener('click', closeNav);
  navOverlay.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeNav();
  });

  /* ── Hero entrance ── */
  function initHeroEntrance() {
    if (prefersReducedMotion) {
      gsap.set(['.hero-eyebrow', '.hero-word', '.hero-body', '.hero-cta', '.hero-avail', '.hero-visual', '.hero-stats-bar'], { clearProps: 'all' });
      return;
    }

    gsap.set('#header', { opacity: 0, y: -14 });
    gsap.set('.hero-eyebrow', { opacity: 0, y: 14 });
    gsap.set('.hero-word', { y: '110%' });
    gsap.set('.hero-body', { opacity: 0, y: 18 });
    gsap.set('.hero-cta', { opacity: 0, y: 14 });
    gsap.set('.hero-avail', { opacity: 0 });
    gsap.set('.hero-visual', { opacity: 0, x: 32 });
    gsap.set('#baDivider', { scaleY: 0, transformOrigin: 'top center' });
    gsap.set('.hero-stats-bar', { opacity: 0, y: 16 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

    tl
      .to('#header', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0)
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0.3)
      .to('.hero-word', { y: '0%', duration: 1.05, stagger: 0.1, ease: 'power4.out' }, 0.45)
      .to('.hero-body', { opacity: 1, y: 0, duration: 0.75 }, 0.7)
      .to('.hero-visual', { opacity: 1, x: 0, duration: 1.1, ease: 'power2.out' }, 0.55)
      .to('#baDivider', { scaleY: 1, duration: 1.0, ease: 'power2.inOut' }, 0.9)
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.65 }, 0.95)
      .to('.hero-avail', { opacity: 1, duration: 0.6 }, 1.15)
      .to('.hero-stats-bar', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroEntrance);
  } else {
    initHeroEntrance();
  }

  /* ── Before / After slider ── */
  (function () {
    const slider  = document.getElementById('baSlider');
    const clean   = document.getElementById('baClean');
    const divider = document.getElementById('baDivider');
    if (!slider) return;

    let pct = 52;
    let active = false;
    let rafId;

    function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

    function applySlider(clientX) {
      const rect = slider.getBoundingClientRect();
      pct = clamp(((clientX - rect.left) / rect.width) * 100, 3, 97);
      const right = 100 - pct;
      clean.style.clipPath = `inset(0 ${right.toFixed(2)}% 0 0)`;
      divider.style.left   = pct.toFixed(2) + '%';
    }

    function onMove(clientX) {
      if (!active) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => applySlider(clientX));
    }

    slider.addEventListener('mousedown',  e => { active = true; applySlider(e.clientX); });
    window.addEventListener('mousemove',  e => onMove(e.clientX));
    window.addEventListener('mouseup',    () => { active = false; });

    slider.addEventListener('touchstart', e => {
      active = true; applySlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend',  () => { active = false; });
  })();

  /* ── Hero mouse parallax ── */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    const heroVisual = document.getElementById('heroVisual');
    let ticking = false;
    window.addEventListener('mousemove', e => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const dx = (e.clientX / window.innerWidth  - 0.5);
        const dy = (e.clientY / window.innerHeight - 0.5);
        gsap.to(heroVisual, { x: dx * 16, y: dy * 10, duration: 1.6, ease: 'power1.out' });
        ticking = false;
      });
    });
  }

  /* ── Hero scroll parallax ── */
  if (!prefersReducedMotion && window.innerWidth > 768) {
    gsap.to('.hero-bg-img', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 },
      y: -80, ease: 'none',
    });
    gsap.to('.hero-text', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      opacity: 0.2, y: -40, ease: 'none',
    });
  }

  /* ── Stats counter (hero) ── */
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (prefersReducedMotion) { el.textContent = target.toLocaleString(); return; }
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter() {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(obj.val).toLocaleString(); },
        });
      },
    });
  });

  /* ── Services — staggered row reveal ── */
  if (!prefersReducedMotion) {
    gsap.from('.services-header > *', {
      scrollTrigger: { trigger: '.services', start: 'top 78%', once: true },
      opacity: 0, y: 28, stagger: 0.1, duration: 0.9, ease: 'power3.out',
    });
    gsap.from('.service-row', {
      scrollTrigger: { trigger: '.services-grid', start: 'top 82%', once: true },
      opacity: 0, y: 32,
      stagger: 0.1,
      duration: 0.85,
      ease: 'power2.out',
    });
  }

  /* ── Transformation — cinematic reveal ── */
  if (!prefersReducedMotion) {
    const tf = document.querySelector('.transformation');
    if (tf) {
      gsap.from('.transform-content > *', {
        scrollTrigger: { trigger: tf, start: 'top 72%', once: true },
        opacity: 0, y: 28, stagger: 0.12, duration: 1.0, ease: 'power3.out',
      });
      gsap.from('#transformCar', {
        scrollTrigger: { trigger: tf, start: 'top 72%', once: true },
        scale: 1.06, duration: 1.4, ease: 'power2.out',
      });
      document.querySelectorAll('.hs').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: tf, start: 'top 65%', once: true },
          opacity: 0, x: el.classList.contains('hs-left') ? -20 : 20,
          duration: 0.7, ease: 'power2.out',
          delay: 0.7 + i * 0.2,
        });
      });
      gsap.to('#transformCar', {
        scrollTrigger: { trigger: tf, start: 'top bottom', end: 'bottom top', scrub: 1.8 },
        x: -40, ease: 'none',
      });
    }
  }

  /* ── Gallery — wipe reveal ── */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.gallery-img-wrap').forEach((wrap, i) => {
      gsap.set(wrap, { clipPath: 'inset(100% 0 0 0)' });
      gsap.to(wrap, {
        scrollTrigger: { trigger: wrap, start: 'top 84%', once: true },
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1, ease: 'power3.out', delay: i * 0.15,
      });
    });
    gsap.from('.gallery-caption', {
      scrollTrigger: { trigger: '.gallery', start: 'top 80%', once: true },
      opacity: 0, y: 20, stagger: 0.15, duration: 0.8, ease: 'power2.out', delay: 0.2,
    });
  }

  /* ── Why list — stagger reveal ── */
  if (!prefersReducedMotion) {
    gsap.from('.why-header > *', {
      scrollTrigger: { trigger: '.why', start: 'top 78%', once: true },
      opacity: 0, y: 28, stagger: 0.1, duration: 0.9, ease: 'power3.out',
    });
    gsap.from('.why-item', {
      scrollTrigger: { trigger: '.why-list', start: 'top 82%', once: true },
      opacity: 0, y: 28, stagger: 0.1, duration: 0.85, ease: 'power2.out',
    });
  }

  /* ── CTA section entrance ── */
  if (!prefersReducedMotion) {
    gsap.from('.cta-heading', {
      scrollTrigger: { trigger: '.cta-section', start: 'top 75%', once: true },
      opacity: 0, y: 44, duration: 1.0, ease: 'power3.out',
    });
    gsap.from('.cta-right > *', {
      scrollTrigger: { trigger: '.cta-section', start: 'top 72%', once: true },
      opacity: 0, y: 28, stagger: 0.12, duration: 0.85, ease: 'power2.out', delay: 0.2,
    });
  }

  /* ── Magnetic CTA button ── */
  (function () {
    const btn = document.getElementById('magneticBtn');
    if (!btn || prefersReducedMotion) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.3;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.3;
      gsap.to(btn, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.45)' });
    });
  })();

})();
