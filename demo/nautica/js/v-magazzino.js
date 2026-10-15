/* 6. Magazzino ricambi: giacenze, scorte minime, impegni dei lavori e movimenti. */
(function () {
  'use strict';
  var A = window.A, D = window.DATI;
  var ico = A.ico, esc = A.esc, fmt = A.fmt;
  var filtro = 'tutti', tab = 'articoli', cerca = '';

  function righe() {
    var q = cerca.toLowerCase();
    var l = D.magazzino.filter(function (a) {
      if (filtro === 'sotto' && a.giac - A.impegnato(a.cod) >= a.min) return false;
      if (filtro !== 'tutti' && filtro !== 'sotto' && a.cat !== filtro) return false;
      return !q || (a.cod + ' ' + a.desc).toLowerCase().indexOf(q) >= 0;
    });
    if (!l.length) return '<p class="empty">Nessun articolo.</p>';
    return '<table class="tbl tbl-fir tbl-mag"><thead><tr><th>Articolo</th><th>Categoria</th><th class="r">Giacenza</th><th class="r">Impegnati</th><th>Ubicazione</th><th class="r">Acquisto / vendita</th></tr></thead><tbody>' + l.map(function (a) {
      var imp = A.impegnato(a.cod), disp = a.giac - imp, liv = a.giac <= 0 || disp < 0 ? 'danger' : disp < a.min ? 'warn' : 'ok';
      return '<tr><td><strong>' + esc(a.desc) + '</strong><small class="muted d-block">' + a.cod + '</small></td><td data-l="Categoria">' + esc(a.cat) + '</td>' +
        '<td class="r" data-l="Giacenza"><span class="chip chip-' + liv + '"><b>' + a.giac + '</b> ' + a.um + ' · min ' + a.min + '</span></td><td class="r" data-l="Impegnati">' + (imp ? imp + ' per lavori' : '—') + '</td>' +
        '<td data-l="Ubicazione">' + esc(a.ubic) + '</td><td class="r" data-l="Prezzi">' + A.eur(a.acq) + ' / ' + A.eur(a.ven) + '</td></tr>';
    }).join('') + '</tbody></table>';
  }

  A.viste.magazzino = function () {
    var valore = D.magazzino.reduce(function (s, a) { return s + Math.max(0, a.giac) * a.acq; }, 0);
    var sotto = D.magazzino.filter(function (a) { return a.giac - A.impegnato(a.cod) < a.min; }).length;
    var h = A.intestazione('Magazzino ricambi', 'Giacenze, scorte minime e ricambi già promessi ai lavori', '<a class="btn" href="#/ia">' + ico('ia') + 'Carica una fattura fornitore</a>');
    h += '<section class="kpis kpis-3">' + A.kpi('Articoli', D.magazzino.length, 'a listino', 'magazzino', '#/magazzino') +
      A.kpi('Valore a magazzino', A.eur0(valore), 'a prezzo di acquisto', 'euro', '#/magazzino') +
      A.kpi('Da riordinare', sotto, 'sotto scorta dopo gli impegni', 'alert', '#/magazzino', sotto ? 'warn' : '') + '</section>';
    h += '<div class="seg"><button data-act="tab-mag" data-v="articoli" class="' + (tab === 'articoli' ? 'on' : '') + '">Articoli</button><button data-act="tab-mag" data-v="movimenti" class="' + (tab === 'movimenti' ? 'on' : '') + '">Movimenti</button></div>';
    if (tab === 'articoli') {
      var cats = D.magazzino.map(function (a) { return a.cat; }).filter(function (c, i, all) { return all.indexOf(c) === i; });
      h += '<input type="search" class="search" placeholder="Cerca per codice o descrizione" data-cerca="magazzino" value="' + esc(cerca) + '">';
      h += '<div class="filters">' + [['tutti', 'Tutti'], ['sotto', 'Da riordinare']].concat(cats.map(function (c) { return [c, c]; })).map(function (f) {
        return '<button class="filter' + (filtro === f[0] ? ' on' : '') + '" data-act="filtro-mag" data-v="' + esc(f[0]) + '">' + esc(f[1]) + '</button>';
      }).join('') + '</div><div class="card table-card" id="lista">' + righe() + '</div>';
      h += '<p class="note">' + ico('info') + 'Gli anodi in magnesio sono quelli adatti all\'acqua dolce. Codici e prezzi sono di esempio: nell\'app vera si importa il listino dell\'azienda da Excel.</p>';
    } else {
      var mov = D.movimenti.slice().sort(function (a, b) { return b.data - a.data; });
      h += '<div class="card table-card"><table class="tbl tbl-fir"><thead><tr><th>Data</th><th>Movimento</th><th>Articolo</th><th class="r">Q.tà</th><th>Riferimento</th></tr></thead><tbody>' + mov.map(function (m) {
        var a = A.articolo(m.cod);
        return '<tr><td>' + fmt(m.data) + '</td><td data-l="Movimento"><span class="pill pill-' + (m.tipo === 'Carico' ? 'info' : 'neutral') + '">' + m.tipo + '</span></td><td data-l="Articolo">' + esc(a ? a.desc : m.cod) + '</td>' +
          '<td class="r" data-l="Quantità">' + (m.tipo === 'Carico' ? '+' : '−') + m.q + '</td><td data-l="Riferimento">' + (/^OL-/.test(m.rif) ? '<a href="#/lavoro/' + m.rif + '">' + m.rif + '</a>' : esc(m.rif)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    }
    return h;
  };
  A.azioni['filtro-mag'] = function (el, id, v) { filtro = v; A.render(); };
  A.azioni['tab-mag'] = function (el, id, v) { tab = v; A.render(); };
  A.input.push(function (t) { if (t.getAttribute('data-cerca') === 'magazzino') { cerca = t.value; A.$('#lista').innerHTML = righe(); } });
})();
