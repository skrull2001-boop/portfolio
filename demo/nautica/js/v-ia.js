/* 7. Lettura con IA (simulata): la fattura del fornitore di ricambi diventa carico di magazzino. */
(function () {
  'use strict';
  var A = window.A, D = window.DATI, gg = window.DEMO.gg, OGGI = window.DEMO.OGGI;
  var ico = A.ico, esc = A.esc, eur = A.eur;

  function fattura(file, fornitore, numero, giorni, righe) {
    var imp = righe.reduce(function (s, r) { return s + r.q * r.p; }, 0);
    return { file: file, fornitore: fornitore, numero: numero, righe: righe,
      campi: [['Fornitore', fornitore, 99], ['Partita IVA', 'IT 00000000001', 97], ['Numero fattura', numero, 99], ['Data', A.fmt(gg(-1)), 98],
        ['Scadenza pagamento', A.fmt(gg(giorni)), 91], ['Imponibile', eur(imp), 96], ['IVA 22%', eur(imp * 0.22), 95], ['Totale documento', eur(imp * 1.22), 97]] };
  }
  var DOC = {
    ricambi: fattura('Fattura_4471_2026_RicambiNauticiLombardi.pdf', 'Ricambi Nautici Lombardi Srl (fittizio)', '4471/2026', 30, [
      { codF: 'RNL-55102', desc: 'Filtro olio fuoribordo 4T 115-250 cv', q: 10, p: 14.8, cod: 'F-OLIO-4T', conf: 97 },
      { codF: 'RNL-55340', desc: 'Olio ingranaggi SAE 90 lt 1', q: 12, p: 9.9, cod: 'O-GEAR-1', conf: 96 },
      { codF: 'RNL-61020', desc: 'Kit girante pompa acqua F150/F250', q: 3, p: 46, cod: 'G-GIR-200', conf: 94 },
      { codF: 'RNL-70011', desc: 'Telo copribarca misura 7,5 m', q: 1, p: 240, cod: 'T-TELO-8', conf: 81 },
      { codF: 'RNL-55871', desc: 'Girante pompa acqua per fuoribordo 140 cv', q: 2, p: 41, cod: null, conf: 88 }]),
    vernici: fattura('Fattura_3988_2026_ColorificioNautico.pdf', 'Colorificio Nautico Srl (fittizio)', '3988/2026', 60, [
      { codF: 'CN-AV25-BL', desc: 'Antivegetativa acqua dolce blu 2,5 L', q: 10, p: 92, cod: 'V-AV-25', conf: 96 },
      { codF: 'CN-PE25', desc: 'Primer epossidico 2,5 L', q: 4, p: 78, cod: 'V-PRIM-25', conf: 95 },
      { codF: 'CN-COP1', desc: 'Coppale marina lucida 1 L', q: 6, p: 41, cod: 'V-COP-1', conf: 93 },
      { codF: 'CN-NC50', desc: 'Nastro di carteggiatura 50 mm', q: 20, p: 3.2, cod: null, conf: 86 }])
  };
  var ia = { doc: null, fase: 'attesa', nomeFile: '' };
  A.iaReset = function () { if (ia.fase !== 'lettura') ia = { doc: null, fase: 'attesa', nomeFile: '' }; };

  function abbinamento(r) {
    if (!r.cod) return '<span class="pill pill-warn">Nuovo articolo</span>';
    var a = A.articolo(r.cod);
    return '<span class="pill pill-' + (r.conf < 90 ? 'warn' : 'ok') + '">' + a.cod + '</span><small class="muted d-block">' + esc(a.desc) + (ia.fase === 'confermato' ? '' : ' · giacenza ' + a.giac + ' → <b>' + (a.giac + r.q) + '</b>') + (r.conf < 90 ? ' · <b class="txt-warn">abbinamento da controllare (' + r.conf + '%)</b>' : '') + '</small>';
  }
  function tabRighe(d) {
    return '<table class="tbl tbl-fir tbl-ia"><thead><tr><th>Riga della fattura</th><th class="r">Q.tà</th><th class="r">Prezzo</th><th>Articolo di magazzino</th></tr></thead><tbody>' + d.righe.map(function (r, k) {
      return '<tr id="iar-' + k + '"' + (ia.fase === 'lettura' ? ' class="nasc"' : '') + '><td><strong>' + esc(r.desc) + '</strong><small class="muted d-block">' + r.codF + '</small></td><td class="r" data-l="Quantità">' + r.q + '</td><td class="r" data-l="Prezzo">' + eur(r.p) + '</td><td data-l="Diventa">' + abbinamento(r) + '</td></tr>';
    }).join('') + '</tbody></table>';
  }
  function pdfFinto(d) {
    var righe = '';
    d.campi.slice(0, 5).forEach(function (f, k) { righe += '<div class="pdf-line" id="pl-' + k + '"><span>' + f[0] + ':</span> <b>' + esc(f[1]) + '</b></div>'; });
    righe += '<div class="pdf-tab">' + d.righe.map(function (r, k) { return '<div class="pdf-line" id="plr-' + k + '"><span>' + r.codF + '</span> ' + esc(r.desc) + ' <b>' + r.q + ' × ' + A.num(r.p, 2) + '</b></div>'; }).join('') + '</div>';
    d.campi.slice(5).forEach(function (f, k) { righe += '<div class="pdf-line r" id="pl-' + (k + 5) + '"><span>' + f[0] + ':</span> <b>' + esc(f[1]) + '</b></div>'; });
    return '<div class="pdf-head"><div class="pdf-logo"></div><div><div class="pdf-bar w60"></div><div class="pdf-bar w40"></div></div></div><div class="pdf-title">FATTURA</div>' + righe + '<div class="pdf-bar w70"></div>';
  }

  A.viste.ia = function (param) {
    if (param && DOC[param] && ia.fase === 'attesa') { ia = { doc: param, fase: 'lettura', nomeFile: DOC[param].file }; setTimeout(avvia, 350); }
    var h = A.intestazione('Lettura fattura con IA', 'Carica la fattura del fornitore: le righe diventano carico di magazzino e tu confermi', '');
    h += '<div class="banner banner-info">' + ico('info') + '<div><strong>In questa demo la lettura è simulata</strong><small>Qualunque file carichi, i dati mostrati sono inventati e nulla esce dal tuo computer. Nell\'app vera la fattura viene letta davvero (anche l\'XML della fattura elettronica) e ogni riga va confermata da una persona.</small></div></div>';
    if (!ia.doc) {
      h += '<label class="drop" id="drop">' + ico('upload', 'ico-lg') + '<strong>Trascina qui il PDF o la foto della fattura</strong><span>oppure tocca per sceglierla dal telefono</span><input type="file" accept=".pdf,.xml,image/*" data-act="ia-file" hidden></label>';
      h += '<h3 class="sub">Oppure prova con una fattura di esempio</h3><div class="samples samples-2">' + Object.keys(DOC).map(function (k) {
        var d = DOC[k]; return '<button class="sample" data-act="ia-sample" data-v="' + k + '">' + ico('doc', 'ico-lg') + '<div><strong>' + esc(d.fornitore) + '</strong><small>' + d.righe.length + ' righe · ' + d.file + '</small></div></button>';
      }).join('') + '</div>';
      return h;
    }
    var d = DOC[ia.doc];
    h += '<div class="split split-ia"><div class="card"><div class="card-head"><h2>' + ico('doc') + ' ' + esc(ia.nomeFile) + '</h2></div><div class="fake-pdf' + (ia.fase === 'lettura' ? ' scanning' : '') + '" id="fake-pdf">' + pdfFinto(d) + '<div class="scanbar"></div></div></div>';
    h += '<div class="card"><div class="card-head"><h2>' + ico('ia') + ' Dati della fattura</h2><span class="muted" id="ia-stato">' + (ia.fase === 'lettura' ? 'Lettura in corso…' : ia.fase === 'confermato' ? 'Caricata a magazzino' : 'Da controllare') + '</span></div><div class="ia-fields ia-fields-2">' +
      d.campi.map(function (f, k) { return '<label class="ia-field" id="iaf-' + k + '"><span>' + f[0] + '<em class="conf"></em></span><input type="text" value="' + (ia.fase === 'lettura' ? '' : esc(f[1])) + '"' + (ia.fase === 'confermato' ? ' disabled' : '') + '></label>'; }).join('') + '</div></div></div>';
    h += '<section class="card table-card"><div class="card-head pad"><h2>' + ico('magazzino') + ' Righe che diventano carico di magazzino</h2></div>' + tabRighe(d) + '</section>';
    h += '<div class="ia-actions" id="ia-actions"' + (ia.fase === 'lettura' ? ' hidden' : '') + '>' + (ia.fase === 'confermato' ? '<a class="btn" href="#/magazzino">Vai al magazzino</a><button class="btn btn-ghost" data-act="ia-reset">Leggi un\'altra fattura</button>' :
      '<button class="btn" data-act="ia-conferma">' + ico('check') + 'Confermo e carico a magazzino</button><button class="btn btn-ghost" data-act="ia-reset">Annulla</button>') + '</div>';
    if (ia.fase !== 'lettura') setTimeout(mostraConfidenze, 0);
    return h;
  };

  function avvia() {
    var d = DOC[ia.doc], k = 0;
    if (!A.$('#fake-pdf')) return;
    function campo() {
      if (location.hash.indexOf('#/ia') !== 0) return;
      if (k >= d.campi.length) { k = 0; return setTimeout(riga, 200); }
      var f = d.campi[k], line = A.$('#pl-' + k), field = A.$('#iaf-' + k), inp = A.$('input', field), i = 0, idx = k;
      line.classList.add('hl'); field.classList.add('filling');
      (function scrivi() {
        if (!document.body.contains(inp)) return;
        inp.value = f[1].slice(0, ++i);
        if (i < f[1].length) setTimeout(scrivi, 14);
        else { field.classList.remove('filling'); confidenza(idx); k++; setTimeout(campo, 150); }
      })();
    }
    function riga() {
      if (location.hash.indexOf('#/ia') !== 0 || !A.$('#iar-0')) return;
      if (k >= d.righe.length) {
        ia.fase = 'controllo'; A.$('#fake-pdf').classList.remove('scanning');
        A.$('#ia-stato').textContent = 'Da controllare'; A.$('#ia-actions').hidden = false; return;
      }
      A.$('#plr-' + k).classList.add('hl'); A.$('#iar-' + k).classList.remove('nasc'); k++; setTimeout(riga, 380);
    }
    setTimeout(campo, 800);
  }
  function confidenza(k) {
    var f = DOC[ia.doc].campi[k], field = A.$('#iaf-' + k); if (!field) return;
    field.classList.add('done', f[2] < 92 ? 'low' : 'high');
    A.$('.conf', field).textContent = f[2] < 92 ? 'da controllare · ' + f[2] + '%' : f[2] + '%';
  }
  function mostraConfidenze() { DOC[ia.doc].campi.forEach(function (f, k) { confidenza(k); }); A.$$('.fake-pdf .pdf-line').forEach(function (l) { l.classList.add('hl'); }); }

  A.azioni['ia-sample'] = function (el, id, v) { ia = { doc: v, fase: 'lettura', nomeFile: DOC[v].file }; A.render(); avvia(); };
  A.azioni['ia-reset'] = function () { ia = { doc: null, fase: 'attesa', nomeFile: '' }; if (location.hash !== '#/ia') location.hash = '#/ia'; else A.render(); };
  A.azioni['ia-conferma'] = function () {
    var d = DOC[ia.doc], nuovi = 0, rif = 'Fattura ' + d.numero + ', ' + d.fornitore;
    d.righe.forEach(function (r) {
      if (!r.cod) {
        r.cod = r.codF; nuovi++;
        D.magazzino.push({ cod: r.codF, desc: r.desc, cat: ia.doc === 'vernici' ? 'Carena' : 'Motore', um: 'pz', giac: 0, min: 1, ubic: 'Da assegnare', acq: r.p, ven: Math.round(r.p * 1.6 * 10) / 10 });
      }
      var a = A.articolo(r.cod); a.giac += r.q; a.acq = r.p;
      D.movimenti.push({ data: new Date(OGGI), tipo: 'Carico', cod: a.cod, q: r.q, rif: rif });
    });
    ia.fase = 'confermato';
    A.toast('Carico registrato: ' + d.righe.length + ' righe, ' + nuovi + ' articoli nuovi. Giacenze aggiornate.'); A.render();
  };
  A.change.push(function (t) {
    if (t.getAttribute('data-act') === 'ia-file' && t.files && t.files[0]) { ia = { doc: 'ricambi', fase: 'lettura', nomeFile: t.files[0].name }; A.render(); avvia(); }
  });
  document.addEventListener('dragover', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
  document.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) d.classList.remove('over'); });
  document.addEventListener('drop', function (e) {
    var d = e.target.closest && e.target.closest('#drop'); if (!d) return; e.preventDefault();
    var f = e.dataTransfer.files[0]; ia = { doc: 'ricambi', fase: 'lettura', nomeFile: f ? f.name : 'fattura.pdf' }; A.render(); avvia();
  });
})();
