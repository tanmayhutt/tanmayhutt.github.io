document.querySelector('[data-year]').textContent = new Date().getFullYear();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
}

const previewData = {
    blend: { title: 'Blend', kind: 'Private social product', mark: 'BL', count: '01 / 05' },
    thwip: { title: 'Thwip', kind: 'Developer tool', mark: 'TH', count: '02 / 05' },
    server: { title: 'Arch server', kind: 'Infrastructure', mark: 'AS', count: '03 / 05' },
    filmedin: { title: 'FilmedIn', kind: 'Full-stack application', mark: 'FI', count: '04 / 05' },
    wifisense: { title: 'WiFiSense', kind: 'Embedded experiment', mark: 'WS', count: '05 / 05' }
};
const previewCanvas = document.querySelector('[data-preview-canvas]');
const previewTitle = document.querySelector('[data-preview-title]');
const previewKind = document.querySelector('[data-preview-kind]');
const previewCount = document.querySelector('[data-preview-count]');
const previewMark = document.querySelector('.preview-mark');

function updateProjectPreview(key) {
    const next = previewData[key];
    if (!next || !previewCanvas) return;
    previewCanvas.dataset.previewCanvas = key;
    previewTitle.textContent = next.title;
    previewKind.textContent = next.kind;
    previewCount.textContent = next.count;
    previewMark.textContent = next.mark;
}

document.querySelectorAll('[data-preview]').forEach((project) => {
    project.addEventListener('mouseenter', () => updateProjectPreview(project.dataset.preview));
    project.addEventListener('focusin', () => updateProjectPreview(project.dataset.preview));
});

if (!reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((element) => {
        element.addEventListener('pointermove', (event) => {
            if (event.pointerType === 'touch') return;
            const bounds = element.getBoundingClientRect();
            const x = (event.clientX - bounds.left - bounds.width / 2) * 0.08;
            const y = (event.clientY - bounds.top - bounds.height / 2) * 0.08;
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
        element.addEventListener('pointerleave', () => {
            element.style.transform = '';
        });
    });

    previewCanvas?.addEventListener('pointermove', (event) => {
        const bounds = previewCanvas.getBoundingClientRect();
        previewCanvas.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
        previewCanvas.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    });
    previewCanvas?.addEventListener('pointerleave', () => {
        previewCanvas.style.removeProperty('--pointer-x');
        previewCanvas.style.removeProperty('--pointer-y');
    });
}
