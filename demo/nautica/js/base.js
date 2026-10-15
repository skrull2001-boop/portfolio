/*
 * Demo cliccabile "gestionale rimessaggio e cantiere nautico": utilità, componenti e regole comuni.
 * Statica: nessun server, nessuna chiamata di rete. Lo stato vive in memoria
 * e si azzera ricaricando la pagina. Le viste stanno nei file v-*.js.
 */
(function () {
  'use strict';
  var C = window.CONFIG, D = window.DATI, OGGI = window.DEMO.OGGI;
  var A = window.A = { viste: {}, azioni: {}, input: [], change: [] };

  /* ---------- utilità ---------- */
  A.$ = function (s, el) { return (el || document).querySelector(s); };
  A.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  A.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  A.fmt = function (d) { return d ? d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'; };
  A.fmtBreve = function (d) { return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }); };
  A.fmtGiorno = function (d) { return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }); };
  A.giorni = function (d) { return Math.round((d - OGGI) / 86400000); };
  A.piu = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
  A.rel = function (d) {
    var n = A.giorni(d);
    if (n === 0) return 'oggi'; if (n === 1) return 'domani'; if (n === -1) return 'ieri';
    return n > 0 ? 'tra ' + n + ' giorni' : 'da ' + (-n) + ' giorni';
  };
  A.livello = function (n) { return n < 0 ? 'danger' : n <= 7 ? 'warn' : n <= 30 ? 'info' : 'ok'; };
  // formato italiano con il punto delle migliaia anche sotto 10.000 (toLocaleString non lo mette)
  A.num = function (n, dec) {
    var neg = n < 0, p = Math.abs(n).toFixed(dec || 0).split('.');
    return (neg ? '-' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (p[1] ? ',' + p[1] : '');
  };
  A.eur = function (n) { return A.num(n, 2) + ' €'; };
  A.eur0 = function (n) { return A.num(n) + ' €'; };
  A.pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  A.toISO = function (d) { return d ? d.getFullYear() + '-' + A.pad(d.getMonth() + 1) + '-' + A.pad(d.getDate()) : ''; };
  A.fromISO = function (s) { if (!s) return null; var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  A.iniziali = function (s) { return s.replace(/\b(srl|snc|spa|sas)\b/ig, '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); };
  A.minuti = function (o) { var p = o.split(':'); return +p[0] * 60 + +p[1]; };

  function trova(lista, k, v) { return lista.filter(function (x) { return x[k] === v; })[0]; }
  A.barca = function (id) { return trova(D.barche, 'id', id); };
  A.armatore = function (id) { return trova(D.armatori, 'id', id); };
  A.armatoreDi = function (b) { return A.armatore(b.armatore); };
  A.articolo = function (cod) { return trova(D.magazzino, 'cod', cod); };
  A.lavoro = function (id) { return trova(D.lavori, 'id', id); };
  A.contrattoDi = function (bid) { return trova(D.contratti, 'barca', bid); };
  A.area = function (posto) { return trova(C.aree, 'id', posto[0]); };
  A.postoLabel = function (posto) { return A.area(posto).nome + ' · posto ' + (+posto.slice(2)); };

  /* ---------- icone ---------- */
  var ICON = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    barca: '<path d="M3 15h18l-3 5H6z"/><path d="M12 3v10M12 4l6 8h-6"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    lavori: '<path d="M14.5 6.5a4 4 0 00-5.3 5.3L3 18l3 3 6.2-6.2a4 4 0 005.3-5.3l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    contratti: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    magazzino: '<path d="M3 8l9-5 9 5v12H3z"/><path d="M7 20v-8h10v8M7 15h10"/>',
    ia: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>',
    doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    camera: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13.5" r="3.5"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M6 14h12v7H6z"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    su: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    giu: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    euro: '<path d="M17 6.5A7 7 0 106.5 16"/><path d="M4 10h9M4 14h8"/>',
    msg: '<path d="M4 5h16v11H9l-5 4z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-6.5 8-6.5s7 2 8 6.5"/>'
  };
  A.ico = function (n, cls) { return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>'; };
  var ico = A.ico, esc = A.esc;

  /* ---------- componenti ---------- */
  A.logoHTML = function (cls) {
    var ini = '<span class="logo-ini ' + cls + '"' + (C.logo ? ' style="display:none"' : '') + '>' + esc(A.iniziali(C.nome)) + '</span>';
    if (!C.logo) return ini;
    return '<img class="logo ' + cls + '" src="' + esc(C.logo) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'">' + ini;
  };
  A.intestazione = function (titolo, sotto, azioni, indietro) {
    return '<header class="page-head">' + (indietro ? '<a class="back" href="' + indietro + '">' + ico('back') + 'Indietro</a>' : '') +
      '<div class="page-head-row"><div><h1>' + titolo + '</h1>' + (sotto ? '<p class="muted">' + sotto + '</p>' : '') + '</div>' +
      (azioni ? '<div class="actions">' + azioni + '</div>' : '') + '</div></header>';
  };
  A.kpi = function (label, val, sotto, icona, href, tono) {
    return '<a class="kpi' + (tono ? ' kpi-' + tono : '') + '" href="' + href + '"><span class="kpi-ico">' + ico(icona) + '</span><small>' + label + '</small><b>' + val + '</b><em>' + sotto + '</em></a>';
  };
  A.dl = function (k, v) { return '<dt>' + k + '</dt><dd>' + v + '</dd>'; };
  A.stepper = function (stati, cur) {
    var i = stati.map(function (s) { return s[0]; }).indexOf(cur);
    return '<ol class="stepper">' + stati.map(function (s, k) { return '<li class="' + (k < i ? 'done' : k === i ? 'cur' : '') + '"><span></span><em>' + s[1] + '</em></li>'; }).join('') + '</ol>';
  };
  A.toast = function (msg) {
    var t = A.$('#toast'); t.innerHTML = ico('check') + '<span>' + msg + '</span>'; t.classList.add('show');
    clearTimeout(A.toast.t); A.toast.t = setTimeout(function () { t.classList.remove('show'); }, 3400);
  };
  A.modale = function (html, largo) {
    var m = A.$('#modal');
    m.innerHTML = '<div class="modal-bg" data-act="chiudi"></div><div class="modal-box' + (largo ? ' largo' : '') + '" role="dialog" aria-modal="true"><button class="icon-btn modal-x" data-act="chiudi" aria-label="Chiudi">' + ico('x') + '</button>' + html + '</div>';
    m.hidden = false; document.body.classList.add('no-scroll');
  };
  A.chiudiModale = function () {
    var m = A.$('#modal'); if (m.hidden) return;
    m.hidden = true; m.innerHTML = ''; document.body.classList.remove('no-scroll');
  };
  A.stampa = function (html) {
    A.$('#print-root').innerHTML = html;
    document.body.classList.add('printing');
    setTimeout(function () { window.print(); }, 50);
  };
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing'); A.$('#print-root').innerHTML = ''; });
  A.docTesta = function (titolo, sotto) {
    return '<div class="doc-head">' + A.logoHTML('logo-doc') + '<div class="doc-az"><strong>' + esc(C.nome) + '</strong><span>' + esc(C.sede) + ' · P.IVA ' + esc(C.piva) + '</span><span>' + esc(C.telefono) + ' · ' + esc(C.email) + '</span></div></div>' +
      '<h1 class="doc-title">' + titolo + '</h1>' + (sotto ? '<p class="doc-sub">' + sotto + '</p>' : '');
  };
  A.galleria = function (foto, stamp, attr, add) {
    return '<div class="gallery">' + foto.map(function (f, k) { return '<button class="ph" data-act="foto" ' + attr + ' data-k="' + k + '">' + window.fotoSVG(f, stamp) + '</button>'; }).join('') +
      (add ? '<label class="ph ph-add">' + ico('camera') + '<span>Aggiungi foto</span><input type="file" accept="image/*" capture="environment" data-act="foto-add" ' + attr + ' hidden></label>' : '') + '</div>';
  };
  A.copia = function (testo) {
    try { navigator.clipboard.writeText(testo).then(function () { A.toast('Testo copiato: incollalo in WhatsApp o nell\'email.'); }, function () { A.toast('Seleziona il testo e copialo a mano.'); }); }
    catch (e) { A.toast('Seleziona il testo e copialo a mano.'); }
  };

  /* ---------- ordini di lavoro ---------- */
  A.STATI_L = [['bozza', 'Preventivo da preparare'], ['inviato', 'Attesa armatore'], ['approvato', 'Approvato'], ['incorso', 'In lavorazione'], ['finito', 'Da fatturare'], ['fatturato', 'Fatturato']];
  var TONO_L = { bozza: 'neutral', inviato: 'warn', approvato: 'info', incorso: 'brand', finito: 'ok', fatturato: 'neutral' };
  A.statoL = function (s) { return A.STATI_L.filter(function (x) { return x[0] === s; })[0][1]; };
  A.pillL = function (s) { return '<span class="pill pill-' + TONO_L[s] + '">' + A.statoL(s) + '</span>'; };
  A.aperto = function (l) { return l.stato !== 'fatturato'; };
  A.descRiga = function (r) { return r.k === 'ric' ? A.articolo(r.cod).desc : r.d; };
  A.umRiga = function (r) { var u = r.k === 'mano' ? 'ore' : r.k === 'ric' ? A.articolo(r.cod).um : (r.um || 'a corpo'); return r.q !== 1 && u === 'latta' ? 'latte' : u; };
  // prezzi delle righe: listino del magazzino per i ricambi, tariffa oraria per la manodopera
  D.lavori.forEach(function (l) { l.righe.forEach(function (r) { if (r.p == null) r.p = r.k === 'mano' ? C.tariffaOraria : A.articolo(r.cod).ven; }); });
  A.totLavoro = function (l) {
    var t = { mano: 0, ric: 0, corpo: 0, orePrev: 0 };
    l.righe.forEach(function (r) { t[r.k] += r.q * r.p; if (r.k === 'mano') t.orePrev += r.q; });
    t.imp = t.mano + t.ric + t.corpo; t.iva = t.imp * 0.22; t.tot = t.imp + t.iva;
    t.oreReg = l.ore.reduce(function (s, o) { return s + o.ore; }, 0);
    return t;
  };
  A.impegnato = function (cod) {
    return D.lavori.filter(function (l) { return l.stato === 'approvato' || l.stato === 'incorso'; }).reduce(function (s, l) {
      return s + l.righe.filter(function (r) { return r.k === 'ric' && r.cod === cod && !r.scaricato; }).reduce(function (t, r) { return t + r.q; }, 0);
    }, 0);
  };
  A.slug = (location.search.match(/[?&]a=([a-z0-9-]+)/i) || [0, 'cantiere'])[1].toLowerCase();
  A.linkArmatore = function (l) { return 'https://' + A.slug + '.preventivi.example/p/' + l.id.slice(-3) + 'K7Q'; };

  /* ---------- gru e scivolo ---------- */
  // problemi delle prenotazioni future: sovrapposizioni sulla stessa risorsa e barche oltre la portata
  A.problemi = function (p) {
    var out = [], b = A.barca(p.barca), R = C.risorse[p.ris];
    if (p.fatto) return out;
    if (b.peso > R.portata) out.push(b.nome + ' pesa ' + A.num(b.peso, 1) + ' t: ' + R.nome.toLowerCase() + ' fino a ' + A.num(R.portata, 1) + ' t');
    D.prenotazioni.forEach(function (q) {
      if (q !== p && !q.fatto && q.ris === p.ris && +q.data === +p.data && Math.abs(A.minuti(q.ora) - A.minuti(p.ora)) < R.durata)
        out.push('si sovrappone a ' + A.barca(q.barca).nome + ' alle ' + q.ora + ' (' + R.nome.toLowerCase() + ', ' + R.durata + ' min)');
    });
    return out;
  };
  A.prossimePren = function (giorniMax) {
    return D.prenotazioni.filter(function (p) { return !p.fatto && A.giorni(p.data) >= 0 && A.giorni(p.data) <= giorniMax; })
      .sort(function (a, b) { return a.data - b.data || A.minuti(a.ora) - A.minuti(b.ora); });
  };
  A.prenDi = function (bid) { return D.prenotazioni.filter(function (p) { return p.barca === bid && !p.fatto; })[0]; };

  /* ---------- contratti e incassi ---------- */
  A.rateScadute = function () {
    var out = [];
    D.contratti.forEach(function (c) { c.rate.forEach(function (r, k) { if (!r.pagata && r.scad < OGGI) out.push({ c: c, r: r, n: k + 1 }); }); });
    return out.sort(function (a, b) { return a.r.scad - b.r.scad; });
  };
  A.rateInArrivo = function (gmax) {
    var out = [];
    D.contratti.forEach(function (c) { c.rate.forEach(function (r, k) { if (!r.pagata && r.scad >= OGGI && A.giorni(r.scad) <= gmax) out.push({ c: c, r: r, n: k + 1 }); }); });
    return out.sort(function (a, b) { return a.r.scad - b.r.scad; });
  };
  A.inScadenza = function (gmax) { return D.contratti.filter(function (c) { return !c.rinnovo && A.giorni(c.fine) >= 0 && A.giorni(c.fine) <= gmax; }).sort(function (a, b) { return a.fine - b.fine; }); };
  A.daPagare = function (c) { return c.rate.filter(function (r) { return !r.pagata; }).reduce(function (s, r) { return s + r.imp; }, 0); };

  /* ---------- messaggi preparati (li invia l'ufficio, mai l'app da sola) ---------- */
  A.msgPreventivo = function (l) {
    var b = A.barca(l.barca), a = A.armatoreDi(b), t = A.totLavoro(l);
    if (a.lingua === 'de') return 'Guten Tag ' + a.nome + ',\nder Kostenvoranschlag für Ihr Boot ' + b.nome + ' ist bereit (' + l.titolo + ', Gesamtbetrag ' + A.eur(t.tot) + ' inkl. MwSt.).\nFotos und Details ansehen und freigeben:\n' + A.linkArmatore(l) + '\n\nMit freundlichen Grüßen\n' + C.nome;
    return 'Buongiorno ' + a.nome + ',\nè pronto il preventivo per ' + b.nome + ': ' + l.titolo.toLowerCase() + ', totale ' + A.eur(t.tot) + ' IVA inclusa.\nQui trova foto e dettagli e può approvarlo con un tocco:\n' + A.linkArmatore(l) + '\n\nGrazie, ' + C.nome;
  };
  A.msgSollecito = function (c, rata, n) {
    var b = A.barca(c.barca), a = A.armatoreDi(b), secondo = c.solleciti.length > 0;
    if (a.lingua === 'de') return 'Guten Tag ' + a.nome + ',\n' + (secondo ? 'wir erinnern Sie erneut' : 'wir möchten Sie freundlich erinnern') + ', dass die ' + n + '. Rate für den Liegeplatz von ' + b.nome + ' (' + A.eur(rata.imp) + ') am ' + A.fmt(rata.scad) + ' fällig war.\nIBAN: ' + C.iban + '\nFalls bereits bezahlt, betrachten Sie diese Nachricht bitte als gegenstandslos.\n\n' + C.nome;
    return 'Buongiorno ' + a.nome + ',\n' + (secondo ? 'le ricordiamo nuovamente' : 'le ricordiamo gentilmente') + ' che la ' + n + 'ª rata del contratto ' + c.id + ' per ' + b.nome + ' (' + A.eur(rata.imp) + ') era in scadenza il ' + A.fmt(rata.scad) + '.\nIBAN: ' + C.iban + ', causale "' + c.id + ' rata ' + n + '".\nSe ha già pagato, non tenga conto di questo messaggio.\n\n' + C.nome;
  };
})();
