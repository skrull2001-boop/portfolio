// Andrea Vacchini · portfolio
// Lingua IT/EN, barra di lettura, sezione attiva nel menu, comparsa allo scroll,
// manifesto che si illumina, linea dei passi, tilt della pila di screenshot.
// I testi italiani sono nell'HTML; qui ci sono solo quelli inglesi.

(function () {
    'use strict';

    var EN = {
        'skip': 'Skip to content',
        'nav.work': 'Work',
        'nav.approach': 'Approach',
        'nav.background': 'Background',
        'nav.contact': 'Contact',

        'hero.whoami': '→ Andrea Vacchini · AI Automation Specialist · Milan',
        'hero.status': 'Open to roles and projects',
        'hero.title': 'I bring AI into <span class="grad">everyday work</span>.',
        'hero.sub': 'I watch how people work, find the step that eats their hours and build the tool that removes it. AI writes the code under my direction; I decide what to build, test it on real data and put it to work.',
        'hero.cta': 'See the work',
        'cap.gp': 'GymPage · live',
        'cap.rf': 'RispostaFacile · live',
        'cap.kit': 'Book launch kit · prototype',
        'alt.gp': 'GymPage home page',
        'alt.rf': 'RispostaFacile home page',
        'alt.kit': 'First screen of the book launch kit',
        'alt.cat': 'Independent film catalog demo',
        'cue': 'scroll',

        'mani': 'AI writes the code. <em>I make the calls.</em>',

        'numbers.aria': 'In numbers',
        'n.a.l': 'Invoice check',
        'n.a.n': '4,000',
        'n.a.t': 'invoice-order pairs tested before go-live',
        'n.b.t': 'per invoice checked',
        'n.c.t': 'products live on their own domain',
        'n.d.t': 'AI agents, one person who decides',
        'n.e.n': '1 afternoon',
        'n.e.t': 'from idea to working prototype',
        'n.f.t': 'bots built and tested',
        'n.g.n': '2,800+',
        'n.g.t': 'local businesses found and qualified from public sources',
        'n.h.n': '6 <span class="unit">years</span>',
        'n.h.t': 'of infrastructure, networks, Microsoft 365 and help desk',

        'work.title': 'Work',
        'work.sub': 'Real tools: in use, live or ready to try.',
        'st.use': 'In use',
        'st.live': 'Live',
        'st.proto': 'Prototype',
        'st.int': 'Internal',
        'st.res': 'Research',

        'p1.over': 'Publishing · built in one afternoon',
        'p1.title': 'Book launch kit',
        'p1.prob': 'Launching a book takes many different materials, all consistent with the same book sheet.',
        'p1.what': '5 agents in sequence turn a book sheet into 8 campaign materials; the last one checks spoilers and tone, then a person approves.',
        'p1.note': 'Proposed to PLAI. Independent prototype, not affiliated with Gruppo Mondadori.',
        'p1.link': 'Try the prototype (in Italian) →',
        'next1': 'Next: Invoice vs. purchase-order check →',

        'inv.caption': 'Example of an invoice and order check, illustrative data',
        'inv.h1': 'Invoice',
        'inv.h2': 'Order',
        'inv.h3': 'Check',
        'inv.r1a': 'INV&nbsp;2291 · €&nbsp;1,240.00',
        'inv.r1b': 'PO&nbsp;8812 · €&nbsp;1,240.00',
        'inv.r2a': 'INV&nbsp;2292 · €&nbsp;318.50',
        'inv.r2b': 'PO&nbsp;8820 · €&nbsp;318.50',
        'inv.r3a': 'INV&nbsp;2293 · €&nbsp;96.00',
        'inv.r3b': 'PO&nbsp;8823 · €&nbsp;90.00',
        'inv.diff': '€&nbsp;6.00 off',
        'inv.r4a': 'INV&nbsp;2294 · €&nbsp;2,015.30',
        'inv.r4b': 'PO&nbsp;8831 · €&nbsp;2,015.30',
        'inv.note': 'Illustrative data',
        'p3.over': 'Hospital near Milan',
        'p3.title': 'Invoice vs. purchase-order check',
        'p3.prob': 'Whoever pays the invoices had to check every e-invoice against its order by hand.',
        'p3.what': 'Pairs invoices and orders automatically and shows only the differences worth a look. Runs offline. Tested on 4,000 pairs.',
        'next2': 'Next: RispostaFacile →',

        'p6.over': 'Accounting firms',
        'p6.prob': 'Clients ask their accountant the same questions all day.',
        'p6.what': 'Drafts the reply; the accountant reads it, fixes it if needed and sends it.',
        'next3': 'Next: A second brain run by 12 AI agents →',

        'roles.org': '<li>Ops</li><li>Sales</li><li>Projects</li><li>Dev</li><li>QA</li><li>Finance</li><li>Risk</li><li>Research</li>',
        'roles.me': 'Andrea decides',
        'p2.over': 'My own studio · Obsidian + AI agents',
        'p2.title': 'A second brain run by 12 AI agents',
        'p2.prob': "Working alone, I cover sales, projects, finance, QA and research, and can't afford to lose track of decisions.",
        'p2.what': 'An Obsidian vault where 12 agents with clear roles prepare proposals, drafts and checks and write everything down: project sheets, visual maps, a decision log, trading research. I decide; nothing goes out without my yes.',
        'p2.extra': 'I use it for my own job search too: it shortlisted the roles I applied for.',
        'next4': 'Next: Trading Lab →',

        'p5.over': 'Research · automated systems',
        'p5.prob': 'Automated trading makes self-deception easy: a backtest that "sees" future data makes any strategy look good.',
        'p5.what': 'A research lab with anti-lookahead checks. Over 120 bots built and tested: trend following, multi-timeframe, mean reversion, reinforcement learning. Monitoring with automatic reconnection, and an LLM parser that reads signals from Telegram.',
        'next5': 'Next: Lead Pipeline →',

        'p4.over': 'Sales automation',
        'p4.prob': 'Finding local businesses that need a website by hand takes hours of research.',
        'p4.what': 'Searches public sources for local businesses (hair salons, gyms) with no website or an outdated one, qualifies them and drafts both the site and the first message. Over 2,800 businesses in the database. I review and send each message myself.',
        'next6': 'Next: GymPage →',

        'p7.over': 'Gyms and personal trainers',
        'p7.prob': 'A gym needs a clear website without having to run a web project.',
        'p7.what': 'Ready-made sites with services, schedule, prices and contact.',
        'next7': 'Next: Independent film catalog →',

        'p8.over': 'Film production company',
        'p8.title': 'Independent film catalog',
        'p8.prob': 'The catalog needs frequent updates without calling a developer every time.',
        'p8.what': 'Search, genre and year filters, film pages with cast and festivals, and a panel to update it yourself.',
        'p8.link': 'Open the demo (in Italian) ↗',

        'others.title': 'More projects',
        'others.cmd': '$ ls ~/projects',
        'o1': 'Pulls job ads from public job-board APIs and ranks them against a profile. Tested on non-technical profiles too.',
        'o2': 'Windows desktop app that finds devices on a network and helps manage subnets and IP addresses.',
        'o3.name': 'Project hub',
        'o3': 'One app that collects and launches all my projects from a single window.',

        'ap.cmd': '$ cat method.txt',
        'ap.title': 'Approach',
        's1.t': 'Watch',
        's1.p': 'I get shown the job by the person who does it every day, not just by whoever describes it.',
        's2.t': 'Build',
        's2.p': 'A first version to try on real data, then I refine it with the people who use it.',
        's3.t': 'Test',
        's3.p': 'Before go-live I run it on real cases, including the awkward ones.',
        's4.t': 'Stay',
        's4.p': "After delivery I'm still the person to call when something changes.",
        'ai.title': 'How I use AI',
        'ai.text': "I don't write code by hand. I build by directing Claude Code and Gemini: I pick the problem, describe what's needed, review the output and test it. I answer for what goes into use. In the systems I build, AI prepares and a person approves.",

        'bg.title': 'Background',
        'bg.intro': "I come from IT: six years keeping networks, servers and Microsoft 365 running for people with other things to do. That's where I learned to look at a process and see where time gets lost. Today I use AI to take that lost time back.",
        't1.when': 'Since Dec 2025',
        't1': '<b>Studio Vacchini</b> · freelance. AI automations, custom tools and websites for small businesses.',
        't2.when': 'Now',
        't2': 'IT infrastructure for restaurant chains across Italy.',
        't3.when': 'Before',
        't3': 'FTTH fiber. Microsoft 365 and user training. SQL and help desk.',

        'c.title': 'Got a process that eats hours every week?',
        'c.text': "If you're looking for someone to bring AI into your company's processes, or you run a business with repetitive work to remove, write or call.",
        'c.wa': 'Message me on WhatsApp',

        'f.left': '© 2026 Andrea Vacchini · Studio Vacchini · Milan',
        'f.right': 'Site built by directing Claude Code.'
    };

    var META = {
        it: {
            desc: "Andrea Vacchini, Milano. Porto l'IA nel lavoro di ogni giorno: strumenti collaudati su dati veri e messi in uso. Agenti IA, automazioni, siti.",
            langLabel: "Lingua: italiano. Passa all'inglese"
        },
        en: {
            desc: 'Andrea Vacchini, Milan. I bring AI into everyday work: tools tested on real data and put into use. AI agents, automations, websites.',
            langLabel: 'Language: English. Switch to Italian'
        }
    };
    var TITLE = 'Andrea Vacchini · AI Automation Specialist';
    var KEY = 'av-lang';

    var root = document.documentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('js');
    if (!reduce && 'IntersectionObserver' in window) root.classList.add('js-motion');

    var textEls = document.querySelectorAll('[data-i18n]');
    var altEls = document.querySelectorAll('[data-i18n-alt]');
    var ariaEls = document.querySelectorAll('[data-i18n-aria]');
    var langBtn = document.getElementById('lang');
    var metaDesc = document.getElementById('meta-desc');
    var mani = document.getElementById('mani');

    // Salva i testi italiani dell'HTML per poter tornare indietro
    textEls.forEach(function (el) { el._it = el.innerHTML; });
    altEls.forEach(function (el) { el._it = el.getAttribute('alt'); });
    ariaEls.forEach(function (el) { el._it = el.getAttribute('aria-label'); });

    // Divide il manifesto in parole, per illuminarle una alla volta
    var words = [];
    function splitWords() {
        if (!mani) return;
        (function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (n) {
                if (n.nodeType === 3) {
                    var frag = document.createDocumentFragment();
                    n.textContent.split(/(\s+)/).forEach(function (part) {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                        var s = document.createElement('span');
                        s.className = 'w';
                        s.textContent = part;
                        frag.appendChild(s);
                    });
                    node.replaceChild(frag, n);
                } else if (n.nodeType === 1) {
                    walk(n);
                }
            });
        })(mani);
        words = mani.querySelectorAll('.w');
    }

    function setLang(lang) {
        var en = lang === 'en';
        textEls.forEach(function (el) {
            var k = el.getAttribute('data-i18n');
            el.innerHTML = en && EN[k] !== undefined ? EN[k] : el._it;
        });
        altEls.forEach(function (el) {
            var k = el.getAttribute('data-i18n-alt');
            el.setAttribute('alt', en && EN[k] !== undefined ? EN[k] : el._it);
        });
        ariaEls.forEach(function (el) {
            var k = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', en && EN[k] !== undefined ? EN[k] : el._it);
        });
        root.setAttribute('lang', en ? 'en' : 'it');
        document.title = TITLE;
        if (metaDesc) metaDesc.setAttribute('content', META[en ? 'en' : 'it'].desc);
        if (langBtn) langBtn.setAttribute('aria-label', META[en ? 'en' : 'it'].langLabel);
        splitWords();
        update();
    }

    // ---------- Effetti legati allo scroll (un solo listener, con rAF) ----------
    var nav = document.getElementById('nav');
    var bar = document.getElementById('progress-bar');
    var steps = document.getElementById('steps');
    var stepItems = steps ? steps.querySelectorAll('.step') : [];
    var navLinks = document.querySelectorAll('.nav-links a[data-sec]');
    var sections = Array.prototype.map.call(navLinks, function (a) { return document.getElementById(a.getAttribute('data-sec')); });
    if (steps && !reduce) steps.classList.add('armed');

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function update() {
        var vh = window.innerHeight;
        var max = document.documentElement.scrollHeight - vh;
        if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? clamp(window.scrollY / max) : 0) + ')';
        nav.classList.toggle('scrolled', window.scrollY > 20);

        // sezione corrente nel menu
        var active = -1;
        sections.forEach(function (s, i) {
            if (!s) return;
            var r = s.getBoundingClientRect();
            if (r.top < vh * 0.4 && r.bottom > vh * 0.4) active = i;
        });
        navLinks.forEach(function (a, i) {
            if (i === active) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
        });

        if (reduce) return;

        // manifesto: le parole si accendono mentre attraversa lo schermo
        if (mani && words.length) {
            var r = mani.getBoundingClientRect();
            var p = clamp((vh * 0.9 - r.top) / (vh * 0.55 + r.height * 0.5));
            var lit = Math.round(p * words.length);
            for (var i = 0; i < words.length; i++) words[i].classList.toggle('lit', i < lit);
        }

        // passi: la linea si riempie
        if (steps) {
            var rs = steps.getBoundingClientRect();
            var ps = clamp((vh * 0.8 - rs.top) / (rs.height + vh * 0.25));
            steps.style.setProperty('--p', ps.toFixed(3));
            for (var j = 0; j < stepItems.length; j++) stepItems[j].classList.toggle('on', ps >= j / stepItems.length + 0.02);
        }
    }

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; update(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // ---------- Lingua ----------
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
    if (saved === 'en') setLang('en');
    else { splitWords(); update(); }

    if (langBtn) {
        langBtn.addEventListener('click', function () {
            var next = root.getAttribute('lang') === 'en' ? 'it' : 'en';
            setLang(next);
            try { localStorage.setItem(KEY, next); } catch (e) { /* storage non disponibile */ }
        });
    }

    // ---------- Comparsa allo scroll ----------
    if (root.classList.contains('js-motion')) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
        document.querySelectorAll('.rv, .media').forEach(function (el) { io.observe(el); });
    }

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // ---------- Lastre 3D: si sollevano e si inclinano verso il cursore (max ~8°) ----------
    if (finePointer && !reduce) {
        document.querySelectorAll('.card3d.tilt').forEach(function (card) {
            var frame = 0;
            card.addEventListener('mouseenter', function () { card.classList.add('lift'); });
            card.addEventListener('mousemove', function (e) {
                if (frame) return;
                frame = requestAnimationFrame(function () {
                    frame = 0;
                    var r = card.getBoundingClientRect();
                    var fx = clamp((e.clientX - r.left) / r.width);
                    var fy = clamp((e.clientY - r.top) / r.height);
                    card.style.setProperty('--ry', ((fx - 0.5) * 16).toFixed(2) + 'deg');
                    card.style.setProperty('--rx', ((0.5 - fy) * 16).toFixed(2) + 'deg');
                    card.style.setProperty('--gx', (fx * 100).toFixed(1) + '%');
                    card.style.setProperty('--gy', (fy * 100).toFixed(1) + '%');
                });
            });
            card.addEventListener('mouseleave', function () {
                card.classList.remove('lift');
                ['--rx', '--ry', '--gx', '--gy'].forEach(function (p) { card.style.removeProperty(p); });
            });
        });
    }

    // ---------- Tilt della pila: solo con mouse e movimento consentito ----------
    var area = document.getElementById('stack-area');
    var stack = document.getElementById('stack');
    if (area && stack && finePointer && !reduce) {
        area.addEventListener('mousemove', function (e) {
            var r = area.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            stack.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
            stack.style.setProperty('--rx', (y * -6).toFixed(2) + 'deg');
        });
        area.addEventListener('mouseleave', function () {
            stack.style.setProperty('--ry', '0deg');
            stack.style.setProperty('--rx', '0deg');
        });
    }
})();
