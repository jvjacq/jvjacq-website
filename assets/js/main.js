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

  // Mark active nav link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-link, .footer-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

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
