/* 4. Ordini di lavoro: ore, ricambi, foto prima e dopo, preventivo e approvazione dell'armatore via link. */
(function () {
  'use strict';
  var A = window.A, C = window.CONFIG, D = window.DATI, OGGI = window.DEMO.OGGI;
  var ico = A.ico, esc = A.esc, fmt = A.fmt, eur = A.eur;

  A.rigaLavoro = function (l) {
    var b = A.barca(l.barca), t = A.totLavoro(l), extra;
    if (l.stato === 'inviato') extra = '<span class="mini mini-' + (A.giorni(l.inviato) <= -4 ? 'warn' : 'info') + '">In attesa ' + A.rel(l.inviato) + '</span>';
    else if (l.stato === 'incorso' || l.stato === 'approvato') extra = '<span class="mini mini-brand">' + A.num(t.oreReg, 1) + ' di ' + A.num(t.orePrev, 1) + ' ore</span>';
    else extra = '<span class="mini">' + eur(t.tot) + '</span>';
    var pct = t.orePrev ? Math.min(100, Math.round(t.oreReg / t.orePrev * 100)) : 0;
    return '<a class="cant" href="#/lavoro/' + l.id + '"><div class="cant-top"><span class="code">' + l.id + '</span>' + A.pillL(l.stato) + '</div><strong>' + esc(l.titolo) + '</strong><small>' + ico('barca') + esc(b.nome) + ' · ' + esc(A.armatoreDi(b).nome) + '</small>' +
      '<div class="cant-bot"><div class="bar"><span style="width:' + (l.stato === 'finito' || l.stato === 'fatturato' ? 100 : pct) + '%"></span></div>' + extra + '</div></a>';
  };

  var filtro = 'aperti';
  A.viste.lavori = function () {
    var lista = D.lavori.filter(function (l) { return filtro === 'tutti' || (filtro === 'aperti' ? A.aperto(l) : l.stato === filtro); });
    var h = A.intestazione('Lavori', 'Tagliandi, antivegetativa, invernaggi e riparazioni', '<button class="btn" data-act="demo-nuovo-lavoro">' + ico('plus') + 'Nuovo lavoro</button>');
    h += '<div class="filters">' + [['aperti', 'Aperti'], ['bozza', 'Da preparare'], ['inviato', 'Attesa armatore'], ['incorso', 'In lavorazione'], ['finito', 'Da fatturare'], ['tutti', 'Tutti']].map(function (f) {
      return '<button class="filter' + (filtro === f[0] ? ' on' : '') + '" data-act="filtro-lavori" data-v="' + f[0] + '">' + f[1] + '</button>';
    }).join('') + '</div>';
    return h + (lista.length ? '<ul class="cant-grid">' + lista.map(function (l) { return '<li>' + A.rigaLavoro(l) + '</li>'; }).join('') + '</ul>' : '<p class="empty">Nessun lavoro in questo stato.</p>');
  };
  A.azioni['filtro-lavori'] = function (el, id, v) { filtro = v; A.render(); };

  function tabRighe(l) {
    var mod = l.stato === 'bozza';
    return '<table class="tbl tbl-edit tbl-voci"><thead><tr><th></th><th>Descrizione</th><th class="r">Q.tà</th><th>U.m.</th><th class="r">Prezzo</th><th class="r">Importo</th></tr></thead><tbody>' +
      l.righe.map(function (r, k) {
        var tag = { mano: 'Ore', ric: 'Ricambio', corpo: 'Voce' }[r.k];
        return '<tr><td><span class="tag">' + tag + '</span></td><td>' + esc(A.descRiga(r)) + (r.k === 'ric' ? '<small class="muted d-block">' + r.cod + '</small>' : '') + '</td>' +
          '<td class="r">' + (mod ? '<input type="number" step="any" min="0" data-riga="' + k + '" data-k="q" value="' + r.q + '">' : A.num(r.q, r.q % 1 ? 1 : 0)) + '</td><td>' + A.umRiga(r) + '</td>' +
          '<td class="r">' + (mod ? '<input type="number" step="0.01" min="0" data-riga="' + k + '" data-k="p" value="' + r.p + '">' : eur(r.p)) + '</td><td class="r" data-imp="' + k + '">' + eur(r.q * r.p) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      (mod ? '<div class="pad-row"><select data-act="lav-agg-ric" data-id="' + l.id + '"><option value="">+ Aggiungi un ricambio dal magazzino…</option>' + D.magazzino.map(function (a) { return '<option value="' + a.cod + '">' + esc(a.desc) + ' · ' + eur(a.ven) + ' · giacenza ' + a.giac + '</option>'; }).join('') + '</select></div>' : '');
  }
  function boxTot(l) {
    var t = A.totLavoro(l), b = A.barca(l.barca), azioni = '';
    if (l.stato === 'bozza') azioni = '<button class="btn btn-block" data-act="lav-invia" data-id="' + l.id + '">' + ico('link') + 'Invia all\'armatore con link</button>';
    else if (l.stato === 'inviato') azioni = '<button class="btn btn-block" data-act="lav-link" data-id="' + l.id + '">' + ico('link') + 'Apri il link come armatore</button><button class="btn btn-ghost btn-block" data-act="lav-invia" data-id="' + l.id + '">' + ico('msg') + 'Prepara un promemoria</button>';
    else if (l.stato === 'approvato' || l.stato === 'incorso') azioni = '<button class="btn btn-block" data-act="lav-ore" data-id="' + l.id + '">' + ico('clock') + 'Registra ore</button><button class="btn btn-ghost btn-block" data-act="lav-finito" data-id="' + l.id + '">' + ico('check') + 'Segna come finito</button>';
    else if (l.stato === 'finito') azioni = '<button class="btn btn-block" data-act="lav-fattura" data-id="' + l.id + '">' + ico('euro') + 'Prepara la fattura</button>';
    return '<h2>Preventivo</h2><p class="muted small">' + esc(b.nome) + ' · ' + esc(A.armatoreDi(b).nome) + '</p><dl class="sum">' +
      '<dt>Manodopera (' + A.num(t.orePrev, 1) + ' h × ' + eur(C.tariffaOraria) + ')</dt><dd>' + eur(t.mano) + '</dd><dt>Ricambi e materiali</dt><dd>' + eur(t.ric) + '</dd><dt>Altre voci</dt><dd>' + eur(t.corpo) + '</dd>' +
      '<dt>Imponibile</dt><dd>' + eur(t.imp) + '</dd><dt>IVA 22%</dt><dd>' + eur(t.iva) + '</dd></dl><div class="grand"><span>Totale</span><b>' + eur(t.tot) + '</b></div>' +
      '<p class="muted small">Prezzi e tariffa di esempio.</p>' + azioni + '<button class="btn btn-ghost btn-block" data-act="lav-stampa" data-id="' + l.id + '">' + ico('print') + 'Stampa / PDF</button>';
  }

  A.viste.lavoro = function (id) {
    var l = A.lavoro(id); if (!l) return '<p class="empty">Lavoro non trovato.</p>';
    var b = A.barca(l.barca), t = A.totLavoro(l), i = A.STATI_L.map(function (s) { return s[0]; }).indexOf(l.stato);
    var h = A.intestazione(esc(l.titolo), '<span class="code">' + l.id + '</span> ' + A.pillL(l.stato) + ' · <a class="link" href="#/barca/' + b.id + '">' + esc(b.nome) + '</a> · ' + esc(A.postoLabel(b.posto)), '', '#/lavori');
    h += '<div class="card stepper-card">' + A.stepper(A.STATI_L, l.stato) + '</div>';
    if (l.stato === 'bozza') h += '<div class="banner banner-info">' + ico('info') + '<div><strong>Preventivo in preparazione</strong><small>Quantità e prezzi si cambiano qui. Quando è pronto lo mandi all\'armatore: riceve un link con foto, voci e il pulsante per approvare.</small></div></div>';
    if (l.stato === 'inviato') h += '<div class="banner banner-' + (A.giorni(l.inviato) <= -4 ? 'warn' : 'info') + '">' + ico('clock') + '<div><strong>Inviato il ' + fmt(l.inviato) + ', in attesa ' + A.rel(l.inviato) + '</strong><small>Il lavoro parte quando l\'armatore approva dal link. Puoi provare ad aprirlo come lo vede lui.</small></div><button class="btn btn-sm" data-act="lav-link" data-id="' + l.id + '">Apri il link</button></div>';
    if (l.approvato && i >= 2) h += '<div class="banner banner-ok">' + ico('check') + '<div><strong>Approvato dall\'armatore via link il ' + fmt(l.approvato) + '</strong><small>' + esc(A.armatoreDi(b).nome) + ' ha visto foto e voci prima di dire sì: niente discussioni in fattura.</small></div></div>';

    h += '<div class="split split-prev"><div>';
    h += '<section class="card table-card"><div class="card-head pad"><h2>' + ico('contratti') + ' Voci del preventivo</h2><span class="muted">' + (l.stato === 'bozza' ? 'modificabili' : 'bloccate dopo l\'invio') + '</span></div><div id="lav-righe">' + tabRighe(l) + '</div></section>';

    if (i >= 2) {
      var pct = t.orePrev ? Math.min(100, Math.round(t.oreReg / t.orePrev * 100)) : 0;
      h += '<section class="card"><div class="card-head"><h2>' + ico('clock') + ' Ore lavorate</h2><span class="muted">' + A.num(t.oreReg, 1) + ' su ' + A.num(t.orePrev, 1) + ' preventivate</span></div><div class="bar bar-lg' + (t.oreReg > t.orePrev ? ' bar-over' : '') + '"><span style="width:' + pct + '%"></span></div>' +
        (l.ore.length ? '<ul class="docs">' + l.ore.map(function (o) { return '<li><div class="doc-row">' + ico('user') + '<div><strong>' + A.num(o.ore, 1) + ' ore · ' + esc(o.tec) + '</strong><small>' + fmt(o.data) + (o.nota ? ' · ' + esc(o.nota) : '') + '</small></div></div></li>'; }).join('') + '</ul>' : '<p class="empty">Nessuna ora registrata. Il tecnico le segna dal telefono a fine giornata.</p>') + '</section>';
      var ric = l.righe.map(function (r, k) { return { r: r, k: k }; }).filter(function (x) { return x.r.k === 'ric'; });
      h += '<section class="card"><div class="card-head"><h2>' + ico('magazzino') + ' Ricambi dal magazzino</h2></div><ul class="docs">' + ric.map(function (x) {
        var a = A.articolo(x.r.cod), manca = !x.r.scaricato && a.giac < x.r.q;
        return '<li><div class="doc-row">' + ico('magazzino') + '<div><strong>' + x.r.q + ' × ' + esc(a.desc) + '</strong><small>' + a.cod + ' · ' + esc(a.ubic) + ' · giacenza ' + a.giac + '</small></div>' +
          (x.r.scaricato ? '<span class="pill pill-ok">Scaricato</span>' : manca ? '<span class="pill pill-danger">Da ordinare</span>' : (l.stato === 'fatturato' ? '' : '<button class="btn btn-sm btn-ghost" data-act="lav-scarica" data-id="' + l.id + '" data-k="' + x.k + '">Scarica</button>')) + '</div></li>';
      }).join('') + '</ul></section>';
    }
    var stamp = b.nome;
    h += '<section class="card"><div class="card-head"><h2>' + ico('camera') + ' Foto prima e dopo</h2></div><div class="prima-dopo"><div><h3>Prima</h3>' + A.galleria(l.foto.prima, stamp, 'data-l="' + l.id + '" data-f="prima"', l.stato !== 'fatturato') + '</div>' +
      '<div><h3>Dopo</h3>' + (l.foto.dopo.length || i >= 2 ? A.galleria(l.foto.dopo, stamp, 'data-l="' + l.id + '" data-f="dopo"', i >= 2 && l.stato !== 'fatturato') : '<p class="empty">Le foto del dopo si aggiungono a lavoro iniziato.</p>') + '</div></div></section>';
    h += '</div><aside class="card totals" id="lav-tot">' + boxTot(l) + '</aside></div>';
    return h;
  };

  A.input.push(function (t) {
    if (!t.hasAttribute('data-riga')) return;
    var l = A.lavoro(location.hash.split('/')[2]), k = +t.getAttribute('data-riga'), v = parseFloat(t.value);
    if (!l || isNaN(v)) return;
    l.righe[k][t.getAttribute('data-k')] = v;
    A.$('[data-imp="' + k + '"]').textContent = eur(l.righe[k].q * l.righe[k].p);
    A.$('#lav-tot').innerHTML = boxTot(l);
  });
  A.change.push(function (t) {
    if (t.getAttribute('data-act') !== 'lav-agg-ric' || !t.value) return;
    var l = A.lavoro(t.getAttribute('data-id')), a = A.articolo(t.value);
    l.righe.push({ k: 'ric', cod: a.cod, q: 1, p: a.ven }); A.toast('Aggiunto: ' + a.desc + '.'); A.render();
  });

  function docPreventivo(l) {
    var b = A.barca(l.barca), a = A.armatoreDi(b), t = A.totLavoro(l);
    return A.docTesta('Preventivo ' + l.id.replace('OL-', 'P-'), 'Data ' + fmt(l.inviato || OGGI) + ' · validità 30 giorni') +
      '<table class="doc-kv"><tr><th>Armatore</th><td>' + esc(a.nome) + ', ' + esc(a.citta) + '</td></tr><tr><th>Barca</th><td>' + esc(b.nome) + ', ' + esc(b.marca + ' ' + b.modello) + ', ' + A.num(b.l, 2) + ' m</td></tr>' +
      '<tr><th>Motori</th><td>' + (b.motori.map(function (m) { return esc(m.marca + ' ' + m.modello) + ', ' + A.num(m.ore) + ' ore'; }).join('; ') || '—') + '</td></tr><tr><th>Lavoro</th><td>' + esc(l.titolo) + '</td></tr></table>' +
      (l.foto.prima.length ? '<div class="doc-foto">' + l.foto.prima.slice(0, 3).map(function (f) { return window.fotoSVG(f, b.nome); }).join('') + '</div>' : '') +
      '<table class="doc-tbl"><thead><tr><th>Descrizione</th><th>Q.tà</th><th>U.m.</th><th>Prezzo</th><th>Importo</th></tr></thead><tbody>' +
      l.righe.map(function (r) { return '<tr><td>' + esc(A.descRiga(r)) + '</td><td class="r">' + A.num(r.q, r.q % 1 ? 1 : 0) + '</td><td>' + A.umRiga(r) + '</td><td class="r">' + eur(r.p) + '</td><td class="r">' + eur(r.q * r.p) + '</td></tr>'; }).join('') +
      '</tbody></table><table class="doc-sum"><tr><td>Imponibile</td><td>' + eur(t.imp) + '</td></tr><tr><td>IVA 22%</td><td>' + eur(t.iva) + '</td></tr><tr class="grand"><td>Totale</td><td>' + eur(t.tot) + '</td></tr></table>' +
      '<div class="doc-firme"><div>Per il cantiere<span>' + esc(C.titolare) + '</span></div><div>Per accettazione dell\'armatore<span>' + (l.approvato ? 'approvato via link il ' + fmt(l.approvato) : '&nbsp;') + '</span></div></div>' +
      '<p class="doc-foot">Documento dimostrativo con dati e prezzi inventati.</p>';
  }
  A.azioni['lav-stampa'] = function (el, id) { A.stampa('<div class="paper">' + docPreventivo(A.lavoro(id)) + '</div>'); };
  A.azioni['lav-invia'] = function (el, id) {
    var l = A.lavoro(id), b = A.barca(l.barca), a = A.armatoreDi(b), testo = A.msgPreventivo(l);
    A.modale('<h2>' + (l.stato === 'bozza' ? 'Invia il preventivo all\'armatore' : 'Promemoria all\'armatore') + '</h2><p class="muted">Messaggio pronto' + (a.lingua === 'de' ? ' <b>in tedesco</b>' : '') + ' per ' + esc(a.nome) + ' (' + esc(a.tel) + '). Lo invii tu da WhatsApp o email: l\'app non manda niente da sola.</p>' +
      '<pre class="msg">' + esc(testo) + '</pre><p class="muted small">' + ico('link') + ' Il link apre una pagina con foto, voci e totale, e il pulsante per approvare. Nella demo esiste solo qui.</p>' +
      '<div class="modal-actions"><button class="btn btn-ghost" data-act="copia" data-t="' + esc(testo) + '">Copia testo</button><button class="btn btn-ghost" data-act="lav-link" data-id="' + l.id + '">Vedi come l\'armatore</button>' +
      (l.stato === 'bozza' ? '<button class="btn" data-act="lav-inviato" data-id="' + l.id + '">' + ico('check') + 'Segna come inviato</button>' : '') + '</div>');
  };
  A.azioni['lav-inviato'] = function (el, id) { var l = A.lavoro(id); l.stato = 'inviato'; l.inviato = new Date(OGGI); A.chiudiModale(); A.toast('Preventivo segnato come inviato: lo trovi tra quelli in attesa.'); A.render(); };
  A.azioni['lav-link'] = function (el, id) { var l = A.lavoro(id); if (l.stato === 'bozza') { l.stato = 'inviato'; l.inviato = new Date(OGGI); } A.chiudiModale(); location.hash = '#/approva/' + id; };
  A.azioni['lav-finito'] = function (el, id) { var l = A.lavoro(id); l.stato = 'finito'; l.fine = new Date(OGGI); A.toast('Lavoro finito: ora è tra gli incassi da fare.'); A.render(); };
  A.azioni['lav-fattura'] = function (el, id) { var l = A.lavoro(id); l.stato = 'fatturato'; A.toast('Nell\'app vera parte la fattura elettronica dal gestionale di fatturazione dell\'azienda. Qui il lavoro passa a "Fatturato".'); A.render(); };
  A.azioni['lav-scarica'] = function (el, id) {
    var l = A.lavoro(id), r = l.righe[+el.getAttribute('data-k')], a = A.articolo(r.cod);
    a.giac -= r.q; r.scaricato = true; D.movimenti.push({ data: new Date(OGGI), tipo: 'Scarico', cod: a.cod, q: r.q, rif: l.id });
    if (l.stato === 'approvato') l.stato = 'incorso';
    A.toast('Scaricati ' + r.q + ' × ' + a.desc + '. Giacenza: ' + a.giac + '.'); A.render();
  };
  A.azioni['lav-ore'] = function (el, id) {
    A.modale('<h2>Registra ore</h2><p class="muted">Nell\'app vera il tecnico le segna dal telefono a fine giornata.</p><form class="form" id="form-ore" data-id="' + id + '"><fieldset>' +
      '<label class="full"><span>Tecnico</span><select name="tec">' + D.tecnici.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
      '<label><span>Ore</span><input type="number" name="ore" step="0.5" min="0.5" value="2"></label><label><span>Giorno</span><input type="date" name="data" value="' + A.toISO(OGGI) + '"></label>' +
      '<label class="full"><span>Cosa è stato fatto</span><input type="text" name="nota" placeholder="es. cambio olio e filtri"></label></fieldset></form>' +
      '<div class="modal-actions"><button class="btn btn-ghost" data-act="chiudi">Annulla</button><button class="btn" data-act="ore-salva">' + ico('check') + 'Registra</button></div>');
  };
  A.azioni['ore-salva'] = function () {
    var f = A.$('#form-ore'), l = A.lavoro(f.getAttribute('data-id')), ore = parseFloat(f.ore.value);
    if (!(ore > 0)) { A.toast('Indica le ore.'); return; }
    l.ore.push({ data: A.fromISO(f.data.value) || new Date(OGGI), tec: f.tec.value, ore: ore, nota: f.nota.value });
    if (l.stato === 'approvato') l.stato = 'incorso';
    A.chiudiModale(); A.toast('Registrate ' + A.num(ore, 1) + ' ore su ' + l.id + '.'); A.render();
  };

  /* ---------- pagina che vede l'armatore aprendo il link ---------- */
  A.viste.approva = function (id) {
    var l = A.lavoro(id); if (!l) return '<p class="empty">Link non valido.</p>';
    var b = A.barca(l.barca), a = A.armatoreDi(b), t = A.totLavoro(l), ok = !!l.approvato;
    var h = '<div class="demo-bar">' + ico('info') + '<span>Così l\'armatore vede il link sul telefono. Nella demo la pagina non è online.</span><a class="btn btn-sm" href="#/lavoro/' + l.id + '">Torna al gestionale</a></div>';
    h += '<div class="portal-head">' + A.logoHTML('logo-md') + '<div><strong>' + esc(C.nome) + '</strong><small>' + esc(C.sede) + '</small></div></div>';
    h += '<section class="card"><p class="muted small">Gentile ' + esc(a.nome) + ',</p><h1>Preventivo per ' + esc(b.nome) + '</h1><p class="muted">' + esc(l.titolo) + ' · ' + esc(b.marca + ' ' + b.modello) + '</p>' +
      (l.foto.prima.length ? '<h3>Come abbiamo trovato la barca</h3>' + A.galleria(l.foto.prima, b.nome, 'data-l="' + l.id + '" data-f="prima"', false) : '') +
      '<h3>Cosa faremo</h3><ul class="voci-portale">' + l.righe.map(function (r) { return '<li><span>' + esc(A.descRiga(r)) + (r.q !== 1 || r.k === 'mano' ? ' <small>' + A.num(r.q, r.q % 1 ? 1 : 0) + ' ' + A.umRiga(r) + '</small>' : '') + '</span><b>' + eur(r.q * r.p) + '</b></li>'; }).join('') + '</ul>' +
      '<dl class="sum"><dt>Imponibile</dt><dd>' + eur(t.imp) + '</dd><dt>IVA 22%</dt><dd>' + eur(t.iva) + '</dd></dl><div class="grand"><span>Totale</span><b>' + eur(t.tot) + '</b></div>' +
      '<p class="muted small">Fine lavori prevista: ' + (l.fine ? fmt(l.fine) : 'da definire') + '. Le foto del lavoro finito le riceverà qui.</p></section>';
    h += ok ? '<div class="banner banner-ok">' + ico('check') + '<div><strong>Preventivo approvato il ' + fmt(l.approvato) + '</strong><small>Grazie. Il cantiere è stato avvisato e la avviserà a lavoro finito.</small></div></div>'
      : '<div class="portal-actions"><button class="btn btn-block btn-lg" data-act="approva-ok" data-id="' + l.id + '">' + ico('check') + 'Approvo il preventivo</button><button class="btn btn-ghost btn-block" data-act="approva-domanda">Ho una domanda</button></div>';
    return h;
  };
  A.azioni['approva-ok'] = function (el, id) {
    var l = A.lavoro(id); l.stato = 'approvato'; l.approvato = new Date(OGGI);
    A.toast('Approvato. In ufficio il lavoro passa subito ad "Approvato".'); A.render();
  };
  A.azioni['approva-domanda'] = function () { A.toast('Nell\'app vera la domanda arriva all\'ufficio, legata a questo preventivo.'); };
})();
