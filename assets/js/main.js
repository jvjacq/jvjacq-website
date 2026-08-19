// Theme - apply before paint to prevent flash
(function () {
  const saved = localStorage.getItem('theme');
  document.documentElement.dataset.theme = saved || 'dark';
})();

document.addEventListener('DOMContentLoaded', () => {
  const html    = document.documentElement;
  const header  = document.getElementById('header');
  const themeBtn = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // Scroll-spy: mark the nav link for the section currently in view.
  // Position-based so nothing is highlighted while still in the hero.
  const navLinks = [...document.querySelectorAll('.nav-link[href^="#"], .mobile-link[href^="#"]')];
  const sections = [...new Set(navLinks.map(l => l.getAttribute('href')))]
    .map(h => document.getElementById(h.slice(1)))
    .filter(Boolean);

  const setActive = id => navLinks.forEach(l =>
    l.classList.toggle('active', id !== null && l.getAttribute('href') === '#' + id));

  const updateSpy = () => {
    const line = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    for (const s of sections) {
      if (s.offsetTop <= line) current = s.id;
    }
    setActive(current);
  };

  // Combined scroll handler: header state + scroll-spy
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 16);
    if (sections.length) updateSpy();
  }, { passive: true });

  if (sections.length) updateSpy();

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
