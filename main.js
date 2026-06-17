

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

function revealHeroFallback() {
  const ids = ['hero-subhead', 'hero-headline-1', 'hero-headline-2',
               'hero-tagline', 'hero-actions'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  });
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

function onLoad(fn) {
  if (document.readyState === 'complete') {
    fn();
  } else {
    window.addEventListener('load', fn, { once: true });
  }
}

onReady(() => {
  if (typeof gsap === 'undefined') {
    revealHeroFallback();
    return;
  }
  initLoader();
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader && loader.style.display !== 'none' &&
        getComputedStyle(loader).display !== 'none') {
      revealHeroFallback();
    }
  }, 4000);
});

onLoad(() => {
  if (typeof gsap === 'undefined') { revealHeroFallback(); return; }
  const safe = (label, fn) => { try { return fn(); } catch (err) { console.error('init failed:', label, err); } };
  const lenis = safe('smoothScroll', initSmoothScroll);
  safe('gsapAnimations', () => initGSAPAnimations(lenis));
  safe('customCursor', initCustomCursor);
  safe('magneticButtons', initMagneticButtons);
  safe('contactModal', initContactModal);
  safe('logoInversion', initLogoInversion);
});

function cameFromSameSite() {
  try {
    return !!document.referrer && new URL(document.referrer).host === location.host;
  } catch (e) {
    return false;
  }
}

function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  if (cameFromSameSite()) {
    loader.style.display = 'none';
    playHeroEntry();
    return;
  }

  const tagline = document.getElementById('loader-text');

  const logoImg = document.getElementById('loader-wordmark-img');

  const loaderTimeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      playHeroEntry();
      gsap.to('.loader-content', {
        scale: 1.05,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.inOut'
      });
      gsap.to(loader, {
        clipPath: 'circle(0% at 50% 46%)',
        duration: 1.1,
        ease: 'power3.inOut',
        onComplete: () => {
          loader.style.display = 'none';
        }
      });
    }
  });

  loaderTimeline
    .to(logoImg, {
      opacity: 1,
      duration: 0.55,
      ease: 'power1.inOut'
    })
    .to(tagline, {
      opacity: 1,
      y: 0,
      duration: 0.45
    }, '-=0.25')
    .to({}, { duration: 0.5 });
}

function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 0.9,
    smoothTouch: false,
    touchMultiplier: 2.0,
    infinite: false,
  });

  lenis.scrollTo(0, { immediate: true });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  const jumpTo = (target) => {
    if (target === '#hero' || target === '#top') {
      lenis.scrollTo(0, { immediate: true });
      return;
    }
    const el = document.querySelector(target);
    if (el) lenis.scrollTo(el, { immediate: true, offset: 0 });
  };

  document.querySelectorAll('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      jumpTo(el.getAttribute('data-scroll-to'));
    });
  });

  document.querySelectorAll('[data-scroll-smooth]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const node = document.querySelector(el.getAttribute('data-scroll-smooth'));
      if (node) lenis.scrollTo(node, { duration: 1.3 });
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#' ||
        link.hasAttribute('data-scroll-to') ||
        link.hasAttribute('data-scroll-smooth') ||
        link.hasAttribute('data-modal')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      jumpTo(href);
    });
  });

  const brandLogo = document.querySelector('.brand-nav-logo');
  if (brandLogo) {
    const goTop = () => lenis.scrollTo(0, { immediate: true });
    brandLogo.addEventListener('click', goTop);
    brandLogo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goTop();
      }
    });
  }

  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      lenis.scrollTo(0, { immediate: true });
    });
    lenis.on('scroll', (e) => {
      if (e.animatedScroll > window.innerHeight * 0.5) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    });
  }

  return lenis;
}

function playHeroEntry() {
  const heroTL = gsap.timeline({
    defaults: { ease: 'power3.out', duration: 0.65 }
  });

  heroTL
    .fromTo('#hero-bg-nest-center',
      { opacity: 0, scale: 0.82 },
      {
        opacity: 0.14,
        scale: 1,
        duration: 1.4,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to('#hero-bg-nest-center', {
            scale: 1.06,
            duration: 12,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 0.5
          });
        }
      }, 0)
    .fromTo('#hero-bg-nest-left',
      { xPercent: -60, rotation: -20, opacity: 0, scale: 0.9 },
      {
        xPercent: 0,
        rotation: -8,
        opacity: 0.52,
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to('#hero-bg-nest-left img', {
            y: -14,
            rotation: -3,
            duration: 7,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
          });
          gsap.to('#hero-bg-nest-left', {
            scale: 1.03,
            duration: 9,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 1
          });
        }
      }, 0)
    .fromTo('#hero-bg-nest-right',
      { xPercent: 60, rotation: 20, opacity: 0, scale: 0.9 },
      {
        xPercent: 0,
        rotation: 8,
        opacity: 0.52,
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to('#hero-bg-nest-right img', {
            y: 14,
            rotation: 3,
            duration: 8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
          });
          gsap.to('#hero-bg-nest-right', {
            scale: 1.03,
            duration: 10,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 2
          });
        }
      }, 0)
    .fromTo('#hero-bg-nest-bl',
      { xPercent: -55, yPercent: 30, rotation: 24, opacity: 0, scale: 0.9 },
      {
        xPercent: 0,
        yPercent: 0,
        rotation: 10,
        opacity: 0.72,
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to('#hero-bg-nest-bl img', {
            y: -16,
            rotation: 4,
            duration: 9,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
          });
          gsap.to('#hero-bg-nest-bl', {
            scale: 1.04,
            duration: 11,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 1.5
          });
        }
      }, 0)
    .fromTo('#hero-headline-1', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.1)
    .fromTo('#hero-headline-2', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.22)
    .fromTo('#hero-subhead', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.34)
    .fromTo('#hero-tagline', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.44)
    .fromTo('#hero-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.54)
    .fromTo('#hero-phone-img',
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 1.1, ease: 'expo.out',
        onComplete: () => {
          gsap.to('#hero-phone-img', {
            y: -12, duration: 5.5,
            ease: 'sine.inOut', yoyo: true, repeat: -1
          });
        }
      }, 0.3);

  gsap.to('#hero-orb-1', {
    xPercent: 12,
    yPercent: 8,
    duration: 16,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });

  gsap.to('#hero-orb-2', {
    xPercent: -12,
    yPercent: -8,
    duration: 20,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });
}

function initGSAPAnimations(lenis) {
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = window.innerWidth <= 768;

  if (!isMobile) {
    // One master timeline owns the pin AND every hero-exit animation, so they
    // all share the same 0 to bottom scroll range. Separate ScrollTriggers on a
    // pinned element get their start pushed past the pin and never fire on screen.
    const heroTL = gsap.timeline({
      defaults: { ease: 'none', overwrite: false },
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true
      }
    });

    // Timeline runs 0..1 = scroll fraction through the pinned hero. Text and
    // buttons stay fully visible for the first ~60% of the scroll, then dissolve;
    // the cream body washes in only after they have mostly cleared. Fades use
    // plain opacity (never autoAlpha) so visibility can't get stuck hidden.
    heroTL
      // Headlines drift up slowly across the whole scroll.
      .fromTo('#hero-headline-1', { y: 0, scale: 1 }, { y: -150, scale: 1.26, ease: 'none', duration: 1, immediateRender: false }, 0)
      .fromTo('#hero-headline-2', { y: 0, scale: 1 }, { y: -95, scale: 1.14, ease: 'none', duration: 1, immediateRender: false }, 0)
      // Text + buttons hold, then fade late.
      .fromTo('#hero-subhead', { opacity: 1, y: 0 }, { opacity: 0, y: -30, ease: 'none', duration: 0.25, immediateRender: false }, 0.60)
      .fromTo('#hero-tagline', { opacity: 1, y: 0 }, { opacity: 0, y: -30, ease: 'none', duration: 0.25, immediateRender: false }, 0.62)
      .fromTo('#hero-headline-2', { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.24, immediateRender: false }, 0.64)
      .fromTo('#hero-headline-1', { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.26, immediateRender: false }, 0.66)
      .fromTo('#hero-actions', { opacity: 1, y: 0 }, { opacity: 0, y: -30, ease: 'none', duration: 0.26, immediateRender: false }, 0.64)
      .fromTo('#hero-phone-img', { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.26, immediateRender: false }, 0.6)
      // Background nests drift apart and fade as the body rises.
      .fromTo('#hero-bg-nest-left', { xPercent: 0, opacity: 0.52 }, { xPercent: -55, opacity: 0, ease: 'none', duration: 0.4, immediateRender: false }, 0.55)
      .fromTo('#hero-bg-nest-right', { xPercent: 0, opacity: 0.52 }, { xPercent: 55, opacity: 0, ease: 'none', duration: 0.4, immediateRender: false }, 0.55)
      .fromTo('#hero-bg-nest-bl', { xPercent: 0, yPercent: 0, opacity: 0.72 }, { xPercent: 35, yPercent: 30, opacity: 0, ease: 'none', duration: 0.4, immediateRender: false }, 0.55)
      .fromTo('#hero-bg-nest-center', { scale: 1, opacity: 0.14 }, { scale: 1.18, opacity: 0, ease: 'none', duration: 0.42, immediateRender: false }, 0.55)
      .to('.hero-ripple', { scale: 3.6, opacity: 0, ease: 'none', duration: 0.7 }, 0.2)
      // Cream body washes in only after the text has mostly cleared.
      .to('#hero', { backgroundColor: '#F5F5F2', ease: 'none', duration: 0.3, immediateRender: false }, 0.7)
      // Warm aura blooms through the colour change for a soft, lit handoff.
      .fromTo('#hero-aura',
        { xPercent: -50, yPercent: -50, scale: 0.3, opacity: 0 },
        { xPercent: -50, yPercent: -50, scale: 1.2, opacity: 0.7, ease: 'power1.out', duration: 0.28, immediateRender: false }, 0.6)
      .to('#hero-aura', { scale: 1.95, opacity: 0, ease: 'power1.in', duration: 0.1 }, 0.9);

    // The body assembles in (scale + fade) as it rises, rather than a flat wipe.
    gsap.fromTo('.marquee-strip',
      { autoAlpha: 0, scale: 1.08, y: 44 },
      {
        autoAlpha: 1, scale: 1, y: 0, ease: 'power2.out',
        scrollTrigger: { trigger: '.marquee-strip', start: 'top 96%', end: 'top 60%', scrub: true }
      }
    );
  }

  if (isMobile) {
    // Clean mobile hand-off: the hero text and nests dissolve and the cream body
    // washes in together as the hero scrolls away, so nothing sits awkwardly on a
    // half-changed background (no pinning, which is janky on touch).
    gsap.timeline({
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.4 }
    })
      .to(['#hero-subhead', '#hero-headline', '#hero-tagline', '#hero-actions'],
        { opacity: 0, y: -28, ease: 'none', duration: 0.3 }, 0.45)
      .to(['#hero-bg-nest-left', '#hero-bg-nest-right', '#hero-bg-nest-bl', '#hero-bg-nest-center'],
        { opacity: 0, ease: 'none', duration: 0.3 }, 0.45)
      .to('#hero', { backgroundColor: '#F5F5F2', ease: 'none', duration: 0.35 }, 0.6);
  }

  const phoneScreenMap = {};
  document.querySelectorAll('.how-phone-screen').forEach(img => {
    phoneScreenMap[img.dataset.screen] = img;
  });
  function switchPhoneScreen(screenName) {
    Object.values(phoneScreenMap).forEach(img => img.classList.remove('is-active'));
    if (phoneScreenMap[screenName]) phoneScreenMap[screenName].classList.add('is-active');
  }

  const hiwCards = gsap.utils.toArray('.hiw-card');
  hiwCards.forEach((card, idx) => {
    gsap.fromTo(card,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        delay: (idx % 2) * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  const blobs = document.querySelectorAll('.how-it-works-blob');
  blobs.forEach((blob, idx) => {
    gsap.to(blob, {
      y: (idx === 0) ? -200 : -350,
      scrollTrigger: {
        trigger: '#how-it-works',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  const dots = document.querySelectorAll('.scroll-dot');

  if (!isMobile) {
    const container = document.getElementById('horizontal-scroll-container');
    const sectionsCount = 4;

    const horizontalScrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: '#numbers-section',
        pin: true,
        scrub: 0.8,
        start: 'top top',
        end: () => `+=${container.offsetWidth - window.innerWidth}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        pinSpacing: true,
        onLeave: () => document.querySelector('.brand-nav-logo img')?.classList.remove('logo-white'),
        onLeaveBack: () => document.querySelector('.brand-nav-logo img')?.classList.remove('logo-white'),
        onUpdate: (self) => {
          const progress = self.progress;
          const panelFloat = progress * (sectionsCount - 1);
          const activeIndex = Math.min(
            sectionsCount - 1,
            Math.round(panelFloat)
          );

          dots.forEach((dot, idx) => {
            if (idx === activeIndex) {
              dot.classList.add('is-active');
            } else {
              dot.classList.remove('is-active');
            }
          });

          const navLogo = document.querySelector('.brand-nav-logo img');
          if (navLogo) {
            const shouldInvert = panelFloat >= 1.9 && panelFloat < 2.97;
            navLogo.classList.toggle('logo-white', shouldInvert);
          }
        }
      }
    });

    horizontalScrollTL
      .to(container, { x: 0, ease: 'none', duration: 0.18 })
      .to(container, {
        x: () => -(container.offsetWidth - window.innerWidth),
        ease: 'none',
        duration: 1
      });

    const watermarks = document.querySelectorAll('.panel-watermark');
    watermarks.forEach((wm) => {
      gsap.fromTo(wm,
        { x: 100 },
        {
          x: -120,
          scrollTrigger: {
            trigger: wm,
            containerAnimation: horizontalScrollTL,
            start: 'left right',
            end: 'right left',
            scrub: true
          }
        }
      );
    });

    const numTexts = document.querySelectorAll('.panel-num');
    numTexts.forEach((num) => {
      gsap.fromTo(num,
        { scale: 0.65, opacity: 0.3 },
        {
          scale: 1.1,
          opacity: 1,
          scrollTrigger: {
            trigger: num,
            containerAnimation: horizontalScrollTL,
            start: 'left 80%',
            end: 'left 20%',
            scrub: true
          }
        }
      );
    });
  } else {
    const panels = document.querySelectorAll('.number-panel');
    panels.forEach((panel, idx) => {
      gsap.fromTo(panel.querySelector('.panel-content'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: panel,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true
          }
        }
      );
    });
  }

  const panelsStack = document.querySelectorAll('.community-panel');
  panelsStack.forEach((panel, idx) => {
    if (!isMobile && idx < panelsStack.length - 1) {
      const isEven = idx % 2 === 0;

      gsap.to(panel, {
        scale: 0.85,
        opacity: 0,
        x: isEven ? -160 : 160,
        y: -100,
        scrollTrigger: {
          trigger: panel,
          start: 'top 5%',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    gsap.fromTo(panel.querySelector('.community-art-illustration'),
      { scale: 0.6, rotate: -15, opacity: 0 },
      {
        scale: 1,
        rotate: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: panel,
          start: 'top 70%',
          end: 'top 30%',
          scrub: true
        }
      }
    );
  });

  if (!isMobile) {
    gsap.to('#scales-bg-kente', {
      yPercent: 20,
      scrollTrigger: {
        trigger: '#why-scales-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

  }

  const rows = document.querySelectorAll('.parallax-row');
  rows.forEach((row, idx) => {
    if (isMobile) {
      gsap.fromTo(row,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0,
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            end: 'top 70%',
            scrub: 1,
            onEnter: () => row.classList.add('is-visible')
          }
        }
      );
    } else {
      gsap.fromTo(row,
        { x: 120, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            end: 'top 65%',
            scrub: 1,
            onEnter: () => row.classList.add('is-visible')
          }
        }
      );
    }
  });

  const teamCards = document.querySelectorAll('.team-member-card');
  teamCards.forEach((card, idx) => {
    gsap.fromTo(card,
      { scale: 0.8, y: 80, opacity: 0 },
      {
        scale: 1.0,
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          end: 'top 70%',
          scrub: 1,
          onEnter: () => {
            card.classList.add('is-visible');
            if (!isMobile) initTeamCardTilt(card);
          }
        }
      }
    );
  });

  gsap.to('#philosophy-section', {
    backgroundColor: '#2A3A35',
    scrollTrigger: {
      trigger: '#philosophy-screen-3',
      start: 'top 70%',
      end: 'top 10%',
      scrub: true
    }
  });

  if (!isMobile) {
    gsap.to('#bubble-1', {
      y: -150,
      rotate: 20,
      scrollTrigger: {
        trigger: '#philosophy-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('#bubble-2', {
      y: -300,
      rotate: -40,
      scrollTrigger: {
        trigger: '#philosophy-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  const waveScreens = document.querySelectorAll('.philosophy-screen');
  const isMobileWave = window.innerWidth < 768;
  waveScreens.forEach((screen, screenIdx) => {
    const words = screen.querySelectorAll('.philosophy-wave-text span');

    words.forEach((word, wordIdx) => {
      const isOdd = wordIdx % 2 === 0;
      const xDist = isMobileWave ? 18 : 50;
      const yDist = isMobileWave ? 10 : 20;

      gsap.fromTo(word,
        {
          x: isOdd ? -xDist : xDist,
          y: isOdd ? yDist : -yDist,
          scale: 0.9,
          opacity: 0.3
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          scrollTrigger: {
            trigger: screen,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true
          }
        }
      );
    });
  });

  const eaTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#early-access-section',
      start: 'top 70%',
      toggleActions: 'play none none none'
    }
  });

  eaTl
    .fromTo('#early-access-section .early-access-inner',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
    )
    .fromTo('#ea-headline .ea-line-inner',
      { yPercent: 115 },
      { yPercent: 0, duration: 0.95, ease: 'power4.out', stagger: 0.12 },
      '-=0.35'
    );

  gsap.to('#sunset-glow', {
    yPercent: -20,
    opacity: 1,
    scrollTrigger: {
      trigger: '#contact-section',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true
    }
  });

  const contactWords = document.querySelectorAll('.contact-headline span');
  contactWords.forEach((word, idx) => {
    const directions = [
      { x: -60, y: -40 },
      { x: 60, y: -40 },
      { x: -60, y: 40 },
      { x: 60, y: 40 }
    ];
    const dir = directions[idx % directions.length];

    gsap.fromTo(word,
      { x: dir.x, y: dir.y, opacity: 0 },
      {
        x: 0,
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: '#contact-section',
          start: 'top 65%',
          end: 'top 25%',
          scrub: true
        }
      }
    );
  });

  gsap.fromTo('#contact-details',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      scrollTrigger: {
        trigger: '#contact-section',
        start: 'top 40%',
        end: 'top 10%',
        scrub: true,
        onEnter: () => document.getElementById('contact-details').classList.add('is-visible')
      }
    }
  );

  lenis.on('scroll', (e) => {
    const scrollPercent = (e.scroll / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    gsap.to('#scroll-progress-indicator', {
      height: `${scrollPercent}%`,
      duration: 0.1,
      ease: 'none'
    });
  });
}

function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  if (!cursor || !follower) return;

  let mouse = { x: 0, y: 0 };
  let cursorCoords = { x: 0, y: 0 };
  let followerCoords = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const onLight = !!el?.closest('#how-it-works, #communities-section, #team-section');
    document.body.classList.toggle('cursor-on-light', onLight);
  });

  function updateCursor() {
   cursorCoords.x += (mouse.x - cursorCoords.x) * 0.2;
   cursorCoords.y += (mouse.y - cursorCoords.y) * 0.2;
    cursor.style.transform = `translate3d(${cursorCoords.x}px, ${cursorCoords.y}px, 0) translate(-50%, -50%)`;

    followerCoords.x += (mouse.x - followerCoords.x) * 0.18;
    followerCoords.y += (mouse.y - followerCoords.y) * 0.18;
    follower.style.transform = `translate3d(${followerCoords.x}px, ${followerCoords.y}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(updateCursor);
  }

  requestAnimationFrame(updateCursor);

  const hoverElements = document.querySelectorAll('a, button, [role="button"], [data-magnetic]');

  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}

function initMagneticButtons() {
  const magnets = document.querySelectorAll('[data-magnetic]');

  magnets.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 60) {
        gsap.to(btn, {
          x: dx * 0.35,
          y: dy * 0.35,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1.1, 0.4)'
      });
    });
  });
}

function initTeamCardTilt(card) {
  const avatar = card.querySelector('.member-avatar');
  const info = card.querySelector('.member-info');

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = -((rect.width / 2 - x) / (rect.width / 2));
    const dy =  ((rect.height / 2 - y) / (rect.height / 2));

    gsap.to(card, {
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out',
      boxShadow: '0 25px 55px rgba(15, 31, 24, 0.12)'
    });

    if (avatar && info) {
      gsap.to(avatar, { x: dx * 6, y: dy * 6, duration: 0.3 });
      gsap.to(info,   { x: dx * 3, y: dy * 3, duration: 0.3 });
    }
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
      boxShadow: '0 15px 35px rgba(15, 31, 24, 0.06)'
    });

    if (avatar && info) {
      gsap.to([avatar, info], { x: 0, y: 0, duration: 0.5 });
    }
  });
}

function initLogoInversion() {
  const navLogo = document.querySelector('.brand-nav-logo img');
  if (!navLogo) return;

  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;

  const orangePanel = document.getElementById('panel-3');
  if (!orangePanel) return;

  ScrollTrigger.create({
    trigger: orangePanel,
    start: 'top 80px',
    end: 'bottom 80px',
    onEnter:     () => navLogo.classList.add('logo-white'),
    onLeave:     () => navLogo.classList.remove('logo-white'),
    onEnterBack: () => navLogo.classList.add('logo-white'),
    onLeaveBack: () => navLogo.classList.remove('logo-white'),
  });
}

function initContactModal() {
  const modal   = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!modal) return;

  const triggers = document.querySelectorAll('[data-modal="contact"]');

  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add('is-open'));
    });
    document.body.style.overflow = 'hidden';
    if (form && success) {
      form.hidden   = false;
      success.hidden = true;
      form.reset();
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 380);
  }

  triggers.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    openModal();
  }));

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit');
      const btnLabel  = submitBtn.querySelector('span');
      const prevLabel = btnLabel.textContent;

      submitBtn.disabled  = true;
      btnLabel.textContent = 'Sending…';

      const prevErr = form.querySelector('.form-error');
      if (prevErr) prevErr.remove();

      const payload = {
        name:            form.querySelector('#cf-name').value,
        email:           form.querySelector('#cf-email').value,
        organisation:    form.querySelector('#cf-org').value,
        interest:        form.querySelector('#cf-interest').value,
        message:         form.querySelector('#cf-message').value,
        company_website: (form.querySelector('[name=company_website]') || {}).value || '',
      };

      try {
        const res = await fetch('/api/contact.php', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Server error');

        form.hidden    = true;
        success.hidden = false;
        setTimeout(closeModal, 3000);
      } catch (_err) {
        submitBtn.disabled  = false;
        btnLabel.textContent = prevLabel;

        const errEl = document.createElement('p');
        errEl.className   = 'form-error';
        errEl.textContent = 'Something went wrong. Please try again or email us at info@kiota.ai.';
        submitBtn.insertAdjacentElement('afterend', errEl);
      }
    });
  }
}
