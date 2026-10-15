/* 2. Barche: elenco e scheda barca con armatore, posto, storico, foto e documenti. */
(function () {
  'use strict';
  var A = window.A, C = window.CONFIG, D = window.DATI, OGGI = window.DEMO.OGGI;
  var ico = A.ico, esc = A.esc, fmt = A.fmt;

  A.pillBarca = function (b) {
    var p = A.prenDi(b.id);
    if (p) return '<span class="pill pill-warn">' + (p.tipo === 'varo' ? 'Varo' : 'Alaggio') + ' ' + A.fmtBreve(p.data) + '</span>';
    return b.stato === 'acqua' ? '<span class="pill pill-info">In acqua</span>' : '<span class="pill pill-neutral">A terra</span>';
  };
  function rigaBarca(b) {
    var a = A.armatoreDi(b), lav = D.lavori.filter(function (l) { return l.barca === b.id && A.aperto(l); }).length;
    return '<a class="cant" href="#/barca/' + b.id + '"><div class="cant-top"><span class="code">' + b.id + '</span>' + A.pillBarca(b) + '</div><strong>' + esc(b.nome) + '</strong>' +
      '<small>' + esc(b.marca + ' ' + b.modello) + ' · ' + A.num(b.l, 1) + ' m</small><small>' + ico('pin') + esc(A.postoLabel(b.posto)) + '</small>' +
      '<div class="cant-bot"><small>' + ico('user') + esc(a.nome) + '</small>' + (lav ? '<span class="mini mini-brand">' + lav + ' lavori aperti</span>' : '') + '</div></a>';
  }
  var filtro = 'tutte', cerca = '';
  var FILTRI = [['tutte', 'Tutte'], ['terra', 'A terra'], ['acqua', 'In acqua'], ['lavori', 'Con lavori aperti']].concat(C.aree.map(function (a) { return [a.id, a.nome]; }));
  function lista() {
    var q = cerca.toLowerCase();
    var l = D.barche.filter(function (b) {
      if (filtro === 'terra' || filtro === 'acqua') { if (b.stato !== filtro) return false; }
      else if (filtro === 'lavori') { if (!D.lavori.some(function (x) { return x.barca === b.id && A.aperto(x); })) return false; }
      else if (filtro !== 'tutte' && b.posto[0] !== filtro) return false;
      return !q || (b.nome + ' ' + b.marca + ' ' + b.modello + ' ' + A.armatoreDi(b).nome + ' ' + b.posto).toLowerCase().indexOf(q) >= 0;
    });
    return (l.length ? '<ul class="cant-grid">' + l.map(function (b) { return '<li>' + rigaBarca(b) + '</li>'; }).join('') + '</ul>' : '<p class="empty">Nessuna barca trovata.</p>') +
      '<p class="note">' + ico('info') + l.length + ' barche mostrate su ' + D.barche.length + '.</p>';
  }
  A.viste.barche = function (arg) {
    if (arg) filtro = arg;
    var h = A.intestazione('Barche e armatori', D.barche.length + ' barche · ' + C.aree.reduce(function (s, a) { return s + a.posti; }, 0) + ' posti tra capannoni, piazzale e pontile', '<button class="btn" data-act="demo-nuova-barca">' + ico('plus') + 'Nuova barca</button>');
    h += '<input type="search" class="search" placeholder="Cerca per barca, armatore, modello o posto" data-cerca="barche" value="' + esc(cerca) + '">';
    h += '<div class="filters">' + FILTRI.map(function (f) { return '<button class="filter' + (filtro === f[0] ? ' on' : '') + '" data-act="filtro-barche" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>';
    return h + '<div id="lista">' + lista() + '</div>';
  };
  A.azioni['filtro-barche'] = function (el, id, v) { filtro = v; A.render(); };
  A.input.push(function (t) { if (t.getAttribute('data-cerca') === 'barche') { cerca = t.value; A.$('#lista').innerHTML = lista(); } });

  function mappaPosti(b) {
    var area = A.area(b.posto), celle = '';
    for (var n = 1; n <= area.posti; n++) {
      var id = area.id + '-' + A.pad(n), occ = D.barche.filter(function (x) { return x.posto === id; })[0];
      celle += '<span class="posto' + (occ === b ? ' qui' : occ ? ' occ' : '') + '" title="' + id + (occ ? ' · ' + esc(occ.nome) : ' · libero') + '">' + n + '</span>';
    }
    return '<div class="posti">' + celle + '</div>';
  }
  function chipRata(r, k) {
    if (r.pagata) return '<span class="chip chip-ok">' + (k + 1) + 'ª pagata</span>';
    var n = A.giorni(r.scad);
    return '<span class="chip chip-' + (n < 0 ? 'danger' : A.livello(n)) + '">' + (k + 1) + 'ª <b>' + (n < 0 ? 'scaduta' : A.fmtBreve(r.scad)) + '</b> ' + A.eur0(r.imp) + '</span>';
  }
  A.chipRata = chipRata;

  A.viste.barca = function (id) {
    var b = A.barca(id); if (!b) return '<p class="empty">Barca non trovata.</p>';
    var a = A.armatoreDi(b), c = A.contrattoDi(b.id), p = A.prenDi(b.id);
    var lav = D.lavori.filter(function (l) { return l.barca === b.id; });
    var azioni = (p ? '' : '<button class="btn" data-act="pren-nuova" data-b="' + b.id + '">' + ico(b.stato === 'acqua' ? 'su' : 'giu') + (b.stato === 'acqua' ? 'Prenota alaggio' : 'Prenota varo') + '</button>') +
      '<button class="btn btn-ghost" data-act="demo-nuovo-lavoro">' + ico('plus') + 'Nuovo lavoro</button>';
    var h = A.intestazione(esc(b.nome), '<span class="code">' + b.id + '</span> ' + A.pillBarca(b) + ' · ' + esc(b.marca + ' ' + b.modello), azioni, '#/barche');
    if (p) h += '<div class="banner banner-' + (A.problemi(p).length ? 'danger' : 'info') + '">' + ico('cal') + '<div><strong>' + (p.tipo === 'varo' ? 'Varo' : 'Alaggio') + ' prenotato ' + A.fmtGiorno(p.data) + ' alle ' + p.ora + ' con ' + C.risorse[p.ris].nome.toLowerCase() + '</strong><small>' + (A.problemi(p).length ? A.problemi(p).join('; ') : esc(p.note || A.rel(p.data))) + '</small></div><a class="btn btn-sm" href="#/calendario/' + A.toISO(p.data) + '">Apri</a></div>';

    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>' + ico('barca') + ' Barca</h2></div><dl class="dl">' +
      A.dl('Tipo', esc(b.tipo) + ' · anno ' + b.anno) + A.dl('Dimensioni', A.num(b.l, 2) + ' × ' + A.num(b.w, 2) + ' m · ' + A.num(b.peso, 1) + ' t') +
      A.dl('Motori', b.motori.length ? b.motori.map(function (m) { return esc(m.marca + ' ' + m.modello) + (m.cv ? ', ' + m.cv + ' cv' : '') + ' · <b>' + A.num(m.ore) + ' ore</b>'; }).join('<br>') : 'senza motore') +
      A.dl('Assicurazione', '<span class="chip chip-' + A.livello(A.giorni(b.assic)) + '">' + (b.assic < OGGI ? 'scaduta il ' : 'fino al ') + fmt(b.assic) + '</span>') +
      (b.note ? A.dl('Note', esc(b.note)) : '') + '</dl></section>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('user') + ' Armatore</h2><button class="btn btn-sm btn-ghost" data-act="demo-messaggio">' + ico('msg') + 'Messaggio</button></div><dl class="dl">' +
      A.dl('Nome', '<b>' + esc(a.nome) + '</b>') + A.dl('Città', esc(a.citta)) + A.dl('Telefono', esc(a.tel)) + A.dl('Email', esc(a.email)) +
      A.dl('Lingua', a.lingua === 'de' ? 'Tedesco: messaggi e preventivi preparati in tedesco' : 'Italiano') + (a.note ? A.dl('Note', esc(a.note)) : '') + '</dl></section></div>';

    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>' + ico('pin') + ' ' + esc(A.postoLabel(b.posto)) + '</h2><span class="muted">' + esc(A.area(b.posto).tipo === 'acqua' ? 'in acqua' : A.area(b.posto).tipo) + '</span></div>' + mappaPosti(b) +
      (c ? '<div class="contr-box"><div><strong>' + esc(c.descr) + '</strong><small>Contratto ' + c.id + ' · dal ' + fmt(c.inizio) + ' al ' + fmt(c.fine) + ' · ' + A.eur0(c.canone) + '</small></div><div class="chips">' + c.rate.map(chipRata).join('') + '</div><a class="link" href="#/contratti">Vai ai contratti</a></div>' : '') + '</section>';
    var storico = lav.map(function (l) { return { data: l.fine && l.stato === 'fatturato' ? l.fine : l.aperto, html: '<a href="#/lavoro/' + l.id + '">' + ico('lavori') + '<div><strong>' + esc(l.titolo) + '</strong><small>' + l.id + ' · ' + fmt(l.aperto) + ' · ' + A.eur(A.totLavoro(l).tot) + '</small></div>' + A.pillL(l.stato) + '</a>' }; })
      .concat(b.storico.filter(function (s) { return s.desc.indexOf('OL-') < 0; }).map(function (s) { return { data: s.data, html: '<div class="doc-row">' + ico('clock') + '<div><strong>' + esc(s.desc) + '</strong><small>' + fmt(s.data) + ' · ' + A.eur(s.imp) + '</small></div></div>' }; }))
      .sort(function (x, y) { return y.data - x.data; });
    h += '<section class="card"><div class="card-head"><h2>' + ico('clock') + ' Storico interventi</h2><span class="count">' + storico.length + '</span></div>' +
      (storico.length ? '<ul class="docs">' + storico.map(function (s) { return '<li>' + s.html + '</li>'; }).join('') + '</ul>' : '<p class="empty">Nessun intervento registrato: barca nuova in cantiere.</p>') + '</section></div>';

    h += '<section class="card"><div class="card-head"><h2>' + ico('camera') + ' Foto</h2><span class="muted">' + b.foto.length + ' foto</span></div>' + A.galleria(b.foto, b.nome, 'data-b="' + b.id + '"', true) + '</section>';
    var docs = [];
    if (c) docs.push({ nome: 'Contratto di rimessaggio ' + c.id, info: 'firmato il ' + fmt(c.inizio), st: 'ok' });
    docs.push({ nome: 'Polizza di assicurazione', info: (b.assic < OGGI ? 'scaduta il ' : 'valida fino al ') + fmt(b.assic), st: b.assic < OGGI ? 'danger' : 'ok' });
    docs.push({ nome: b.l > 10 ? 'Licenza di navigazione' : 'Certificato d\'uso del motore', info: 'copia in archivio', st: 'ok' });
    lav.filter(function (l) { return ['approvato', 'incorso', 'finito', 'fatturato'].indexOf(l.stato) >= 0; }).forEach(function (l) { docs.push({ nome: 'Preventivo ' + l.id + ' approvato', info: 'via link il ' + fmt(l.approvato), st: 'ok', href: '#/lavoro/' + l.id }); });
    lav.filter(function (l) { return l.stato === 'fatturato'; }).forEach(function (l) { docs.push({ nome: 'Fattura del lavoro ' + l.id, info: A.eur(A.totLavoro(l).tot), st: 'ok' }); });
    var ST = { ok: ['ok', 'Presente'], danger: ['danger', 'Da rinnovare'] };
    h += '<section class="card"><div class="card-head"><h2>' + ico('doc') + ' Documenti</h2></div><ul class="docs">' + docs.map(function (d) {
      var inner = ico('doc') + '<div><strong>' + esc(d.nome) + '</strong><small>' + d.info + '</small></div><span class="pill pill-' + ST[d.st][0] + '">' + ST[d.st][1] + '</span>';
      return '<li>' + (d.href ? '<a href="' + d.href + '">' + inner + ico('chev') + '</a>' : '<div class="doc-row">' + inner + '</div>') + '</li>';
    }).join('') + '</ul></section>';
    return h;
  };
})();
