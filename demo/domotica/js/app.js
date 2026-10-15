/*
 * Demo cliccabile "gestionale impianti" per integratori di domotica, audio-video e sicurezza.
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
  function eur0(n) { return num(Math.round(n)) + ' €'; }
  function trova(lista, id) { return lista.filter(function (x) { return x.id === id; })[0]; }
  function progetto(id) { return trova(D.progetti, id); }
  function articolo(id) { return trova(D.catalogo, id); }
  function tecnico(id) { return trova(D.tecnici, id); }
  function contratto(id) { return trova(D.contratti, id); }
  function ordine(id) { return trova(D.ordini, id); }
  function sistema(id) { return trova(D.sistemi, id); }
  function iniziali(s) { return s.replace(/\b(srl|snc|spa|sas)\b/ig, '').replace(/[^\wÀ-ÿ\s]/g, '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function sysTag(id) { var s = sistema(id); return '<span class="sys" style="--c:' + s.colore + '"><i></i>' + s.breve + '</span>'; }

  var ICON = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    progetti: '<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><circle cx="12" cy="13" r="1.6"/><path d="M9.2 10.6a4 4 0 015.6 0"/>',
    preventivo: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    magazzino: '<path d="M3 8l9-5 9 5v12H3z"/><path d="M7 20v-7h10v7"/><path d="M7 16h10"/>',
    assistenza: '<path d="M14.5 6.5a4 4 0 00-5.2 5.2L4 17l3 3 5.3-5.3a4 4 0 005.2-5.2l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    contratti: '<path d="M7 3h10l3 3v15H4V3z"/><path d="M8 9h8M8 13h8"/><path d="M15 18l1.5 1.5L20 16"/>',
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
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    euro: '<path d="M17 6.5A7 7 0 1017 17.5"/><path d="M4 10h9M4 14h9"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>'
  };
  function ico(n, cls) { return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>'; }

  var STATI = [
    ['preventivo', 'Preventivo'], ['accettato', 'Accettato'], ['predisposizione', 'Predisposizioni'], ['installazione', 'Installazione'],
    ['programmazione', 'Programmazione'], ['collaudo', 'Collaudo e consegna'], ['assistenza', 'In assistenza']
  ];
  function statoIdx(s) { for (var i = 0; i < STATI.length; i++) if (STATI[i][0] === s) return i; return 0; }
  function statoLabel(s) { return STATI[statoIdx(s)][1]; }
  var STATO_TONO = { preventivo: 'neutral', accettato: 'warn', predisposizione: 'info', installazione: 'brand', programmazione: 'brand', collaudo: 'info', assistenza: 'ok' };
  function pillStato(s) { return '<span class="pill pill-' + STATO_TONO[s] + '">' + statoLabel(s) + '</span>'; }
  function inCorso(p) { var i = statoIdx(p.stato); return i >= 1 && i <= 5; }

  /* ---------- configuratore: livelli per stanza e apparecchi centrali ---------- */
  // per ogni sistema: [niente, base, plus]. canali = uscite KNX da sommare per calcolare gli attuatori
  var LIVELLI = {
    knx: [null, { nome: 'Luci on/off e tapparelle', items: [['k-puls', 1]], canali: { luci: 2, dimmer: 0, tapp: 1 } },
      { nome: 'Luci dimmerabili, scenari e clima', items: [['k-puls', 2], ['k-term', 1], ['k-sens', 1]], canali: { luci: 1, dimmer: 2, tapp: 2 } }],
    audio: [null, { nome: 'Diffusori a incasso', items: [['a-diff', 1], ['a-amp', 1]] }, { nome: 'Diffusori e subwoofer', items: [['a-diff', 2], ['a-amp', 1], ['a-sub', 1]] }],
    video: [null, { nome: '1 telecamera', items: [['v-cam', 1]] }, { nome: '2 telecamere', items: [['v-cam', 1], ['v-dome', 1]] }],
    allarme: [null, { nome: 'Contatti su porte e finestre', items: [['s-cont', 3]] }, { nome: 'Contatti e volumetrico', items: [['s-cont', 3], ['s-ir', 1]] }],
    rete: [null, { nome: '2 prese rete', items: [['r-punto', 2]] }, { nome: '4 prese rete e Wi-Fi', items: [['r-punto', 4], ['r-ap', 1]] }]
  };
  var ORE_PROG = { knx: [4, 1.5], audio: [2, 0.5], video: [2, 0.5], allarme: [3, 0.3], rete: [3, 0.3] }; // fisse + per stanza
  var ORE_COLLAUDO = 6;

  // elenco materiali di un progetto: { art, q, stanze: {nome: q} }
  function distinta(p) {
    var mappa = {}, can = { luci: 0, dimmer: 0, tapp: 0 }, usati = {}, nStanze = {}, plusKnx = false, punti = 0, cam = 0;
    function add(art, q, dove) {
      if (!q) return;
      var r = mappa[art] || (mappa[art] = { art: art, q: 0, stanze: {} });
      r.q += q; r.stanze[dove] = (r.stanze[dove] || 0) + q;
    }
    p.stanze.forEach(function (s) {
      D.sistemi.forEach(function (sy) {
        var l = s.liv[sy.id], L = l && LIVELLI[sy.id][l]; if (!L) return;
        usati[sy.id] = true; nStanze[sy.id] = (nStanze[sy.id] || 0) + 1;
        L.items.forEach(function (it) { add(it[0], it[1], s.nome); if (it[0] === 'r-punto') punti += it[1]; if (it[0] === 'r-ap') punti++; if (it[0] === 'v-cam' || it[0] === 'v-dome') cam += it[1]; });
        if (L.canali) { can.luci += L.canali.luci; can.dimmer += L.canali.dimmer; can.tapp += L.canali.tapp; }
        if (sy.id === 'knx' && l === 2) plusKnx = true;
      });
    });
    var LT = 'Locale tecnico';
    if (usati.knx) {
      add('k-alim', 1, LT); add('k-ip', 1, LT); if (plusKnx) add('k-srv', 1, LT);
      add('k-att8', Math.ceil(can.luci / 8), LT); add('k-dim4', Math.ceil(can.dimmer / 4), LT); add('k-tapp', Math.ceil(can.tapp / 4), LT);
      add('k-cavo', Math.ceil(nStanze.knx / 4), LT);
    }
    if (usati.audio) add('a-cavo', Math.ceil(nStanze.audio / 4), LT);
    if (usati.video) add('v-nvr', Math.ceil(cam / 8), LT);
    if (usati.allarme) { add('s-cent', 1, LT); add('s-tast', 1, LT); add('s-sir', 1, LT); }
    if (usati.rete || usati.video || usati.knx) {
      add('r-rack', 1, LT); add('r-gw', 1, LT); add('r-ups', 1, LT);
      add('r-sw', Math.max(1, Math.ceil((punti + cam + 2) / 16)), LT); add('r-cavo', Math.max(1, Math.ceil((punti + cam) / 20)), LT);
      usati.rete = true; nStanze.rete = nStanze.rete || 0;
    }
    var righe = D.catalogo.filter(function (a) { return mappa[a.id]; }).map(function (a) { return mappa[a.id]; });
    var prog = {};
    Object.keys(usati).forEach(function (k) { prog[k] = ORE_PROG[k][0] + ORE_PROG[k][1] * (nStanze[k] || 0); });
    return { righe: righe, prog: prog, usati: usati };
  }

  // stato di un materiale nel progetto: preventivo, da ordinare, ordinato, magazzino, in posa, installato
  function residuo(o, art) { var r = o.righe.filter(function (x) { return x.art === art; })[0]; return r ? r.q - r.ricevuti : 0; }
  function statoMat(p, art) {
    var a = articolo(art), i = statoIdx(p.stato), av = p.avanz[a.sis] || 0, o = p.mat[art];
    if (i === 0) return { st: 'preventivo' };
    if (i >= 5 || av >= 100) return { st: 'installato' };
    if (o && o.ordine) { var ord = ordine(o.ordine); if (residuo(ord, art) > 0) return { st: 'ordinato', ord: ord }; }
    else if (o && o.st) return { st: o.st };
    if (av > 0) return { st: 'in posa' };
    return { st: i === 1 ? 'da ordinare' : 'magazzino' };
  }
  var MAT_TONO = { preventivo: 'neutral', 'da ordinare': 'danger', ordinato: 'info', magazzino: 'neutral', 'in posa': 'brand', installato: 'ok' };
  function pillMat(m) {
    var t = m.st === 'ordinato' ? 'Ordinato' + (m.ord.consegna ? ', arrivo ' + fmtBreve(m.ord.consegna) : ', da confermare') : m.st === 'magazzino' ? 'In magazzino' : m.st[0].toUpperCase() + m.st.slice(1);
    return '<span class="pill pill-' + MAT_TONO[m.st] + '">' + t + '</span>';
  }
  function daOrdinare(p) { return distinta(p).righe.filter(function (r) { return statoMat(p, r.art).st === 'da ordinare'; }); }

  // avanzamento complessivo pesato sul valore dei materiali di ogni sistema
  function avanzamento(p) {
    var d = distinta(p), pesi = {}, tot = 0, fatto = 0;
    d.righe.forEach(function (r) { var a = articolo(r.art); pesi[a.sis] = (pesi[a.sis] || 0) + a.prezzo * r.q; });
    Object.keys(pesi).forEach(function (k) { tot += pesi[k]; fatto += pesi[k] * (p.avanz[k] || 0) / 100; });
    var i = statoIdx(p.stato);
    if (i >= 5) return 100;
    return tot ? Math.round(fatto / tot * 100) : 0;
  }

  /* ---------- preventivo: totali e margine ---------- */
  var prevOpz = {};
  function opzPrev(p) { return prevOpz[p.id] || (prevOpz[p.id] = { sconto: 0, iva: 22, posa: C.tariffaPosa, prog: C.tariffaProgrammazione, pdfMateriali: true }); }
  function totaliPrev(p) {
    var d = distinta(p), o = opzPrev(p), mat = 0, matCosto = 0, posaH = 0, progH = ORE_COLLAUDO, perSis = {};
    d.righe.forEach(function (r) {
      var a = articolo(r.art), v = a.prezzo * r.q, h = a.ore * r.q;
      mat += v; matCosto += a.costo * r.q; posaH += h;
      perSis[a.sis] = (perSis[a.sis] || 0) + v + h * o.posa;
    });
    Object.keys(d.prog).forEach(function (k) { progH += d.prog[k]; perSis[k] = (perSis[k] || 0) + d.prog[k] * o.prog; });
    var lavoro = posaH * o.posa + progH * o.prog, lordo = mat + lavoro;
    var sc = lordo * o.sconto / 100, netto = lordo - sc, iva = netto * o.iva / 100;
    var costo = matCosto + (posaH + progH) * C.costoOrario, margine = netto - costo;
    return { d: d, mat: mat, matCosto: matCosto, posaH: posaH, progH: progH, lavoro: lavoro, lordo: lordo, sc: sc, netto: netto, iva: iva, tot: netto + iva, costo: costo, margine: margine, pct: netto ? margine / netto * 100 : 0, perSis: perSis };
  }

  /* ---------- contratti, ticket, ordini ---------- */
  var LIV_CTR = {
    Base: { visite: 1, sla: 48, ore: 0, pct: 2.5, servizi: ['1 visita di controllo all\'anno', 'Intervento entro 48 ore lavorative', 'Backup della configurazione', 'Uscite incluse, ore a consuntivo'] },
    Plus: { visite: 2, sla: 24, ore: 4, pct: 4, servizi: ['2 visite di controllo all\'anno', 'Intervento entro 24 ore lavorative', '4 ore di modifiche incluse (scenari, utenti)', 'Aggiornamenti firmware e sostituzione batterie programmata'] },
    Premium: { visite: 3, sla: 8, ore: 10, pct: 6, servizi: ['3 visite all\'anno e monitoraggio remoto', 'Intervento entro 8 ore lavorative', '10 ore di modifiche incluse', 'Licenze di accesso remoto comprese', 'Numero diretto del tecnico'] }
  };
  function canoneSuggerito(valore, liv) { return Math.max(590, Math.round(valore * LIV_CTR[liv].pct / 100 / 10) * 10); }
  function ctrAttivi() { return D.contratti.filter(function (c) { return giorni(c.scad) >= 0; }); }
  function ctrValido(c) { return c && giorni(c.scad) >= 0; }
  function slaEntro(t) {
    var c = contratto(t.contratto);
    if (!ctrValido(c)) return null;
    var h = LIV_CTR[c.livello].sla; return piu(t.aperto, h <= 8 ? 0 : h / 24);
  }
  function fuoriSla(t) { var e = slaEntro(t); return t.stato === 'nuovo' && e && giorni(e) < 0; }
  var PRIO_TONO = { alta: 'danger', media: 'warn', bassa: 'neutral' };
  var TK_TONO = { nuovo: 'warn', pianificato: 'info', chiuso: 'ok' };
  function pillTk(t) { return '<span class="pill pill-' + TK_TONO[t.stato] + '">' + (t.stato === 'nuovo' ? 'Da pianificare' : t.stato === 'pianificato' ? 'Pianificato ' + fmtBreve(t.data) : 'Chiuso') + '</span>'; }
  function copertura(t) {
    var c = contratto(t.contratto);
    if (ctrValido(c)) return { ok: true, testo: 'Coperto dal contratto ' + c.livello + ' ' + c.id };
    if (c) return { ok: false, testo: 'Contratto ' + c.id + ' scaduto il ' + fmt(c.scad) + ': intervento a pagamento' };
    return { ok: false, testo: 'Nessun contratto: intervento a pagamento' };
  }
  function ordineAperto(o) { return o.stato !== 'ricevuto'; }
  function dispon(art) { var m = D.magazzino[art] || [0, 0]; return m[0] - impegnati(art); }
  // impegnati = materiali "in magazzino" già destinati ai progetti aperti
  function impegnati(art) {
    var n = 0;
    D.progetti.forEach(function (p) { if (!inCorso(p)) return; distinta(p).righe.forEach(function (r) { if (r.art === art && statoMat(p, art).st === 'magazzino') n += r.q; }); });
    return n;
  }

  /* ---------- scadenze e allarmi ---------- */
  function inArrivo() {
    var out = [];
    D.ticket.forEach(function (t) { if (t.stato === 'pianificato') out.push({ tipo: 'Ticket', data: t.data, titolo: t.titolo, sotto: t.cliente + ' · ' + (tecnico(t.tecnico) || {}).nome, href: '#/tecnico/' + t.id }); });
    D.contratti.forEach(function (c) { if (c.prossimaVisita && giorni(c.scad) >= 0) out.push({ tipo: 'Visita', data: c.prossimaVisita, titolo: 'Visita di manutenzione ' + c.livello, sotto: c.cliente + ' · ' + c.comune, href: '#/contratti/' + c.id }); });
    D.progetti.forEach(function (p) {
      if (p.inizio && giorni(p.inizio) >= 0) out.push({ tipo: 'Cantiere', data: p.inizio, titolo: 'Inizio lavori', sotto: p.id + ' · ' + p.comune, href: '#/progetto/' + p.id });
      if (p.installazione && giorni(p.installazione) >= 0) out.push({ tipo: 'Cantiere', data: p.installazione, titolo: 'Inizio posa apparecchi', sotto: p.id + ' · ' + p.comune, href: '#/progetto/' + p.id });
      if (p.consegna && giorni(p.consegna) >= 0 && inCorso(p)) out.push({ tipo: 'Consegna', data: p.consegna, titolo: 'Consegna impianto', sotto: p.id + ' · ' + p.comune, href: '#/progetto/' + p.id });
    });
    D.ordini.forEach(function (o) { if (ordineAperto(o) && o.consegna && giorni(o.consegna) >= 0) out.push({ tipo: 'DDT', data: o.consegna, titolo: 'Arrivo materiale ' + o.id, sotto: D.F[o.forn], href: '#/magazzino' }); });
    return out.sort(function (a, b) { return a.data - b.data; });
  }
  function allarmi() {
    var out = [];
    D.ticket.forEach(function (t) {
      if (fuoriSla(t)) out.push({ liv: 'danger', testo: 'Ticket ' + t.id + ' fuori dai tempi del contratto: ' + t.cliente, dett: t.titolo + ' · intervento previsto entro il ' + fmt(slaEntro(t)), href: '#/assistenza/' + t.id });
      else if (t.stato === 'nuovo' && t.priorita === 'alta') out.push({ liv: 'warn', testo: 'Ticket urgente da pianificare: ' + t.cliente, dett: t.titolo + ' · ' + copertura(t).testo, href: '#/assistenza/' + t.id });
    });
    D.ordini.forEach(function (o) {
      if (ordineAperto(o) && o.consegna && giorni(o.consegna) < 0) out.push({ liv: 'danger', testo: 'Materiale in ritardo: ordine ' + o.id + (o.progetto ? ' per ' + o.progetto : ''), dett: D.F[o.forn] + ' · DDT atteso il ' + fmt(o.consegna) + ' (' + rel(o.consegna) + ')', href: '#/magazzino' });
      if (o.stato === 'inviato' && giorni(o.data) <= -3) out.push({ liv: 'warn', testo: 'Ordine ' + o.id + ' senza conferma del fornitore', dett: 'Inviato il ' + fmt(o.data) + ' a ' + D.F[o.forn], href: '#/magazzino' });
    });
    D.progetti.forEach(function (p) {
      var mancano = daOrdinare(p), quando = p.inizio && giorni(p.inizio) >= 0 ? p.inizio : p.installazione;
      if (mancano.length && quando) out.push({ liv: giorni(quando) <= 14 ? 'danger' : 'warn', testo: p.id + ' · ' + p.comune + ': ' + (mancano.length === 1 ? '1 articolo' : mancano.length + ' articoli') + ' da ordinare', dett: (quando === p.inizio ? 'Inizio lavori' : 'Posa apparecchi') + ' il ' + fmt(quando) + ' (' + rel(quando) + ')', href: '#/progetto/' + p.id });
      if ((p.stato === 'assistenza' || (p.consegna && inCorso(p) && giorni(p.consegna) <= 15)) && !ctrValido(contratto(p.contratto))) out.push({ liv: 'warn', testo: p.cliente + ': impianto ' + (p.stato === 'assistenza' ? 'consegnato' : 'in consegna') + ' senza contratto di manutenzione', dett: 'Canone suggerito ' + eur0(canoneSuggerito(totaliPrev(p).netto, 'Plus')) + '/anno (Plus)', href: '#/contratti' });
    });
    D.contratti.forEach(function (c) {
      var n = giorni(c.scad);
      if (n < 0) out.push({ liv: 'danger', testo: 'Contratto ' + c.id + ' scaduto: ' + c.cliente, dett: 'Scaduto il ' + fmt(c.scad) + ' · ' + eur0(c.canone) + '/anno da rinnovare', href: '#/contratti/' + c.id });
      else if (n <= 30) out.push({ liv: 'warn', testo: 'Contratto ' + c.id + ' in scadenza: ' + c.cliente, dett: 'Entro il ' + fmt(c.scad) + ' (' + rel(c.scad) + ') · ' + eur0(c.canone) + '/anno', href: '#/contratti/' + c.id });
    });
    var sotto = D.catalogo.filter(function (a) { var m = D.magazzino[a.id]; return m && m[1] && dispon(a.id) < m[1] && !D.ordini.some(function (o) { return ordineAperto(o) && residuo(o, a.id) > 0; }); });
    if (sotto.length) out.push({ liv: 'warn', testo: (sotto.length === 1 ? '1 articolo' : sotto.length + ' articoli') + ' sotto la scorta minima, senza ordine aperto', dett: sotto.slice(0, 3).map(function (a) { return a.desc; }).join(', ') + (sotto.length > 3 ? '…' : ''), href: '#/magazzino' });
    return out.sort(function (a, b) { return (a.liv === 'danger' ? 0 : 1) - (b.liv === 'danger' ? 0 : 1); });
  }

  /* ---------- guscio ---------- */
  var NAV = [
    ['', 'Cruscotto', 'home'], ['progetti', 'Progetti', 'progetti'], ['preventivo', 'Preventivo', 'preventivo'], ['magazzino', 'Magazzino', 'magazzino'],
    ['assistenza', 'Assistenza', 'assistenza'], ['contratti', 'Contratti', 'contratti'], ['ia', 'Lettura IA', 'ia']
  ];
  function logoHTML(cls) {
    var ini = '<span class="logo-ini ' + cls + '"' + (C.logo ? ' style="display:none"' : '') + '>' + esc(iniziali(C.nome)) + '</span>';
    if (!C.logo) return ini;
    return '<img class="logo ' + cls + '" src="' + esc(C.logo) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'">' + ini;
  }
  function guscio() {
    document.title = C.nome + ' · Impianti';
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
  function kpi(label, val, sotto, icona, href, tono) {
    return '<a class="kpi' + (tono ? ' kpi-' + tono : '') + '" href="' + href + '"><span class="kpi-ico">' + ico(icona) + '</span><small>' + label + '</small><b>' + val + '</b><em>' + sotto + '</em></a>';
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
  function dl(k, v) { return '<dt>' + k + '</dt><dd>' + v + '</dd>'; }
  function toast(msg) {
    var t = $('#toast'); t.innerHTML = ico('check') + '<span>' + msg + '</span>'; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 3400);
  }
  function modale(html, largo) {
    var m = $('#modal');
    m.innerHTML = '<div class="modal-bg" data-act="chiudi"></div><div class="modal-box' + (largo ? ' largo' : '') + '" role="dialog" aria-modal="true"><button class="icon-btn modal-x" data-act="chiudi" aria-label="Chiudi">' + ico('x') + '</button>' + html + '</div>';
    m.hidden = false; document.body.classList.add('no-scroll');
  }
  function chiudiModale() {
    var m = $('#modal'); if (m.hidden) return;
    m.hidden = true; m.innerHTML = ''; document.body.classList.remove('no-scroll');
    var h = location.hash.match(/^#\/(assistenza|contratti)\/./);
    if (h) history.replaceState(null, '', location.pathname + location.search + '#/' + h[1]);
  }
  function stampa(html) {
    $('#print-root').innerHTML = html;
    document.body.classList.add('printing');
    setTimeout(function () { window.print(); }, 50);
  }
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing'); $('#print-root').innerHTML = ''; });
  function docTesta(titolo, sotto) {
    return '<div class="doc-head">' + logoHTML('logo-doc') + '<div class="doc-az"><strong>' + esc(C.nome) + '</strong><span>' + esc(C.sede) + ' · P.IVA ' + esc(C.piva) + '</span><span>' + esc(C.telefono) + ' · ' + esc(C.email) + '</span></div></div>' +
      '<h1 class="doc-title">' + titolo + '</h1>' + (sotto ? '<p class="doc-sub">' + sotto + '</p>' : '');
  }
  function stampFoto(p) { return fmt(p.installazione || p.inizio || OGGI) + ' · ' + p.comune; }

  function infoDemo() {
    modale('<h2>Cosa è vero in questa demo</h2><p class="muted">Questa è una bozza dimostrativa per ' + esc(C.nome) + '. Serve a far vedere come lavorerebbe l\'app, non è ancora il prodotto.</p>' +
      '<div class="two"><div><h3>' + ico('check') + ' Funziona già così</h3><ul><li>Navigazione tra tutte le schermate, da computer e da telefono</li><li>Configuratore per stanza con elenco materiali, margine e totale ricalcolati dal vivo</li><li>Preventivo, rapportino firmato, fascicolo impianto e proposta di rinnovo stampabili in PDF dal browser</li><li>Allarmi calcolati da ticket, ordini, contratti e scorte</li></ul></div>' +
      '<div><h3>' + ico('info') + ' Simulato</h3><ul><li>Tutti i dati: clienti, ville, prezzi, codici articolo e fornitori sono inventati</li><li>La lettura di listini e DDT con l\'IA è un\'animazione</li><li>Nessun salvataggio: ricaricando la pagina si riparte</li><li>Nessun invio: ordini, email e messaggi ai clienti si preparano, li manda l\'ufficio</li></ul></div></div>');
  }

  /* ---------- 1. cruscotto ---------- */
  function vCruscotto() {
    var al = allarmi(), arr = inArrivo();
    var aperti = D.progetti.filter(inCorso);
    var cantieri = aperti.filter(function (p) { var i = statoIdx(p.stato); return i >= 2 && i <= 5; }).length;
    var sett = D.ticket.filter(function (t) { return t.stato === 'pianificato' && giorni(t.data) <= 7; }).length +
      D.contratti.filter(function (c) { return c.prossimaVisita && giorni(c.prossimaVisita) >= 0 && giorni(c.prossimaVisita) <= 7; }).length;
    var daPian = D.ticket.filter(function (t) { return t.stato === 'nuovo'; }).length;
    var rinn = D.contratti.filter(function (c) { return giorni(c.scad) <= 60; });
    var aRischio = rinn.reduce(function (t, c) { return t + c.canone; }, 0);
    var ricorr = ctrAttivi().reduce(function (t, c) { return t + c.canone; }, 0);
    var ora = new Date().getHours();
    var saluto = ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';

    var h = intestazione(saluto + ', ' + esc(C.utente.nome), OGGI.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), '<a class="btn" href="#/preventivo">' + ico('preventivo') + 'Nuovo preventivo</a>');
    h += '<section class="kpis">' +
      kpi('Progetti in corso', aperti.length, cantieri + ' cantieri aperti', 'progetti', '#/progetti') +
      kpi('Interventi nei prossimi 7 giorni', sett, daPian + ' ticket da pianificare', 'assistenza', '#/assistenza', daPian ? 'warn' : '') +
      kpi('Contratti da rinnovare', rinn.length, eur0(aRischio) + '/anno in gioco', 'contratti', '#/contratti', rinn.length ? 'info' : '') +
      kpi('Canoni di manutenzione', eur0(ricorr), ctrAttivi().length + ' contratti · ' + eur0(ricorr / 12) + '/mese', 'euro', '#/contratti') +
      '</section>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('alert') + ' Allarmi</h2><span class="count">' + al.length + '</span></div>' +
      (al.length ? '<ul class="alarms">' + al.map(function (a) { return '<li><a class="alarm alarm-' + a.liv + '" href="' + a.href + '"><span class="dot"></span><div><strong>' + esc(a.testo) + '</strong><small>' + esc(a.dett) + '</small></div>' + ico('chev') + '</a></li>'; }).join('') + '</ul>' : '<p class="empty">Nessun allarme. Tutto in regola.</p>') + '</section>';
    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>' + ico('progetti') + ' Progetti e cantieri</h2><a class="link" href="#/progetti">Tutti</a></div><ul class="cant-list">' +
      aperti.map(function (p) { return '<li>' + rigaProgetto(p) + '</li>'; }).join('') + '</ul></section>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('cal') + ' Interventi e cantieri in arrivo</h2><a class="link" href="#/assistenza">Assistenza</a></div>' + timeline(arr.filter(function (s) { return giorni(s.data) <= 30; }).slice(0, 9)) + '</section></div>';
    var scad = D.contratti.slice().sort(function (a, b) { return a.scad - b.scad; }).filter(function (c) { return giorni(c.scad) <= 90; });
    h += '<section class="card"><div class="card-head"><h2>' + ico('contratti') + ' Contratti di manutenzione in scadenza</h2><a class="link" href="#/contratti">Contratti</a></div>' +
      timeline(scad.map(function (c) { return { tipo: c.livello, data: c.scad, titolo: c.cliente, sotto: c.id + ' · ' + eur0(c.canone) + '/anno', href: '#/contratti/' + c.id }; })) + '</section>';
    return h;
  }
  function timeline(lista) {
    if (!lista.length) return '<p class="empty">Niente in programma.</p>';
    return '<ul class="timeline">' + lista.map(function (s) {
      var n = giorni(s.data);
      return '<li><a href="' + s.href + '"><span class="date date-' + (s.tipo === 'Ticket' || s.tipo === 'Visita' || s.tipo === 'Cantiere' || s.tipo === 'DDT' || s.tipo === 'Consegna' ? (n <= 1 ? 'warn' : 'info') : livello(n)) + '"><b>' + s.data.getDate() + '</b>' + s.data.toLocaleDateString('it-IT', { month: 'short' }) + '</span><div><strong>' + esc(s.titolo) + ' <span class="tag">' + s.tipo + '</span></strong><small>' + esc(s.sotto) + ' · ' + rel(s.data) + '</small></div></a></li>';
    }).join('') + '</ul>';
  }
  function rigaProgetto(p) {
    var extra = '', mancano = statoIdx(p.stato) >= 1 ? daOrdinare(p).length : 0;
    if (mancano) extra = '<span class="mini mini-danger">' + mancano + ' da ordinare</span>';
    else if (p.stato === 'preventivo') extra = '<span class="mini">' + eur0(totaliPrev(p).netto) + '</span>';
    else if (p.inizio && p.inizio > OGGI) extra = '<span class="mini">Inizio ' + fmtBreve(p.inizio) + '</span>';
    else if (p.consegna && inCorso(p)) extra = '<span class="mini mini-' + (giorni(p.consegna) <= 15 ? 'warn' : 'brand') + '">Consegna ' + fmtBreve(p.consegna) + '</span>';
    else if (p.stato === 'assistenza') extra = '<span class="mini mini-' + (ctrValido(contratto(p.contratto)) ? 'brand' : 'warn') + '">' + (ctrValido(contratto(p.contratto)) ? 'Contratto ' + contratto(p.contratto).livello : 'Senza contratto') + '</span>';
    var pct = p.stato === 'preventivo' ? 0 : avanzamento(p);
    var sis = D.sistemi.filter(function (s) { return p.stanze.some(function (x) { return x.liv[s.id]; }); }).map(function (s) { return sysTag(s.id); }).join('');
    return '<a class="cant" href="#/progetto/' + p.id + '"><div class="cant-top"><span class="code">' + p.id + '</span>' + pillStato(p.stato) + '</div><strong>' + esc(p.titolo) + '</strong><small>' + ico('pin') + esc(p.comune) + ' (' + p.prov + ') · ' + p.stanze.length + ' stanze</small>' +
      '<div class="sys-list">' + sis + '</div><div class="cant-bot"><div class="bar"><span style="width:' + pct + '%"></span></div>' + extra + '</div></a>';
  }

  /* ---------- progetti: elenco ---------- */
  var filtroProgetti = 'corso';
  function vProgetti() {
    var lista = D.progetti.filter(function (p) { return filtroProgetti === 'tutti' || (filtroProgetti === 'corso' ? inCorso(p) : p.stato === filtroProgetti); });
    var h = intestazione('Progetti', D.progetti.length + ' ville in archivio', '<a class="btn" href="#/preventivo">' + ico('plus') + 'Nuovo preventivo</a>');
    h += '<div class="filters">' + [['corso', 'In corso'], ['preventivo', 'Preventivi'], ['installazione', 'Installazione'], ['assistenza', 'In assistenza'], ['tutti', 'Tutti']].map(function (f) {
      return '<button class="filter' + (filtroProgetti === f[0] ? ' on' : '') + '" data-act="filtro-prog" data-v="' + f[0] + '">' + f[1] + '</button>';
    }).join('') + '</div>';
    h += '<ul class="cant-grid">' + lista.map(function (p) { return '<li>' + rigaProgetto(p) + '</li>'; }).join('') + '</ul>';
    if (!lista.length) h += '<p class="empty">Nessun progetto in questo stato.</p>';
    return h;
  }

  /* ---------- 2. progetto villa ---------- */
  function documentiProgetto(p) {
    var i = statoIdx(p.stato), docs = [];
    docs.push({ nome: 'Preventivo accettato', st: i >= 1 ? 'ok' : 'todo', info: i >= 1 ? eur0(totaliPrev(p).netto) + ' + IVA' : 'in preparazione', href: '#/preventivo/' + p.id });
    docs.push({ nome: 'Schema del quadro e unifilare', st: i >= 3 ? 'ok' : i === 2 ? 'draft' : 'none', info: i >= 3 ? 'rev. 2' : i === 2 ? 'bozza' : '—' });
    docs.push({ nome: 'Indirizzi di gruppo KNX (export ETS)', st: i >= 5 ? 'ok' : i >= 3 ? 'draft' : 'none', info: i >= 5 ? 'versione di consegna' : i >= 3 ? 'in programmazione' : '—' });
    docs.push({ nome: 'Mappa indirizzi IP e reti', st: i >= 4 ? 'ok' : 'none', info: i >= 4 ? 'generata dall\'elenco materiali' : '—', act: i >= 3 ? 'stampa-fascicolo' : null });
    docs.push({ nome: 'Credenziali di impianto', st: i >= 4 ? 'safe' : 'none', info: i >= 4 ? 'in cassaforte cifrata, visibili solo ai tecnici (non mostrate nella demo)' : '—' });
    docs.push({ nome: 'Dichiarazione di conformità (DM 37/2008)', st: i >= 5 ? 'ok' : i === 4 ? 'todo' : 'none', info: i >= 5 ? 'firmata' : i === 4 ? 'da preparare per la consegna' : '—' });
    docs.push({ nome: 'Fascicolo impianto per il cliente', st: i >= 5 ? 'ok' : i >= 3 ? 'draft' : 'none', info: i >= 3 ? 'stanze, apparecchi, rete e istruzioni' : '—', act: i >= 3 ? 'stampa-fascicolo' : null });
    return docs;
  }
  var DOC_ST = { ok: ['ok', 'Presente'], draft: ['info', 'Bozza'], todo: ['warn', 'Da fare'], none: ['neutral', 'Non ancora'], safe: ['brand', 'Protetto'] };

  function vProgetto(id) {
    var p = progetto(id); if (!p) return '<p class="empty">Progetto non trovato.</p>';
    var i = statoIdx(p.stato), d = distinta(p), mancano = i >= 1 ? daOrdinare(p) : [];
    var azioni = '<a class="btn" href="#/preventivo/' + p.id + '">' + ico('preventivo') + (i === 0 ? 'Configura preventivo' : 'Preventivo') + '</a>' +
      (i >= 3 ? '<button class="btn btn-ghost" data-act="stampa-fascicolo" data-id="' + p.id + '">' + ico('print') + 'Fascicolo impianto</button>' : '') +
      (p.stato !== 'assistenza' ? '<button class="btn btn-ghost" data-act="avanza" data-id="' + p.id + '">Avanza stato ' + ico('chev') + '</button>' : '');
    var h = intestazione(esc(p.titolo), '<span class="code">' + p.id + '</span> ' + pillStato(p.stato) + ' · ' + esc(p.cliente), azioni, '#/progetti');
    h += '<div class="card stepper-card">' + stepper(p.stato) + '</div>';
    if (mancano.length) h += '<div class="banner banner-' + (p.inizio && giorni(p.inizio) <= 14 && giorni(p.inizio) >= 0 ? 'danger' : 'warn') + '">' + ico('truck') + '<div><strong>' + (mancano.length === 1 ? '1 articolo' : mancano.length + ' articoli') + ' ancora da ordinare</strong><small>' + mancano.slice(0, 4).map(function (r) { return r.q + ' × ' + articolo(r.art).desc; }).join(', ') + (mancano.length > 4 ? '…' : '') + '</small></div><button class="btn btn-sm" data-act="ordina" data-id="' + p.id + '">Prepara ordine</button></div>';
    if (p.stato === 'assistenza' && !ctrValido(contratto(p.contratto))) h += '<div class="banner banner-warn">' + ico('contratti') + '<div><strong>Impianto senza contratto di manutenzione</strong><small>Ogni intervento si fattura a parte e il cliente non ha tempi garantiti.</small></div><button class="btn btn-sm" data-act="proponi" data-id="' + p.id + '">Proponi contratto</button></div>';

    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>Dati del progetto</h2></div><dl class="dl">' +
      dl('Cliente', esc(p.cliente)) + dl('Referente', esc(p.referente)) + dl('Progettista', esc(p.architetto)) + dl('Indirizzo', esc(p.indirizzo) + ', ' + esc(p.comune) + ' (' + p.prov + ')') +
      dl('Tempi', p.inizio ? 'Inizio ' + fmt(p.inizio) + ' · posa apparecchi ' + fmt(p.installazione) + ' · consegna ' + fmt(p.consegna) : 'da definire all\'accettazione') +
      dl('Importo', eur0(totaliPrev(p).netto) + ' + IVA') + dl('Tecnici', p.tecnici.length ? p.tecnici.map(function (t) { return esc(tecnico(t).nome); }).join(', ') : 'da assegnare') +
      dl('Manutenzione', ctrValido(contratto(p.contratto)) ? 'Contratto ' + contratto(p.contratto).livello + ' ' + p.contratto : 'nessun contratto') + dl('Note', esc(p.note)) + '</dl></section>';

    h += '<section class="card"><div class="card-head"><h2>Avanzamento</h2><span class="muted small">trascina per aggiornare</span></div><div class="avz-tot"><b id="avz-tot">' + avanzamento(p) + '%</b><span class="muted">pesato sul valore dei materiali</span></div><div class="avz">' +
      D.sistemi.filter(function (s) { return d.usati[s.id]; }).map(function (s) {
        var v = p.avanz[s.id] || 0;
        return '<div class="avz-row" style="--c:' + s.colore + '"><span>' + sysTag(s.id).replace(s.breve, s.nome) + '</span><div class="bar"><span id="avz-bar-' + s.id + '" style="width:' + v + '%"></span></div><b id="avz-v-' + s.id + '">' + v + '%</b>' +
          (i >= 2 && i <= 5 ? '<input type="range" min="0" max="100" step="5" value="' + v + '" data-avz="' + s.id + '" data-id="' + p.id + '" aria-label="Avanzamento ' + s.nome + '">' : '') + '</div>';
      }).join('') + '</div></section></div>';

    h += '<section class="card table-card"><div class="card-head pad"><h2>Stanze e impianti</h2><span class="muted">B = base, P = plus</span></div><table class="tbl tbl-stanze"><thead><tr><th>Stanza</th><th>Piano</th>' +
      D.sistemi.map(function (s) { return '<th>' + s.breve + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.stanze.map(function (s) {
        return '<tr><td><strong>' + esc(s.nome) + '</strong></td><td class="muted">' + esc(s.piano) + '</td>' + D.sistemi.map(function (sy) {
          var l = s.liv[sy.id] || 0, L = LIVELLI[sy.id][l];
          return '<td><span class="lv lv-' + l + '" style="--c:' + sy.colore + '" title="' + (L ? esc(L.nome) : 'Niente') + '">' + (l === 2 ? 'P' : l === 1 ? 'B' : '–') + '</span></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></section>';

    h += '<section class="card table-card"><div class="card-head pad"><h2>Elenco materiali</h2><span class="count">' + d.righe.length + ' articoli</span></div><table class="tbl tbl-mat"><thead><tr><th>Codice</th><th>Descrizione</th><th>Impianto</th><th class="r">Q.tà</th><th>Stato</th></tr></thead><tbody>' +
      d.righe.map(function (r) { var a = articolo(r.art); return '<tr><td><span class="code">' + a.cod + '</span></td><td data-l="Descrizione">' + esc(a.desc) + ' <small class="muted">' + a.marca + '</small></td><td data-l="Impianto">' + sysTag(a.sis) + '</td><td class="r" data-l="Q.tà">' + r.q + '</td><td data-l="Stato">' + pillMat(statoMat(p, r.art)) + '</td></tr>'; }).join('') +
      '</tbody></table></section>';

    h += '<section class="card"><div class="card-head"><h2>' + ico('camera') + ' Foto di cantiere</h2><span class="muted">' + p.foto.length + ' foto</span></div><div class="gallery">' +
      p.foto.map(function (f, k) { return '<button class="ph" data-act="foto" data-id="' + p.id + '" data-k="' + k + '">' + window.fotoSVG(f, stampFoto(p)) + '</button>'; }).join('') +
      '<label class="ph ph-add">' + ico('camera') + '<span>Aggiungi foto</span><input type="file" accept="image/*" capture="environment" data-act="foto-add" data-id="' + p.id + '" hidden></label></div></section>';

    h += '<section class="card"><div class="card-head"><h2>' + ico('doc') + ' Fascicolo impianto (as-built)</h2></div><ul class="docs">' + documentiProgetto(p).map(function (x) {
      var st = DOC_ST[x.st], inner = ico('doc') + '<div><strong>' + x.nome + '</strong><small>' + x.info + '</small></div><span class="pill pill-' + st[0] + '">' + st[1] + '</span>';
      if (x.act) return '<li><a href="#" data-act="' + x.act + '" data-id="' + p.id + '">' + inner + ico('chev') + '</a></li>';
      return '<li>' + (x.href ? '<a href="' + x.href + '">' + inner + ico('chev') + '</a>' : '<div class="doc-row">' + inner + '</div>') + '</li>';
    }).join('') + '</ul></section>';
    return h;
  }

  // fascicolo impianto: stanze, apparecchi e indirizzi IP generati dall'elenco materiali
  function docFascicolo(p) {
    var d = distinta(p), ip = 20, rete = [];
    d.righe.forEach(function (r) {
      var a = articolo(r.art);
      if (['k-ip', 'k-srv', 'a-amp', 'v-cam', 'v-dome', 'v-nvr', 's-cent', 'r-sw', 'r-ap', 'r-gw'].indexOf(a.id) < 0) return;
      Object.keys(r.stanze).forEach(function (st) { for (var k = 0; k < r.stanze[st]; k++) rete.push([a.desc, st, a.id === 'r-gw' ? '192.168.10.1' : '192.168.10.' + (ip++)]); });
    });
    return docTesta('Fascicolo impianto', esc(p.titolo) + ' · ' + esc(p.cliente) + ' · aggiornato al ' + fmt(OGGI)) +
      '<table class="doc-kv"><tr><th>Indirizzo</th><td>' + esc(p.indirizzo) + ', ' + esc(p.comune) + ' (' + p.prov + ')</td></tr><tr><th>Impianti</th><td>' + D.sistemi.filter(function (s) { return d.usati[s.id]; }).map(function (s) { return s.nome; }).join(', ') + '</td></tr><tr><th>Installatore</th><td>' + esc(C.nome) + ' · ' + esc(C.qualifiche) + '</td></tr><tr><th>Assistenza</th><td>' + (ctrValido(contratto(p.contratto)) ? 'Contratto ' + contratto(p.contratto).livello + ' ' + p.contratto + ', scadenza ' + fmt(contratto(p.contratto).scad) : 'Nessun contratto di manutenzione attivo') + ' · ' + esc(C.telefono) + '</td></tr></table>' +
      '<h2>1. Stanze e funzioni</h2><table class="doc-tbl"><thead><tr><th>Stanza</th>' + D.sistemi.map(function (s) { return '<th>' + s.breve + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.stanze.map(function (s) { return '<tr><td>' + esc(s.nome) + ' (' + esc(s.piano) + ')</td>' + D.sistemi.map(function (sy) { var L = LIVELLI[sy.id][s.liv[sy.id] || 0]; return '<td>' + (L ? esc(L.nome) : '—') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' +
      '<h2>2. Apparecchi installati</h2><table class="doc-tbl"><thead><tr><th>Codice</th><th>Descrizione</th><th>Marca</th><th class="r">Q.tà</th></tr></thead><tbody>' +
      d.righe.map(function (r) { var a = articolo(r.art); return '<tr><td>' + a.cod + '</td><td>' + esc(a.desc) + '</td><td>' + a.marca + '</td><td class="r">' + r.q + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2>3. Rete: indirizzi IP</h2><table class="doc-tbl"><thead><tr><th>Apparecchio</th><th>Posizione</th><th>Indirizzo IP</th></tr></thead><tbody>' +
      rete.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td><td>' + x[2] + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2>4. Credenziali</h2><p>Le password di impianto (server, router, NVR, centrale) non sono stampate in questo fascicolo: sono custodite in cassaforte cifrata dall\'installatore e consegnate al cliente in busta chiusa.</p>' +
      '<div class="doc-firme"><div>L\'installatore<span>' + esc(C.responsabileTecnico) + '</span></div><div>Il cliente, per ricevuta<span>&nbsp;</span></div></div>' +
      '<p class="doc-foot">Documento dimostrativo con dati inventati. Nell\'app vera il fascicolo si aggiorna a ogni intervento.</p>';
  }

  /* ---------- 3. preventivo e configuratore ---------- */
  function vPreventivo(id) {
    var cand = D.progetti.filter(function (x) { return x.stato !== 'assistenza'; });
    var p = progetto(id) || cand.filter(function (x) { return x.stato === 'preventivo'; })[0];
    var o = opzPrev(p);
    var h = intestazione('Preventivo e configuratore', 'Scegli cosa va in ogni stanza: materiali, ore, margine e totale si calcolano da soli', '<button class="btn" data-act="stampa-prev" data-id="' + p.id + '">' + ico('print') + 'Stampa / PDF</button>');
    h += '<label class="select-cant"><span>Progetto</span><select data-act="cambia-prev">' + cand.map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + x.id + ' · ' + esc(x.cliente) + ', ' + esc(x.comune) + '</option>'; }).join('') + '</select></label>';
    if (statoIdx(p.stato) >= 1) h += '<div class="banner banner-info">' + ico('info') + '<div><strong>Preventivo già accettato</strong><small>Le modifiche qui diventano una variante: elenco materiali e ordini del progetto si aggiornano.</small></div></div>';
    h += '<div class="split split-prev"><div>';
    h += '<section class="card table-card"><div class="card-head pad"><h2>Stanze e sistemi</h2><button class="btn btn-sm btn-ghost" data-act="add-stanza" data-id="' + p.id + '">' + ico('plus') + 'Stanza</button></div><div id="prev-matrix">' + tabMatrix(p) + '</div></section>';
    h += '<section class="card table-card"><div class="card-head pad"><h2>Elenco materiali</h2><span class="muted" id="prev-nart">' + distinta(p).righe.length + ' articoli, apparecchi centrali compresi</span></div><div id="prev-mat">' + tabMateriali(p) + '</div></section>';
    h += '</div><aside class="card totals" id="prev-tot">' + boxTotali(p) + '</aside></div>';
    return h;
  }
  function tabMatrix(p) {
    return '<table class="tbl tbl-matrix"><thead><tr><th>Stanza</th>' + D.sistemi.map(function (s) { return '<th>' + sysTag(s.id) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.stanze.map(function (s, k) {
        return '<tr><td>' + esc(s.nome) + ' <small class="muted">' + esc(s.piano) + '</small></td>' + D.sistemi.map(function (sy) {
          var l = s.liv[sy.id] || 0;
          return '<td data-l="' + sy.breve + '"><select data-stanza="' + k + '" data-sis="' + sy.id + '" aria-label="' + esc(s.nome) + ', ' + sy.nome + '">' +
            LIVELLI[sy.id].map(function (L, n) { return '<option value="' + n + '"' + (n === l ? ' selected' : '') + '>' + (L ? (n === 1 ? 'Base: ' : 'Plus: ') + L.nome : '—') + '</option>'; }).join('') + '</select></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
  }
  function tabMateriali(p) {
    var d = distinta(p);
    return '<table class="tbl tbl-mat"><thead><tr><th>Codice</th><th>Descrizione</th><th class="r">Q.tà</th><th class="r">Costo</th><th class="r">Prezzo</th><th class="r">Importo</th></tr></thead><tbody>' +
      d.righe.map(function (r) {
        var a = articolo(r.art), dove = Object.keys(r.stanze).map(function (s) { return s + (r.stanze[s] > 1 ? ' ×' + r.stanze[s] : ''); }).join(', ');
        return '<tr><td><span class="code">' + a.cod + '</span> ' + sysTag(a.sis) + '</td><td data-l="Descrizione">' + esc(a.desc) + '<small class="muted d-block">' + esc(dove) + '</small></td><td class="r" data-l="Q.tà">' + r.q + '</td><td class="r muted" data-l="Costo">' + eur(a.costo) + '</td><td class="r" data-l="Prezzo">' + eur(a.prezzo) + '</td><td class="r" data-l="Importo"><b>' + eur(a.prezzo * r.q) + '</b></td></tr>';
      }).join('') + '</tbody></table>';
  }
  function boxTotali(p) {
    var t = totaliPrev(p), o = opzPrev(p), max = 0;
    Object.keys(t.perSis).forEach(function (k) { max = Math.max(max, t.perSis[k]); });
    var cls = t.pct < 20 ? 'critico' : t.pct < 30 ? 'basso' : '';
    return '<h2>Riepilogo</h2><p class="muted small">' + esc(p.cliente) + '<br>' + esc(p.indirizzo) + ', ' + esc(p.comune) + ' · ' + p.stanze.length + ' stanze</p>' +
      '<div class="sys-bars">' + D.sistemi.filter(function (s) { return t.perSis[s.id]; }).map(function (s) { return '<div style="--c:' + s.colore + '"><span>' + s.breve + '</span><div class="bar"><span style="width:' + Math.round(t.perSis[s.id] / max * 100) + '%"></span></div><em>' + eur0(t.perSis[s.id]) + '</em></div>'; }).join('') + '</div>' +
      '<dl class="sum"><dt>Materiali</dt><dd>' + eur(t.mat) + '</dd>' +
      '<dt>Posa ' + num(t.posaH, 1) + ' h × <input type="number" min="0" step="1" data-prev="posa" value="' + o.posa + '" aria-label="Tariffa posa">€</dt><dd>' + eur(t.posaH * o.posa) + '</dd>' +
      '<dt>Programmazione e collaudo ' + num(t.progH, 1) + ' h × <input type="number" min="0" step="1" data-prev="prog" value="' + o.prog + '" aria-label="Tariffa programmazione">€</dt><dd>' + eur(t.progH * o.prog) + '</dd>' +
      '<dt>Sconto <input type="number" min="0" max="30" step="1" data-prev="sconto" value="' + o.sconto + '" aria-label="Sconto percentuale">%</dt><dd>− ' + eur(t.sc) + '</dd>' +
      '<dt>Imponibile</dt><dd>' + eur(t.netto) + '</dd><dt>IVA <select data-prev="iva" aria-label="Aliquota IVA"><option' + (o.iva === 22 ? ' selected' : '') + '>22</option><option' + (o.iva === 10 ? ' selected' : '') + '>10</option></select>%</dt><dd>' + eur(t.iva) + '</dd></dl>' +
      '<div class="grand"><span>Totale</span><b>' + eur(t.tot) + '</b></div>' +
      '<div class="marg ' + cls + '"><small>Margine interno (non va nel PDF)</small><strong>' + eur0(t.margine) + ' · ' + num(t.pct, 1) + '%</strong><small>Costo materiali ' + eur0(t.matCosto) + ' + ' + num(t.posaH + t.progH, 1) + ' h a ' + C.costoOrario + ' €/h' + (cls ? (cls === 'critico' ? ' · sotto il 20%: rivedi lo sconto' : ' · sotto il 30%') : '') + '</small></div>' +
      '<label class="opt"><input type="checkbox" data-prev="pdfMateriali"' + (o.pdfMateriali ? ' checked' : '') + '> Elenco materiali dettagliato nel PDF</label>' +
      '<p class="muted small">Prezzi di esempio. L\'aliquota IVA corretta va verificata caso per caso.</p>' +
      '<button class="btn btn-block" data-act="stampa-prev" data-id="' + p.id + '">' + ico('print') + 'Stampa / PDF</button><button class="btn btn-ghost btn-block" data-act="demo-invia">Prepara email al cliente</button>';
  }
  function docPreventivo(p) {
    var t = totaliPrev(p), o = opzPrev(p);
    return docTesta('Preventivo n. ' + p.id.replace('P-', 'PV-'), 'Data ' + fmt(OGGI) + ' · validità 30 giorni') +
      '<table class="doc-kv"><tr><th>Cliente</th><td>' + esc(p.cliente) + '</td></tr><tr><th>Luogo</th><td>' + esc(p.indirizzo) + ', ' + esc(p.comune) + ' (' + p.prov + ')</td></tr><tr><th>Progettista</th><td>' + esc(p.architetto) + '</td></tr><tr><th>Impianti</th><td>' + D.sistemi.filter(function (s) { return t.d.usati[s.id]; }).map(function (s) { return s.nome; }).join(', ') + '</td></tr></table>' +
      '<h2>Soluzione stanza per stanza</h2><table class="doc-tbl"><thead><tr><th>Stanza</th>' + D.sistemi.map(function (s) { return '<th>' + s.breve + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.stanze.map(function (s) { return '<tr><td>' + esc(s.nome) + '</td>' + D.sistemi.map(function (sy) { var L = LIVELLI[sy.id][s.liv[sy.id] || 0]; return '<td>' + (L ? esc(L.nome) : '—') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' +
      '<h2>Riepilogo per impianto</h2><table class="doc-tbl"><thead><tr><th>Impianto</th><th class="r">Materiali, posa e programmazione</th></tr></thead><tbody>' +
      D.sistemi.filter(function (s) { return t.perSis[s.id]; }).map(function (s) { return '<tr><td>' + s.nome + '</td><td class="r">' + eur(t.perSis[s.id]) + '</td></tr>'; }).join('') +
      '<tr><td>Collaudo, consegna e fascicolo impianto</td><td class="r">' + eur(ORE_COLLAUDO * o.prog) + '</td></tr></tbody></table>' +
      (o.pdfMateriali ? '<h2>Elenco materiali</h2><table class="doc-tbl"><thead><tr><th>Codice</th><th>Descrizione</th><th>Marca</th><th class="r">Q.tà</th><th class="r">Prezzo</th><th class="r">Importo</th></tr></thead><tbody>' +
        t.d.righe.map(function (r) { var a = articolo(r.art); return '<tr><td>' + a.cod + '</td><td>' + esc(a.desc) + '</td><td>' + a.marca + '</td><td class="r">' + r.q + '</td><td class="r">' + eur(a.prezzo) + '</td><td class="r">' + eur(a.prezzo * r.q) + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
      '<table class="doc-sum"><tr><td>Materiali</td><td>' + eur(t.mat) + '</td></tr><tr><td>Posa in opera (' + num(t.posaH, 1) + ' h)</td><td>' + eur(t.posaH * o.posa) + '</td></tr><tr><td>Programmazione e collaudo (' + num(t.progH, 1) + ' h)</td><td>' + eur(t.progH * o.prog) + '</td></tr>' +
      (o.sconto ? '<tr><td>Sconto ' + o.sconto + '%</td><td>− ' + eur(t.sc) + '</td></tr>' : '') +
      '<tr><td>Imponibile</td><td>' + eur(t.netto) + '</td></tr><tr><td>IVA ' + o.iva + '%</td><td>' + eur(t.iva) + '</td></tr><tr class="grand"><td>Totale</td><td>' + eur(t.tot) + '</td></tr></table>' +
      '<p>Pagamenti: 30% all\'accettazione, 40% alla posa degli apparecchi, 30% alla consegna. Dopo la consegna proponiamo un contratto di manutenzione a partire da ' + eur0(canoneSuggerito(t.netto, 'Base')) + ' all\'anno.</p>' +
      '<div class="doc-firme"><div>Per ' + esc(C.nome) + '<span>' + esc(C.titolare) + '</span></div><div>Per accettazione<span>&nbsp;</span></div></div>' +
      '<p class="doc-foot">Documento dimostrativo con dati e prezzi inventati.</p>';
  }
  function aggiornaPrev(p, rifaiMatrice) {
    if (rifaiMatrice) $('#prev-matrix').innerHTML = tabMatrix(p);
    $('#prev-mat').innerHTML = tabMateriali(p);
    $('#prev-nart').textContent = distinta(p).righe.length + ' articoli, apparecchi centrali compresi';
    var active = document.activeElement && document.activeElement.getAttribute('data-prev');
    if (!active || active === 'iva' || active === 'pdfMateriali') { $('#prev-tot').innerHTML = boxTotali(p); return; }
    // mentre si scrive in un campo del riepilogo non lo ridisegno, per non perdere il cursore
    var box = document.createElement('div'); box.innerHTML = boxTotali(p);
    ['.sys-bars', '.sum', '.grand', '.marg'].forEach(function (s) {
      if (s === '.sum') { var nuovi = $$('dd', box), vecchi = $$('#prev-tot .sum dd'); vecchi.forEach(function (dd, k) { dd.textContent = nuovi[k].textContent; }); $$('#prev-tot .sum dt').forEach(function (dt, k) { var n = $$('dt', box)[k]; if (dt.firstChild && dt.firstChild.nodeType === 3) dt.firstChild.textContent = n.firstChild.textContent; }); }
      else $('#prev-tot ' + s).outerHTML = $(s, box).outerHTML;
    });
  }

  /* ---------- 4. magazzino e ordini ---------- */
  var tabMag = 'ordini';
  var ORD_TONO = { inviato: 'warn', confermato: 'info', parziale: 'info', ricevuto: 'ok' };
  function vMagazzino() {
    var aperti = D.ordini.filter(ordineAperto), valore = 0;
    D.catalogo.forEach(function (a) { valore += (D.magazzino[a.id] || [0])[0] * a.costo; });
    var sotto = D.catalogo.filter(function (a) { var m = D.magazzino[a.id]; return m && m[1] && dispon(a.id) < m[1]; });
    var prossimo = aperti.filter(function (o) { return o.consegna; }).sort(function (a, b) { return a.consegna - b.consegna; })[0];
    var h = intestazione('Magazzino e ordini', 'Giacenze, materiali ordinati e DDT in arrivo dai fornitori', '<a class="btn" href="#/ia/ddt">' + ico('ia') + 'Leggi un DDT</a>');
    h += '<section class="kpis">' + kpi('Ordini aperti', aperti.length, aperti.filter(function (o) { return o.stato === 'inviato'; }).length + ' senza conferma', 'truck', '#/magazzino') +
      kpi('Prossimo DDT in arrivo', prossimo ? fmtBreve(prossimo.consegna) : '—', prossimo ? prossimo.id + ' · ' + rel(prossimo.consegna) : 'nessuno', 'cal', '#/magazzino', prossimo && giorni(prossimo.consegna) < 0 ? 'warn' : '') +
      kpi('Sotto scorta', sotto.length, sotto.filter(function (a) { return D.ordini.some(function (o) { return ordineAperto(o) && residuo(o, a.id) > 0; }); }).length + ' già in ordine', 'alert', '#/magazzino', sotto.length ? 'info' : '') +
      kpi('Valore a magazzino', eur0(valore), 'a prezzo di acquisto', 'magazzino', '#/magazzino') + '</section>';
    h += '<div class="seg"><button data-act="tab-mag" data-v="ordini" class="' + (tabMag === 'ordini' ? 'on' : '') + '">Ordini e DDT</button><button data-act="tab-mag" data-v="giacenze" class="' + (tabMag === 'giacenze' ? 'on' : '') + '">Giacenze</button></div>';
    if (tabMag === 'ordini') {
      h += '<div class="card table-card"><table class="tbl tbl-ord"><thead><tr><th>Ordine</th><th>Fornitore</th><th>Per</th><th>Materiale</th><th>Consegna</th><th></th></tr></thead><tbody>' +
        D.ordini.slice().sort(function (a, b) { return (ordineAperto(b) - ordineAperto(a)) || (a.consegna || piu(OGGI, 999)) - (b.consegna || piu(OGGI, 999)); }).map(function (o) {
          var cons = o.stato === 'ricevuto' ? '<span class="pill pill-ok">' + esc(o.ddt) + '</span>' : o.consegna ? '<span class="pill pill-' + (giorni(o.consegna) < 0 ? 'danger' : giorni(o.consegna) <= 2 ? 'warn' : 'info') + '">' + (giorni(o.consegna) < 0 ? 'In ritardo, atteso ' : 'DDT atteso ') + fmt(o.consegna) + '</span>' : '<span class="pill pill-warn">Da confermare</span>';
          return '<tr><td><strong>' + o.id + '</strong> <span class="pill pill-' + ORD_TONO[o.stato] + '">' + o.stato[0].toUpperCase() + o.stato.slice(1) + '</span><small class="muted d-block">del ' + fmt(o.data) + '</small></td>' +
            '<td data-l="Fornitore">' + esc(D.F[o.forn]) + '</td><td data-l="Per">' + (o.progetto ? '<a href="#/progetto/' + o.progetto + '">' + o.progetto + '</a>' : 'Scorta') + '</td>' +
            '<td data-l="Materiale">' + o.righe.map(function (r) { return (r.ricevuti && r.ricevuti < r.q ? r.ricevuti + '/' : '') + r.q + ' × ' + esc(articolo(r.art).desc); }).join('<br>') + '</td><td data-l="Consegna">' + cons + '</td>' +
            '<td class="r">' + (o.stato === 'ricevuto' ? '' : o.stato === 'inviato' ? '<a class="btn btn-sm btn-ghost" href="#/ia/conferma">' + ico('ia') + 'Leggi conferma</a>' : '<a class="btn btn-sm btn-ghost" href="#/ia/ddt">' + ico('ia') + 'Leggi DDT</a>') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    } else {
      h += '<div class="card table-card"><table class="tbl tbl-mag"><thead><tr><th>Articolo</th><th>Impianto</th><th class="r">Giacenza</th><th class="r">Impegnati</th><th class="r">Disponibili</th><th class="r">In arrivo</th></tr></thead><tbody>' +
        D.catalogo.map(function (a) {
          var m = D.magazzino[a.id] || [0, 0], imp = impegnati(a.id), disp = m[0] - imp, arr = 0;
          D.ordini.forEach(function (o) { if (ordineAperto(o)) arr += residuo(o, a.id); });
          return '<tr><td><strong>' + esc(a.desc) + '</strong><small class="muted d-block">' + a.cod + ' · ' + a.marca + '</small></td><td data-l="Impianto">' + sysTag(a.sis) + '</td><td class="r" data-l="Giacenza">' + m[0] + '</td><td class="r" data-l="Impegnati">' + (imp || '—') + '</td>' +
            '<td class="r" data-l="Disponibili">' + (m[1] && disp < m[1] ? '<span class="pill pill-' + (disp < 0 ? 'danger' : 'warn') + '">' + disp + ' (min. ' + m[1] + ')</span>' : disp) + '</td><td class="r" data-l="In arrivo">' + (arr || '—') + '</td></tr>';
        }).join('') + '</tbody></table></div><p class="note">' + ico('info') + 'Impegnati = materiali in magazzino già destinati ai progetti aperti. Nell\'app vera il carico arriva dai DDT letti e lo scarico dai rapportini dei tecnici.</p>';
    }
    return h;
  }

  /* ---------- 5. assistenza: ticket e app del tecnico ---------- */
  var filtroTk = 'aperti';
  function vAssistenza(apri) {
    var lista = D.ticket.filter(function (t) { return filtroTk === 'tutti' || (filtroTk === 'aperti' ? t.stato !== 'chiuso' : t.stato === filtroTk); })
      .sort(function (a, b) { var pr = { alta: 0, media: 1, bassa: 2 }; return (a.stato === 'chiuso') - (b.stato === 'chiuso') || pr[a.priorita] - pr[b.priorita] || a.aperto - b.aperto; });
    var aperti = D.ticket.filter(function (t) { return t.stato !== 'chiuso'; });
    var fuori = D.ticket.filter(function (t) { return t.stato === 'chiuso' && !copertura(t).ok && giorni(t.chiuso) >= -31; });
    var daFatt = fuori.reduce(function (s, t) { return s + C.dirittoUscita + (t.ore || 1) * C.tariffaPosa; }, 0);
    var h = intestazione('Assistenza', 'Ticket dei clienti e interventi dei tecnici', '<button class="btn" data-act="portale">' + ico('plus') + 'Ticket dal portale cliente</button>');
    h += '<section class="kpis">' + kpi('Ticket aperti', aperti.length, aperti.filter(function (t) { return t.stato === 'nuovo'; }).length + ' da pianificare', 'assistenza', '#/assistenza') +
      kpi('Fuori dai tempi del contratto', D.ticket.filter(fuoriSla).length, 'da chiamare subito', 'alert', '#/assistenza', D.ticket.filter(fuoriSla).length ? 'warn' : '') +
      kpi('Interventi nei prossimi 7 giorni', D.ticket.filter(function (t) { return t.stato === 'pianificato' && giorni(t.data) <= 7; }).length, 'più le visite programmate', 'cal', '#/assistenza') +
      kpi('Fuori contratto da fatturare', eur0(daFatt), fuori.length + ' interventi negli ultimi 30 giorni', 'euro', '#/assistenza') + '</section>';
    h += '<div class="filters">' + [['aperti', 'Aperti'], ['nuovo', 'Da pianificare'], ['pianificato', 'Pianificati'], ['chiuso', 'Chiusi'], ['tutti', 'Tutti']].map(function (f) { return '<button class="filter' + (filtroTk === f[0] ? ' on' : '') + '" data-act="filtro-tk" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>';
    h += '<ul class="tk-list">' + lista.map(function (t) {
      var cop = copertura(t), sla = slaEntro(t);
      return '<li><button class="tk" data-act="apri-tk" data-id="' + t.id + '"><div class="cant-top"><span class="code">' + t.id + ' · ' + t.canale + '</span>' + pillTk(t) + '</div><strong>' + esc(t.titolo) + '</strong><small>' + esc(t.cliente) + ' · ' + esc(t.comune) + '</small>' +
        '<div class="sys-list">' + sysTag(t.sistema) + '<span class="pill pill-' + PRIO_TONO[t.priorita] + '">Priorità ' + t.priorita + '</span>' + (fuoriSla(t) ? '<span class="pill pill-danger">Fuori SLA</span>' : t.stato === 'nuovo' && sla ? '<span class="pill pill-info">Entro ' + fmtBreve(sla) + '</span>' : '') + (cop.ok ? '' : '<span class="pill pill-warn">A pagamento</span>') + '</div></button></li>';
    }).join('') + '</ul>';
    if (!lista.length) h += '<p class="empty">Nessun ticket in questo filtro.</p>';
    if (apri) setTimeout(function () { schedaTicket(apri); }, 0);
    return h;
  }
  function schedaTicket(id) {
    var t = trova(D.ticket, id); if (!t) return;
    var cop = copertura(t), c = contratto(t.contratto), tec = tecnico(t.tecnico);
    var az = t.stato === 'nuovo' ? '<button class="btn btn-ghost" data-act="pianifica" data-id="' + t.id + '">' + ico('cal') + 'Pianifica per domani</button><a class="btn" href="#/tecnico/' + t.id + '">' + ico('phone') + 'Apri app del tecnico</a>' :
      t.stato === 'pianificato' ? '<a class="btn" href="#/tecnico/' + t.id + '">' + ico('phone') + 'Apri app del tecnico</a>' : '<button class="btn" data-act="stampa-rap" data-id="' + t.id + '">' + ico('print') + 'Stampa rapportino</button>';
    if (c && !ctrValido(c)) az = '<a class="btn btn-ghost" href="#/contratti/' + c.id + '">Proponi rinnovo</a>' + az;
    modale('<h2>' + esc(t.titolo) + '</h2><p class="muted"><span class="code">' + t.id + '</span> · ' + esc(t.cliente) + ', ' + esc(t.indirizzo) + ', ' + esc(t.comune) + '</p>' +
      '<div class="msg">' + esc(t.messaggio) + '<small>' + t.canale + ' · ' + fmt(t.aperto) + '</small></div>' +
      '<div class="banner banner-' + (cop.ok ? 'ok' : 'warn') + '">' + ico(cop.ok ? 'check' : 'euro') + '<div><strong>' + esc(cop.testo) + '</strong><small>' + (cop.ok ? 'Tempo di intervento: ' + LIV_CTR[c.livello].sla + ' ore lavorative' + (slaEntro(t) ? ', entro il ' + fmt(slaEntro(t)) : '') : 'Diritto di uscita ' + eur0(C.dirittoUscita) + ' più ' + eur0(C.tariffaPosa) + '/h') + '</small></div></div>' +
      '<dl class="dl">' + dl('Impianto', sysTag(t.sistema)) + dl('Priorità', '<span class="pill pill-' + PRIO_TONO[t.priorita] + '">' + t.priorita + '</span>') + dl('Stato', pillTk(t)) + dl('Tecnico', tec ? esc(tec.nome) + ' · ' + esc(tec.ruolo) : 'da assegnare') +
      (t.progetto ? dl('Progetto', '<a class="link" href="#/progetto/' + t.progetto + '">' + t.progetto + '</a>') : '') + (t.attivita ? dl('Intervento', esc(t.attivita)) : '') + '</dl>' +
      '<div class="modal-actions">' + az + '</div>');
  }
  function portale() {
    modale('<h2>Portale del cliente</h2><p class="muted">Così il cliente apre una richiesta dal telefono, senza chiamare. Nella demo è precompilata.</p>' +
      '<div class="form-mini"><label>Impianto<select id="pt-sis">' + D.sistemi.map(function (s) { return '<option value="' + s.id + '"' + (s.id === 'audio' ? ' selected' : '') + '>' + s.nome + '</option>'; }).join('') + '</select></label>' +
      '<label>Cosa succede<textarea id="pt-msg" rows="3">In taverna i diffusori gracchiano quando alziamo il volume.</textarea></label>' +
      '<label>Urgenza<select id="pt-prio"><option value="bassa">Posso aspettare</option><option value="media" selected>Entro qualche giorno</option><option value="alta">Urgente</option></select></label></div>' +
      '<p class="muted small">Cliente: Famiglia Pirovano (nome inventato), Vimercate · contratto Plus</p><div class="modal-actions"><button class="btn btn-ghost" data-act="chiudi">Annulla</button><button class="btn" data-act="portale-invia">Invia richiesta</button></div>');
  }

  // app del tecnico: rapportino in compilazione per ogni ticket
  var rapporti = {};
  var CHECK = ['Verificato il problema segnalato dal cliente', 'Controllate alimentazione, rete e connessioni', 'Aggiornato il firmware se necessario', 'Provato il funzionamento insieme al cliente', 'Salvato il backup della configurazione'];
  var ATT = { video: 'Riavviato lo switch PoE del garage dopo il temporale e sostituito l\'alimentatore danneggiato. Tutte le telecamere di nuovo raggiungibili, registrazione verificata.', knx: 'Verificato l\'attuatore tapparelle nel quadro: canale bloccato. Ripristinata la configurazione dal backup ETS e provati i comandi da pulsante e da app.', audio: 'Ricollegato l\'amplificatore della cucina alla rete Wi-Fi e aggiornato il firmware. Musica di nuovo disponibile dall\'app in tutte le zone.', allarme: 'Sostituita la batteria del contatto radio della zona 4. Centrale senza guasti, inserimento totale provato.', rete: 'Riconfigurato il videocitofono sulla rete ospiti e verificata la chiamata sui telefoni.' };
  function rapporto(t) {
    return rapporti[t.id] || (rapporti[t.id] = { check: CHECK.map(function (x, k) { return k < 2; }), attivita: ATT[t.sistema] || '', materiali: t.sistema === 'allarme' ? [['s-batt', 1]] : [], inizio: '14:00', fine: '15:30', firma: null, firmatario: t.cliente.replace(/ \(nome inventato\)/, ''), foto: [] });
  }
  function oreRap(r) { var a = r.inizio.split(':').map(Number), b = r.fine.split(':').map(Number); return Math.max(0.5, Math.round(((b[0] * 60 + b[1]) - (a[0] * 60 + a[1])) / 30) / 2); }
  var vistaTec = 'app';
  function vTecnico(id) {
    var t = trova(D.ticket, id); if (!t) return '<p class="empty">Ticket non trovato.</p>';
    var r = rapporto(t), tec = tecnico(t.tecnico) || D.tecnici[2], cop = copertura(t), chiuso = t.stato === 'chiuso';
    var h = intestazione('App del tecnico', 'Quello che vede ' + esc(tec.nome) + ' sul telefono, con il rapportino che si compone a fianco', '<button class="btn btn-ghost" data-act="stampa-rap" data-id="' + t.id + '">' + ico('print') + 'Rapportino PDF</button>', '#/assistenza');
    h += '<div class="seg seg-vista"><button data-act="vista-tec" data-v="app" class="' + (vistaTec === 'app' ? 'on' : '') + '">App</button><button data-act="vista-tec" data-v="anteprima" class="' + (vistaTec === 'anteprima' ? 'on' : '') + '">Rapportino</button></div>';
    h += '<div class="split split-tec vista-' + vistaTec + '"><div class="phone"><div class="phone-in"><div class="phone-bar"><small>' + t.id + ' · ' + (t.data ? fmt(t.data) : 'da pianificare') + '</small><strong>' + esc(t.titolo) + '</strong></div><div class="phone-body" id="app-tec" data-id="' + t.id + '">';
    if (chiuso) h += '<div class="banner banner-ok">' + ico('check') + '<div><strong>Intervento chiuso</strong><small>Rapportino firmato e salvato. Il cliente lo riceve via email o dal portale.</small></div></div>';
    h += '<div class="card"><h3>' + ico('pin') + ' ' + esc(t.cliente) + '</h3><p class="muted small" style="margin:0">' + esc(t.indirizzo) + ', ' + esc(t.comune) + '</p><div class="msg">' + esc(t.messaggio) + '</div><span class="pill pill-' + (cop.ok ? 'ok' : 'warn') + '">' + esc(cop.testo) + '</span></div>';
    h += '<div class="card"><h3>Controlli</h3>' + CHECK.map(function (x, k) { return '<label class="chk"><input type="checkbox" data-rap="check" data-k="' + k + '"' + (r.check[k] ? ' checked' : '') + (chiuso ? ' disabled' : '') + '>' + x + '</label>'; }).join('') + '</div>';
    h += '<div class="card"><h3>Lavoro svolto</h3><textarea rows="4" data-rap="attivita"' + (chiuso ? ' disabled' : '') + '>' + esc(r.attivita) + '</textarea></div>';
    h += '<div class="card"><h3>Materiale usato</h3><div id="rap-mat">' + righeMatRap(r, chiuso) + '</div>' + (chiuso ? '' : '<button class="btn btn-sm btn-ghost" data-act="rap-addmat">' + ico('plus') + 'Aggiungi</button>') + '</div>';
    h += '<div class="card"><h3>Orario</h3><div class="ore"><label>Inizio<input type="time" data-rap="inizio" value="' + r.inizio + '"' + (chiuso ? ' disabled' : '') + '></label><label>Fine<input type="time" data-rap="fine" value="' + r.fine + '"' + (chiuso ? ' disabled' : '') + '></label></div></div>';
    h += '<div class="card"><h3>' + ico('camera') + ' Foto</h3><div class="gallery gallery-sm">' + r.foto.map(function (u) { return '<span class="ph"><img src="' + u + '" alt=""></span>'; }).join('') + (chiuso ? '' : '<label class="ph ph-add">' + ico('camera') + '<span>Scatta</span><input type="file" accept="image/*" capture="environment" data-act="rap-foto" hidden></label>') + '</div></div>';
    h += '<div class="card"><h3>Firma del cliente</h3><label class="ore" style="grid-template-columns:1fr;margin-bottom:8px"><span class="muted small">Nome di chi firma</span><input type="text" data-rap="firmatario" value="' + esc(r.firmatario) + '"' + (chiuso ? ' disabled' : '') + '></label>' +
      (chiuso ? (r.firma ? '<img src="' + r.firma + '" alt="Firma" style="width:100%;border:1px solid var(--line);border-radius:10px">' : '<p class="muted small">Firmato su carta prima dell\'app.</p>') : '<div class="firma-wrap' + (r.firma ? ' ok' : '') + '" id="firma-wrap"><canvas id="firma" width="600" height="200" aria-label="Spazio per la firma"></canvas><span>Firma qui con il dito</span></div><button class="btn btn-sm btn-ghost" data-act="firma-cancella" style="margin-top:6px">Cancella firma</button>') + '</div>';
    if (!chiuso) h += '<button class="btn btn-block" data-act="chiudi-int" data-id="' + t.id + '">' + ico('check') + 'Chiudi intervento</button>';
    h += '</div></div></div><div class="preview-wrap"><div class="paper" id="anteprima-rap">' + docRapportino(t) + '</div></div></div>';
    if (!chiuso) setTimeout(function () { avviaFirma(t); }, 0);
    return h;
  }
  function righeMatRap(r, chiuso) {
    if (!r.materiali.length) return '<p class="empty small">Nessun materiale.</p>';
    return r.materiali.map(function (m, k) {
      return '<div class="mat-row"><select data-rapmat="art" data-k="' + k + '"' + (chiuso ? ' disabled' : '') + '>' + D.catalogo.map(function (a) { return '<option value="' + a.id + '"' + (a.id === m[0] ? ' selected' : '') + '>' + esc(a.desc) + '</option>'; }).join('') + '</select>' +
        '<input type="number" min="1" step="1" value="' + m[1] + '" data-rapmat="q" data-k="' + k + '"' + (chiuso ? ' disabled' : '') + ' aria-label="Quantità">' + (chiuso ? '' : '<button class="icon-btn" data-act="rap-delmat" data-k="' + k + '" aria-label="Togli">' + ico('x') + '</button>') + '</div>';
    }).join('');
  }
  function avviaFirma(t) {
    var cv = $('#firma'); if (!cv) return;
    var ctx = cv.getContext('2d'), r = rapporto(t), giu = false, tracciato = false;
    ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1b2f63';
    if (r.firma) { var img = new Image(); img.onload = function () { ctx.drawImage(img, 0, 0); }; img.src = r.firma; }
    function pos(e) { var b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * cv.width / b.width, (e.clientY - b.top) * cv.height / b.height]; }
    cv.addEventListener('pointerdown', function (e) { giu = true; tracciato = false; cv.setPointerCapture(e.pointerId); var p = pos(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]); });
    cv.addEventListener('pointermove', function (e) { if (!giu) return; var p = pos(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); tracciato = true; });
    function fine() {
      if (!giu) return; giu = false; if (!tracciato) return;
      r.firma = cv.toDataURL('image/png'); $('#firma-wrap').classList.add('ok'); $('#anteprima-rap').innerHTML = docRapportino(t);
    }
    cv.addEventListener('pointerup', fine); cv.addEventListener('pointercancel', fine); cv.addEventListener('pointerleave', fine);
  }
  function docRapportino(t) {
    var r = rapporto(t), cop = copertura(t), tec = tecnico(t.tecnico) || D.tecnici[2], ore = t.ore || oreRap(r), c = contratto(t.contratto);
    var mat = r.materiali.map(function (m) { var a = articolo(m[0]); return { a: a, q: m[1] }; });
    var costoMat = mat.reduce(function (s, m) { return s + m.a.prezzo * m.q; }, 0);
    var addebito = cop.ok ? 0 : C.dirittoUscita + ore * C.tariffaPosa + costoMat;
    return docTesta('Rapporto di intervento ' + t.id, 'Data ' + fmt(t.chiuso || t.data || OGGI) + ' · tecnico ' + esc(tec.nome)) +
      '<table class="doc-kv"><tr><th>Cliente</th><td>' + esc(t.cliente) + '</td></tr><tr><th>Indirizzo</th><td>' + esc(t.indirizzo) + ', ' + esc(t.comune) + '</td></tr><tr><th>Impianto</th><td>' + sistema(t.sistema).nome + '</td></tr><tr><th>Richiesta</th><td>' + esc(t.titolo) + ' (' + t.canale + ', ' + fmt(t.aperto) + ')</td></tr><tr><th>Condizioni</th><td>' + esc(cop.testo) + '</td></tr></table>' +
      '<h2>Lavoro svolto</h2><p>' + esc(t.attivita || r.attivita || '—') + '</p>' +
      '<h2>Controlli</h2><p>' + CHECK.map(function (x, k) { return (r.check[k] ? '☑ ' : '☐ ') + x; }).join('<br>') + '</p>' +
      '<h2>Materiale e ore</h2><table class="doc-tbl"><thead><tr><th>Voce</th><th class="r">Q.tà</th><th class="r">Importo</th></tr></thead><tbody>' +
      mat.map(function (m) { return '<tr><td>' + esc(m.a.desc) + '</td><td class="r">' + m.q + '</td><td class="r">' + (cop.ok ? 'incluso' : eur(m.a.prezzo * m.q)) + '</td></tr>'; }).join('') +
      '<tr><td>Manodopera ' + (t.ore ? '' : '(' + r.inizio + '-' + r.fine + ')') + '</td><td class="r">' + num(ore, 1) + ' h</td><td class="r">' + (cop.ok ? 'incluso' : eur(ore * C.tariffaPosa)) + '</td></tr>' +
      (cop.ok ? '' : '<tr><td>Diritto di uscita</td><td class="r">1</td><td class="r">' + eur(C.dirittoUscita) + '</td></tr>') + '</tbody></table>' +
      '<p><b>' + (cop.ok ? 'Intervento coperto dal contratto ' + c.livello + ': nessun addebito.' + (LIV_CTR[c.livello].ore ? ' Ore del pacchetto usate: ' + num(c.oreUsate + (t.stato === 'chiuso' ? 0 : ore), 1) + ' su ' + LIV_CTR[c.livello].ore + '.' : '') : 'Da fatturare: ' + eur(addebito) + ' + IVA.') + '</b></p>' +
      (r.foto.length ? '<div class="doc-foto">' + r.foto.slice(0, 3).map(function (u) { return '<img src="' + u + '" alt="">'; }).join('') + '</div>' : '') +
      '<div class="doc-firme2"><div><p class="spazio"></p><p class="linea">Il tecnico<span>' + esc(tec.nome) + '</span></p></div><div><p class="spazio">' + (r.firma ? '<img src="' + r.firma + '" alt="Firma del cliente">' : '') + '</p><p class="linea">Il cliente<span>' + esc(r.firmatario || '') + '</span></p></div></div>' +
      '<p class="doc-foot">Documento dimostrativo con dati inventati.</p>';
  }
  function chiudiIntervento(id) {
    var t = trova(D.ticket, id), r = rapporto(t);
    if (!r.firma) { toast('Manca la firma del cliente: si firma sul telefono del tecnico.'); $('#firma-wrap') && $('#firma-wrap').scrollIntoView({ block: 'center' }); return; }
    t.ore = oreRap(r); t.attivita = r.attivita; t.stato = 'chiuso'; t.chiuso = new Date(OGGI); t.data = t.data || new Date(OGGI); t.tecnico = t.tecnico || 't3';
    r.materiali.forEach(function (m) { var g = D.magazzino[m[0]]; if (g) g[0] = Math.max(0, g[0] - m[1]); });
    var c = contratto(t.contratto); if (copertura(t).ok) c.oreUsate += t.ore;
    toast(copertura(t).ok ? 'Intervento chiuso: rapportino firmato, materiale scaricato dal magazzino.' : 'Intervento chiuso: ' + eur0(C.dirittoUscita + t.ore * C.tariffaPosa) + ' + materiale pronti da fatturare.');
    render();
  }

  /* ---------- 6. contratti di manutenzione ---------- */
  function vContratti(apri) {
    var att = ctrAttivi(), ricorr = att.reduce(function (s, c) { return s + c.canone; }, 0);
    var rinn = D.contratti.filter(function (c) { return giorni(c.scad) <= 60; });
    var oppo = D.progetti.filter(function (p) { return (p.stato === 'assistenza' || (inCorso(p) && statoIdx(p.stato) >= 4)) && !ctrValido(contratto(p.contratto)); });
    var potenziale = oppo.reduce(function (s, p) { return s + canoneSuggerito(totaliPrev(p).netto, 'Plus'); }, 0);
    var h = intestazione('Contratti di manutenzione', 'Il ricavo che si ripete ogni anno: canoni, visite, rinnovi', '');
    h += '<section class="kpis">' + kpi('Canoni annui attivi', eur0(ricorr), att.length + ' contratti · ' + eur0(ricorr / 12) + '/mese', 'euro', '#/contratti') +
      kpi('Da rinnovare entro 60 giorni', rinn.length, eur0(rinn.reduce(function (s, c) { return s + c.canone; }, 0)) + '/anno, scaduti compresi', 'clock', '#/contratti', rinn.length ? 'warn' : '') +
      kpi('Impianti senza contratto', oppo.length, 'potenziale ' + eur0(potenziale) + '/anno', 'progetti', '#/contratti', oppo.length ? 'info' : '') +
      kpi('Visite programmate', D.contratti.filter(function (c) { return c.prossimaVisita && giorni(c.prossimaVisita) >= 0 && giorni(c.prossimaVisita) <= 30; }).length, 'nei prossimi 30 giorni', 'cal', '#/contratti') + '</section>';
    h += '<div class="card table-card"><table class="tbl tbl-ctr tbl-op"><thead><tr><th>Cliente</th><th>Livello</th><th class="r">Canone</th><th>Scadenza</th><th>Visite</th><th>Prossima visita</th></tr></thead><tbody>' +
      D.contratti.slice().sort(function (a, b) { return a.scad - b.scad; }).map(function (c) {
        var L = LIV_CTR[c.livello];
        return '<tr data-act="apri-ctr" data-id="' + c.id + '"><td><strong>' + esc(c.cliente) + '</strong><small class="muted d-block">' + c.id + ' · ' + esc(c.comune) + ' · ' + esc(c.impianto) + '</small></td>' +
          '<td data-l="Livello"><span class="pill pill-' + (c.livello === 'Premium' ? 'brand' : c.livello === 'Plus' ? 'info' : 'neutral') + '">' + c.livello + '</span></td><td class="r" data-l="Canone">' + eur0(c.canone) + '/anno</td>' +
          '<td data-l="Scadenza">' + chipScad('Rinnovo', c.scad) + '</td><td data-l="Visite"><span class="visite">' + Array.apply(null, Array(L.visite)).map(function (x, k) { return '<i class="' + (k < c.visiteFatte ? 'on' : '') + '"></i>'; }).join('') + '</span> <small class="muted">' + c.visiteFatte + '/' + L.visite + '</small></td>' +
          '<td data-l="Prossima visita">' + (c.prossimaVisita && giorni(c.scad) >= 0 ? fmt(c.prossimaVisita) : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('progetti') + ' Impianti senza contratto</h2><span class="count">' + oppo.length + '</span></div>' + (oppo.length ? '<ul class="docs">' + oppo.map(function (p) {
      return '<li><a href="#" data-act="proponi" data-id="' + p.id + '">' + ico('contratti') + '<div><strong>' + esc(p.cliente) + ' · ' + esc(p.comune) + '</strong><small>' + (p.stato === 'assistenza' ? 'Consegnato il ' + fmt(p.consegna) : 'Consegna prevista il ' + fmt(p.consegna)) + ' · impianto da ' + eur0(totaliPrev(p).netto) + ' · Plus suggerito ' + eur0(canoneSuggerito(totaliPrev(p).netto, 'Plus')) + '/anno</small></div><span class="pill pill-warn">Proponi</span></a></li>';
    }).join('') + '</ul>' : '<p class="empty">Tutti gli impianti consegnati hanno un contratto.</p>') + '</section>';
    h += '<section class="card"><div class="card-head"><h2>Cosa comprende ogni livello</h2><span class="muted small">canone suggerito in % sul valore dell\'impianto</span></div><div class="liv-grid">' + Object.keys(LIV_CTR).map(function (k) {
      var L = LIV_CTR[k]; return '<div class="liv-card"><h3>' + k + ' <span class="tag">' + num(L.pct, 1) + '% · min. 590 €</span></h3><ul>' + L.servizi.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>';
    }).join('') + '</div></section>';
    if (apri) setTimeout(function () { schedaContratto(apri); }, 0);
    return h;
  }
  var adeg = 3;
  function schedaContratto(id) {
    var c = contratto(id); if (!c) return;
    var L = LIV_CTR[c.livello], n = giorni(c.scad), nuovo = Math.round(c.canone * (1 + adeg / 100) / 10) * 10;
    modale('<h2>' + esc(c.cliente) + '</h2><p class="muted"><span class="code">' + c.id + '</span> · ' + esc(c.comune) + ' · ' + esc(c.impianto) + '</p>' +
      '<div class="banner banner-' + livello(n) + '">' + ico('clock') + '<div><strong>' + (n < 0 ? 'Scaduto il ' + fmt(c.scad) + ' (' + rel(c.scad) + ')' : 'Rinnovo il ' + fmt(c.scad) + ' (' + rel(c.scad) + ')') + '</strong><small>Contratto ' + c.livello + ' da ' + eur0(c.canone) + '/anno, attivo dal ' + fmt(c.inizio) + '</small></div></div>' +
      '<ul class="scad-list"><li><span>Visite fatte quest\'anno<small>' + L.visite + ' incluse</small></span><span class="visite">' + Array.apply(null, Array(L.visite)).map(function (x, k) { return '<i class="' + (k < c.visiteFatte ? 'on' : '') + '"></i>'; }).join('') + '</span></li>' +
      '<li><span>Ore di modifiche usate<small>' + (L.ore ? L.ore + ' incluse' : 'non incluse, a consuntivo') + '</small></span><span class="pill pill-neutral">' + num(c.oreUsate, 1) + ' h</span></li>' +
      '<li><span>Tempo di intervento garantito</span><span class="pill pill-info">' + L.sla + ' ore lavorative</span></li>' +
      c.scadTecniche.map(function (s) { return '<li><span>' + esc(s[0]) + '<small>scadenza tecnica</small></span><span class="pill pill-' + livello(giorni(s[1])) + '">' + fmt(s[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<h3>Rinnovo</h3><div class="form-mini"><label>Adeguamento del canone (%)<input type="number" min="0" max="15" step="0.5" value="' + adeg + '" id="ctr-adeg"></label></div>' +
      '<p>Nuovo canone: <b id="ctr-nuovo">' + eur0(nuovo) + '/anno</b> <span class="muted small">(+' + eur0(nuovo - c.canone) + ')</span></p>' +
      '<div class="modal-actions"><button class="btn btn-ghost" data-act="stampa-rinnovo" data-id="' + c.id + '">' + ico('print') + 'Proposta di rinnovo PDF</button><button class="btn" data-act="rinnova" data-id="' + c.id + '">' + ico('check') + 'Segna come rinnovato</button></div>');
  }
  function docRinnovo(c) {
    var L = LIV_CTR[c.livello], nuovo = Math.round(c.canone * (1 + adeg / 100) / 10) * 10;
    return docTesta('Proposta di rinnovo del contratto di manutenzione', c.id + ' · ' + fmt(OGGI)) +
      '<p>Gentile ' + esc(c.cliente.replace(/ \(nome inventato\)/, '')) + ',</p><p>il contratto di manutenzione ' + c.livello + ' del suo impianto (' + esc(c.impianto) + ') ' + (giorni(c.scad) < 0 ? 'è scaduto il ' : 'scade il ') + fmt(c.scad) + '. Le proponiamo il rinnovo per altri 12 mesi alle condizioni seguenti.</p>' +
      '<table class="doc-kv"><tr><th>Livello</th><td>' + c.livello + '</td></tr><tr><th>Periodo</th><td>dal ' + fmt(piu(c.scad, 1)) + ' al ' + fmt(piu(c.scad, 366)) + '</td></tr><tr><th>Canone annuo</th><td><b>' + eur(nuovo) + '</b> + IVA (adeguamento ' + num(adeg, 1) + '%)</td></tr><tr><th>Tempo di intervento</th><td>' + L.sla + ' ore lavorative</td></tr></table>' +
      '<h2>Cosa comprende</h2><p>' + L.servizi.map(esc).join('<br>') + '</p>' +
      '<h2>Nell\'anno appena passato</h2><p>' + c.visiteFatte + ' visite di controllo, ' + num(c.oreUsate, 1) + ' ore di interventi e modifiche' + (c.scadTecniche.length ? '. Prossime scadenze tecniche: ' + c.scadTecniche.map(function (s) { return esc(s[0]).toLowerCase() + ' (' + fmt(s[1]) + ')'; }).join(', ') : '') + '.</p>' +
      '<div class="doc-firme"><div>Per ' + esc(C.nome) + '<span>' + esc(C.titolare) + '</span></div><div>Per accettazione<span>&nbsp;</span></div></div>' +
      '<p class="doc-foot">Documento dimostrativo con dati inventati.</p>';
  }
  function proponi(pid) {
    var p = progetto(pid), val = totaliPrev(p).netto;
    modale('<h2>Proponi un contratto</h2><p class="muted">' + esc(p.cliente) + ' · ' + esc(p.titolo) + ' · impianto da ' + eur0(val) + '</p><div class="liv-grid">' + Object.keys(LIV_CTR).map(function (k) {
      return '<label class="liv-card check"><input type="radio" name="liv-prop" value="' + k + '"' + (k === 'Plus' ? ' checked' : '') + '><span><strong>' + k + ': ' + eur0(canoneSuggerito(val, k)) + '/anno</strong><small>' + LIV_CTR[k].servizi.slice(0, 2).join(' · ') + '</small></span></label>';
    }).join('') + '</div><div class="modal-actions"><button class="btn btn-ghost" data-act="demo-invia">Prepara email al cliente</button><button class="btn" data-act="crea-ctr" data-id="' + p.id + '">' + ico('check') + 'Il cliente ha accettato</button></div>');
  }

  /* ---------- 7. lettura con IA (simulata): listino, DDT, conferma d'ordine ---------- */
  var DOC_IA = {
    ddt: { file: 'DDT_4512_Distribuzione_Elettrica_Brianza.pdf', tipo: 'Documento di trasporto (DDT)', dest: 'Magazzino · ordine OF-2026-118',
      campi: [['Fornitore', D.F.elettrico, 98], ['Numero DDT', '4512', 99], ['Data', fmt(OGGI), 97], ['Riferimento ordine', 'OF-2026-118 (progetto P-2026-019)', 92]],
      righe: [['k-srv', 1, 99, ''], ['k-dim4', 2, 86, 'Ordinati 3: consegna parziale, ne manca 1'], ['k-cavo', 2, 95, 'Non in ordine: omaggio o errore, da verificare']] },
    listino: { file: 'Listino_KNX_novembre_2026.xlsx', tipo: 'Listino prezzi del fornitore', dest: 'Listino interno · costi d\'acquisto',
      campi: [['Fornitore', D.F.elettrico, 97], ['Listino', 'KNX e automazione, novembre 2026', 95], ['Valido dal', fmt(piu(OGGI, 17)), 93]],
      righe: [['k-att8', 188, 98, ''], ['k-dim4', 304, 97, ''], ['k-tapp', 176, 96, ''], ['k-srv', 735, 88, 'Aumento oltre il 6%: controlla prima di confermare'], ['k-sens', 85, 99, '']] },
    conferma: { file: 'Conferma_ordine_AV_Pro_OF-2026-121.pdf', tipo: 'Conferma d\'ordine del fornitore', dest: 'Magazzino · ordine OF-2026-121',
      campi: [['Fornitore', D.F.av, 98], ['Vostro ordine', 'OF-2026-121', 99], ['Consegna prevista', fmt(piu(OGGI, 5)), 91]],
      righe: [['a-diff', 6, 98, ''], ['a-amp', 3, 97, '']] }
  };
  var ia = { doc: null, fase: 'attesa', nomeFile: '' };
  function vIA(param) {
    if (param && DOC_IA[param] && ia.fase === 'attesa') { ia.doc = param; ia.nomeFile = DOC_IA[param].file; setTimeout(avviaLettura, 350); ia.fase = 'lettura'; }
    var h = intestazione('Lettura con IA', 'Carica un listino, un DDT o una conferma d\'ordine: diventano righe di materiale e tu confermi', '');
    h += '<div class="banner banner-info">' + ico('info') + '<div><strong>In questa demo la lettura è simulata</strong><small>Qualunque file carichi, i dati mostrati sono inventati e nulla esce dal tuo computer. Nell\'app vera il documento viene letto davvero e ogni riga va confermata da una persona.</small></div></div>';
    if (!ia.doc) {
      h += '<label class="drop" id="drop">' + ico('upload', 'ico-lg') + '<strong>Trascina qui un PDF, un Excel o una foto</strong><span>oppure tocca per sceglierlo dal telefono</span><input type="file" accept=".pdf,.xls,.xlsx,.csv,image/*" data-act="ia-file" hidden></label>';
      h += '<h3 class="sub">Oppure prova con un documento di esempio</h3><div class="samples">' + Object.keys(DOC_IA).map(function (k) {
        var d = DOC_IA[k]; return '<button class="sample" data-act="ia-sample" data-v="' + k + '">' + ico('doc', 'ico-lg') + '<div><strong>' + d.tipo + '</strong><small>' + d.file + '</small></div></button>';
      }).join('') + '</div>';
      return h;
    }
    var d = DOC_IA[ia.doc], lettura = ia.fase === 'lettura', listino = ia.doc === 'listino';
    h += '<div class="split split-ia"><div class="card"><div class="card-head"><h2>' + ico('doc') + ' ' + esc(ia.nomeFile) + '</h2></div><div class="fake-pdf' + (lettura ? ' scanning' : '') + '" id="fake-pdf">' + pdfFinto(d) + '<div class="scanbar"></div></div></div>';
    h += '<div class="card"><div class="card-head"><h2>' + ico('ia') + ' Dati estratti</h2><span class="muted" id="ia-stato">' + (lettura ? 'Lettura in corso…' : ia.fase === 'confermato' ? 'Confermato' : 'Da controllare') + '</span></div>' +
      '<p class="muted small">Tipo riconosciuto: <b>' + d.tipo + '</b> · destinazione: ' + d.dest + '</p><div class="ia-fields">' +
      d.campi.map(function (f, k) { return '<label class="ia-field" id="iaf-' + k + '"><span>' + f[0] + '<em class="conf"></em></span><input type="text" value="' + (lettura ? '' : esc(f[1])) + '"' + (ia.fase === 'confermato' ? ' disabled' : '') + '></label>'; }).join('') + '</div>' +
      '<h3>Elenco materiali</h3><div class="table-card"><table class="tbl ia-righe"><thead><tr><th>Articolo</th><th class="r">' + (listino ? 'Costo nuovo' : 'Q.tà') + '</th><th class="r">' + (listino ? 'Variazione' : 'Affid.') + '</th></tr></thead><tbody>' +
      d.righe.map(function (r, k) {
        var a = articolo(r[0]), v = listino ? eur(r[1]) : r[1], dv = listino ? (r[1] - a.costo) / a.costo * 100 : null;
        return '<tr id="iar-' + k + '" class="' + (lettura ? 'attesa' : r[2] < 90 ? 'low' : 'high') + '"><td><strong>' + esc(a.desc) + '</strong><span class="code d-block">' + a.cod + '</span>' + (r[3] ? '<small>' + esc(r[3]) + '</small>' : '') + '</td><td class="r">' + v + '</td>' +
          '<td class="r conf">' + (listino ? (dv >= 0 ? '+' : '') + num(dv, 1) + '% · ' : '') + r[2] + '%</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="ia-actions" id="ia-actions"' + (lettura ? ' hidden' : '') + '>' + (ia.fase === 'confermato' ? '<a class="btn" href="' + destHref() + '">Vai alla scheda</a><button class="btn btn-ghost" data-act="ia-reset">Leggi un altro documento</button>' :
        '<button class="btn" data-act="ia-conferma">' + ico('check') + 'Confermo i dati</button><button class="btn btn-ghost" data-act="ia-reset">Annulla</button>') + '</div></div></div>';
    if (!lettura) setTimeout(mostraConfidenze, 0);
    return h;
  }
  function destHref() { return ia.doc === 'listino' ? '#/preventivo' : '#/magazzino'; }
  function pdfFinto(d) {
    var righe = '';
    d.campi.forEach(function (f, k) { righe += '<div class="pdf-line" id="pl-' + k + '"><span>' + f[0] + ':</span> <b>' + esc(f[1]) + '</b></div>'; });
    righe += '<div class="pdf-bar w90"></div>';
    d.righe.forEach(function (r, k) { var a = articolo(r[0]); righe += '<div class="pdf-line" id="plr-' + k + '"><span>' + a.cod + '</span> ' + esc(a.desc) + ' · <b>' + (ia.doc === 'listino' ? eur(r[1]) : r[1] + ' pz') + '</b></div>'; });
    return '<div class="pdf-head"><div class="pdf-logo"></div><div><div class="pdf-bar w60"></div><div class="pdf-bar w40"></div></div></div><div class="pdf-title">' + d.tipo.toUpperCase() + '</div>' + righe +
      '<div class="pdf-bar w70"></div><div class="pdf-bar w40"></div><div class="pdf-sign"><div class="pdf-bar w40"></div><svg viewBox="0 0 120 30"><path d="M5 22c10-14 18-14 20-4s10 6 16-6 12 10 20 4 14-8 22-2 18 4 30-6" fill="none" stroke="#2b4a8b" stroke-width="2"/></svg></div>';
  }
  function avviaLettura() {
    var d = DOC_IA[ia.doc], k = 0, kr = 0;
    if (!$('#fake-pdf')) return;
    function riga() {
      if (location.hash.indexOf('#/ia') !== 0 || !$('#iar-0')) return;
      if (kr >= d.righe.length) {
        ia.fase = 'controllo'; $('#fake-pdf').classList.remove('scanning');
        $('#ia-stato').textContent = 'Da controllare'; $('#ia-actions').hidden = false; return;
      }
      var tr = $('#iar-' + kr), line = $('#plr-' + kr), r = d.righe[kr];
      line.classList.add('hl'); line.scrollIntoView({ block: 'nearest' });
      tr.className = 'filling';
      setTimeout(function () { tr.className = r[2] < 90 ? 'low' : 'high'; kr++; riga(); }, 420);
    }
    function prossimo() {
      if (location.hash.indexOf('#/ia') !== 0) return;
      if (k >= d.campi.length) { setTimeout(riga, 200); return; }
      var f = d.campi[k], line = $('#pl-' + k), field = $('#iaf-' + k), inp = $('input', field), i = 0, idx = k;
      line.classList.add('hl'); field.classList.add('filling');
      line.scrollIntoView({ block: 'nearest' });
      (function scrivi() {
        if (!document.body.contains(inp)) return;
        inp.value = f[1].slice(0, ++i);
        if (i < f[1].length) setTimeout(scrivi, 16);
        else { field.classList.remove('filling'); confidenza(idx); k++; setTimeout(prossimo, 200); }
      })();
    }
    setTimeout(prossimo, 900);
  }
  function confidenza(k) {
    var f = DOC_IA[ia.doc].campi[k], field = $('#iaf-' + k); if (!field) return;
    field.classList.add('done', f[2] < 90 ? 'low' : 'high');
    $('.conf', field).textContent = f[2] < 90 ? 'da controllare · ' + f[2] + '%' : f[2] + '%';
  }
  function mostraConfidenze() {
    var d = DOC_IA[ia.doc];
    d.campi.forEach(function (f, k) { confidenza(k); $('#pl-' + k) && $('#pl-' + k).classList.add('hl'); });
    d.righe.forEach(function (r, k) { $('#plr-' + k) && $('#plr-' + k).classList.add('hl'); });
  }
  function confermaIA() {
    var d = DOC_IA[ia.doc];
    if (ia.doc === 'ddt') {
      var o = ordine('OF-2026-118');
      d.righe.forEach(function (r) {
        var g = D.magazzino[r[0]]; if (g) g[0] += r[1];
        o.righe.forEach(function (x) { if (x.art === r[0]) x.ricevuti = Math.min(x.q, x.ricevuti + r[1]); });
      });
      var completo = o.righe.every(function (x) { return x.ricevuti >= x.q; });
      o.stato = completo ? 'ricevuto' : 'parziale'; o.ddt = 'DDT 4512 del ' + fmt(OGGI); if (!completo) o.consegna = piu(OGGI, 4);
      toast('DDT registrato: materiale caricato a magazzino, ordine OF-2026-118 ' + (completo ? 'chiuso' : 'parziale (manca 1 dimmer)') + '.');
    } else if (ia.doc === 'listino') {
      d.righe.forEach(function (r) { articolo(r[0]).costo = r[1]; });
      toast('Listino aggiornato: ' + d.righe.length + ' costi d\'acquisto. Il margine dei preventivi aperti è ricalcolato.');
    } else {
      var oc = ordine('OF-2026-121'); oc.stato = 'confermato'; oc.consegna = piu(OGGI, 5);
      toast('Conferma registrata: OF-2026-121 arriva il ' + fmt(oc.consegna) + ', è tra i DDT in arrivo.');
    }
    ia.fase = 'confermato'; render();
  }

  /* ---------- router ---------- */
  function render() {
    var parts = location.hash.replace(/^#\/?/, '').split('/'), r = parts[0], arg = parts[1];
    var v;
    switch (r) {
      case 'progetti': v = vProgetti(); break;
      case 'progetto': v = vProgetto(arg); break;
      case 'preventivo': v = vPreventivo(arg); break;
      case 'magazzino': v = vMagazzino(); break;
      case 'assistenza': v = vAssistenza(arg); break;
      case 'tecnico': v = vTecnico(arg); break;
      case 'contratti': v = vContratti(arg); break;
      case 'ia': v = vIA(arg); break;
      default: v = vCruscotto(); r = '';
    }
    $('#view').innerHTML = v;
    var sez = { progetto: 'progetti', tecnico: 'assistenza' }[r] || r;
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === sez); });
  }
  var ultimoHash = '';
  window.addEventListener('hashchange', function () {
    chiudiModale();
    var base = function (h) { return h.split('/').slice(0, 2).join('/'); };
    if (location.hash.indexOf('#/ia') !== 0 || (location.hash.indexOf('#/ia/') === 0 && ia.fase !== 'lettura')) ia = { doc: null, fase: 'attesa', nomeFile: '' };
    var stessa = base(location.hash) === base(ultimoHash) && /^#\/(assistenza|contratti)/.test(location.hash);
    ultimoHash = location.hash;
    var sub = location.hash.split('/')[2];
    if (stessa && sub) { (/^#\/assistenza/.test(location.hash) ? schedaTicket : schedaContratto)(sub); return; }
    render(); window.scrollTo(0, 0);
  });

  /* ---------- eventi ---------- */
  function progettoPrev() { var s = $('select[data-act=cambia-prev]'); return s && progetto(s.value); }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'LABEL' || el.tagName === 'TEXTAREA') return;
    if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
    switch (a) {
      case 'info': infoDemo(); break;
      case 'chiudi': chiudiModale(); break;
      case 'filtro-prog': filtroProgetti = v; render(); break;
      case 'filtro-tk': filtroTk = v; render(); break;
      case 'tab-mag': tabMag = v; render(); break;
      case 'vista-tec': vistaTec = v; $$('.seg button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); }); $('.split').className = 'split split-tec vista-' + v; break;
      case 'apri-tk': location.hash = '#/assistenza/' + id; break;
      case 'apri-ctr': location.hash = '#/contratti/' + id; break;
      case 'avanza': var p = progetto(id), i = statoIdx(p.stato);
        if (i < STATI.length - 1) {
          p.stato = STATI[i + 1][0];
          if (!p.inizio && i + 1 >= 1) { p.inizio = gg(21); p.installazione = gg(60); p.consegna = gg(110); p.tecnici = ['t1', 't4']; }
          if (i + 1 >= 5) D.sistemi.forEach(function (s) { p.avanz[s.id] = 100; });
          toast('Stato aggiornato: ' + statoLabel(p.stato)); render();
        }
        break;
      case 'ordina': var po = progetto(id), mancano = daOrdinare(po), perForn = {};
        mancano.forEach(function (r) { var f = articolo(r.art).forn; (perForn[f] = perForn[f] || []).push(r); });
        var nOrd = 0;
        Object.keys(perForn).forEach(function (f) {
          var oid = 'OF-2026-' + (130 + D.ordini.length);
          D.ordini.push({ id: oid, forn: f, data: new Date(OGGI), progetto: po.id, stato: 'inviato', consegna: null, ddt: null, righe: perForn[f].map(function (r) { return { art: r.art, q: r.q, ricevuti: 0 }; }) });
          perForn[f].forEach(function (r) { po.mat[r.art] = { ordine: oid }; }); nOrd++;
        });
        toast(nOrd + (nOrd === 1 ? ' ordine preparato' : ' ordini preparati') + ' per fornitore. Nell\'app vera l\'email al fornitore la mandi tu.'); render(); break;
      case 'stampa-prev': var pp = progetto(id); stampa('<div class="paper">' + docPreventivo(pp) + '</div>'); break;
      case 'stampa-fascicolo': stampa('<div class="paper">' + docFascicolo(progetto(id)) + '</div>'); break;
      case 'stampa-rap': stampa('<div class="paper">' + docRapportino(trova(D.ticket, id)) + '</div>'); break;
      case 'stampa-rinnovo': stampa('<div class="paper">' + docRinnovo(contratto(id)) + '</div>'); break;
      case 'foto': var pf = progetto(id), f = pf.foto[+el.getAttribute('data-k')];
        modale('<div class="photo-big">' + window.fotoSVG(f, stampFoto(pf)) + '</div><p class="muted">' + esc(f.label) + ' · ' + esc(pf.titolo) + '</p>', true); break;
      case 'add-stanza': var ps = progetto(id);
        ps.stanze.push({ nome: 'Stanza ' + (ps.stanze.length + 1), piano: 'P1', liv: { knx: 1, audio: 0, video: 0, allarme: 1, rete: 1 } });
        aggiornaPrev(ps, true); toast('Stanza aggiunta: scegli i sistemi nella tabella.'); break;
      case 'pianifica': var tp = trova(D.ticket, id); tp.stato = 'pianificato'; tp.data = gg(1); tp.tecnico = { video: 't3', rete: 't3', audio: 't2', knx: 't1', allarme: 't3' }[tp.sistema];
        toast('Intervento pianificato per domani con ' + tecnico(tp.tecnico).nome + '. Il cliente riceve la conferma.'); chiudiModale(); render(); break;
      case 'portale': portale(); break;
      case 'portale-invia':
        D.ticket.unshift({ id: 'T-04' + (19 + D.ticket.length), titolo: 'Diffusori della taverna gracchiano', cliente: 'Famiglia Pirovano (nome inventato)', comune: 'Vimercate', indirizzo: 'Via Cavour 51', contratto: 'CM-2025-003', progetto: null,
          canale: 'App cliente', priorita: $('#pt-prio').value, stato: 'nuovo', aperto: new Date(OGGI), data: null, tecnico: null, sistema: $('#pt-sis').value, messaggio: $('#pt-msg').value });
        chiudiModale(); filtroTk = 'aperti'; render(); toast('Richiesta arrivata dal portale: il ticket è già nella lista con il contratto collegato.'); break;
      case 'rap-addmat': var ta = trova(D.ticket, $('#app-tec').getAttribute('data-id')), ra = rapporto(ta); ra.materiali.push(['s-batt', 1]); $('#rap-mat').innerHTML = righeMatRap(ra); $('#anteprima-rap').innerHTML = docRapportino(ta); break;
      case 'rap-delmat': var td = trova(D.ticket, $('#app-tec').getAttribute('data-id')), rd = rapporto(td); rd.materiali.splice(+el.getAttribute('data-k'), 1); $('#rap-mat').innerHTML = righeMatRap(rd); $('#anteprima-rap').innerHTML = docRapportino(td); break;
      case 'firma-cancella': var tf = trova(D.ticket, $('#app-tec').getAttribute('data-id')), cv = $('#firma');
        rapporto(tf).firma = null; cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); $('#firma-wrap').classList.remove('ok'); $('#anteprima-rap').innerHTML = docRapportino(tf); break;
      case 'chiudi-int': chiudiIntervento(id); break;
      case 'rinnova': var cr = contratto(id); cr.canone = Math.round(cr.canone * (1 + adeg / 100) / 10) * 10; cr.scad = piu(giorni(cr.scad) < 0 ? OGGI : cr.scad, 365); cr.visiteFatte = 0; cr.oreUsate = 0; if (!cr.prossimaVisita || giorni(cr.prossimaVisita) < 0) cr.prossimaVisita = gg(30);
        chiudiModale(); render(); toast('Contratto rinnovato fino al ' + fmt(cr.scad) + ' a ' + eur0(cr.canone) + '/anno.'); break;
      case 'proponi': proponi(id); break;
      case 'crea-ctr': var pc = progetto(id), liv = ($('input[name=liv-prop]:checked') || {}).value || 'Plus', val = totaliPrev(pc).netto, nid = 'CM-2026-' + (20 + D.contratti.length);
        D.contratti.push({ id: nid, cliente: pc.cliente, comune: pc.comune, progetto: pc.id, impianto: D.sistemi.filter(function (s) { return distinta(pc).usati[s.id]; }).map(function (s) { return s.breve; }).join(', '), valore: Math.round(val), livello: liv, canone: canoneSuggerito(val, liv),
          inizio: new Date(OGGI), scad: gg(365), visiteFatte: 0, oreUsate: 0, prossimaVisita: gg(60), scadTecniche: [] });
        pc.contratto = nid; chiudiModale(); render(); toast('Contratto ' + liv + ' creato: +' + eur0(canoneSuggerito(val, liv)) + '/anno di canoni.'); break;
      case 'ia-sample': ia = { doc: v, fase: 'lettura', nomeFile: DOC_IA[v].file }; render(); avviaLettura(); break;
      case 'ia-conferma': confermaIA(); break;
      case 'ia-reset': ia = { doc: null, fase: 'attesa', nomeFile: '' }; if (location.hash !== '#/ia') location.hash = '#/ia'; else render(); break;
      case 'demo-invia': toast('Nell\'app vera prepara l\'email con il PDF allegato: la invii tu.'); break;
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiModale(); });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-avz')) {
      var p = progetto(t.getAttribute('data-id')), s = t.getAttribute('data-avz');
      p.avanz[s] = +t.value; $('#avz-bar-' + s).style.width = t.value + '%'; $('#avz-v-' + s).textContent = t.value + '%'; $('#avz-tot').textContent = avanzamento(p) + '%'; return;
    }
    if (t.id === 'ctr-adeg') { var v = parseFloat(t.value); if (!isNaN(v)) { adeg = v; var c = contratto(location.hash.split('/')[2]); if (c) $('#ctr-nuovo').textContent = eur0(Math.round(c.canone * (1 + adeg / 100) / 10) * 10) + '/anno'; } return; }
    if (t.hasAttribute('data-rap') || t.hasAttribute('data-rapmat')) {
      var tk = trova(D.ticket, $('#app-tec').getAttribute('data-id')), r = rapporto(tk), k = t.getAttribute('data-rap');
      if (k === 'check') r.check[+t.getAttribute('data-k')] = t.checked; else if (k) r[k] = t.value;
      if (t.hasAttribute('data-rapmat')) { var m = r.materiali[+t.getAttribute('data-k')]; if (t.getAttribute('data-rapmat') === 'art') m[0] = t.value; else if (+t.value > 0) m[1] = +t.value; }
      $('#anteprima-rap').innerHTML = docRapportino(tk); return;
    }
    if (location.hash.indexOf('#/preventivo') === 0) {
      var pp = progettoPrev(); if (!pp) return;
      var o = opzPrev(pp), val = parseFloat(t.value);
      if (t.hasAttribute('data-stanza')) { pp.stanze[+t.getAttribute('data-stanza')].liv[t.getAttribute('data-sis')] = +t.value; aggiornaPrev(pp); }
      else if (t.hasAttribute('data-prev')) {
        var kk = t.getAttribute('data-prev');
        if (kk === 'pdfMateriali') o.pdfMateriali = t.checked; else if (!isNaN(val)) o[kk] = val;
        aggiornaPrev(pp);
      }
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target, a = t.getAttribute('data-act');
    if (a === 'cambia-prev') location.hash = '#/preventivo/' + t.value;
    if (t.getAttribute('data-prev') === 'iva') { var pp = progettoPrev(); opzPrev(pp).iva = +t.value; t.blur(); aggiornaPrev(pp); }
    if (a === 'foto-add' && t.files && t.files[0]) {
      var pf = progetto(t.getAttribute('data-id'));
      pf.foto.push({ tipo: 'stanza', label: 'Foto aggiunta', url: URL.createObjectURL(t.files[0]) });
      toast('Foto aggiunta al progetto (solo in questa sessione).'); render();
    }
    if (a === 'rap-foto' && t.files && t.files[0]) {
      var tk = trova(D.ticket, $('#app-tec').getAttribute('data-id')); rapporto(tk).foto.push(URL.createObjectURL(t.files[0]));
      toast('Foto aggiunta al rapportino (solo in questa sessione).'); render();
    }
    if (a === 'ia-file' && t.files && t.files[0]) { ia = { doc: /\.(xlsx?|csv)$/i.test(t.files[0].name) ? 'listino' : 'ddt', fase: 'lettura', nomeFile: t.files[0].name }; render(); avviaLettura(); }
  });
  // trascina e rilascia sulla zona di caricamento
  document.addEventListener('dragover', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
  document.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) d.classList.remove('over'); });
  document.addEventListener('drop', function (e) {
    var d = e.target.closest && e.target.closest('#drop'); if (!d) return; e.preventDefault();
    var f = e.dataTransfer.files[0]; ia = { doc: f && /\.(xlsx?|csv)$/i.test(f.name) ? 'listino' : 'ddt', fase: 'lettura', nomeFile: f ? f.name : 'documento.pdf' }; render(); avviaLettura();
  });

  // le foto aggiunte dal telefono hanno un URL vero: le mostro come immagine
  var fotoOrig = window.fotoSVG;
  window.fotoSVG = function (f, stamp) { return f.url ? '<img src="' + f.url + '" alt="' + esc(f.label) + '">' : fotoOrig(f, stamp); };

  guscio();
  ultimoHash = location.hash;
  render();
})();
