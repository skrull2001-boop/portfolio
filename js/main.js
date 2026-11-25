/* Andrea Vacchini · anteprima E · finestre 3D su sfondo vivo */
(function () {
  'use strict';
  const root = document.documentElement;
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ================= Sfondo ================= */
  const bg = window.Aurora ? new window.Aurora($('#bg'), { static: RM }) : null;
  const bgScroll = () => {
    if (!bg) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    bg.setScroll(window.scrollY / window.innerHeight, window.scrollY / max);
  };
  window.addEventListener('scroll', bgScroll, { passive: true });

  /* ================= Lingua ================= */
  const IT = {}; const EN = window.I18N_EN || {};
  $$('[data-i18n]').forEach((el) => { IT[el.dataset.i18n] = el.innerHTML; });
  $$('[data-i18n-alt]').forEach((el) => { IT[el.dataset.i18nAlt] = el.alt; });
  $$('[data-i18n-aria]').forEach((el) => { IT[el.dataset.i18nAria] = el.getAttribute('aria-label'); });
  let lang = root.lang === 'en' ? 'en' : 'it';
  const T = (k) => (lang === 'en' ? (EN[k] != null ? EN[k] : IT[k]) : IT[k]);

  function fmt(v, dec) {
    const [i, d] = v.toFixed(dec).split('.');
    const out = i.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
    return d ? out + (lang === 'en' ? '.' : ',') + d : out;
  }
  function applyLang(first) {
    root.lang = lang;
    $$('[data-i18n]').forEach((el) => {
      const v = T(el.dataset.i18n); if (v == null) return;
      el.innerHTML = v;
      if (el.classList.contains('split')) { el.classList.remove('is-split'); splitEl(el, !!el.dataset.shown || RM || !HAS_GSAP); }
    });
    $$('[data-i18n-alt]').forEach((el) => { const v = T(el.dataset.i18nAlt); if (v) el.alt = v; });
    $$('[data-i18n-aria]').forEach((el) => { const v = T(el.dataset.i18nAria); if (v) el.setAttribute('aria-label', v); });
    $$('.orb-img').forEach((img) => { img.src = 'img/orbita-dark-' + lang + '.jpg'; });
    $$('.cv-link').forEach((a) => { a.href = 'cv/CV-Andrea-Vacchini-' + (lang === 'en' ? 'EN' : 'IT') + '.pdf'; });
    const ask = $('#ask'); if (ask) ask.href = 'mailto:vacchiniandrea2001@gmail.com?subject=' + encodeURIComponent(lang === 'en' ? 'A project for my company' : 'Progetto per la mia azienda');
    $('.logo').setAttribute('aria-label', lang === 'en' ? 'Andrea Vacchini, back to top' : 'Andrea Vacchini, torna su');
    $$('.count').forEach((el) => { if (el.dataset.done || first === 'static') el.textContent = fmt(+el.dataset.to, +(el.dataset.dec || 0)); });
    if (!first) { buildRows(); if (HAS_GSAP) ScrollTrigger.refresh(); }
  }
  $('#lang').addEventListener('click', () => {
    lang = lang === 'it' ? 'en' : 'it';
    try { localStorage.setItem('av-lang', lang); } catch (e) { /* storage non disponibile */ }
    applyLang(false);
  });

  /* ================= Testo in maschera ================= */
  function splitEl(el, revealed) {
    if (el.classList.contains('is-split')) return;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('i'); i.textContent = p; w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && !ch.classList.contains('w')) walk(ch);
      });
    };
    walk(el); el.classList.add('is-split');
    if (revealed) el.dataset.shown = '1';
    else if (HAS_GSAP && !RM) gsap.set($$('.w > i', el), { yPercent: 115 });
    fitGrad(el);
  }
  function fitGrad(el) {
    $$('.grad, .grad-d', el).forEach((g) => {
      const R = g.getBoundingClientRect();
      $$('.w', g).forEach((w) => { const r = w.getBoundingClientRect(); const i = w.firstChild; i.style.backgroundSize = R.width + 'px ' + r.height + 'px'; i.style.backgroundPosition = -(r.left - R.left) + 'px 0'; });
    });
  }
  function revealSplit(el, delay) {
    if (el.dataset.shown) return; el.dataset.shown = '1';
    const words = $$('.w', el); let top = null, line = -1;
    const lines = words.map((w) => { const t = Math.round(w.offsetTop); if (top === null || Math.abs(t - top) > 6) { line++; top = t; } return line; });
    $$('.w > i', el).forEach((i, k) => gsap.to(i, { yPercent: 0, duration: 0.7, ease: 'expo.out', delay: (delay || 0) + lines[k] * 0.06 + k * 0.008 }));
  }

  /* ================= Controllo fatture ================= */
  const ROWS = [
    ['INV 2291', '1240,00', '1240,00'], ['INV 2292', '318,50', '318,50'], ['INV 2293', '80,52', '74,52'],
    ['INV 2294', '2015,30', '2015,30'], ['INV 2295', '96,10', '96,10'], ['INV 2296', '412,00', null],
    ['INV 2297', '57,80', '57,80'], ['INV 2298', '730,00', '730,00'], ['INV 2299', '129,90', '129,90'],
    ['INV 2300', '44,00', '44,00'], ['INV 2301', '1880,00', '1867,60'], ['INV 2302', '265,40', '265,40']
  ];
  const money = (s) => { const [a, b] = s.split(','); return '€ ' + a.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.') + (lang === 'en' ? '.' : ',') + b; };
  let rowEls = [], flowOff = 0;
  function buildRows() {
    const track = $('#flow-track'); if (!track) return;
    track.innerHTML = '';
    rowEls = ROWS.concat(ROWS).map((r) => {
      let e, diff = true;
      if (r[2] === null) e = lang === 'en' ? 'order missing' : 'ordine mancante';
      else if (r[1] !== r[2]) { const dv = (parseFloat(r[1].replace(',', '.')) - parseFloat(r[2].replace(',', '.'))).toFixed(2).replace('.', ','); e = (dv[0] === '-' ? '− ' : '+ ') + money(dv.replace('-', '')); }
      else { e = (lang === 'en' ? 'match' : 'uguale') + ' ✓'; diff = false; }
      const el = document.createElement('div'); el.className = 'row'; el.dataset.diff = diff ? '1' : ''; el.dataset.res = e;
      el.innerHTML = '<span>' + r[0] + '</span><span>' + money(r[1]) + '</span><span class="e"><b class="pend">···</b></span>';
      track.appendChild(el); return el;
    });
    flowState(flowOff);
  }
  function flowState(off) {
    const win = $('.flow-win'); if (!win || !rowEls.length) return;
    const H = win.clientHeight, rh = rowEls[0].offsetHeight || 36, half = ROWS.length * rh;
    off = ((off % half) + half) % half;
    $('#flow-track').style.transform = 'translate3d(0,' + (-off) + 'px,0)';
    rowEls.forEach((el, k) => {
      const passed = k * rh - off + rh / 2 < H * 0.5;
      if (el._p !== passed) { el._p = passed; el.lastChild.innerHTML = passed ? el.dataset.res : '<b class="pend">···</b>'; }
      el.classList.toggle('ok', passed && !el.dataset.diff);
      el.classList.toggle('diff', passed && !!el.dataset.diff);
    });
  }

  /* ================= Mini orbita del secondo cervello ================= */
  function buildGraph() {
    const svg = $('#graph-lines'), nodes = $('#nodes'); if (!svg || !nodes) return;
    let html = '<circle class="ring" cx="150" cy="150" r="128"/>', li = '';
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2; const x = 150 + 128 * Math.sin(a), y = 150 - 128 * Math.cos(a);
      html += '<line class="lk" pathLength="1" x1="150" y1="150" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
      html += '<line class="fl" x1="150" y1="150" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" style="animation-delay:' + (-k * 0.31) + 's"/>';
      li += '<li style="left:' + (x / 3).toFixed(2) + '%;top:' + (y / 3).toFixed(2) + '%">' + (k + 1) + '</li>';
    }
    svg.innerHTML = html; nodes.innerHTML = li;
  }

  /* ================= Hero: 4 finestre equilibrate ================= */
  const cards = ['.k1', '.k2', '.k3', '.k4'].map((s) => $(s));
  const SX = [-1, 1, -1, 1], SY = [-1, -1, 1, 1], Z = [30, -10, -30, 50];
  const st = { p: 0, mx: 0, my: 0, tx: 0, ty: 0, kk: cards.map(() => ({ v: 0 })), hov: -1, h: [0, 0, 0, 0], t: 0, hx: [0, 0, 0, 0], hy: [0, 0, 0, 0] };
  function deckRender() {
    const area = $('#deck-area'); const W = area.clientWidth, H = area.clientHeight;
    st.mx += (st.tx - st.mx) * 0.06; st.my += (st.ty - st.my) * 0.06; st.t += 0.016;
    const mob = window.innerWidth <= 900; const p = st.p * (mob ? 0.4 : 1);
    $('#deck').style.transform = 'rotateX(' + (8 + 6 * p - st.my * 5) + 'deg) rotateY(' + (-14 - 6 * p + st.mx * 7) + 'deg)';
    cards.forEach((c, i) => {
      st.h[i] += ((st.hov === i ? 1 : 0) - st.h[i]) * 0.12;
      const k = st.kk[i].v; const fl = RM ? 0 : Math.sin(st.t * 0.9 + i * 1.7) * 5;
      const x = SX[i] * p * 0.05 * W + st.mx * 6 * (i % 2 ? 1 : -1);
      const y = SY[i] * p * 0.06 * H + fl + (1 - k) * 160;
      const z = Z[i] + p * Z[i] * 2 + st.h[i] * 60 - (1 - k) * 300;
      c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateX(' + ((1 - k) * 30 - st.hy[i] * 9).toFixed(2) + 'deg) rotateY(' + (st.hx[i] * 11).toFixed(2) + 'deg)';
      c.style.opacity = Math.min(1, k * 1.4);
    });
  }

  /* ================= Avvio comune ================= */
  applyLang(RM || !HAS_GSAP ? 'static' : true);
  buildRows(); buildGraph(); bgScroll();

  /* ================= Numeri dell'hero: caselle con bordo che si disegna e cifre a rulli ================= */
  const odoFigs = $$('#figs .fig');
  let odoTL = null, odoDone = false;
  function buildOdo() {
    odoFigs.forEach((fig, fi) => {
      const n = $('.odo', fig); const to = +n.dataset.to;
      const txt = (n.dataset.pre || '') + fmt(to, 0) + (n.dataset.suf || '');
      let html = '<span class="sr">' + txt + '</span><span class="od-vis" aria-hidden="true" style="display:inline-flex">';
      for (const ch of txt) {
        if (/\d/.test(ch)) {
          let cells = ''; for (let k = 0; k < 20; k++) cells += '<span>' + (k % 10) + '</span>';
          html += '<span class="od-col"><span class="od-strip" data-t="' + (10 + +ch) + '">' + cells + '</span></span>';
        } else html += '<span class="od-static' + (ch === '~' ? ' od-pre' : ch === '+' ? ' od-suf' : '') + '">' + ch + '</span>';
      }
      n.innerHTML = html + '</span>';
      let svg = $('.fig-edge', fig);
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'fig-edge'); svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = '<defs><linearGradient id="oge' + fi + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22e3ff"/><stop offset="1" stop-color="#8b6bff"/></linearGradient></defs><rect pathLength="1" stroke="url(#oge' + fi + ')"/>';
        fig.prepend(svg);
      }
      sizeEdge(fig);
      const strips = $$('.od-strip', n);
      if (odoDone || RM || !HAS_GSAP) { fig.classList.add('done'); strips.forEach((st2) => { st2.style.transform = 'translateY(-' + (+st2.dataset.t * 5) + '%)'; }); }
    });
  }
  function sizeEdge(fig) {
    const svg = $('.fig-edge', fig); if (!svg) return;
    const w = fig.offsetWidth, h = fig.offsetHeight; svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    const r = $('rect', svg); r.setAttribute('x', 0.7); r.setAttribute('y', 0.7); r.setAttribute('width', Math.max(0, w - 1.4)); r.setAttribute('height', Math.max(0, h - 1.4));
    r.setAttribute('rx', parseFloat(getComputedStyle(fig).borderTopLeftRadius) || 16);
    if (odoDone || RM || !HAS_GSAP) { r.style.strokeDasharray = 1; r.style.strokeDashoffset = 0; r.style.opacity = 0.55; }
  }
  if (window.ResizeObserver) { const ro = new ResizeObserver((en) => en.forEach((e) => sizeEdge(e.target))); odoFigs.forEach((f) => ro.observe(f)); }
  else window.addEventListener('resize', () => odoFigs.forEach(sizeEdge));
  buildOdo();
  $('#lang').addEventListener('click', () => { odoDone = true; if (odoTL) odoTL.progress(1); buildOdo(); });
  function playOdo(delay) {
    if (!HAS_GSAP || RM) return;
    if (odoTL) { if (odoTL.time() < odoTL._start) odoTL.time(odoTL._start); return; }
    odoTL = gsap.timeline({ delay: 0, onComplete: () => { odoDone = true; } });
    odoTL._start = delay; odoTL.to({}, { duration: delay });
    odoFigs.forEach((fig, i) => {
      const t0 = delay + i * 0.1;
      const rect = $('.fig-edge rect', fig);
      gsap.set(rect, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1 });
      odoTL.fromTo(fig, { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' }, t0);
      odoTL.to(rect, { strokeDashoffset: 0, duration: 0.75, ease: 'power2.inOut' }, t0 + 0.05);
      odoTL.to(rect, { opacity: 0.55, duration: 0.4, ease: 'power1.out' }, t0 + 0.8);
      const strips = $$('.od-strip', fig);
      strips.forEach((st2, j) => {
        const back = strips.length - 1 - j;
        odoTL.fromTo(st2, { yPercent: 0 }, { yPercent: -(+st2.dataset.t * 5), duration: 0.7 + back * 0.06, ease: 'power3.out' }, t0 + 0.1 + j * 0.03);
      });
      odoTL.fromTo($('.fig-l', fig), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, t0 + 0.25);
      odoTL.call(() => { fig.classList.add('glow', 'done'); setTimeout(() => fig.classList.remove('glow'), 650); }, null, t0 + 0.95);
    });
  }
  if (HAS_GSAP && !RM) { gsap.set(odoFigs, { opacity: 0 }); gsap.set($$('#figs .fig-l'), { opacity: 0 }); }
  (function flowLoop() {
    if (RM) { flowOff = 4 * 36; flowState(flowOff); return; }
    let vis = false, last = 0;
    new IntersectionObserver((e) => { vis = e[0].isIntersecting; }).observe($('#flow'));
    const tick = (now) => { const dt = Math.min(64, now - (last || now)); last = now; if (vis) { flowOff += dt * 0.028; flowState(flowOff); } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  })();

  if (!HAS_GSAP || RM) {
    root.classList.add('no-intro'); $('#intro').classList.add('gone');
    $$('.rv, .hr').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    st.kk.forEach((o) => { o.v = 1; }); deckRender();
    $('#graph').classList.add('live'); $$('#graph-lines .lk').forEach((l) => { l.style.strokeDasharray = 1; l.style.strokeDashoffset = 0; });
    $$('.tl-i').forEach((i) => i.classList.add('lit')); $('#tl').style.setProperty('--p', 1);
    return;
  }

  /* ================= Lenis + ScrollTrigger ================= */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', () => { ScrollTrigger.update(); bgScroll(); });
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); const t = id === '#top' ? 0 : $(id); if (t === null) return;
    e.preventDefault(); if (lenis) lenis.scrollTo(t, { duration: 1.3, offset: id === '#top' ? 0 : -80 }); else window.scrollTo(0, t ? t.offsetTop : 0);
  }));

  /* intro */
  let seen = false; try { seen = sessionStorage.getItem('av-intro') === '1'; } catch (e) { /* */ }
  const intro = $('#intro');
  if (lenis) lenis.stop();
  const done = () => { intro.classList.add('gone'); if (lenis) lenis.start(); try { sessionStorage.setItem('av-intro', '1'); } catch (e) { /* */ } };
  if (seen) { done(); heroIn(0.1); playOdo(0.05); }
  else {
    const cnt = { v: 0 };
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: done });
    tl.from('.intro-logo span', { yPercent: 110, duration: 0.7, stagger: 0.07 })
      .to('#intro-bar', { scaleX: 1, duration: 0.95, ease: 'power2.inOut' }, 0.1)
      .to(cnt, { v: 100, duration: 0.95, ease: 'power2.inOut', onUpdate: () => { $('#intro-n').textContent = String(Math.round(cnt.v)).padStart(3, '0'); } }, 0.1)
      .to('.intro-core', { y: -30, opacity: 0, duration: 0.45, ease: 'power2.in' }, 1.05)
      .to(intro, { yPercent: -100, borderBottomLeftRadius: '50% 22vh', borderBottomRightRadius: '50% 22vh', duration: 0.85, ease: 'power3.inOut' }, 1.15)
      .add(() => heroIn(0), 1.3);
    playOdo(0.6);
    const skip = () => { if (tl.progress() < 1) tl.progress(1); playOdo(0); };
    $('#intro-skip').addEventListener('click', skip); intro.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true }); window.addEventListener('wheel', skip, { once: true, passive: true });
  }
  function heroIn(d) {
    revealSplit($('#top h1'), d + 0.05);
    gsap.to('.hero .hr', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: d + 0.25 });
    st.kk.forEach((o, i) => gsap.to(o, { v: 1, duration: 1.5, ease: 'expo.out', delay: d + 0.15 + i * 0.09 }));
  }

  /* hero deck */
  let heroVis = true;
  ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom top', onUpdate: (s) => { st.p = s.progress; }, onToggle: (s) => { heroVis = s.isActive || window.scrollY < 10; } });
  gsap.ticker.add(() => { if (heroVis) deckRender(); });
  if (FINE) {
    window.addEventListener('pointermove', (e) => { st.tx = (e.clientX / window.innerWidth) * 2 - 1; st.ty = (e.clientY / window.innerHeight) * 2 - 1; });
    cards.forEach((c, i) => { c.addEventListener('pointerenter', () => { st.hov = i; }); c.addEventListener('pointerleave', () => { if (st.hov === i) st.hov = -1; }); });
  }
  deckRender();

  /* finestre: entrano dalla profondità ruotando, poi si inclinano col mouse */
  /* coreografia: nella stessa riga la finestra principale parte prima e viaggia di più, la seconda segue più corta */
  const wins = $$('.wn');
  wins.forEach((w, i) => {
    const prev = wins[i - 1];
    const second = !!prev && Math.abs(prev.offsetTop - w.offsetTop) < 4;
    gsap.fromTo(w, { rotateX: second ? 9 : 13, y: second ? 44 : 72, z: second ? -100 : -160, opacity: 0, transformPerspective: 1400, transformOrigin: '50% 100%' },
      { rotateX: 0, y: 0, z: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: w, start: second ? 'top 98%' : 'top 100%', end: second ? 'center 90%' : 'center 92%', scrub: true } });
    const b = $('.wn-body', w); b.style.setProperty('--fd', (8 + (i * 1.7) % 4).toFixed(1) + 's'); b.style.setProperty('--fdl', (-i * 1.3).toFixed(1) + 's');
  });
  /* parallasse leggera delle finestre rispetto allo sfondo (solo desktop): proprietà translate, indipendente dalle altre trasformazioni */
  const PF = [0.6, -0.6, -0.5, 0.5, 0.35, -0.3];
  let wTops = [];
  const measureWins = () => { wTops = wins.map((w) => { let t = 0, n = w; while (n) { t += n.offsetTop; n = n.offsetParent; } return t + w.offsetHeight / 2; }); };
  measureWins(); window.addEventListener('load', measureWins); window.addEventListener('resize', measureWins);
  gsap.ticker.add(() => {
    if (window.innerWidth <= 900) return;
    const mid = window.scrollY + window.innerHeight / 2;
    wins.forEach((w, i) => {
      const v = Math.max(-16, Math.min(16, (wTops[i] - mid) * 0.03 * (PF[i] || 0)));
      const r = v.toFixed(1); if (w._px !== r) { w._px = r; w.style.translate = '0 ' + r + 'px'; }
    });
  });

  /* reveal */
  $$('.split').forEach((el) => { if (el.closest('#top')) return; ScrollTrigger.create({ trigger: el, start: 'top 100%', once: true, onEnter: () => revealSplit(el, 0) }); });
  ScrollTrigger.batch('.rv', { start: 'top 100%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 }) });

  /* contatori */
  $$('.count').forEach((el) => {
    const to = +el.dataset.to, dec = +(el.dataset.dec || 0);
    el.textContent = fmt(0, dec);
    const win = el.closest('.wn');
    if (!win) {
      ScrollTrigger.create({ trigger: el, start: 'top 100%', once: true, onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, { v: to, duration: to > 1000 ? 1.8 : 1.2, delay: el.closest('#top') ? 1.3 : 0, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v, dec); }, onComplete: () => { el.dataset.done = '1'; el.textContent = fmt(to, dec); } });
      } });
      return;
    }
    /* dentro le finestre il conteggio segue lo scroll: finito quando il centro della finestra arriva al 70% dello schermo */
    ScrollTrigger.create({ trigger: win, start: 'top 100%', end: 'center 84%', onUpdate: (s) => {
      if (el.dataset.done) return;
      const k = 1 - Math.pow(1 - s.progress, 3);
      el.textContent = fmt(to * k, dec);
      if (s.progress >= 0.999) { el.dataset.done = '1'; el.textContent = fmt(to, dec); }
    }, onLeave: () => { el.dataset.done = '1'; el.textContent = fmt(to, dec); } });
  });

  /* mini orbita che si costruisce */
  gsap.set('#graph-lines .lk', { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set('#nodes li', { scale: 0, opacity: 0 });
  const gtl = gsap.timeline({ scrollTrigger: { trigger: '#cervelli', start: 'top 100%', end: 'center 84%', scrub: 0.2, onUpdate: (s) => $('#graph').classList.toggle('live', s.progress > 0.95) } });
  $$('#graph-lines .lk').forEach((l, k) => { gtl.to(l, { strokeDashoffset: 0, duration: 0.5, ease: 'none' }, k * 0.1); gtl.to($$('#nodes li')[k], { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, 0.3 + k * 0.1); });

  /* percorso */
  const tlItems = $$('.tl-i');
  ScrollTrigger.create({ trigger: '#percorso', start: 'top 100%', end: 'center 84%', onUpdate: (s) => {
    $('#tl').style.setProperty('--p', s.progress.toFixed(3));
    tlItems.forEach((it, k) => it.classList.toggle('lit', s.progress >= (k / (tlItems.length - 1)) * 0.98));
  } });

  /* nav: sparisce scendendo, torna salendo o vicino alla cima */
  let lastY = window.scrollY;
  const nav = $('#nav');
  const navCheck = () => {
    const y = window.scrollY, d = y - lastY;
    if (y < 40) nav.classList.remove('nav-hide');
    else if (d > 6) nav.classList.add('nav-hide');
    else if (d < -6) nav.classList.remove('nav-hide');
    if (Math.abs(d) > 6 || y < 40) lastY = y;
  };
  if (lenis) lenis.on('scroll', navCheck);
  window.addEventListener('scroll', navCheck, { passive: true });

  /* nav e barra */
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  $$('.nav-links a').forEach((a) => { const sec = $('#' + a.dataset.sec); if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('on', s.isActive) }); });

  /* cursore, magneti, inclinazioni (solo desktop) */
  if (FINE) {
    root.classList.add('has-cursor');
    const dot = $('.c-dot'), ring = $('.c-ring');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => {
      root.classList.add('cursor-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const t = e.target; if (!t.closest) return;
      ring.classList.toggle('big', !!t.closest('a, button'));
      root.classList.toggle('on-light', !!(t.closest('.light') && !t.closest('.tile.num, .vault, .yes')));
    });
    $$('.mag').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }), qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.25); qy((e.clientY - r.top - r.height / 2) * 0.35); });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' }));
    });
    $$('.wn').forEach((w) => {
      const b = $('.wn-body', w);
      w.addEventListener('pointermove', (e) => {
        const r = w.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        b.style.setProperty('--ty', ((px - 0.5) * 2.4).toFixed(2) + 'deg'); b.style.setProperty('--tx', ((0.5 - py) * 2.4).toFixed(2) + 'deg');
        b.style.setProperty('--gx', px * 100 + '%'); b.style.setProperty('--gy', py * 100 + '%');
      });
      w.addEventListener('pointerleave', () => { b.style.setProperty('--tx', '0deg'); b.style.setProperty('--ty', '0deg'); });
    });

    /* Hover premium sulle immagini: inclinazione con molla, immagine che si sposta dentro la cornice,
       riflesso che segue il cursore, bordo che si accende nel punto del cursore, ombra che si sposta,
       scorrimento degli screenshot lunghi. Solo transform/opacity sull'immagine e sul riflesso; il loop gira solo durante l'hover. */
    function hover3d(host, opt) {
      const frame = opt.frame ? $(opt.frame, host) : host;
      const img = frame ? $('img', frame) : null;
      const glare = document.createElement('span'); glare.className = 'hx-glare'; glare.setAttribute('aria-hidden', 'true');
      const edge = document.createElement('span'); edge.className = 'hx-edge'; edge.setAttribute('aria-hidden', 'true');
      host.appendChild(glare); host.appendChild(edge);
      const long = !!img && (+img.getAttribute('height') / +img.getAttribute('width')) > 1.2;
      let tx = 0, ty = 0, cx = 0, cy = 0, on = 0, ca = 0, sc = 0, px = 0.5, py = 0.5, raf = 0;
      const loop = () => {
        cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1; ca += (on - ca) * (on ? 0.12 : 0.08);
        if (long) { const lim = img.offsetHeight - frame.clientHeight; const target = on ? -Math.max(0, lim) : 0; sc += (target - sc) * (on ? 0.012 : 0.09); }
        if (opt.deck != null) { st.hx[opt.deck] = cx; st.hy[opt.deck] = cy; }
        else host.style.transform = 'perspective(900px) rotateX(' + (-cy * opt.max).toFixed(2) + 'deg) rotateY(' + (cx * opt.max).toFixed(2) + 'deg)';
        host.style.filter = ca > 0.01 ? 'drop-shadow(' + (-cx * 14).toFixed(1) + 'px ' + (16 + cy * 10).toFixed(1) + 'px 22px rgba(5,8,18,' + (0.38 * ca).toFixed(3) + '))' : '';
        if (img) img.style.transform = 'translate3d(' + (-cx * 9).toFixed(1) + 'px,' + (long ? sc : -cy * 7).toFixed(1) + 'px,0) scale(' + (1 + 0.06 * ca).toFixed(4) + ')';
        glare.style.transform = 'translate3d(' + ((px - 0.5) * 50).toFixed(2) + '%,' + ((py - 0.5) * 50).toFixed(2) + '%,0)';
        glare.style.opacity = (ca * 0.95).toFixed(3); edge.style.opacity = ca.toFixed(3);
        edge.style.setProperty('--ex', (px * 100).toFixed(1) + '%'); edge.style.setProperty('--ey', (py * 100).toFixed(1) + '%');
        if (!on && Math.abs(cx) + Math.abs(cy) + ca + Math.abs(sc) < 0.004) {
          raf = 0; host.style.filter = ''; if (opt.deck == null) host.style.transform = ''; if (img) img.style.transform = '';
          if (opt.deck != null) { st.hx[opt.deck] = 0; st.hy[opt.deck] = 0; }
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
      host.addEventListener('pointerenter', () => { on = 1; kick(); });
      host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height; tx = (px - 0.5) * 2; ty = (py - 0.5) * 2; kick(); });
      host.addEventListener('pointerleave', () => { on = 0; tx = 0; ty = 0; kick(); });
    }
    cards.forEach((c, i) => hover3d(c, { deck: i }));
    $$('.shot.hx').forEach((el) => hover3d(el, { frame: '.shot-img', max: 6 }));
    $$('.tile.hx').forEach((el) => hover3d(el, { frame: '.t-img', max: 9 }));
  }

  const refresh = () => { $$('.split').forEach(fitGrad); ScrollTrigger.refresh(); bgScroll(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
  window.addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(() => $$('.split').forEach(fitGrad), 150); });
})();
