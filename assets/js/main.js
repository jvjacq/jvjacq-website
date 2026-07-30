// Theme - apply before paint to prevent flash
(function () {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
})();

document.addEventListener('DOMContentLoaded', () => {
  const html    = document.documentElement;
  const header  = document.getElementById('header');
  const themeBtn = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // Scroll-spy: mark the nav link for the section currently in view
  const navLinks = [...document.querySelectorAll('.nav-link[href^="#"], .mobile-link[href^="#"]')];
  const sections = navLinks
    .map(l => document.getElementById(l.getAttribute('href').slice(1)))
    .filter(Boolean);

  if (sections.length) {
    const setActive = id => navLinks.forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === '#' + id));

    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(s => spy.observe(s));
  }

  // Header on scroll
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 16);
  }, { passive: true });

  // Theme toggle
  themeBtn?.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // Mobile menu
  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle?.classList.remove('open');
      mobileMenu?.classList.remove('open');
    });
  });
});
