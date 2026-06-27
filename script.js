/* =====================================================
   TANMAY TIWARI — GITHUB LANDING PAGE
   script.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── 1. NAV SCROLL EFFECT ─── */
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });


    /* ─── 2. REVEAL ON SCROLL (IntersectionObserver) ─── */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealEls.forEach(el => revealObserver.observe(el));


    /* ─── 3. TYPING ANIMATION (Terminal) ─── */
    const typedOutput = document.getElementById('typed-output');
    const lines = [
        'Developer · Builder · Open-Source Enthusiast',
        'TypeScript · C++ · GLSL · Embedded Systems',
        'Building tools that matter, one commit at a time.'
    ];
    let currentLine = 0;
    let charIndex = 0;
    let isDeleting = false;
    const TYPING_SPEED = 55;
    const DELETING_SPEED = 25;
    const PAUSE_AFTER_TYPE = 2200;
    const PAUSE_AFTER_DELETE = 400;

    function type() {
        const current = lines[currentLine];

        if (!isDeleting) {
            typedOutput.textContent = current.slice(0, charIndex + 1);
            charIndex++;
            if (charIndex === current.length) {
                isDeleting = true;
                setTimeout(type, PAUSE_AFTER_TYPE);
                return;
            }
        } else {
            typedOutput.textContent = current.slice(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                currentLine = (currentLine + 1) % lines.length;
                setTimeout(type, PAUSE_AFTER_DELETE);
                return;
            }
        }

        setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    }

    setTimeout(type, 800);


    /* ─── 4. COUNT-UP NUMBERS ─── */
    const counters = document.querySelectorAll('.count-up');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                const duration = 1800;
                const steps = 60;
                const increment = target / steps;
                let current = 0;
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        el.textContent = target;
                        clearInterval(interval);
                    } else {
                        el.textContent = Math.floor(current);
                    }
                }, duration / steps);
                countObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => countObserver.observe(c));


    /* ─── 5. CONTRIBUTION GRAPH (procedural) ─── */
    const graph = document.getElementById('contrib-graph');
    if (graph) {
        const totalCells = 26 * 7;
        const COLORS = [
            'rgba(67,69,83,0.2)',
            'rgba(111,84,136,0.25)',
            'rgba(111,84,136,0.45)',
            'rgba(111,84,136,0.7)',
            'rgba(155,114,200,0.9)',
        ];

        // Weighted random to make it look like real activity
        function weightedRandom() {
            const r = Math.random();
            if (r < 0.55) return 0;
            if (r < 0.72) return 1;
            if (r < 0.83) return 2;
            if (r < 0.93) return 3;
            return 4;
        }

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'contrib-cell';
            const level = weightedRandom();
            cell.style.background = COLORS[level];
            cell.style.borderRadius = '3px';

            // Animate in with stagger
            cell.style.opacity = '0';
            cell.style.transform = 'scale(0)';
            cell.style.transition = `opacity 0.3s ease ${(i * 4)}ms, transform 0.3s ease ${(i * 4)}ms`;
            graph.appendChild(cell);
        }

        // Trigger animation after a short delay
        setTimeout(() => {
            graph.querySelectorAll('.contrib-cell').forEach(cell => {
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            });
        }, 400);
    }


    /* ─── 6. SMOOTH CURSOR PARALLAX on Hero Orbs ─── */
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 30;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    }, { passive: true });

    function animOrbs() {
        curX += (mouseX - curX) * 0.06;
        curY += (mouseY - curY) * 0.06;
        if (orb1) orb1.style.transform = `translate(${curX}px, ${curY}px)`;
        if (orb2) orb2.style.transform = `translate(${-curX * 0.7}px, ${-curY * 0.7}px)`;
        requestAnimationFrame(animOrbs);
    }
    animOrbs();


    /* ─── 7. AVATAR TILT EFFECT ─── */
    const avatarWrap = document.querySelector('.avatar-wrap');
    if (avatarWrap) {
        avatarWrap.addEventListener('mousemove', e => {
            const rect = avatarWrap.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            avatarWrap.style.transform = `perspective(600px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.04)`;
        });
        avatarWrap.addEventListener('mouseleave', () => {
            avatarWrap.style.transform = '';
        });
    }

});
