/* ═══════════════════════════════════════════
   OLI Mobile Valet — Interactions v2
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Register GSAP plugins first ── */
  gsap.registerPlugin(ScrollTrigger);

  /* ────────────────────────────────────────
     LENIS smooth scroll
     Single integration path: gsap.ticker only
     ──────────────────────────────────────── */
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    lenis.on('scroll', () => ScrollTrigger.update());
  }

  /* ────────────────────────────────────────
     HEADER — glass transition on scroll
     ──────────────────────────────────────── */
  const header = document.getElementById('header');

  ScrollTrigger.create({
    start: 80,
    onEnter:     () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled'),
  });

  /* ────────────────────────────────────────
     MOBILE NAV overlay
     ──────────────────────────────────────── */
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

  /* Escape key closes nav */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeNav();
  });

  /* ────────────────────────────────────────
     HERO — entrance sequence
     Runs immediately (script is at body end,
     DOM is ready). Images may still be loading
     but layout is established.
     ──────────────────────────────────────── */
  function initHeroEntrance() {
    if (prefersReducedMotion) {
      /* Make everything visible immediately */
      gsap.set([
        '.hero-eyebrow', '.hero-line', '.hero-body',
        '.hero-cta', '.hero-avail', '.hero-visual', '.hero-scroll'
      ], { clearProps: 'all' });
      return;
    }

    /* Set initial hidden states */
    gsap.set('.hero-eyebrow',  { opacity: 0, y: 18 });
    gsap.set('.hero-line',     { y: '108%' });
    gsap.set('.hero-body',     { opacity: 0, y: 22 });
    gsap.set('.hero-cta',      { opacity: 0, y: 18 });
    gsap.set('.hero-avail',    { opacity: 0, y: 12 });
    gsap.set('.hero-visual',   { opacity: 0, scale: 1.05 });
    gsap.set('#baDivider',     { scaleY: 0, transformOrigin: 'top center' });
    gsap.set('.hero-scroll',   { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay: 0.12,
    });

    tl
      /* Header fades down */
      .from('#header', { opacity: 0, y: -16, duration: 0.7, ease: 'power2.out' }, 0)

      /* Eyebrow */
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.9 }, 0.28)

      /* Headline lines — slow stagger, cinematic */
      .to('.hero-line', {
        y: '0%',
        duration: 1.15,
        stagger: 0.13,
        ease: 'power4.out',
      }, 0.44)

      /* Body copy */
      .to('.hero-body', { opacity: 1, y: 0, duration: 0.85 }, 0.72)

      /* Car image */
      .to('.hero-visual', {
        opacity: 1, scale: 1,
        duration: 1.2,
        ease: 'power2.out',
      }, 0.52)

      /* BA divider draws from top */
      .to('#baDivider', { scaleY: 1, duration: 1.1, ease: 'power2.inOut' }, 0.88)

      /* CTA */
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.75 }, 1.0)

      /* Availability row */
      .to('.hero-avail', { opacity: 1, y: 0, duration: 0.65 }, 1.2)

      /* Scroll indicator */
      .to('.hero-scroll', { opacity: 1, duration: 0.6 }, 1.5);
  }

  /* DOMContentLoaded is likely already fired by the time
     this script executes (placed at body end), so call directly */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroEntrance);
  } else {
    initHeroEntrance();
  }

  /* ────────────────────────────────────────
     BEFORE / AFTER SLIDER
     ──────────────────────────────────────── */
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
      clean.style.clipPath   = `inset(0 ${right.toFixed(2)}% 0 0)`;
      divider.style.left     = pct.toFixed(2) + '%';
    }

    function onMove(clientX) {
      if (!active) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => applySlider(clientX));
    }

    /* Mouse */
    slider.addEventListener('mousedown',  e => { active = true; applySlider(e.clientX); });
    window.addEventListener('mousemove',  e => onMove(e.clientX));
    window.addEventListener('mouseup',    ()  => { active = false; });

    /* Touch */
    slider.addEventListener('touchstart', e => {
      active = true;
      applySlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      onMove(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend',  ()  => { active = false; });
  })();

  /* ────────────────────────────────────────
     HERO — mouse parallax on car + reflection
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const heroVisual = document.getElementById('heroVisual');
    const heroRefl   = document.querySelector('.hero-reflection');

    /* Only run on desktop — skip touch devices */
    if (window.matchMedia('(hover: hover)').matches) {
      let ticking = false;
      window.addEventListener('mousemove', e => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const dx = (e.clientX / window.innerWidth  - 0.5);
          const dy = (e.clientY / window.innerHeight - 0.5);
          gsap.to(heroVisual, { x: dx * 14, y: dy * 8,  duration: 1.6, ease: 'power1.out' });
          if (heroRefl) gsap.to(heroRefl, { x: dx * 28, y: dy * 16, duration: 2.0, ease: 'power1.out' });
          ticking = false;
        });
      });
    }
  }

  /* ────────────────────────────────────────
     HERO — scroll parallax (scrub)
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    /* Only on desktop to avoid mobile jank */
    if (window.innerWidth > 768) {
      gsap.to('#heroVisual', {
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
        y: -70, ease: 'none',
      });
      gsap.to('.hero-text', {
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
        opacity: 0.25, y: -36, ease: 'none',
      });
    }
  }

  /* ────────────────────────────────────────
     TRUST BAR — card + count-up
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const trustBar = document.querySelector('.trust-bar');
    if (trustBar) {
      gsap.from(trustBar, {
        scrollTrigger: { trigger: trustBar, start: 'top 90%', once: true },
        opacity: 0, y: 44,
        duration: 1.1,
        ease: 'power3.out',
      });
      gsap.from('.trust-item', {
        scrollTrigger: { trigger: trustBar, start: 'top 86%', once: true },
        opacity: 0, y: 24,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power2.out',
        delay: 0.15,
      });

      /* Count-up numbers */
      document.querySelectorAll('.trust-number').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter() {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 2.0,
              ease: 'power2.out',
              onUpdate() { el.textContent = Math.round(obj.val).toLocaleString(); },
            });
          },
        });
      });
    }
  } else {
    /* No-animation fallback: show final numbers */
    document.querySelectorAll('.trust-number').forEach(el => {
      el.textContent = parseInt(el.dataset.target, 10).toLocaleString();
    });
  }

  /* ────────────────────────────────────────
     SERVICES — stagger reveal
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    gsap.from('.services-left .eyebrow, .services-left .section-heading, .services-left .section-body, .services-left .link-arrow', {
      scrollTrigger: { trigger: '.services', start: 'top 78%', once: true },
      opacity: 0, y: 30,
      stagger: 0.11,
      duration: 1.0,
      ease: 'power3.out',
    });

    gsap.from('.service-col', {
      scrollTrigger: { trigger: '.services-right', start: 'top 80%', once: true },
      opacity: 0, y: 32,
      stagger: { amount: 0.5, from: 'start' },
      duration: 0.85,
      ease: 'power2.out',
    });
  }

  /* ────────────────────────────────────────
     SECTION HEADINGS — clip-path reveal
     Applied to all section-headings not in hero
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.section-heading:not(.hero *), .cta-heading').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        opacity: 0, y: 32,
        duration: 1.0,
        ease: 'power3.out',
      });
    });
  }

  /* ────────────────────────────────────────
     TRANSFORMATION — dark cinematic reveal
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const tf = document.querySelector('.transformation');
    if (tf) {
      /* Text stagger */
      gsap.from('.transform-text .eyebrow, .transform-text .section-heading, .transform-text .section-body, .transform-text .link-arrow', {
        scrollTrigger: { trigger: tf, start: 'top 72%', once: true },
        opacity: 0, y: 28,
        stagger: 0.13,
        duration: 1.0,
        ease: 'power3.out',
      });

      /* Car: slides in + scale */
      gsap.from('#transformCar', {
        scrollTrigger: { trigger: tf, start: 'top 72%', once: true },
        opacity: 0, x: 64, scale: 0.97,
        duration: 1.3,
        ease: 'power3.out',
        delay: 0.1,
      });

      /* Orbit ring fades in */
      gsap.to('.orbit-ring', {
        scrollTrigger: { trigger: tf, start: 'top 68%', once: true },
        opacity: 1,
        duration: 1.6,
        ease: 'power2.out',
        delay: 0.5,
      });

      /* Hotspots — single fromTo avoids conflicting calls */
      document.querySelectorAll('.hotspot').forEach((el, i) => {
        const dir = el.classList.contains('hotspot-left') ? -18 : 18;
        gsap.fromTo(el,
          { opacity: 0, x: dir },
          {
            scrollTrigger: { trigger: tf, start: 'top 65%', once: true },
            opacity: 1, x: 0,
            duration: 0.75,
            ease: 'power2.out',
            delay: 0.9 + i * 0.22,
          }
        );
      });

      /* Hotspot connector lines grow */
      document.querySelectorAll('.hotspot-line').forEach((line, i) => {
        gsap.from(line, {
          scrollTrigger: { trigger: tf, start: 'top 65%', once: true },
          scaleX: 0,
          duration: 0.55,
          ease: 'power2.out',
          delay: 1.0 + i * 0.22,
        });
      });

      /* Scroll-driven car drift */
      gsap.to('#transformCar', {
        scrollTrigger: {
          trigger: tf,
          start: 'top bottom', end: 'bottom top',
          scrub: 1.8,
        },
        x: -36, ease: 'none',
      });
    }
  } else {
    document.querySelectorAll('.hotspot').forEach(el => { el.style.opacity = '1'; });
    const ring = document.querySelector('.orbit-ring');
    if (ring) ring.style.opacity = '0.4';
  }

  /* ────────────────────────────────────────
     DETAIL CARDS — clip-path wipe reveal
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    /* Set initial hidden state in JS (not CSS) so images show without JS */
    document.querySelectorAll('.detail-card-img-wrap').forEach((wrap, i) => {
      gsap.set(wrap, { clipPath: 'inset(100% 0 0 0)' });
      gsap.to(wrap, {
        scrollTrigger: { trigger: wrap, start: 'top 84%', once: true },
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.15,
        ease: 'power3.out',
        delay: i * 0.18,
      });
    });
    gsap.from('.detail-card-body', {
      scrollTrigger: { trigger: '.detail-cards', start: 'top 80%', once: true },
      opacity: 0, y: 22,
      stagger: 0.16,
      duration: 0.85,
      ease: 'power2.out',
      delay: 0.25,
    });
  }

  /* ────────────────────────────────────────
     WHY / CTA — stagger + panel slide
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    /* Left column text */
    gsap.from('.why-left .eyebrow, .why-left .section-heading', {
      scrollTrigger: { trigger: '.why-cta', start: 'top 78%', once: true },
      opacity: 0, y: 28,
      stagger: 0.12,
      duration: 0.9,
      ease: 'power3.out',
    });

    /* Benefit items */
    gsap.to('.benefit-item', {
      scrollTrigger: { trigger: '.benefits-list', start: 'top 82%', once: true },
      opacity: 1, y: 0,
      stagger: 0.14,
      duration: 0.85,
      ease: 'power2.out',
    });

    /* CTA panel */
    const ctaPanel = document.querySelector('.cta-panel');
    if (ctaPanel) {
      gsap.to(ctaPanel, {
        scrollTrigger: { trigger: ctaPanel, start: 'top 82%', once: true },
        opacity: 1, y: 0,
        duration: 1.05,
        ease: 'power3.out',
      });
      gsap.to('.cta-reassure', {
        scrollTrigger: { trigger: ctaPanel, start: 'top 75%', once: true },
        opacity: 1,
        duration: 0.85,
        delay: 0.55,
        ease: 'power2.out',
      });
    }
  } else {
    /* Reduced-motion: show everything immediately */
    document.querySelectorAll('.benefit-item').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const cp = document.querySelector('.cta-panel');
    const cr = document.querySelector('.cta-reassure');
    if (cp) { cp.style.opacity = '1'; cp.style.transform = 'none'; }
    if (cr) cr.style.opacity = '1';
  }

  /* ────────────────────────────────────────
     MAGNETIC BUTTON
     ──────────────────────────────────────── */
  (function () {
    const btn = document.getElementById('magneticBtn');
    if (!btn || prefersReducedMotion) return;
    if (!window.matchMedia('(hover: hover)').matches) return; /* Skip on touch */

    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.32;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.32;
      gsap.to(btn, { x: dx, y: dy, duration: 0.38, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    });
  })();

  /* ────────────────────────────────────────
     EYEBROW elements generic fade-up
     (eyebrows not already inside animated wrappers)
     ──────────────────────────────────────── */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.detail-cards .eyebrow').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        opacity: 0, y: 16,
        duration: 0.75,
        ease: 'power2.out',
      });
    });
  }

})();
