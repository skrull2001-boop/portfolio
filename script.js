// ============================================
// Andrea Vacchini — Portfolio V2 Scripts
// Futuristic / Interactive
// ============================================

// --- Custom Cursor ---
const dot = document.createElement('div');
dot.className = 'cursor-dot';
const ring = document.createElement('div');
ring.className = 'cursor-ring';
document.body.appendChild(dot);
document.body.appendChild(ring);

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX - 4 + 'px';
    dot.style.top = mouseY - 4 + 'px';
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX - 20 + 'px';
    ring.style.top = ringY - 20 + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

// Hover effect on interactive elements
const hoverables = document.querySelectorAll('a, .btn, .project-card, .social-link, .project-ext-link');
hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

// --- Scroll reveal with stagger ---
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

reveals.forEach((el, i) => {
    const parent = el.parentElement;
    const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.dataset.delay = idx * 120;
    revealObserver.observe(el);
});

// --- Nav scroll ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// --- Counter animation ---
const counters = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            let current = 0;
            const duration = 1500;
            const steps = 40;
            const stepVal = target / steps;
            let step = 0;
            const timer = setInterval(() => {
                step++;
                // Ease out
                const progress = step / steps;
                const eased = 1 - Math.pow(1 - progress, 3);
                current = Math.round(eased * target);
                el.textContent = current;
                if (step >= steps) {
                    el.textContent = target;
                    clearInterval(timer);
                }
            }, duration / steps);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// --- Skill bars ---
const skillItems = document.querySelectorAll('.skill-item');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('animated'), 200);
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });
skillItems.forEach(s => skillObserver.observe(s));

// --- Typed effect ---
const words = ['work.', 'scale.', 'profit.', 'automate.', 'last.'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedEl = document.querySelector('.typed-wrapper');

function typeEffect() {
    if (!typedEl) return;
    const currentWord = words[wordIndex];
    typedEl.childNodes[0].textContent = currentWord.substring(0, charIndex);

    let delay;
    if (!isDeleting) {
        charIndex++;
        delay = 80 + Math.random() * 40;
        if (charIndex > currentWord.length) {
            delay = 2500;
            isDeleting = true;
        }
    } else {
        charIndex--;
        delay = 40;
        if (charIndex < 0) {
            charIndex = 0;
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 400;
        }
    }
    setTimeout(typeEffect, delay);
}
setTimeout(typeEffect, 1800);

// --- Smooth scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// --- Magnetic tilt on project cards ---
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;

        // Move glow to cursor position
        const glow = card.querySelector('.project-glow');
        if (glow) {
            glow.style.left = (e.clientX - rect.left - 150) + 'px';
            glow.style.top = (e.clientY - rect.top - 150) + 'px';
        }
    });
    card.addEventListener('mouseleave', (e) => {
        card.style.transform = '';
    });
});

// --- Parallax on hero elements ---
window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    const hero = document.querySelector('.hero-content');
    if (hero && scroll < window.innerHeight) {
        hero.style.transform = `translateY(${scroll * 0.15}px)`;
        hero.style.opacity = 1 - (scroll / window.innerHeight) * 0.6;
    }
});
