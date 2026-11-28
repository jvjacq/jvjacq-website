// jvjacq.com. The theme is applied before paint by the inline script in <head>.
document.addEventListener('DOMContentLoaded', () => {
  const html       = document.documentElement;
  const header     = document.getElementById('header');
  const themeBtn   = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Scroll-spy: mark the nav link for the section in view (nothing while in the hero)
  const navLinks = [...document.querySelectorAll('.nav-link[href^="#"], .mobile-link[href^="#"]')];
  const sections = [...new Set(navLinks.map(l => l.getAttribute('href')))]
    .map(h => document.getElementById(h.slice(1)))
    .filter(Boolean);
  const setActive = id => navLinks.forEach(l =>
    l.classList.toggle('active', id !== null && l.getAttribute('href') === '#' + id));
  const updateSpy = () => {
    const line = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    for (const s of sections) if (s.offsetTop <= line) current = s.id;
    setActive(current);
  };
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 16);
    if (sections.length) updateSpy();
  }, { passive: true });
  if (sections.length) updateSpy();

  // Theme toggle
  themeBtn?.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: lasts this visit */ }
  });

  // Mobile menu
  const setMenu = (open) => {
    mobileMenu?.classList.toggle('open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    if (menuToggle) menuToggle.textContent = open ? '[ close ]' : '[ menu ]';
  };
  menuToggle?.addEventListener('click', () => setMenu(!mobileMenu?.classList.contains('open')));
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // ASCII runner: animates only while the hero is on screen; one still frame if motion is reduced
  const pre = document.getElementById('runner');
  if (pre && window.createRunner) {
    const runner = window.createRunner(pre, { phase: 1.87, scale: 5.3 });   // mid-stride reads best as a still; 5.3 keeps clear of the status lines
    runner.frame(false);
    if (!reduceMotion) {
      let timer = null;
      const start = () => { if (!timer) timer = setInterval(() => runner.frame(), 70); };
      const stop = () => { clearInterval(timer); timer = null; };
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(pre);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    }
  }

  // Contact form: Netlify Forms, sent in the background with an in-place thank-you.
  // Without JavaScript the form still posts and Netlify shows its own success page.
  const form = document.querySelector('form[name="contact"]');
  const success = document.getElementById('form-success');
  const error = document.getElementById('form-error');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (error) error.hidden = true;
    if (button) button.disabled = true;
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error('Form submit failed: HTTP ' + res.status);
      form.hidden = true;
      if (success) { success.hidden = false; success.focus(); }
    } catch (err) {
      console.error(err);
      if (error) error.hidden = false;
      if (button) button.disabled = false;
    }
  });

  // Typed motto: lift heavy. run far. break limits.
  const typed = document.getElementById('typed');
  if (typed && !reduceMotion) {
    const words = ['lift heavy.', 'run far.', 'break limits.'];
    let w = 0, i = words[0].length, deleting = true;
    const step = () => {
      const word = words[w];
      typed.textContent = word.slice(0, i);
      if (deleting) {
        if (i > 0) { i--; return setTimeout(step, 35); }
        deleting = false; w = (w + 1) % words.length; return setTimeout(step, 250);
      }
      if (i < words[w].length) { i++; return setTimeout(step, 75); }
      deleting = true; setTimeout(step, 1600);
    };
    setTimeout(step, 1800);
  }
});
