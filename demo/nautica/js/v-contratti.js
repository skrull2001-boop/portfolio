/* 5. Contratti di rimessaggio stagionale: canone, rate e solleciti. */
(function () {
  'use strict';
  var A = window.A, D = window.DATI, OGGI = window.DEMO.OGGI;
  var ico = A.ico, esc = A.esc, fmt = A.fmt;
  var filtro = 'tutti', cerca = '';

  function scaduta(c) { return c.rate.some(function (r) { return !r.pagata && r.scad < OGGI; }); }
  function righe() {
    var q = cerca.toLowerCase();
    var l = D.contratti.filter(function (c) {
      var b = A.barca(c.barca);
      if (filtro === 'scadute' && !scaduta(c)) return false;
      if (filtro === 'scadenza' && A.inScadenza(60).indexOf(c) < 0) return false;
      if (filtro === 'saldati' && A.daPagare(c) > 0) return false;
      return !q || (b.nome + ' ' + A.armatoreDi(b).nome + ' ' + c.id).toLowerCase().indexOf(q) >= 0;
    }).sort(function (x, y) { return (scaduta(y) ? 1 : 0) - (scaduta(x) ? 1 : 0) || x.fine - y.fine; });
    if (!l.length) return '<p class="empty">Nessun contratto in questo filtro.</p>';
    return '<table class="tbl tbl-fir tbl-contr"><thead><tr><th>Barca e armatore</th><th>Contratto</th><th class="r">Canone</th><th>Rate</th><th></th></tr></thead><tbody>' + l.map(function (c) {
      var b = A.barca(c.barca), a = A.armatoreDi(b), sc = scaduta(c), inSc = A.inScadenza(60).indexOf(c) >= 0, az = '';
      if (sc) az += '<button class="btn btn-sm" data-act="sollecito" data-id="' + c.id + '">' + ico('msg') + 'Sollecito</button>';
      if (A.daPagare(c) > 0) az += '<button class="btn btn-sm btn-ghost" data-act="paga" data-id="' + c.id + '">' + ico('euro') + 'Pagamento</button>';
      if (inSc) az += '<button class="btn btn-sm btn-ghost" data-act="rinnovo" data-id="' + c.id + '">Rinnovo</button>';
      if (c.rinnovo) az += '<span class="pill pill-info">Rinnovo inviato</span>';
      return '<tr><td><a href="#/barca/' + b.id + '">' + esc(b.nome) + '</a><small class="muted d-block">' + esc(a.nome) + (a.lingua === 'de' ? ' · DE' : '') + '</small></td>' +
        '<td data-l="Contratto">' + esc(c.descr) + '<small class="muted d-block">' + c.id + ' · ' + esc(A.postoLabel(b.posto)) + ' · fino al ' + fmt(c.fine) + (inSc ? ' <b class="txt-warn">in scadenza</b>' : '') + '</small></td>' +
        '<td class="r" data-l="Canone">' + A.eur0(c.canone) + '</td><td data-l="Rate"><div class="chips">' + c.rate.map(A.chipRata).join('') + '</div>' + (c.solleciti.length ? '<small class="muted d-block">' + c.solleciti.length + ' solleciti, ultimo il ' + fmt(c.solleciti[c.solleciti.length - 1].data) + '</small>' : '') + '</td>' +
        '<td class="r"><div class="actions az-row">' + az + '</div></td></tr>';
    }).join('') + '</tbody></table>';
  }

  A.viste.contratti = function (arg) {
    if (arg) filtro = arg;
    var canoni = 0, incassato = 0, aperto = 0;
    D.contratti.forEach(function (c) { canoni += c.canone; c.rate.forEach(function (r) { if (r.pagata) incassato += r.imp; else aperto += r.imp; }); });
    var sc = A.rateScadute(), scTot = sc.reduce(function (s, x) { return s + x.r.imp; }, 0);
    var h = A.intestazione('Contratti di rimessaggio', D.contratti.length + ' contratti · stagione ' + OGGI.getFullYear() + '/' + String(OGGI.getFullYear() + 1).slice(2), '<button class="btn" data-act="demo-nuovo-contratto">' + ico('plus') + 'Nuovo contratto</button>');
    h += '<section class="kpis">' + A.kpi('Canoni della stagione', A.eur0(canoni), 'tutti i posti assegnati', 'contratti', '#/contratti/tutti') +
      A.kpi('Incassato', A.eur0(incassato), Math.round(incassato / canoni * 100) + '% dei canoni', 'euro', '#/contratti/saldati') +
      A.kpi('Ancora da incassare', A.eur0(aperto), 'rate non ancora pagate', 'clock', '#/contratti/tutti') +
      A.kpi('Rate scadute', A.eur0(scTot), sc.length + ' rate da sollecitare', 'alert', '#/contratti/scadute', sc.length ? 'warn' : '') + '</section>';
    h += '<input type="search" class="search" placeholder="Cerca per barca, armatore o numero di contratto" data-cerca="contratti" value="' + esc(cerca) + '">';
    h += '<div class="filters">' + [['tutti', 'Tutti'], ['scadute', 'Con rate scadute'], ['scadenza', 'In scadenza (60 giorni)'], ['saldati', 'Saldati']].map(function (f) {
      return '<button class="filter' + (filtro === f[0] ? ' on' : '') + '" data-act="filtro-contr" data-v="' + f[0] + '">' + f[1] + '</button>';
    }).join('') + '</div>';
    h += '<div class="card table-card" id="lista">' + righe() + '</div>';
    h += '<p class="note">' + ico('info') + 'Canoni di esempio: ' + 'coperto 360 €/m, all\'aperto 210 €/m, posto in acqua 480 €/m all\'anno. Nell\'app vera si usa il listino dell\'azienda.</p>';
    return h;
  };
  A.azioni['filtro-contr'] = function (el, id, v) { filtro = v; if (/^#\/contratti\/./.test(location.hash)) location.hash = '#/contratti'; else A.render(); };
  A.input.push(function (t) { if (t.getAttribute('data-cerca') === 'contratti') { cerca = t.value; A.$('#lista').innerHTML = righe(); } });

  function contratto(id) { return D.contratti.filter(function (c) { return c.id === id; })[0]; }
  A.azioni.sollecito = function (el, id) {
    var c = contratto(id), b = A.barca(c.barca), a = A.armatoreDi(b), x = A.rateScadute().filter(function (y) { return y.c === c; })[0];
    var testo = A.msgSollecito(c, x.r, x.n);
    A.modale('<h2>Sollecito a ' + esc(a.nome) + '</h2><p class="muted">' + x.n + 'ª rata di ' + A.eur(x.r.imp) + ', scaduta il ' + fmt(x.r.scad) + ' (' + A.rel(x.r.scad) + ') · ' + esc(b.nome) + '</p>' +
      (c.solleciti.length ? '<ul class="scad-list">' + c.solleciti.map(function (s, k) { return '<li><span>' + (k + 1) + 'º sollecito</span><span class="pill pill-neutral">' + fmt(s.data) + ' · ' + s.canale + '</span></li>'; }).join('') + '</ul>' : '<p class="muted small">Primo sollecito: tono gentile.</p>') +
      '<pre class="msg">' + esc(testo) + '</pre><p class="muted small">Il testo è pronto' + (a.lingua === 'de' ? ' in tedesco' : '') + ' con IBAN e causale. Lo invii tu: l\'app registra solo che è partito.</p>' +
      '<div class="modal-actions"><button class="btn btn-ghost" data-act="copia" data-t="' + esc(testo) + '">Copia testo</button><button class="btn" data-act="sollecito-inviato" data-id="' + c.id + '">' + ico('check') + 'Segna come inviato oggi</button></div>');
  };
  A.azioni['sollecito-inviato'] = function (el, id) { var c = contratto(id); c.solleciti.push({ data: new Date(OGGI), canale: 'WhatsApp' }); A.chiudiModale(); A.toast('Sollecito registrato: ' + c.solleciti.length + 'º per questo contratto.'); A.render(); };
  A.azioni.paga = function (el, id) {
    var c = contratto(id), r = c.rate.filter(function (x) { return !x.pagata; })[0], n = c.rate.indexOf(r) + 1;
    r.pagata = new Date(OGGI); A.toast(n + 'ª rata di ' + A.barca(c.barca).nome + ' registrata come pagata: ' + A.eur(r.imp) + '.'); A.render();
  };
  A.azioni.rinnovo = function (el, id) { var c = contratto(id); c.rinnovo = true; A.toast('Proposta di rinnovo preparata con il canone del nuovo anno: la invii tu.'); A.render(); };
})();
