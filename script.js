const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

$('[data-year]').textContent = new Date().getFullYear();

/* Reveal on scroll. Content is visible by default when scripts do not run. */
const reveals = $$('.reveal');
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7%', threshold: .08 });
  reveals.forEach(el => observer.observe(el));
}

/* Header state and scroll progress */
const header = $('[data-header]');
const progress = $('[data-progress]');
let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  header.classList.toggle('scrolled', scrollY > 24);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
}
addEventListener('scroll', () => {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
updateScroll();

/* Current section in the primary navigation */
const navLinks = $$('[data-nav]');
if ('IntersectionObserver' in window) {
  const sections = navLinks.map(link => document.getElementById(link.dataset.nav));
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.dataset.nav === entry.target.id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(section => section && sectionObserver.observe(section));
  sectionObserver.observe($('#top'));
}

/* Work showcase: the sticky visual follows whichever project is in view. */
const showcase = $('.showcase');
const projects = $$('[data-project]');
const visual = $('[data-visual]');
const visualIndex = $('[data-visual-index]');
const visualMark = $('[data-visual-mark]');
const visualFlow = $('[data-visual-flow]');
const pips = $$('[data-pips] li');
let swapTimer;

function renderVisual(project) {
  visual.dataset.visual = project.dataset.project;
  visualIndex.textContent = project.dataset.index;
  visualMark.textContent = project.dataset.mark;
  visualFlow.replaceChildren(...project.dataset.flow.split('|').map(step => {
    const li = document.createElement('li');
    li.textContent = step;
    return li;
  }));
  pips.forEach((pip, i) => pip.classList.toggle('on', i === projects.indexOf(project)));
}

function activate(project) {
  if (project.classList.contains('is-active')) return;
  projects.forEach(p => p.classList.toggle('is-active', p === project));
  clearTimeout(swapTimer);
  if (reduced) return renderVisual(project);
  visual.classList.add('swap');
  swapTimer = setTimeout(() => {
    renderVisual(project);
    visual.classList.remove('swap');
  }, 180);
}

if ('IntersectionObserver' in window) {
  showcase.classList.add('live');
  projects[0].classList.add('is-active');
  const projectObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) activate(entry.target); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  projects.forEach(project => projectObserver.observe(project));
}

/* Local time in India */
const clock = $('[data-clock]');
const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
function tick() { clock.textContent = `${timeFormat.format(new Date())} IST`; }
tick();
setInterval(tick, 15000);

/* Pointer light on cards and a gentle pull on the main call to action */
if (!reduced && finePointer) {
  $$('.card').forEach(card => card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }));
  const tilt = $('[data-tilt]');
  const frame = $('.portrait-frame', tilt);
  tilt.addEventListener('pointermove', event => {
    const rect = tilt.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    frame.style.setProperty('--ry', `${x * 8}deg`);
    frame.style.setProperty('--rx', `${y * -8}deg`);
  });
  tilt.addEventListener('pointerleave', () => {
    frame.style.setProperty('--ry', '0deg');
    frame.style.setProperty('--rx', '0deg');
  });
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', event => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .08;
      const y = (event.clientY - rect.top - rect.height / 2) * .08;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* Hero particle field: dots scatter away from the cursor and drift back home. */
const field = $('[data-field]');
if (field && !reduced) {
  const hero = field.parentElement;
  const ctx = field.getContext('2d');
  const spacing = 34;
  const radius = 130;
  let dots = [];
  let width = 0;
  let height = 0;
  let pointer = null;
  let lastMove = 0;
  let frame = 0;
  let visible = true;

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = field.clientWidth;
    height = field.clientHeight;
    field.width = width * dpr;
    field.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    const offsetX = (width % spacing) / 2;
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = offsetX; x < width; x += spacing) {
        dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, heat: 0 });
      }
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const d of dots) {
      // Fade the field toward the bottom so it sits behind the copy quietly.
      const fade = Math.max(0, 1 - d.hy / height) * .9 + .1;
      const alpha = (.1 + d.heat * .6) * fade;
      ctx.fillStyle = d.heat > .05 ? `rgba(181, 139, 221, ${alpha})` : `rgba(240, 237, 230, ${alpha})`;
      const size = 1.1 + d.heat * 1.6;
      ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
    }
  }

  function step() {
    frame = 0;
    let moving = false;
    // A resting cursor stops pushing, so the field settles back on its own.
    const active = pointer && performance.now() - lastMove < 900;
    for (const d of dots) {
      if (active) {
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius && dist > .1) {
          const force = (1 - dist / radius) ** 2 * 5;
          d.vx += (dx / dist) * force;
          d.vy += (dy / dist) * force;
          d.heat = Math.min(1, d.heat + .12);
        }
      }
      d.vx += (d.hx - d.x) * .03;
      d.vy += (d.hy - d.y) * .03;
      d.vx *= .82;
      d.vy *= .82;
      d.x += d.vx;
      d.y += d.vy;
      d.heat *= .96;
      if (Math.abs(d.vx) + Math.abs(d.vy) > .02 || d.heat > .01 || Math.abs(d.x - d.hx) > .3) moving = true;
    }
    draw();
    if ((moving || active) && visible) frame = requestAnimationFrame(step);
  }

  const wake = () => { if (!frame && visible) frame = requestAnimationFrame(step); };

  if (finePointer) {
    hero.addEventListener('pointermove', event => {
      const rect = field.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      lastMove = performance.now();
      wake();
    });
    hero.addEventListener('pointerleave', () => { pointer = null; wake(); });
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  }).observe(hero);

  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 120);
  }).observe(field);
  build();
}

/* Quick navigation dialog */
const dialog = $('[data-command]');
const openDialog = () => {
  if (dialog.open) return;
  dialog.showModal();
  $('a', dialog).focus();
};
const closeDialog = () => { if (dialog.open) dialog.close(); };
const shortcuts = { w: '#work', c: '#craft', a: '#about', d: '#desks' };

$('[data-command-open]').addEventListener('click', openDialog);
$('[data-command-close]').addEventListener('click', closeDialog);
dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
$$('a', dialog).forEach(link => link.addEventListener('click', () => {
  closeDialog();
  if (link.hash === '#desks') $('#desks details').open = true;
}));

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    dialog.open ? closeDialog() : openDialog();
    return;
  }
  if (!dialog.open || event.metaKey || event.ctrlKey || event.altKey) return;

  const links = $$('a', dialog);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const i = links.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? i + 1 : i - 1;
    links[(next + links.length) % links.length].focus();
    return;
  }

  const key = event.key.toLowerCase();
  if (shortcuts[key]) {
    event.preventDefault();
    closeDialog();
    if (key === 'd') $('#desks details').open = true;
    document.querySelector(shortcuts[key]).scrollIntoView();
  } else if (key === 'r' || key === 'e') {
    event.preventDefault();
    links.find(link => $('kbd', link).textContent.toLowerCase() === key).click();
  }
});
