/*
 * Demo cliccabile "gestionale cantieri amianto".
 * Statica: nessun server, nessuna chiamata di rete. Lo stato vive in memoria
 * e si azzera ricaricando la pagina.
 */
(function () {
  'use strict';
  var C = window.CONFIG, D = window.DATI, OGGI = window.DEMO.OGGI, gg = window.DEMO.gg;

  /* ---------- utilità ---------- */
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(d) { return d ? d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'; }
  function fmtBreve(d) { return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }); }
  function giorni(d) { return Math.round((d - OGGI) / 86400000); }
  function piu(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function rel(d) {
    var n = giorni(d);
    if (n === 0) return 'oggi'; if (n === 1) return 'domani'; if (n === -1) return 'ieri';
    return n > 0 ? 'tra ' + n + ' giorni' : 'scaduto da ' + (-n) + ' giorni';
  }
  function livello(n) { return n < 0 ? 'danger' : n <= 15 ? 'warn' : n <= 60 ? 'info' : 'ok'; }
  // formato italiano con il punto delle migliaia anche sotto 10.000 (toLocaleString non lo mette)
  function num(n, dec) {
    var neg = n < 0, p = Math.abs(n).toFixed(dec || 0).split('.');
    return (neg ? '-' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (p[1] ? ',' + p[1] : '');
  }
  function eur(n) { return num(n, 2) + ' €'; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toISO(d) { return d ? d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) : ''; }
  function fromISO(s) { if (!s) return null; var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function cantiere(id) { return D.cantieri.filter(function (c) { return c.id === id; })[0]; }
  function operaio(id) { return D.operai.filter(function (o) { return o.id === id; })[0]; }
  function iniziali(s) { return s.replace(/\b(srl|snc|spa|sas)\b/ig, '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }

  var ICON = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    cantieri: '<path d="M2 20h20"/><path d="M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/>',
    operai: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7"/><path d="M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
    rifiuti: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    preventivo: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    ia: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>',
    doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
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
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'
  };
  function ico(n, cls) { return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>'; }

  var STATI = [
    ['sopralluogo', 'Sopralluogo'], ['preventivo', 'Preventivo inviato'], ['piano', 'Piano da depositare'],
    ['depositato', 'Piano depositato'], ['incorso', 'Lavori in corso'], ['restituibilita', 'Restituibilità'], ['chiuso', 'Chiuso']
  ];
  function statoIdx(s) { for (var i = 0; i < STATI.length; i++) if (STATI[i][0] === s) return i; return 0; }
  function statoLabel(s) { return STATI[statoIdx(s)][1]; }
  var STATO_TONO = { sopralluogo: 'neutral', preventivo: 'neutral', piano: 'warn', depositato: 'info', incorso: 'brand', restituibilita: 'info', chiuso: 'ok' };
  function pillStato(s) { return '<span class="pill pill-' + STATO_TONO[s] + '">' + statoLabel(s) + '</span>'; }
  function gemaEntro(c) { return c.inizio ? piu(c.inizio, -30) : null; }

  /* ---------- scadenze e allarmi ---------- */
  function scadenze() {
    var out = [];
    D.cantieri.forEach(function (c) {
      if (c.stato === 'piano' && c.inizio) out.push({ tipo: 'GeMA', data: gemaEntro(c), titolo: 'Piano di lavoro su GeMA', sotto: c.id + ' · ' + c.comune, href: '#/piano/' + c.id });
    });
    D.operai.forEach(function (o) {
      out.push({ tipo: 'Corso', data: o.corso.agg, titolo: 'Aggiornamento corso amianto', sotto: o.nome, href: '#/operai/' + o.id });
      out.push({ tipo: 'Visita', data: o.visita.scad, titolo: 'Visita medica di idoneità', sotto: o.nome, href: '#/operai/' + o.id });
      if (o.quota) out.push({ tipo: 'Corso', data: o.quota, titolo: 'Corso lavori in quota e DPI III cat.', sotto: o.nome, href: '#/operai/' + o.id });
      if (o.ple) out.push({ tipo: 'Patentino', data: o.ple, titolo: 'Abilitazione PLE', sotto: o.nome, href: '#/operai/' + o.id });
    });
    D.fir.forEach(function (f) {
      if (!f.quarta) out.push({ tipo: 'FIR', data: piu(f.data, 90), titolo: '4ª copia del formulario', sotto: 'FIR ' + f.numero, href: '#/rifiuti' });
    });
    out.push({ tipo: 'Relazione', data: relazioneEntro(), titolo: 'Relazione annuale amianto', sotto: 'art. 9 L. 257/1992', href: '#/' });
    return out.sort(function (a, b) { return a.data - b.data; });
  }
  function relazioneEntro() { var y = OGGI.getMonth() < 2 ? OGGI.getFullYear() : OGGI.getFullYear() + 1; return new Date(y, 1, 28); }

  function allarmi() {
    var out = [];
    scadenze().forEach(function (s) {
      var n = giorni(s.data);
      if (s.tipo !== 'Relazione' && n <= 10) out.push({ liv: n < 0 ? 'danger' : 'warn', testo: s.titolo + ': ' + s.sotto, dett: (n < 0 ? 'Scaduto il ' : 'Entro il ') + fmt(s.data) + ' (' + rel(s.data) + ')', href: s.href });
    });
    // operai assegnati a cantieri che finiscono dopo la scadenza dei loro requisiti
    D.cantieri.forEach(function (c) {
      if (!c.inizio || c.stato === 'chiuso' || c.stato === 'restituibilita') return;
      var fine = piu(c.inizio, c.durata);
      c.squadra.forEach(function (id) {
        var o = operaio(id), motivi = [];
        if (o.corso.agg < fine) motivi.push('aggiornamento amianto ' + (giorni(o.corso.agg) < 0 ? 'scaduto' : 'in scadenza il ' + fmt(o.corso.agg)));
        if (o.visita.scad < fine) motivi.push('visita medica in scadenza il ' + fmt(o.visita.scad));
        if (motivi.length) out.push({ liv: giorni(o.corso.agg) < 0 ? 'danger' : 'warn', testo: o.nome + ' è in squadra su ' + c.id + ' (' + c.comune + ')', dett: motivi.join(' e ') + ': va rinnovato prima di fine lavori o sostituito nel piano', href: '#/cantiere/' + c.id });
      });
    });
    return out.sort(function (a, b) { return (a.liv === 'danger' ? 0 : 1) - (b.liv === 'danger' ? 0 : 1); });
  }

  function stampFoto(c) { return fmt(c.sopralluogo.data) + ' · ' + c.comune; }

  /* ---------- guscio ---------- */
  var NAV = [
    ['', 'Cruscotto', 'home'], ['cantieri', 'Cantieri', 'cantieri'], ['preventivo', 'Preventivo', 'preventivo'],
    ['operai', 'Operai', 'operai'], ['rifiuti', 'Rifiuti', 'rifiuti'], ['ia', 'Lettura IA', 'ia']
  ];
  function logoHTML(cls) {
    var ini = '<span class="logo-ini ' + cls + '"' + (C.logo ? ' style="display:none"' : '') + '>' + esc(iniziali(C.nome)) + '</span>';
    if (!C.logo) return ini;
    return '<img class="logo ' + cls + '" src="' + esc(C.logo) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'">' + ini;
  }
  function guscio() {
    document.title = C.nome + ' · Cantieri';
    document.documentElement.style.setProperty('--brand', C.colore);
    var links = NAV.map(function (n) { return '<a href="#/' + n[0] + '" data-nav="' + n[0] + '">' + ico(n[2]) + '<span>' + n[1] + '</span></a>'; }).join('');
    $('#side').innerHTML =
      '<div class="brand">' + logoHTML('logo-md') + '<div><strong>' + esc(C.nome) + '</strong><small>' + esc(C.sottotitolo) + '</small></div></div>' +
      '<nav class="side-nav">' + links + '</nav>' +
      '<div class="side-foot"><div class="user"><span class="avatar">' + esc(C.utente.nome[0]) + '</span><div><strong>' + esc(C.utente.nome) + '</strong><small>' + esc(C.utente.ruolo) + '</small></div></div>' +
      '<button class="demo-tag" data-act="info">' + ico('info') + 'Prototipo con dati inventati</button></div>';
    $('#top').innerHTML = '<div class="brand">' + logoHTML('logo-sm') + '<strong>' + esc(C.nome) + '</strong></div><button class="icon-btn" data-act="info" aria-label="Informazioni sulla demo">' + ico('info') + '</button>';
    $('#bottom').innerHTML = links;
  }

  /* ---------- componenti ---------- */
  function intestazione(titolo, sotto, azioni, indietro) {
    return '<header class="page-head">' + (indietro ? '<a class="back" href="' + indietro + '">' + ico('back') + 'Indietro</a>' : '') +
      '<div class="page-head-row"><div><h1>' + titolo + '</h1>' + (sotto ? '<p class="muted">' + sotto + '</p>' : '') + '</div>' +
      (azioni ? '<div class="actions">' + azioni + '</div>' : '') + '</div></header>';
  }
  function chipScad(label, d) {
    if (!d) return '<span class="chip chip-none">' + label + ': —</span>';
    var n = giorni(d);
    return '<span class="chip chip-' + livello(n) + '" title="' + label + ' ' + fmt(d) + '">' + label + ' <b>' + (n < 0 ? 'scaduto' : fmt(d)) + '</b></span>';
  }
  function stepper(stato) {
    var i = statoIdx(stato);
    return '<ol class="stepper">' + STATI.map(function (s, k) { return '<li class="' + (k < i ? 'done' : k === i ? 'cur' : '') + '"><span></span><em>' + s[1] + '</em></li>'; }).join('') + '</ol>';
  }
  function toast(msg) {
    var t = $('#toast'); t.innerHTML = ico('check') + '<span>' + msg + '</span>'; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }
  function modale(html, largo) {
    var m = $('#modal');
    m.innerHTML = '<div class="modal-bg" data-act="chiudi"></div><div class="modal-box' + (largo ? ' largo' : '') + '" role="dialog" aria-modal="true"><button class="icon-btn modal-x" data-act="chiudi" aria-label="Chiudi">' + ico('x') + '</button>' + html + '</div>';
    m.hidden = false; document.body.classList.add('no-scroll');
  }
  function chiudiModale() {
    var m = $('#modal'); if (m.hidden) return;
    m.hidden = true; m.innerHTML = ''; document.body.classList.remove('no-scroll');
    if (/^#\/operai\/./.test(location.hash)) history.replaceState(null, '', '#/operai');
  }
  function stampa(html) {
    $('#print-root').innerHTML = html;
    document.body.classList.add('printing');
    setTimeout(function () { window.print(); }, 50);
  }
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing'); $('#print-root').innerHTML = ''; });

  function infoDemo() {
    modale('<h2>Cosa è vero in questa demo</h2><p class="muted">Questa è una bozza dimostrativa per ' + esc(C.nome) + '. Serve a far vedere come lavorerebbe l\'app, non è ancora il prodotto.</p>' +
      '<div class="two"><div><h3>' + ico('check') + ' Funziona già così</h3><ul><li>Navigazione tra tutte le schermate, da computer e da telefono</li><li>Piano di lavoro precompilato con anteprima e stampa in PDF dal browser</li><li>Preventivo con calcolo delle superfici e del totale, stampabile</li><li>Allarmi calcolati dalle scadenze</li></ul></div>' +
      '<div><h3>' + ico('info') + ' Simulato</h3><ul><li>Tutti i dati: cantieri, persone, aziende e formulari sono inventati</li><li>La lettura dei documenti con l\'IA è un\'animazione</li><li>Nessun salvataggio: ricaricando la pagina si riparte</li><li>Nessun invio a GeMA o RENTRI: nell\'app vera si prepara il documento, il deposito resta all\'impresa</li></ul></div></div>');
  }

  /* ---------- 1. cruscotto ---------- */
  function vCruscotto() {
    var sc = scadenze(), al = allarmi();
    var attivi = D.cantieri.filter(function (c) { return c.stato !== 'chiuso'; });
    var inCorso = attivi.filter(function (c) { return c.stato === 'incorso'; }).length;
    var piani = D.cantieri.filter(function (c) { return c.stato === 'piano'; });
    var opScad = D.operai.filter(function (o) { return [o.corso.agg, o.visita.scad, o.quota, o.ple].some(function (d) { return d && giorni(d) <= 60; }); }).length;
    var firAperti = D.fir.filter(function (f) { return !f.quarta; }).length;
    var prossime = sc.filter(function (s) { return giorni(s.data) <= 60 || s.tipo === 'Relazione'; }).slice(0, 9);
    var ora = new Date().getHours();
    var saluto = ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';
    var anno = OGGI.getFullYear();
    var kgAnno = D.fir.filter(function (f) { return f.data.getFullYear() === anno; }).reduce(function (t, f) { return t + (f.kgDestino || f.kgStimati); }, 0);
    var nCantAnno = D.cantieri.filter(function (c) { return c.inizio && c.inizio.getFullYear() === anno && c.inizio <= OGGI; }).length;

    var h = intestazione(saluto + ', ' + esc(C.utente.nome), OGGI.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), '<a class="btn" href="#/ia">' + ico('ia') + 'Leggi un documento</a>');
    h += '<section class="kpis">' +
      kpi('Cantieri attivi', attivi.length, inCorso + ' con lavori in corso', 'cantieri', '#/cantieri') +
      kpi('Piani da caricare su GeMA', piani.length, piani.length ? 'primo entro il ' + fmt(gemaEntro(piani[0])) : 'nessuno', 'doc', piani.length ? '#/piano/' + piani[0].id : '#/cantieri', piani.length && giorni(gemaEntro(piani[0])) <= 7 ? 'warn' : '') +
      kpi('Operai con scadenze a 60 giorni', opScad + ' su ' + D.operai.length, 'corsi, visite, patentini', 'operai', '#/operai', opScad ? 'info' : '') +
      kpi('Formulari senza 4ª copia', firAperti, 'da ricevere entro 3 mesi', 'rifiuti', '#/rifiuti') +
      '</section>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('alert') + ' Allarmi</h2><span class="count">' + al.length + '</span></div>' +
      (al.length ? '<ul class="alarms">' + al.map(function (a) { return '<li><a class="alarm alarm-' + a.liv + '" href="' + a.href + '"><span class="dot"></span><div><strong>' + esc(a.testo) + '</strong><small>' + esc(a.dett) + '</small></div>' + ico('chev') + '</a></li>'; }).join('') + '</ul>' : '<p class="empty">Nessun allarme. Tutto in regola.</p>') + '</section>';
    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>' + ico('cal') + ' Prossime scadenze</h2><a class="link" href="#/operai">Operai</a></div><ul class="timeline">' +
      prossime.map(function (s) {
        var n = giorni(s.data);
        return '<li><a href="' + s.href + '"><span class="date date-' + livello(n) + '"><b>' + s.data.getDate() + '</b>' + s.data.toLocaleDateString('it-IT', { month: 'short' }) + '</span><div><strong>' + esc(s.titolo) + ' <span class="tag">' + s.tipo + '</span></strong><small>' + esc(s.sotto) + ' · ' + rel(s.data) + '</small></div></a></li>';
      }).join('') + '</ul></section>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('cantieri') + ' Cantieri attivi</h2><a class="link" href="#/cantieri">Tutti</a></div><ul class="cant-list">' +
      attivi.map(function (c) { return '<li>' + rigaCantiere(c) + '</li>'; }).join('') + '</ul></section></div>';
    h += '<section class="card relazione"><div><h2>' + ico('doc') + ' Relazione annuale amianto ' + anno + '</h2><p class="muted">Da trasmettere entro il ' + fmt(relazioneEntro()) + ' (' + rel(relazioneEntro()) + '). L\'app raccoglie i dati durante l\'anno.</p></div>' +
      '<div class="rel-nums"><div><b>' + nCantAnno + '</b><small>cantieri avviati</small></div><div><b>' + num(kgAnno) + ' kg</b><small>rifiuti con amianto</small></div><div><b>' + D.operai.length + '</b><small>lavoratori esposti</small></div></div></section>';
    return h;
  }
  function kpi(label, val, sotto, icona, href, tono) {
    return '<a class="kpi' + (tono ? ' kpi-' + tono : '') + '" href="' + href + '"><span class="kpi-ico">' + ico(icona) + '</span><small>' + label + '</small><b>' + val + '</b><em>' + sotto + '</em></a>';
  }
  function rigaCantiere(c) {
    var extra = '';
    if (c.stato === 'piano') { var n = giorni(gemaEntro(c)); extra = '<span class="mini mini-' + livello(n) + '">GeMA entro ' + fmtBreve(gemaEntro(c)) + '</span>'; }
    else if (c.inizio && c.inizio > OGGI) extra = '<span class="mini">Inizio ' + fmtBreve(c.inizio) + '</span>';
    else if (c.stato === 'incorso') extra = '<span class="mini mini-brand">Giorno ' + (giorni(OGGI) - giorni(c.inizio) + 1) + ' di ' + c.durata + '</span>';
    var pct = Math.round(statoIdx(c.stato) / (STATI.length - 1) * 100);
    return '<a class="cant" href="#/cantiere/' + c.id + '"><div class="cant-top"><span class="code">' + c.id + '</span>' + pillStato(c.stato) + '</div><strong>' + esc(c.titolo) + '</strong><small>' + ico('pin') + esc(c.comune) + ' (' + c.prov + ') · ' + num(c.mq) + ' mq</small>' +
      '<div class="cant-bot"><div class="bar"><span style="width:' + pct + '%"></span></div>' + extra + '</div></a>';
  }

  /* ---------- cantieri: elenco ---------- */
  var filtroCantieri = 'attivi';
  function vCantieri() {
    var lista = D.cantieri.filter(function (c) { return filtroCantieri === 'tutti' || (filtroCantieri === 'attivi' ? c.stato !== 'chiuso' : c.stato === filtroCantieri); });
    var h = intestazione('Cantieri', D.cantieri.length + ' commesse in archivio', '<button class="btn" data-act="demo-nuovo">' + ico('plus') + 'Nuovo cantiere</button>');
    h += '<div class="filters">' + [['attivi', 'Attivi'], ['sopralluogo', 'Sopralluogo'], ['piano', 'Piano da depositare'], ['incorso', 'In corso'], ['chiuso', 'Chiusi'], ['tutti', 'Tutti']].map(function (f) {
      return '<button class="filter' + (filtroCantieri === f[0] ? ' on' : '') + '" data-act="filtro-cant" data-v="' + f[0] + '">' + f[1] + '</button>';
    }).join('') + '</div>';
    h += '<ul class="cant-grid">' + lista.map(function (c) { return '<li>' + rigaCantiere(c) + '</li>'; }).join('') + '</ul>';
    if (!lista.length) h += '<p class="empty">Nessun cantiere in questo stato.</p>';
    return h;
  }

  /* ---------- 2. scheda cantiere ---------- */
  function documentiCantiere(c) {
    var i = statoIdx(c.stato), docs = [];
    docs.push({ nome: 'Rapporto di prova del campione (laboratorio)', st: 'ok', info: fmt(piu(c.sopralluogo.data, 6)) });
    docs.push({ nome: 'Preventivo', st: i >= 1 ? 'ok' : 'todo', info: i >= 1 ? (c.importo ? eur(c.importo) : 'inviato') : 'da preparare', href: i < 2 ? '#/preventivo/' + c.id : null });
    docs.push({ nome: 'Notifica preliminare (art. 250 D.Lgs. 81/2008)', st: i >= 3 ? 'ok' : i === 2 ? 'draft' : 'none', info: i >= 3 ? 'inviata' : i === 2 ? 'bozza pronta' : '—' });
    docs.push({ nome: 'Piano di lavoro (art. 256 D.Lgs. 81/2008)', st: i >= 3 ? 'ok' : i === 2 ? 'todo' : 'none', info: i >= 3 ? 'depositato su GeMA il ' + fmt(c.depositato) : i === 2 ? 'da generare e caricare' : '—', href: i >= 2 ? '#/piano/' + c.id : null });
    var nf = D.fir.filter(function (f) { return f.cantiere === c.id; }).length;
    docs.push({ nome: 'Formulari rifiuti (FIR)', st: nf ? 'ok' : 'none', info: nf ? nf + ' formulari' : '—', href: nf ? '#/rifiuti' : null });
    docs.push({ nome: 'Certificato di restituibilità', st: i === 6 ? 'ok' : i === 5 ? 'todo' : 'none', info: i === 6 ? 'ricevuto' : i === 5 ? 'in attesa dell\'ATS' : '—' });
    return docs;
  }
  var DOC_ST = { ok: ['ok', 'Presente'], draft: ['info', 'Bozza'], todo: ['warn', 'Da fare'], none: ['neutral', 'Non ancora'] };

  function vCantiere(id) {
    var c = cantiere(id); if (!c) return '<p class="empty">Cantiere non trovato.</p>';
    var s = c.sopralluogo, i = statoIdx(c.stato);
    var azioni = (i >= 2 ? '<a class="btn" href="#/piano/' + c.id + '">' + ico('doc') + 'Piano di lavoro</a>' : '<a class="btn" href="#/preventivo/' + c.id + '">' + ico('preventivo') + 'Preventivo</a>') +
      (c.stato !== 'chiuso' ? '<button class="btn btn-ghost" data-act="avanza" data-id="' + c.id + '">Avanza stato ' + ico('chev') + '</button>' : '');
    var h = intestazione(esc(c.titolo), '<span class="code">' + c.id + '</span> ' + pillStato(c.stato) + ' · ' + esc(c.committente), azioni, '#/cantieri');
    h += '<div class="card stepper-card">' + stepper(c.stato) + '</div>';

    var gema = '';
    if (c.stato === 'piano') {
      var n = giorni(gemaEntro(c));
      gema = '<div class="banner banner-' + livello(n) + '">' + ico('clock') + '<div><strong>Piano di lavoro da caricare su GeMA entro il ' + fmt(gemaEntro(c)) + ' (' + rel(gemaEntro(c)) + ')</strong><small>Inizio lavori previsto il ' + fmt(c.inizio) + ': servono almeno 30 giorni dal deposito.</small></div><a class="btn btn-sm" href="#/piano/' + c.id + '">Genera</a></div>';
    } else if (c.depositato && i < 4) {
      gema = '<div class="banner banner-ok">' + ico('check') + '<div><strong>Piano depositato su GeMA il ' + fmt(c.depositato) + '</strong><small>Lavori possibili dal ' + fmt(piu(c.depositato, 30)) + '. Inizio previsto il ' + fmt(c.inizio) + '.</small></div></div>';
    }
    h += gema;

    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>Dati del cantiere</h2></div><dl class="dl">' +
      dl('Committente', esc(c.committente)) + dl('Referente', esc(c.referente)) + dl('Indirizzo', esc(c.indirizzo) + ', ' + esc(c.comune) + ' (' + c.prov + ')') +
      dl('Intervento', esc(c.intervento)) + dl('Materiale', esc(c.materiale)) + dl('Superficie', num(c.mq) + ' mq · altezza ' + num(c.altezza, 1) + ' m') +
      dl('Inizio lavori', c.inizio ? fmt(c.inizio) + ' · ' + c.durata + ' giorni lavorativi' : 'da definire') + dl('Organo di vigilanza', c.ats) +
      (c.importo ? dl('Importo', eur(c.importo)) : '') + '</dl></section>';

    h += '<section class="card"><div class="card-head"><h2>Squadra</h2><span class="count">' + c.squadra.length + '</span></div>' +
      (c.squadra.length ? '<ul class="people">' + c.squadra.map(function (oid) {
        var o = operaio(oid), fine = c.inizio ? piu(c.inizio, c.durata) : OGGI;
        var ok = o.corso.agg >= fine && o.visita.scad >= fine;
        return '<li><a href="#/operai/' + o.id + '"><span class="avatar">' + iniziali(o.nome) + '</span><div><strong>' + esc(o.nome) + '</strong><small>' + esc(o.ruolo) + '</small></div><span class="pill pill-' + (ok ? 'ok' : 'danger') + '">' + (ok ? 'In regola' : 'Da verificare') + '</span></a></li>';
      }).join('') + '</ul>' : '<p class="empty">Squadra da assegnare dopo l\'accettazione del preventivo.</p>') + '</section></div>';

    h += '<section class="card"><div class="card-head"><h2>' + ico('camera') + ' Sopralluogo del ' + fmt(s.data) + '</h2><span class="muted">' + esc(s.tecnico) + '</span></div>' +
      '<div class="gallery">' + c.foto.map(function (f, k) { return '<button class="ph" data-act="foto" data-id="' + c.id + '" data-k="' + k + '">' + window.fotoSVG(f, stampFoto(c)) + '</button>'; }).join('') +
      '<label class="ph ph-add">' + ico('camera') + '<span>Aggiungi foto</span><input type="file" accept="image/*" capture="environment" data-act="foto-add" data-id="' + c.id + '" hidden></label></div>' +
      '<div class="grid-2 tight"><div><h3>Misure</h3><table class="tbl"><thead><tr><th>Falda</th><th class="r">L × l (m)</th><th class="r">Pend.</th><th class="r">mq reali</th></tr></thead><tbody>' +
      s.falde.map(function (f) { return '<tr><td>' + esc(f.nome) + '</td><td class="r">' + num(f.l, 1) + ' × ' + num(f.w, 1) + '</td><td class="r">' + f.p + '%</td><td class="r">' + num(supFalda(f), 1) + '</td></tr>'; }).join('') +
      '</tbody></table></div><div><h3>Note del tecnico</h3><dl class="dl"><dt>Stato delle lastre</dt><dd>' + esc(s.degrado) + '</dd><dt>Accesso</dt><dd>' + esc(s.accesso) + '</dd><dt>Note</dt><dd>' + esc(s.note) + '</dd></dl></div></div></section>';

    h += '<section class="card"><div class="card-head"><h2>' + ico('doc') + ' Documenti</h2></div><ul class="docs">' + documentiCantiere(c).map(function (d) {
      var st = DOC_ST[d.st], inner = ico('doc') + '<div><strong>' + d.nome + '</strong><small>' + d.info + '</small></div><span class="pill pill-' + st[0] + '">' + st[1] + '</span>';
      return '<li>' + (d.href ? '<a href="' + d.href + '">' + inner + ico('chev') + '</a>' : '<div class="doc-row">' + inner + '</div>') + '</li>';
    }).join('') + '</ul></section>';
    return h;
  }
  function dl(k, v) { return '<dt>' + k + '</dt><dd>' + v + '</dd>'; }
  function supFalda(f) { return f.l * f.w * Math.sqrt(1 + Math.pow(f.p / 100, 2)); }

  /* ---------- 3. piano di lavoro ---------- */
  var piani = {};
  function modelloPiano(c) {
    if (piani[c.id]) return piani[c.id];
    var kg = Math.round(c.mq * 15);
    piani[c.id] = {
      impresa: C.nome, sede: C.sede, albo: C.albo, datore: C.datoreLavoro, responsabile: C.responsabileTecnico,
      preposto: c.squadra[0] || '', committente: c.committente, indirizzo: c.indirizzo + ', ' + c.comune + ' (' + c.prov + ')', ats: c.ats,
      natura: c.intervento + '.', materiale: c.materiale, mq: c.mq, kg: kg, altezza: c.altezza,
      inizio: toISO(c.inizio), durata: c.durata, orario: '8:00-12:00 e 13:00-17:00, dal lunedì al venerdì',
      squadra: c.squadra.slice(),
      metodi: 'Delimitazione e segnalazione dell\'area. Incapsulamento preventivo delle lastre con prodotto di tipo C a bassa pressione. Smontaggio delle lastre intere senza frantumazione, svitando o tagliando i fissaggi con utensili manuali. Calo a terra con piattaforma elevabile o gru, senza far scivolare le lastre. Pulizia dei canali di gronda con aspiratore a filtro assoluto.',
      dpi: 'Facciali filtranti FFP3 o semimaschere con filtro P3, tute monouso di categoria III tipo 5-6, guanti e calzari. Unità di decontaminazione a tre stadi posta a terra vicino all\'area di lavoro, con doccia e filtrazione delle acque.',
      rifiuti: 'Lastre pallettizzate e imballate in doppio telo di polietilene, etichettate "a" (amianto). Deposito temporaneo in area recintata del cantiere. Trasporto con ' + C.trasportatore + ' verso ' + C.impianto + '.',
      cer: '17 06 05*',
      terzi: 'Area interdetta a persone non autorizzate. Comunicazione al committente degli orari di lavoro. Sospensione delle lavorazioni con vento forte. A fine lavori: pulizia, ispezione visiva e campionamento delle fibre aerodisperse per la restituibilità.'
    };
    return piani[c.id];
  }
  var CAMPI_PIANO = [
    ['Impresa', [['impresa', 'Ragione sociale'], ['sede', 'Sede'], ['albo', 'Iscrizione Albo Gestori Ambientali'], ['datore', 'Datore di lavoro'], ['responsabile', 'Responsabile tecnico']]],
    ['Committente e luogo', [['committente', 'Committente'], ['indirizzo', 'Indirizzo del cantiere'], ['ats', 'Organo di vigilanza']]],
    ['Lavori', [['natura', 'Natura dei lavori', 'area'], ['materiale', 'Materiale da rimuovere'], ['mq', 'Superficie (mq)', 'number'], ['kg', 'Quantità stimata (kg)', 'number'], ['altezza', 'Altezza di lavoro (m)', 'number']]],
    ['Tempi', [['inizio', 'Data di inizio', 'date'], ['durata', 'Durata (giorni lavorativi)', 'number'], ['orario', 'Orario di lavoro']]],
    ['Metodi e protezioni', [['metodi', 'Metodi di lavoro', 'area'], ['dpi', 'DPI e decontaminazione', 'area']]],
    ['Rifiuti e terzi', [['cer', 'Codice CER'], ['rifiuti', 'Gestione dei rifiuti', 'area'], ['terzi', 'Protezione di terzi e restituibilità', 'area']]]
  ];
  var vistaPiano = 'modulo';

  function vPiano(id) {
    var c = cantiere(id); if (!c) return '<p class="empty">Cantiere non trovato.</p>';
    var m = modelloPiano(c);
    var depositato = statoIdx(c.stato) >= 3;
    var azioni = '<button class="btn btn-ghost" data-act="stampa-piano" data-id="' + c.id + '">' + ico('print') + 'Stampa / PDF</button>' +
      (depositato ? '' : '<button class="btn" data-act="deposita" data-id="' + c.id + '">' + ico('upload') + 'Segna come caricato su GeMA</button>');
    var h = intestazione('Piano di lavoro', '<span class="code">' + c.id + '</span> · ' + esc(c.titolo) + ', ' + esc(c.comune), azioni, '#/cantiere/' + c.id);
    if (depositato) h += '<div class="banner banner-ok">' + ico('check') + '<div><strong>Piano già depositato su GeMA il ' + fmt(c.depositato) + '</strong><small>Le modifiche qui servono solo per una variante.</small></div></div>';
    else h += bannerGema(m);
    h += '<div class="seg seg-vista"><button data-act="vista-piano" data-v="modulo" class="' + (vistaPiano === 'modulo' ? 'on' : '') + '">Modulo</button><button data-act="vista-piano" data-v="anteprima" class="' + (vistaPiano === 'anteprima' ? 'on' : '') + '">Anteprima</button></div>';
    h += '<div class="split vista-' + vistaPiano + '"><form class="card form" id="form-piano" data-id="' + c.id + '" autocomplete="off"><p class="hint">' + ico('ia') + 'Campi precompilati da scheda cantiere, sopralluogo e anagrafica operai. Controlla e correggi.</p>';
    CAMPI_PIANO.forEach(function (sez) {
      h += '<fieldset><legend>' + sez[0] + '</legend>' + sez[1].map(function (f) {
        var v = m[f[0]], t = f[2] || 'text';
        var inp = t === 'area' ? '<textarea name="' + f[0] + '" rows="3">' + esc(v) + '</textarea>' : '<input name="' + f[0] + '" type="' + t + '" value="' + esc(v) + '"' + (t === 'number' ? ' step="any"' : '') + '>';
        return '<label class="' + (t === 'area' ? 'full' : '') + '"><span>' + f[1] + '</span>' + inp + '</label>';
      }).join('') + (sez[0] === 'Tempi' ? '' : '') + '</fieldset>';
      if (sez[0] === 'Tempi') {
        h += '<fieldset><legend>Lavoratori</legend><div class="full checks">' + D.operai.map(function (o) {
          var okc = giorni(o.corso.agg) >= 0, okv = giorni(o.visita.scad) >= 0;
          return '<label class="check"><input type="checkbox" name="squadra" value="' + o.id + '"' + (m.squadra.indexOf(o.id) >= 0 ? ' checked' : '') + '><span><strong>' + esc(o.nome) + '</strong><small>' + esc(o.corso.livello) + ' · ' + esc(o.visita.giudizio) + '</small></span>' +
            (okc && okv ? '<span class="pill pill-ok">In regola</span>' : '<span class="pill pill-danger">' + (!okc ? 'Corso scaduto' : 'Visita scaduta') + '</span>') + '</label>';
        }).join('') + '</div><label class="full"><span>Preposto in cantiere</span><select name="preposto">' + D.operai.map(function (o) { return '<option value="' + o.id + '"' + (m.preposto === o.id ? ' selected' : '') + '>' + esc(o.nome) + '</option>'; }).join('') + '</select></label></fieldset>';
      }
    });
    h += '</form><div class="preview-wrap"><div class="paper" id="anteprima-piano">' + docPiano(c, m) + '</div></div></div>';
    return h;
  }
  function bannerGema(m) {
    var ini = fromISO(m.inizio);
    if (!ini) return '<div class="banner banner-warn">' + ico('clock') + '<div><strong>Manca la data di inizio lavori</strong><small>Serve per calcolare il termine di deposito su GeMA.</small></div></div>';
    var entro = piu(ini, -30), n = giorni(entro);
    return '<div class="banner banner-' + livello(n) + '" id="banner-gema">' + ico('clock') + '<div><strong>Da caricare su GeMA entro il ' + fmt(entro) + ' (' + rel(entro) + ')</strong><small>30 giorni prima dell\'inizio lavori del ' + fmt(ini) + '. Se il termine è superato bisogna spostare la data di inizio.</small></div></div>';
  }
  function docTesta(titolo, sotto) {
    return '<div class="doc-head">' + logoHTML('logo-doc') + '<div class="doc-az"><strong>' + esc(C.nome) + '</strong><span>' + esc(C.sede) + ' · P.IVA ' + esc(C.piva) + '</span><span>' + esc(C.telefono) + ' · ' + esc(C.email) + '</span></div></div>' +
      '<h1 class="doc-title">' + titolo + '</h1>' + (sotto ? '<p class="doc-sub">' + sotto + '</p>' : '');
  }
  function docPiano(c, m) {
    var ini = fromISO(m.inizio), prep = operaio(m.preposto);
    var sez = function (n, t, body) { return '<h2>' + n + '. ' + t + '</h2>' + body; };
    var p = function (s) { return '<p>' + esc(s) + '</p>'; };
    var squadra = m.squadra.map(operaio);
    return docTesta('Piano di lavoro per la rimozione di materiali contenenti amianto', 'ai sensi dell\'art. 256 del D.Lgs. 81/2008 · Cantiere ' + c.id) +
      '<table class="doc-kv"><tr><th>Impresa esecutrice</th><td>' + esc(m.impresa) + ', ' + esc(m.sede) + '<br>' + esc(m.albo) + '</td></tr><tr><th>Datore di lavoro</th><td>' + esc(m.datore) + '</td></tr><tr><th>Responsabile tecnico</th><td>' + esc(m.responsabile) + '</td></tr><tr><th>Committente</th><td>' + esc(m.committente) + '</td></tr><tr><th>Luogo dei lavori</th><td>' + esc(m.indirizzo) + '</td></tr><tr><th>Organo di vigilanza</th><td>' + esc(m.ats) + '</td></tr></table>' +
      sez(1, 'Natura dei lavori', p(m.natura) + '<p>Materiale: ' + esc(m.materiale) + '. Superficie: <b>' + num(+m.mq || 0) + ' mq</b>, quantità stimata <b>' + num(+m.kg || 0) + ' kg</b>, altezza di lavoro ' + num(+m.altezza || 0, 1) + ' m.</p>') +
      sez(2, 'Data di inizio e durata', '<p>Inizio lavori: <b>' + (ini ? fmt(ini) : '—') + '</b>. Durata prevista: <b>' + esc(m.durata) + ' giorni lavorativi</b>. Orario: ' + esc(m.orario) + '.</p>') +
      sez(3, 'Lavoratori impiegati', '<table class="doc-tbl"><thead><tr><th>Nominativo</th><th>Mansione</th><th>Formazione amianto</th><th>Idoneità</th></tr></thead><tbody>' +
        (squadra.length ? squadra.map(function (o) { return '<tr><td>' + esc(o.nome) + '</td><td>' + esc(o.ruolo) + '</td><td>' + esc(o.corso.livello) + ', agg. fino al ' + fmt(o.corso.agg) + '</td><td>' + esc(o.visita.giudizio) + ' fino al ' + fmt(o.visita.scad) + '</td></tr>'; }).join('') : '<tr><td colspan="4">Nessun lavoratore selezionato</td></tr>') +
        '</tbody></table><p>Preposto in cantiere: ' + (prep ? esc(prep.nome) : '—') + '.</p>') +
      sez(4, 'Metodi di lavoro', p(m.metodi)) +
      sez(5, 'Dispositivi di protezione e decontaminazione', p(m.dpi)) +
      sez(6, 'Rifiuti', '<p>Codice CER ' + esc(m.cer) + '.</p>' + p(m.rifiuti)) +
      sez(7, 'Protezione di terzi e restituibilità', p(m.terzi)) +
      '<div class="doc-firme"><div>Il datore di lavoro<span>' + esc(m.datore) + '</span></div><div>Il responsabile tecnico<span>' + esc(m.responsabile) + '</span></div></div>' +
      '<p class="doc-foot">Bozza generata il ' + fmt(OGGI) + ' da dati inventati, a scopo dimostrativo. Il contenuto va verificato dal responsabile tecnico; il deposito su GeMA resta a cura dell\'impresa.</p>';
  }
  function aggiornaPiano(form) {
    var c = cantiere(form.getAttribute('data-id')), m = modelloPiano(c);
    $$('input, textarea, select', form).forEach(function (el) { if (el.name !== 'squadra') m[el.name] = el.value; });
    m.squadra = $$('input[name=squadra]:checked', form).map(function (el) { return el.value; });
    $('#anteprima-piano').innerHTML = docPiano(c, m);
    var b = $('#banner-gema'); if (b) b.outerHTML = bannerGema(m);
  }

  /* ---------- 4. operai ---------- */
  var filtroOperai = 'tutti';
  function scadenzeOperaio(o) { return [o.corso.agg, o.visita.scad, o.quota, o.ple].filter(Boolean); }
  function vOperai(apri) {
    var lista = D.operai.filter(function (o) {
      if (filtroOperai === 'scadenza') return scadenzeOperaio(o).some(function (d) { return giorni(d) <= 60; });
      if (filtroOperai === 'bloccati') return giorni(o.corso.agg) < 0 || giorni(o.visita.scad) < 0;
      return true;
    });
    var h = intestazione('Operai', 'Formazione, idoneità e abilitazioni della squadra', '<a class="btn btn-ghost" href="#/ia/attestato">' + ico('ia') + 'Carica un attestato</a>');
    h += '<div class="filters">' + [['tutti', 'Tutti'], ['scadenza', 'Scadenze entro 60 giorni'], ['bloccati', 'Non impiegabili']].map(function (f) { return '<button class="filter' + (filtroOperai === f[0] ? ' on' : '') + '" data-act="filtro-op" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>';
    h += '<div class="card table-card"><table class="tbl tbl-op"><thead><tr><th>Operaio</th><th>Corso amianto</th><th>Visita medica</th><th>Lavori in quota</th><th>PLE</th><th></th></tr></thead><tbody>' +
      lista.map(function (o) {
        var bloc = giorni(o.corso.agg) < 0 || giorni(o.visita.scad) < 0;
        return '<tr data-act="apri-op" data-id="' + o.id + '"><td><div class="person"><span class="avatar">' + iniziali(o.nome) + '</span><div><strong>' + esc(o.nome) + '</strong><small>' + esc(o.ruolo) + '</small></div></div></td>' +
          '<td data-l="Corso amianto">' + chipScad('Agg.', o.corso.agg) + '</td><td data-l="Visita medica">' + chipScad('Visita', o.visita.scad) + '</td><td data-l="Lavori in quota">' + chipScad('Quota', o.quota) + '</td><td data-l="PLE">' + chipScad('PLE', o.ple) + '</td>' +
          '<td class="r">' + (bloc ? '<span class="pill pill-danger">Non impiegabile</span>' : '<span class="pill pill-ok">Impiegabile</span>') + '</td></tr>';
      }).join('') + '</tbody></table>' + (lista.length ? '' : '<p class="empty">Nessun operaio in questo filtro.</p>') + '</div>';
    h += '<p class="note">' + ico('info') + 'Per le visite mediche l\'app registra solo la data e il giudizio di idoneità, mai diagnosi o altri dati sanitari. Le periodicità di corsi e visite sono indicative, da verificare con il medico competente e la normativa regionale.</p>';
    if (apri) setTimeout(function () { schedaOperaio(apri); }, 0);
    return h;
  }
  function schedaOperaio(id) {
    var o = operaio(id); if (!o) return;
    var cant = D.cantieri.filter(function (c) { return c.squadra.indexOf(id) >= 0 && c.stato !== 'chiuso'; });
    var riga = function (label, d, extra) { var n = d ? giorni(d) : null; return '<li><span>' + label + (extra ? '<small>' + extra + '</small>' : '') + '</span>' + (d ? '<span class="pill pill-' + livello(n) + '">' + fmt(d) + ' · ' + rel(d) + '</span>' : '<span class="pill pill-neutral">Non previsto</span>') + '</li>'; };
    modale('<div class="person big"><span class="avatar">' + iniziali(o.nome) + '</span><div><h2>' + esc(o.nome) + '</h2><p class="muted">' + esc(o.ruolo) + ' · in azienda dal ' + o.dal + ' · ' + esc(o.tel) + '</p></div></div>' +
      '<ul class="scad-list">' + riga('Aggiornamento corso amianto', o.corso.agg, esc(o.corso.livello) + ', corso del ' + fmt(o.corso.data)) + riga('Visita medica', o.visita.scad, 'Ultima ' + fmt(o.visita.ultima) + ' · giudizio: ' + esc(o.visita.giudizio)) + riga('Lavori in quota e DPI III cat.', o.quota) + riga('Abilitazione PLE', o.ple) + '</ul>' +
      '<h3>Cantieri assegnati</h3>' + (cant.length ? '<ul class="docs">' + cant.map(function (c) { return '<li><a href="#/cantiere/' + c.id + '">' + ico('cantieri') + '<div><strong>' + c.id + ' · ' + esc(c.comune) + '</strong><small>' + esc(c.titolo) + '</small></div>' + pillStato(c.stato) + '</a></li>'; }).join('') + '</ul>' : '<p class="empty">Nessun cantiere attivo.</p>') +
      '<div class="modal-actions"><a class="btn btn-ghost" href="#/ia/attestato">' + ico('ia') + 'Carica attestato</a><button class="btn" data-act="demo-promemoria">Prepara promemoria</button></div>');
  }

  /* ---------- 5. rifiuti ---------- */
  var tabRifiuti = 'fir';
  function vRifiuti() {
    var anno = OGGI.getFullYear();
    var kg = D.fir.filter(function (f) { return f.data.getFullYear() === anno; }).reduce(function (t, f) { return t + (f.kgDestino || f.kgStimati); }, 0);
    var aperti = D.fir.filter(function (f) { return !f.quarta; });
    var h = intestazione('Rifiuti', 'Formulari di trasporto e registro di carico e scarico · CER 17 06 05*', '<button class="btn" data-act="demo-fir">' + ico('plus') + 'Nuovo formulario</button>');
    h += '<section class="kpis kpis-3">' + kpi('Smaltiti nel ' + anno, num(kg) + ' kg', 'peso a destino o stimato', 'rifiuti', '#/rifiuti') +
      kpi('Formulari aperti', aperti.length, '4ª copia non ancora rientrata', 'doc', '#/rifiuti', aperti.length ? 'info' : '') +
      kpi('Prossimo termine 4ª copia', aperti.length ? fmt(piu(aperti.sort(function (a, b) { return a.data - b.data; })[0].data, 90)) : '—', 'entro 3 mesi dal trasporto', 'clock', '#/rifiuti') + '</section>';
    h += '<div class="seg"><button data-act="tab-rif" data-v="fir" class="' + (tabRifiuti === 'fir' ? 'on' : '') + '">Formulari (FIR)</button><button data-act="tab-rif" data-v="registro" class="' + (tabRifiuti === 'registro' ? 'on' : '') + '">Registro carico e scarico</button></div>';
    if (tabRifiuti === 'fir') {
      h += '<div class="card table-card"><table class="tbl tbl-fir"><thead><tr><th>Formulario</th><th>Cantiere</th><th class="r">Kg stimati</th><th class="r">Kg a destino</th><th>4ª copia</th><th></th></tr></thead><tbody>' +
        D.fir.slice().sort(function (a, b) { return b.data - a.data; }).map(function (f) {
          var c = cantiere(f.cantiere), lim = piu(f.data, 90);
          var stato = f.quarta ? '<span class="pill pill-ok">Rientrata il ' + fmt(f.quarta) + '</span>' : '<span class="pill pill-' + livello(giorni(lim)) + '">Attesa, entro ' + fmt(lim) + '</span>';
          return '<tr><td><strong>' + f.numero + '</strong><small class="muted d-block">' + fmt(f.data) + ' · ' + esc(C.trasportatore) + '</small></td><td data-l="Cantiere"><a href="#/cantiere/' + c.id + '">' + c.id + '</a><small class="muted d-block">' + esc(c.comune) + '</small></td>' +
            '<td class="r" data-l="Kg stimati">' + num(f.kgStimati) + '</td><td class="r" data-l="Kg a destino">' + (f.kgDestino ? num(f.kgDestino) + scarto(f) : '—') + '</td><td data-l="4ª copia">' + stato + '</td>' +
            '<td class="r">' + (f.quarta ? '' : '<a class="btn btn-sm btn-ghost" href="#/ia/fir">' + ico('ia') + 'Leggi 4ª copia</a>') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    } else {
      var mov = [];
      D.fir.forEach(function (f) {
        mov.push({ data: piu(f.data, -1), tipo: 'Carico', kg: f.kgStimati, rif: 'Produzione in cantiere ' + f.cantiere });
        mov.push({ data: f.data, tipo: 'Scarico', kg: f.kgDestino || f.kgStimati, rif: 'FIR ' + f.numero + (f.kgDestino ? '' : ' (peso stimato)') });
      });
      mov.sort(function (a, b) { return a.data - b.data || (a.tipo === 'Carico' ? -1 : 1); });
      h += '<div class="card table-card"><table class="tbl"><thead><tr><th>N.</th><th>Data</th><th>Movimento</th><th>Riferimento</th><th class="r">Kg</th></tr></thead><tbody>' +
        mov.map(function (m, k) { return '<tr><td>' + (k + 1) + '/' + m.data.getFullYear() + '</td><td>' + fmt(m.data) + '</td><td><span class="pill pill-' + (m.tipo === 'Carico' ? 'info' : 'neutral') + '">' + m.tipo + '</span></td><td>' + esc(m.rif) + '</td><td class="r">' + num(m.kg) + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="note">' + ico('info') + 'Registro e formulari sono gestiti in forma digitale sul RENTRI: nell\'app vera i dati si preparano qui e si trasmettono, con modalità di integrazione da verificare.</p>';
    }
    return h;
  }
  function scarto(f) { var d = f.kgDestino - f.kgStimati, pct = d / f.kgStimati * 100; return ' <small class="muted">(' + (d >= 0 ? '+' : '') + num(pct, 1) + '%)</small>'; }

  /* ---------- 6. preventivo ---------- */
  var VOCI = [
    { id: 'prat', d: 'Pratiche: campionamento, analisi, notifica e piano di lavoro su GeMA', um: 'a corpo', q: function () { return 1; }, p: 650 },
    { id: 'cant', d: 'Allestimento cantiere, unità di decontaminazione, segnaletica', um: 'a corpo', q: function () { return 1; }, p: 850 },
    { id: 'sic', d: 'Linea vita provvisoria e parapetti perimetrali', um: 'ml', q: function (m) { return m.perimetro; }, p: 16 },
    { id: 'inc', d: 'Incapsulamento preventivo con prodotto di tipo C', um: 'mq', q: function (m) { return m.sup; }, p: 2.6 },
    { id: 'rim', d: 'Rimozione delle lastre senza frantumazione, pallettizzazione e imballo in doppio telo PE', um: 'mq', q: function (m) { return m.sup; }, p: 9.5 },
    { id: 'smal', d: 'Trasporto e conferimento in impianto autorizzato, CER 17 06 05*', um: 'kg', q: function (m) { return m.kg; }, p: 0.3 },
    { id: 'cop', d: 'Nuova copertura in pannelli sandwich coibentati, sp. 40 mm', um: 'mq', q: function (m) { return m.sup; }, p: 39 },
    { id: 'latt', d: 'Lattoneria: gronde, colmi e scossaline in acciaio preverniciato', um: 'ml', q: function (m) { return m.gronda; }, p: 31 },
    { id: 'rest', d: 'Monitoraggio delle fibre aerodisperse e certificato di restituibilità', um: 'a corpo', q: function () { return 1; }, p: 480 },
    { id: 'canna', d: 'Rimozione di canna fumaria in cemento-amianto (fino a 6 m)', um: 'a corpo', q: function () { return 1; }, p: 620, solo: 'C-2026-044' }
  ];
  var preventivi = {};
  function misure(falde) {
    var sup = 0, L = 0, sw = 0, sl = 0;
    falde.forEach(function (f) { sup += supFalda(f); L = Math.max(L, f.l); sw += f.w; sl += f.l; });
    return { sup: Math.round(sup), perimetro: Math.round(2 * (L + sw)), gronda: Math.round(sl + L), kg: Math.round(sup * 15) };
  }
  function modelloPrev(c) {
    if (preventivi[c.id]) return preventivi[c.id];
    var p = { cid: c.id, falde: c.sopralluogo.falde.map(function (f) { return { nome: f.nome, l: f.l, w: f.w, p: f.p }; }), iva: 22, sconto: 0, voci: {} };
    VOCI.forEach(function (v) { p.voci[v.id] = { on: !v.solo || v.solo === c.id, q: null, p: v.p }; });
    preventivi[c.id] = p; return p;
  }
  function righePrev(p) {
    var m = misure(p.falde);
    return VOCI.filter(function (v) { return !v.solo || v.solo === p.cid; }).map(function (v) {
      var s = p.voci[v.id], q = s.q != null ? s.q : v.q(m);
      return { v: v, s: s, q: q, tot: s.on ? q * s.p : 0 };
    });
  }
  function totaliPrev(p) {
    var imp = righePrev(p).reduce(function (t, r) { return t + r.tot; }, 0);
    var oneri = imp * 0.03, sc = (imp + oneri) * (p.sconto / 100), netto = imp + oneri - sc, iva = netto * p.iva / 100;
    return { imp: imp, oneri: oneri, sc: sc, netto: netto, iva: iva, tot: netto + iva };
  }
  function vPreventivo(id) {
    var candidati = D.cantieri.filter(function (c) { return statoIdx(c.stato) <= 1; });
    var c = cantiere(id) || candidati[0], p = modelloPrev(c), m = misure(p.falde);
    var h = intestazione('Preventivo da sopralluogo', 'Misure e foto del tecnico diventano voci e totale', '<button class="btn" data-act="stampa-prev" data-id="' + c.id + '">' + ico('print') + 'Stampa / PDF</button>');
    h += '<label class="select-cant"><span>Cantiere</span><select data-act="cambia-prev">' + D.cantieri.filter(function (x) { return x.stato !== 'chiuso'; }).map(function (x) { return '<option value="' + x.id + '"' + (x.id === c.id ? ' selected' : '') + '>' + x.id + ' · ' + esc(x.committente) + ', ' + esc(x.comune) + '</option>'; }).join('') + '</select></label>';
    h += '<div class="split split-prev"><div>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('camera') + ' Sopralluogo del ' + fmt(c.sopralluogo.data) + '</h2><span class="muted">' + esc(c.sopralluogo.tecnico) + '</span></div><div class="gallery gallery-sm">' +
      c.foto.map(function (f, k) { return '<button class="ph" data-act="foto" data-id="' + c.id + '" data-k="' + k + '">' + window.fotoSVG(f, stampFoto(c)) + '</button>'; }).join('') + '</div>' +
      '<p class="muted small">' + esc(c.sopralluogo.degrado) + '</p></section>';
    h += '<section class="card"><div class="card-head"><h2>Misure</h2><span class="muted">superficie reale con la pendenza</span></div><div id="prev-falde">' + tabFalde(p) + '</div></section>';
    h += '<section class="card table-card"><div class="card-head pad"><h2>Voci</h2><span class="muted">quantità calcolate dalle misure, modificabili</span></div><div id="prev-voci">' + tabVoci(p) + '</div></section>';
    h += '</div><aside class="card totals" id="prev-tot">' + boxTotali(c, p) + '</aside></div>';
    return h;
  }
  function tabFalde(p) {
    var m = misure(p.falde);
    return '<table class="tbl tbl-edit"><thead><tr><th>Falda</th><th class="r">Lungh. (m)</th><th class="r">Largh. (m)</th><th class="r">Pend. %</th><th class="r">mq</th></tr></thead><tbody>' +
      p.falde.map(function (f, k) { return '<tr><td>' + esc(f.nome) + '</td><td class="r"><input type="number" step="0.1" data-falda="' + k + '" data-k="l" value="' + f.l + '"></td><td class="r"><input type="number" step="0.1" data-falda="' + k + '" data-k="w" value="' + f.w + '"></td><td class="r"><input type="number" step="1" data-falda="' + k + '" data-k="p" value="' + f.p + '"></td><td class="r" data-sup="' + k + '">' + num(supFalda(f), 1) + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr><td colspan="4">Totale · perimetro ' + m.perimetro + ' ml · peso stimato ' + num(m.kg) + ' kg</td><td class="r"><b>' + num(m.sup) + ' mq</b></td></tr></tfoot></table>';
  }
  function tabVoci(p) {
    return '<table class="tbl tbl-edit tbl-voci"><thead><tr><th></th><th>Descrizione</th><th class="r">Q.tà</th><th>U.m.</th><th class="r">Prezzo</th><th class="r">Importo</th></tr></thead><tbody>' +
      righePrev(p).map(function (r) {
        return '<tr class="' + (r.s.on ? '' : 'off') + '"><td><input type="checkbox" data-voce="' + r.v.id + '" data-k="on"' + (r.s.on ? ' checked' : '') + ' aria-label="Includi voce"></td><td>' + esc(r.v.d) + '</td>' +
          '<td class="r"><input type="number" step="any" data-voce="' + r.v.id + '" data-k="q" value="' + Math.round(r.q * 100) / 100 + '"></td><td>' + r.v.um + '</td>' +
          '<td class="r"><input type="number" step="0.01" data-voce="' + r.v.id + '" data-k="p" value="' + r.s.p + '"></td><td class="r" data-imp="' + r.v.id + '">' + eur(r.tot) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  function boxTotali(c, p) {
    var t = totaliPrev(p);
    return '<h2>Riepilogo</h2><p class="muted small">' + esc(c.committente) + '<br>' + esc(c.indirizzo) + ', ' + esc(c.comune) + '</p><dl class="sum">' +
      '<dt>Lavori</dt><dd>' + eur(t.imp) + '</dd><dt>Oneri sicurezza 3%</dt><dd>' + eur(t.oneri) + '</dd>' +
      '<dt>Sconto <input type="number" min="0" max="30" step="1" data-prev="sconto" value="' + p.sconto + '" aria-label="Sconto percentuale">%</dt><dd>− ' + eur(t.sc) + '</dd>' +
      '<dt>Imponibile</dt><dd>' + eur(t.netto) + '</dd><dt>IVA <select data-prev="iva" aria-label="Aliquota IVA"><option' + (p.iva === 22 ? ' selected' : '') + '>22</option><option' + (p.iva === 10 ? ' selected' : '') + '>10</option></select>%</dt><dd>' + eur(t.iva) + '</dd></dl>' +
      '<div class="grand"><span>Totale</span><b>' + eur(t.tot) + '</b></div><p class="muted small">Prezzi di esempio. L\'aliquota IVA corretta va verificata caso per caso.</p>' +
      '<button class="btn btn-block" data-act="stampa-prev" data-id="' + c.id + '">' + ico('print') + 'Stampa / PDF</button><button class="btn btn-ghost btn-block" data-act="demo-invia">Prepara email al cliente</button>';
  }
  function docPreventivo(c, p) {
    var t = totaliPrev(p), m = misure(p.falde);
    return docTesta('Preventivo n. ' + c.id.replace('C-', 'P-'), 'Data ' + fmt(OGGI) + ' · validità 30 giorni') +
      '<table class="doc-kv"><tr><th>Cliente</th><td>' + esc(c.committente) + '</td></tr><tr><th>Luogo dei lavori</th><td>' + esc(c.indirizzo) + ', ' + esc(c.comune) + ' (' + c.prov + ')</td></tr><tr><th>Sopralluogo</th><td>' + fmt(c.sopralluogo.data) + ', ' + esc(c.sopralluogo.tecnico) + '</td></tr><tr><th>Superficie</th><td>' + num(m.sup) + ' mq reali (con pendenza)</td></tr></table>' +
      '<div class="doc-foto">' + c.foto.slice(0, 3).map(function (f) { return window.fotoSVG(f, stampFoto(c)); }).join('') + '</div>' +
      '<table class="doc-tbl"><thead><tr><th>Descrizione</th><th>Q.tà</th><th>U.m.</th><th>Prezzo</th><th>Importo</th></tr></thead><tbody>' +
      righePrev(p).filter(function (r) { return r.s.on; }).map(function (r) { return '<tr><td>' + esc(r.v.d) + '</td><td class="r">' + num(r.q, r.v.um === 'a corpo' ? 0 : 1) + '</td><td>' + r.v.um + '</td><td class="r">' + eur(r.s.p) + '</td><td class="r">' + eur(r.tot) + '</td></tr>'; }).join('') +
      '</tbody></table><table class="doc-sum"><tr><td>Lavori</td><td>' + eur(t.imp) + '</td></tr><tr><td>Oneri della sicurezza (3%)</td><td>' + eur(t.oneri) + '</td></tr>' + (p.sconto ? '<tr><td>Sconto ' + p.sconto + '%</td><td>− ' + eur(t.sc) + '</td></tr>' : '') +
      '<tr><td>Imponibile</td><td>' + eur(t.netto) + '</td></tr><tr><td>IVA ' + p.iva + '%</td><td>' + eur(t.iva) + '</td></tr><tr class="grand"><td>Totale</td><td>' + eur(t.tot) + '</td></tr></table>' +
      '<div class="doc-firme"><div>Per l\'impresa<span>' + esc(C.datoreLavoro) + '</span></div><div>Per accettazione<span>&nbsp;</span></div></div>' +
      '<p class="doc-foot">Documento dimostrativo con dati e prezzi inventati.</p>';
  }
  function aggiornaPrev(c, p, rifaiFalde) {
    if (rifaiFalde) $('#prev-falde').innerHTML = tabFalde(p);
    righePrev(p).forEach(function (r) {
      var td = $('[data-imp="' + r.v.id + '"]'); if (td) td.textContent = eur(r.tot);
      var q = $('input[data-voce="' + r.v.id + '"][data-k="q"]'); if (q && document.activeElement !== q) q.value = Math.round(r.q * 100) / 100;
      var tr = td && td.parentNode; if (tr) tr.classList.toggle('off', !r.s.on);
    });
    var active = document.activeElement && document.activeElement.getAttribute('data-prev');
    if (!active) $('#prev-tot').innerHTML = boxTotali(c, p);
    else { var t = totaliPrev(p), dd = $$('#prev-tot .sum dd'); dd[2].textContent = '− ' + eur(t.sc); dd[3].textContent = eur(t.netto); dd[4].textContent = eur(t.iva); $('#prev-tot .grand b').textContent = eur(t.tot); }
  }

  /* ---------- 7. lettura documento con IA (simulata) ---------- */
  var DOC_IA = {
    rapporto: { file: 'Rapporto_di_prova_2026-1187.pdf', tipo: 'Rapporto di prova del laboratorio', dest: 'Cantiere C-2026-044 · documenti',
      campi: [['Laboratorio', C.laboratorio, 98], ['Numero rapporto', 'RdP 2026/1187', 99], ['Data del prelievo', fmt(gg(-2)), 97], ['Luogo del prelievo', 'Via Bergamo 112, Cesano Maderno (MB)', 95], ['Materiale', 'Lastra ondulata di copertura', 96], ['Metodo', 'Spettrofotometria IR (FTIR)', 91], ['Esito', 'Presenza di amianto: crisotilo', 99], ['Contenuto stimato', '10-15% in peso', 84]] },
    fir: { file: 'FIR_RXB104552_quarta_copia.pdf', tipo: '4ª copia del formulario rifiuti', dest: 'Rifiuti · FIR RXB 104552/26',
      campi: [['Numero formulario', 'RXB 104552/26', 99], ['Codice CER', '17 06 05*', 99], ['Produttore', C.nome, 97], ['Trasportatore', C.trasportatore, 96], ['Impianto di destinazione', C.impianto, 95], ['Data di arrivo', fmt(gg(-3)), 94], ['Peso verificato a destino', '6.140 kg', 87]] },
    attestato: { file: 'Attestato_aggiornamento_amianto_Benali.pdf', tipo: 'Attestato di formazione', dest: 'Operai · Karim Benali',
      campi: [['Lavoratore', 'Karim Benali', 99], ['Corso', 'Aggiornamento addetti alla rimozione amianto', 96], ['Livello', 'Operativo', 93], ['Ente formatore', 'Ente di formazione Brianza Sicurezza (fittizio)', 95], ['Data del corso', fmt(gg(-1)), 98], ['Durata', '8 ore', 89]] }
  };
  var ia = { doc: null, fase: 'attesa', nomeFile: '' };
  function vIA(param) {
    if (param && DOC_IA[param] && ia.fase === 'attesa') { ia.doc = param; ia.nomeFile = DOC_IA[param].file; setTimeout(avviaLettura, 350); ia.fase = 'lettura'; }
    var h = intestazione('Lettura documento con IA', 'Carica un PDF o una foto: i campi si compilano da soli e tu confermi', '');
    h += '<div class="banner banner-info">' + ico('info') + '<div><strong>In questa demo la lettura è simulata</strong><small>Qualunque file carichi, i dati mostrati sono inventati e nulla esce dal tuo computer. Nell\'app vera il documento viene letto davvero e ogni campo va confermato da una persona.</small></div></div>';
    if (!ia.doc) {
      h += '<label class="drop" id="drop">' + ico('upload', 'ico-lg') + '<strong>Trascina qui un PDF o una foto</strong><span>oppure tocca per sceglierlo dal telefono</span><input type="file" accept=".pdf,image/*" data-act="ia-file" hidden></label>';
      h += '<h3 class="sub">Oppure prova con un documento di esempio</h3><div class="samples">' + Object.keys(DOC_IA).map(function (k) {
        var d = DOC_IA[k]; return '<button class="sample" data-act="ia-sample" data-v="' + k + '">' + ico('doc', 'ico-lg') + '<div><strong>' + d.tipo + '</strong><small>' + d.file + '</small></div></button>';
      }).join('') + '</div>';
      return h;
    }
    var d = DOC_IA[ia.doc];
    h += '<div class="split split-ia"><div class="card"><div class="card-head"><h2>' + ico('doc') + ' ' + esc(ia.nomeFile) + '</h2></div><div class="fake-pdf' + (ia.fase === 'lettura' ? ' scanning' : '') + '" id="fake-pdf">' + pdfFinto(d) + '<div class="scanbar"></div></div></div>';
    h += '<div class="card"><div class="card-head"><h2>' + ico('ia') + ' Dati estratti</h2><span class="muted" id="ia-stato">' + (ia.fase === 'lettura' ? 'Lettura in corso…' : ia.fase === 'confermato' ? 'Confermato' : 'Da controllare') + '</span></div>' +
      '<p class="muted small">Tipo riconosciuto: <b>' + d.tipo + '</b> · destinazione: ' + d.dest + '</p><div class="ia-fields">' +
      d.campi.map(function (f, k) { return '<label class="ia-field" id="iaf-' + k + '"><span>' + f[0] + '<em class="conf"></em></span><input type="text" value="' + (ia.fase === 'lettura' ? '' : esc(f[1])) + '"' + (ia.fase === 'confermato' ? ' disabled' : '') + '></label>'; }).join('') + '</div>' +
      '<div class="ia-actions" id="ia-actions"' + (ia.fase === 'lettura' ? ' hidden' : '') + '>' + (ia.fase === 'confermato' ? '<a class="btn" href="' + destHref() + '">Vai alla scheda</a><button class="btn btn-ghost" data-act="ia-reset">Leggi un altro documento</button>' :
        '<button class="btn" data-act="ia-conferma">' + ico('check') + 'Confermo i dati</button><button class="btn btn-ghost" data-act="ia-reset">Annulla</button>') + '</div></div></div>';
    if (ia.fase !== 'lettura') setTimeout(mostraConfidenze, 0);
    return h;
  }
  function destHref() { return ia.doc === 'fir' ? '#/rifiuti' : ia.doc === 'attestato' ? '#/operai/op4' : '#/cantiere/C-2026-044'; }
  function pdfFinto(d) {
    var righe = '';
    d.campi.forEach(function (f, k) { righe += '<div class="pdf-line" id="pl-' + k + '"><span>' + f[0] + ':</span> <b>' + esc(f[1]) + '</b></div>' + (k % 2 ? '<div class="pdf-bar w80"></div>' : ''); });
    return '<div class="pdf-head"><div class="pdf-logo"></div><div><div class="pdf-bar w60"></div><div class="pdf-bar w40"></div></div></div><div class="pdf-title">' + d.tipo.toUpperCase() + '</div>' + righe +
      '<div class="pdf-bar w90"></div><div class="pdf-bar w70"></div><div class="pdf-sign"><div class="pdf-bar w40"></div><svg viewBox="0 0 120 30"><path d="M5 22c10-14 18-14 20-4s10 6 16-6 12 10 20 4 14-8 22-2 18 4 30-6" fill="none" stroke="#2b4a8b" stroke-width="2"/></svg></div>';
  }
  function avviaLettura() {
    var d = DOC_IA[ia.doc], k = 0;
    if (!$('#fake-pdf')) return;
    function prossimo() {
      if (location.hash.indexOf('#/ia') !== 0) return;
      if (k >= d.campi.length) {
        ia.fase = 'controllo'; $('#fake-pdf').classList.remove('scanning');
        $('#ia-stato').textContent = 'Da controllare'; $('#ia-actions').hidden = false; return;
      }
      var f = d.campi[k], line = $('#pl-' + k), field = $('#iaf-' + k), inp = $('input', field), i = 0, idx = k;
      line.classList.add('hl'); field.classList.add('filling');
      line.scrollIntoView({ block: 'nearest' });
      (function scrivi() {
        if (!document.body.contains(inp)) return;
        inp.value = f[1].slice(0, ++i);
        if (i < f[1].length) setTimeout(scrivi, 18);
        else { field.classList.remove('filling'); confidenza(idx); k++; setTimeout(prossimo, 220); }
      })();
    }
    setTimeout(prossimo, 900);
  }
  function confidenza(k) {
    var f = DOC_IA[ia.doc].campi[k], field = $('#iaf-' + k); if (!field) return;
    field.classList.add('done', f[2] < 90 ? 'low' : 'high');
    $('.conf', field).textContent = f[2] < 90 ? 'da controllare · ' + f[2] + '%' : f[2] + '%';
  }
  function mostraConfidenze() { DOC_IA[ia.doc].campi.forEach(function (f, k) { confidenza(k); $('#pl-' + k) && $('#pl-' + k).classList.add('hl'); }); }
  function confermaIA() {
    if (ia.doc === 'fir') { var f = D.fir.filter(function (x) { return x.numero === 'RXB 104552/26'; })[0]; f.quarta = gg(-3); f.kgDestino = 6140; toast('4ª copia registrata: il formulario è chiuso e l\'allarme sparisce.'); }
    else if (ia.doc === 'attestato') { var o = operaio('op4'); o.corso.data = gg(-1); o.corso.agg = gg(1825); toast('Attestato registrato: Karim Benali torna impiegabile.'); }
    else toast('Rapporto di prova archiviato nel cantiere C-2026-044.');
    ia.fase = 'confermato'; render();
  }

  /* ---------- router ---------- */
  function render() {
    var parts = location.hash.replace(/^#\/?/, '').split('/'), r = parts[0], arg = parts[1];
    var v;
    switch (r) {
      case 'cantieri': v = vCantieri(); break;
      case 'cantiere': v = vCantiere(arg); break;
      case 'piano': v = vPiano(arg); break;
      case 'operai': v = vOperai(arg); break;
      case 'rifiuti': v = vRifiuti(); break;
      case 'preventivo': v = vPreventivo(arg); break;
      case 'ia': v = vIA(arg); break;
      default: v = vCruscotto(); r = '';
    }
    $('#view').innerHTML = v;
    var sez = { cantiere: 'cantieri', piano: 'cantieri' }[r] || r;
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === sez); });
  }
  var ultimoHash = '';
  window.addEventListener('hashchange', function () {
    chiudiModale();
    var base = function (h) { return h.split('/').slice(0, 2).join('/'); };
    if (location.hash.indexOf('#/ia') !== 0 || (location.hash.indexOf('#/ia/') === 0 && ia.fase !== 'lettura')) ia = { doc: null, fase: 'attesa', nomeFile: '' };
    var stessa = base(location.hash) === base(ultimoHash) && /^#\/operai/.test(location.hash);
    ultimoHash = location.hash;
    if (stessa && location.hash.split('/')[2]) { schedaOperaio(location.hash.split('/')[2]); return; }
    render(); window.scrollTo(0, 0);
  });

  /* ---------- eventi ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'LABEL') return;
    switch (a) {
      case 'info': infoDemo(); break;
      case 'chiudi': chiudiModale(); break;
      case 'filtro-cant': filtroCantieri = v; render(); break;
      case 'filtro-op': filtroOperai = v; render(); break;
      case 'tab-rif': tabRifiuti = v; render(); break;
      case 'vista-piano': vistaPiano = v; $$('.seg button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); }); $('.split').className = 'split vista-' + v; break;
      case 'apri-op': location.hash = '#/operai/' + id; break;
      case 'avanza': var c = cantiere(id), i = statoIdx(c.stato);
        if (i < STATI.length - 1) { c.stato = STATI[i + 1][0]; if (c.stato === 'depositato') c.depositato = new Date(OGGI); if (!c.inizio && i + 1 >= 2) { c.inizio = gg(45); c.squadra = ['op1', 'op3', 'op7']; } toast('Stato aggiornato: ' + statoLabel(c.stato)); render(); }
        break;
      case 'deposita': var cd = cantiere(id); cd.stato = 'depositato'; cd.depositato = new Date(OGGI); toast('Piano segnato come caricato su GeMA. Scadenza tolta dal cruscotto.'); render(); break;
      case 'stampa-piano': var cp = cantiere(id); stampa('<div class="paper">' + docPiano(cp, modelloPiano(cp)) + '</div>'); break;
      case 'stampa-prev': var cv = cantiere(id); stampa('<div class="paper">' + docPreventivo(cv, modelloPrev(cv)) + '</div>'); break;
      case 'foto': var cf = cantiere(id), f = cf.foto[+el.getAttribute('data-k')];
        modale('<div class="photo-big">' + (f.url ? '<img src="' + f.url + '" alt="">' : window.fotoSVG(f, stampFoto(cf))) + '</div><p class="muted">' + esc(f.label) + ' · ' + esc(cf.titolo) + '</p>', true); break;
      case 'ia-sample': ia = { doc: v, fase: 'lettura', nomeFile: DOC_IA[v].file }; render(); avviaLettura(); break;
      case 'ia-conferma': confermaIA(); break;
      case 'ia-reset': ia = { doc: null, fase: 'attesa', nomeFile: '' }; if (location.hash !== '#/ia') location.hash = '#/ia'; else render(); break;
      case 'demo-nuovo': toast('Nella demo non si creano nuovi cantieri: nell\'app vera parte dal sopralluogo sul telefono.'); break;
      case 'demo-fir': toast('Nella demo il formulario non si crea: nell\'app vera si precompila dal cantiere.'); break;
      case 'demo-promemoria': toast('Nell\'app vera si apre WhatsApp o l\'email con il promemoria già scritto.'); break;
      case 'demo-invia': toast('Nell\'app vera prepara l\'email con il PDF allegato: la invii tu.'); break;
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiModale(); });

  document.addEventListener('input', function (e) {
    var t = e.target, form = t.closest('#form-piano');
    if (form) { aggiornaPiano(form); return; }
    if (location.hash.indexOf('#/preventivo') === 0) {
      var sel = $('select[data-act=cambia-prev]'); if (!sel) return;
      var c = cantiere(sel.value), p = modelloPrev(c), val = parseFloat(t.value);
      if (t.hasAttribute('data-falda')) {
        if (isNaN(val)) return;
        var k = +t.getAttribute('data-falda'); p.falde[k][t.getAttribute('data-k')] = val;
        $('[data-sup="' + k + '"]').textContent = num(supFalda(p.falde[k]), 1);
        var m = misure(p.falde); $('#prev-falde tfoot').innerHTML = '<tr><td colspan="4">Totale · perimetro ' + m.perimetro + ' ml · peso stimato ' + num(m.kg) + ' kg</td><td class="r"><b>' + num(m.sup) + ' mq</b></td></tr>';
        aggiornaPrev(c, p);
      } else if (t.hasAttribute('data-voce')) {
        var s = p.voci[t.getAttribute('data-voce')], kk = t.getAttribute('data-k');
        if (kk === 'on') s.on = t.checked; else if (!isNaN(val)) s[kk] = val;
        aggiornaPrev(c, p);
      } else if (t.hasAttribute('data-prev')) {
        if (!isNaN(val)) p[t.getAttribute('data-prev')] = val; aggiornaPrev(c, p);
      }
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target, a = t.getAttribute('data-act');
    if (a === 'cambia-prev') location.hash = '#/preventivo/' + t.value;
    if (t.hasAttribute('data-voce') && t.getAttribute('data-k') === 'on') { var c = cantiere($('select[data-act=cambia-prev]').value), p = modelloPrev(c); p.voci[t.getAttribute('data-voce')].on = t.checked; aggiornaPrev(c, p); }
    if (t.getAttribute('data-prev') === 'iva') { var c2 = cantiere($('select[data-act=cambia-prev]').value), p2 = modelloPrev(c2); p2.iva = +t.value; t.blur(); aggiornaPrev(c2, p2); }
    if (a === 'foto-add' && t.files && t.files[0]) {
      var cf = cantiere(t.getAttribute('data-id'));
      cf.foto.push({ tipo: 'tetto', label: 'Foto aggiunta', url: URL.createObjectURL(t.files[0]) });
      toast('Foto aggiunta al sopralluogo (solo in questa sessione).'); render();
    }
    if (a === 'ia-file' && t.files && t.files[0]) { ia = { doc: 'rapporto', fase: 'lettura', nomeFile: t.files[0].name }; render(); avviaLettura(); }
  });
  // trascina e rilascia sulla zona di caricamento
  document.addEventListener('dragover', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
  document.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) d.classList.remove('over'); });
  document.addEventListener('drop', function (e) {
    var d = e.target.closest && e.target.closest('#drop'); if (!d) return; e.preventDefault();
    var f = e.dataTransfer.files[0]; ia = { doc: 'rapporto', fase: 'lettura', nomeFile: f ? f.name : 'documento.pdf' }; render(); avviaLettura();
  });

  // le foto aggiunte dal telefono hanno un URL vero: le mostro come immagine
  var fotoOrig = window.fotoSVG;
  window.fotoSVG = function (f, stamp) { return f.url ? '<img src="' + f.url + '" alt="' + esc(f.label) + '">' : fotoOrig(f, stamp); };

  guscio();
  ultimoHash = location.hash;
  render();
})();
