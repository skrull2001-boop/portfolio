/* 1. Cruscotto: barche in rimessaggio, lavori, vari e alaggi, contratti in scadenza, incassi. */
(function () {
  'use strict';
  var A = window.A, C = window.CONFIG, D = window.DATI, OGGI = window.DEMO.OGGI;
  var ico = A.ico, esc = A.esc, fmt = A.fmt;

  A.allarmi = function () {
    var out = [];
    var sc = A.rateScadute();
    if (sc.length) out.push({ liv: 'danger', testo: sc.length + ' rate di rimessaggio scadute e non pagate', dett: 'Totale ' + A.eur(sc.reduce(function (s, x) { return s + x.r.imp; }, 0)) + ' · la più vecchia è di ' + esc(A.barca(sc[0].c.barca).nome) + ', scaduta ' + A.rel(sc[0].r.scad), href: '#/contratti/scadute' });
    var visti = [];
    D.prenotazioni.forEach(function (p) {
      var pr = A.problemi(p), soloSovr = pr.length && pr.every(function (x) { return x.indexOf('si sovrappone') === 0; });
      if (soloSovr && visti.some(function (q) { return q.ris === p.ris && +q.data === +p.data; })) return;
      if (pr.length) visti.push(p);
      if (pr.length && A.giorni(p.data) >= 0) out.push({ liv: 'danger', testo: (p.tipo === 'varo' ? 'Varo' : 'Alaggio') + ' di ' + A.barca(p.barca).nome + ', ' + A.fmtGiorno(p.data) + ' alle ' + p.ora, dett: pr.join('; '), href: '#/calendario/' + A.toISO(p.data) });
    });
    D.lavori.forEach(function (l) {
      if (l.stato === 'inviato' && A.giorni(l.inviato) <= -4) out.push({ liv: 'warn', testo: 'Preventivo ' + l.id + ' senza risposta da ' + (-A.giorni(l.inviato)) + ' giorni', dett: esc(A.barca(l.barca).nome) + ' · ' + esc(A.armatoreDi(A.barca(l.barca)).nome) + ': il lavoro non può partire', href: '#/lavoro/' + l.id });
      if (l.stato === 'approvato' || l.stato === 'incorso') l.righe.forEach(function (r) {
        var a = r.k === 'ric' && !r.scaricato ? A.articolo(r.cod) : null;
        if (a && a.giac < r.q) out.push({ liv: 'warn', testo: 'Manca un ricambio per ' + l.id + ' (' + A.barca(l.barca).nome + ')', dett: a.desc + ': servono ' + r.q + ', in magazzino ' + a.giac, href: '#/magazzino' });
      });
      if (l.stato === 'finito') out.push({ liv: 'warn', testo: 'Lavoro finito da fatturare: ' + A.barca(l.barca).nome, dett: l.id + ' · ' + A.eur(A.totLavoro(l).tot) + ', chiuso ' + A.rel(l.fine), href: '#/lavoro/' + l.id });
    });
    D.barche.forEach(function (b) {
      if (b.stato === 'acqua' && b.assic < OGGI) out.push({ liv: 'danger', testo: 'Assicurazione scaduta: ' + b.nome + ' è in acqua', dett: 'Scaduta il ' + fmt(b.assic) + ' · posto ' + A.postoLabel(b.posto), href: '#/barca/' + b.id });
    });
    var daPren = D.barche.filter(function (b) { return b.stato === 'acqua' && A.area(b.posto).tipo !== 'acqua' && !A.prenDi(b.id); });
    if (daPren.length) out.push({ liv: 'warn', testo: daPren.length === 1 ? daPren[0].nome + ' è ancora in acqua senza alaggio prenotato' : daPren.length + ' barche ancora in acqua senza alaggio prenotato', dett: 'Posto a terra già assegnato per l\'inverno', href: '#/calendario' });
    return out.sort(function (a, b) { return (a.liv === 'danger' ? 0 : 1) - (b.liv === 'danger' ? 0 : 1); });
  };

  A.viste[''] = function () {
    var al = A.allarmi();
    var terra = D.barche.filter(function (b) { return b.stato === 'terra'; }).length;
    var postiTerra = C.aree.filter(function (a) { return a.tipo !== 'acqua'; }).reduce(function (s, a) { return s + a.posti; }, 0);
    var aperti = D.lavori.filter(function (l) { return ['approvato', 'incorso'].indexOf(l.stato) >= 0; });
    var attesa = D.lavori.filter(function (l) { return l.stato === 'inviato'; }).length;
    var sett = A.prossimePren(7), sc = A.rateScadute();
    var scTot = sc.reduce(function (s, x) { return s + x.r.imp; }, 0);
    var ora = new Date().getHours();
    var saluto = ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';

    var h = A.intestazione(saluto + ', ' + esc(C.utente.nome), OGGI.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + esc(C.lago), '<a class="btn" href="#/ia">' + ico('ia') + 'Leggi una fattura</a>');
    h += '<section class="kpis">' +
      A.kpi('Barche in rimessaggio', terra + ' su ' + postiTerra, 'posti a terra e in capannone', 'barca', '#/barche/terra') +
      A.kpi('Lavori in corso', aperti.length, (attesa === 1 ? '1 preventivo' : attesa + ' preventivi') + ' in attesa dell\'armatore', 'lavori', '#/lavori', attesa ? 'info' : '') +
      A.kpi('Vari e alaggi in 7 giorni', sett.length, sett.length ? 'primo: ' + esc(A.barca(sett[0].barca).nome) + ', ' + A.rel(sett[0].data) + ' ' + sett[0].ora : 'nessuno', 'cal', '#/calendario') +
      A.kpi('Rate scadute', A.eur0(scTot), sc.length + ' rate da sollecitare', 'euro', '#/contratti/scadute', sc.length ? 'warn' : '') + '</section>';

    h += '<section class="card"><div class="card-head"><h2>' + ico('alert') + ' Da sistemare</h2><span class="count">' + al.length + '</span></div>' +
      (al.length ? '<ul class="alarms">' + al.map(function (a) { return '<li><a class="alarm alarm-' + a.liv + '" href="' + a.href + '"><span class="dot"></span><div><strong>' + esc(a.testo) + '</strong><small>' + a.dett + '</small></div>' + ico('chev') + '</a></li>'; }).join('') + '</ul>' : '<p class="empty">Niente da sistemare.</p>') + '</section>';

    var prossime = A.prossimePren(21).slice(0, 8);
    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>' + ico('cal') + ' Prossimi vari e alaggi</h2><a class="link" href="#/calendario">Calendario</a></div><ul class="timeline">' +
      prossime.map(function (p) {
        var b = A.barca(p.barca), pr = A.problemi(p);
        return '<li><a href="#/calendario/' + A.toISO(p.data) + '"><span class="date date-' + (pr.length ? 'danger' : A.giorni(p.data) <= 1 ? 'warn' : 'info') + '"><b>' + p.data.getDate() + '</b>' + p.data.toLocaleDateString('it-IT', { month: 'short' }) + '</span><div><strong>' + esc(b.nome) + ' <span class="tag">' + (p.tipo === 'varo' ? 'Varo' : 'Alaggio') + '</span></strong><small>' + p.ora + ' · ' + C.risorse[p.ris].nome + ' · ' + A.num(b.l, 1) + ' m, ' + A.num(b.peso, 1) + ' t' + (pr.length ? ' · <b class="txt-danger">da sistemare</b>' : '') + '</small></div></a></li>';
      }).join('') + '</ul></section>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('lavori') + ' Lavori aperti</h2><a class="link" href="#/lavori">Tutti</a></div><ul class="cant-list">' +
      D.lavori.filter(function (l) { return ['bozza', 'inviato', 'approvato', 'incorso', 'finito'].indexOf(l.stato) >= 0; }).map(function (l) { return '<li>' + A.rigaLavoro(l) + '</li>'; }).join('') + '</ul></section></div>';

    var scad = A.inScadenza(60), arrivo = A.rateInArrivo(30);
    var daFatt = D.lavori.filter(function (l) { return l.stato === 'finito'; });
    h += '<div class="grid-2"><section class="card"><div class="card-head"><h2>' + ico('contratti') + ' Contratti in scadenza</h2><a class="link" href="#/contratti/scadenza">Contratti</a></div>' +
      (scad.length ? '<ul class="docs">' + scad.map(function (c) { var b = A.barca(c.barca); return '<li><a href="#/contratti/scadenza">' + ico('contratti') + '<div><strong>' + esc(b.nome) + ' · ' + esc(A.armatoreDi(b).nome) + '</strong><small>' + c.descr + ' · ' + A.eur0(c.canone) + '/anno</small></div><span class="pill pill-' + A.livello(A.giorni(c.fine)) + '">' + fmt(c.fine) + '</span></a></li>'; }).join('') + '</ul>' : '<p class="empty">Nessun contratto in scadenza nei prossimi 60 giorni.</p>') + '</section>';
    h += '<section class="card"><div class="card-head"><h2>' + ico('euro') + ' Incassi da fare</h2><a class="link" href="#/contratti/scadute">Solleciti</a></div><ul class="docs">' +
      sc.slice(0, 4).map(function (x) { var b = A.barca(x.c.barca); return '<li><a href="#/contratti/scadute">' + ico('euro') + '<div><strong>' + A.eur(x.r.imp) + ' · ' + esc(b.nome) + '</strong><small>' + x.n + 'ª rata, scaduta il ' + fmt(x.r.scad) + (x.c.solleciti.length ? ' · ' + x.c.solleciti.length + ' solleciti' : ' · mai sollecitata') + '</small></div><span class="pill pill-danger">Scaduta</span></a></li>'; }).join('') +
      daFatt.map(function (l) { return '<li><a href="#/lavoro/' + l.id + '">' + ico('lavori') + '<div><strong>' + A.eur(A.totLavoro(l).tot) + ' · ' + esc(A.barca(l.barca).nome) + '</strong><small>' + l.id + ', ' + esc(l.titolo.toLowerCase()) + '</small></div><span class="pill pill-ok">Da fatturare</span></a></li>'; }).join('') +
      '<li><a href="#/contratti">' + ico('clock') + '<div><strong>' + A.eur(arrivo.reduce(function (s, x) { return s + x.r.imp; }, 0)) + ' in arrivo nei prossimi 30 giorni</strong><small>' + arrivo.length + ' rate non ancora scadute</small></div></a></li></ul></section></div>';

    h += '<section class="card"><div class="card-head"><h2>' + ico('pin') + ' Occupazione dei posti</h2><a class="link" href="#/barche">Barche</a></div><div class="occ">' + C.aree.map(function (a) {
      var n = D.barche.filter(function (b) { return b.posto[0] === a.id; }).length, dentro = D.barche.filter(function (b) { return b.posto[0] === a.id && (a.tipo === 'acqua' ? b.stato === 'acqua' : b.stato === 'terra'); }).length;
      return '<div class="occ-row"><div><strong>' + esc(a.nome) + '</strong><small>' + n + ' assegnati su ' + a.posti + ' · ' + dentro + ' barche già al loro posto</small></div><div class="bar bar-2"><span style="width:' + Math.round(dentro / a.posti * 100) + '%"></span><i style="width:' + Math.round((n - dentro) / a.posti * 100) + '%"></i></div><b>' + (a.posti - n) + ' liberi</b></div>';
    }).join('') + '</div></section>';
    return h;
  };

  A.infoDemo = function () {
    A.modale('<h2>Cosa è vero in questa demo</h2><p class="muted">Questa è una bozza dimostrativa per ' + esc(C.nome) + '. Serve a far vedere come lavorerebbe l\'app, non è ancora il prodotto.</p>' +
      '<div class="two"><div><h3>' + ico('check') + ' Funziona già così</h3><ul><li>Tutte le schermate, da computer e da telefono</li><li>Calendario di gru e scivolo con controllo di portata e sovrapposizioni</li><li>Preventivo calcolato da ore e ricambi, stampabile in PDF</li><li>Pagina che vede l\'armatore per approvare il preventivo</li><li>Rate, scadenze e allarmi calcolati</li></ul></div>' +
      '<div><h3>' + ico('info') + ' Simulato</h3><ul><li>Tutti i dati: barche, armatori, contratti e importi sono inventati</li><li>La lettura delle fatture con l\'IA è un\'animazione</li><li>Il link per l\'armatore si apre solo qui, non esiste online</li><li>Nessun messaggio parte da solo: l\'app prepara il testo, lo manda l\'ufficio</li><li>Nessun salvataggio: ricaricando la pagina si riparte</li></ul></div></div>');
  };
})();
