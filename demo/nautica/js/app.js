/*
 * Demo cliccabile "gestionale rimessaggio e cantiere nautico": guscio, router ed eventi.
 * Le viste si registrano in A.viste, le azioni dei pulsanti (data-act) in A.azioni.
 */
(function () {
  'use strict';
  var A = window.A, C = window.CONFIG, D = window.DATI;
  var ico = A.ico, esc = A.esc;

  /* ---------- guscio ---------- */
  var NAV = [
    ['', 'Cruscotto', 'home', 'Home'], ['barche', 'Barche', 'barca'], ['calendario', 'Vari e alaggi', 'cal', 'Varo'],
    ['lavori', 'Lavori', 'lavori'], ['contratti', 'Contratti', 'contratti', 'Rate'], ['magazzino', 'Magazzino', 'magazzino', 'Ricambi'], ['ia', 'Lettura IA', 'ia', 'IA']
  ];
  function guscio() {
    document.title = C.nome + ' · Rimessaggio';
    document.documentElement.style.setProperty('--brand', C.colore);
    var link = function (corto) { return NAV.map(function (n) { return '<a href="#/' + n[0] + '" data-nav="' + n[0] + '">' + ico(n[2]) + '<span>' + (corto && n[3] || n[1]) + '</span></a>'; }).join(''); };
    A.$('#side').innerHTML =
      '<div class="brand">' + A.logoHTML('logo-md') + '<div><strong>' + esc(C.nome) + '</strong><small>' + esc(C.sottotitolo) + '</small></div></div>' +
      '<nav class="side-nav">' + link(false) + '</nav>' +
      '<div class="side-foot"><div class="user"><span class="avatar">' + esc(C.utente.nome[0]) + '</span><div><strong>' + esc(C.utente.nome) + '</strong><small>' + esc(C.utente.ruolo) + '</small></div></div>' +
      '<button class="demo-tag" data-act="info">' + ico('info') + 'Prototipo con dati inventati</button></div>';
    A.$('#top').innerHTML = '<div class="brand">' + A.logoHTML('logo-sm') + '<strong>' + esc(C.nome) + '</strong></div><button class="icon-btn" data-act="info" aria-label="Informazioni sulla demo">' + ico('info') + '</button>';
    A.$('#bottom').innerHTML = link(true);
  }

  /* ---------- router ---------- */
  A.render = function () {
    var parts = location.hash.replace(/^#\/?/, '').split('/'), r = parts[0], arg = parts[1];
    if (!A.viste[r]) r = '';
    document.body.classList.toggle('portal', r === 'approva');
    A.$('#view').innerHTML = A.viste[r](arg);
    var sez = { barca: 'barche', lavoro: 'lavori' }[r] || r;
    A.$$('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === sez); });
  };
  window.addEventListener('hashchange', function () {
    A.chiudiModale();
    if (location.hash.indexOf('#/ia') !== 0) A.iaReset();
    A.render(); window.scrollTo(0, 0);
  });

  /* ---------- eventi ---------- */
  function fotoDi(el) {
    var b = el.getAttribute('data-b'), l = el.getAttribute('data-l');
    if (b) { var x = A.barca(b); return { lista: x.foto, titolo: x.nome, stamp: x.nome }; }
    var lv = A.lavoro(l), f = el.getAttribute('data-f');
    return { lista: lv.foto[f], titolo: lv.titolo + ' · ' + f, stamp: A.barca(lv.barca).nome };
  }
  var DEMO_MSG = {
    'demo-nuova-barca': 'Nella demo non si creano barche: nell\'app vera la scheda si compila anche leggendo il libretto con l\'IA.',
    'demo-nuovo-lavoro': 'Nella demo non si creano lavori: nell\'app vera si parte dalla scheda barca, con le voci tipiche già pronte.',
    'demo-nuovo-contratto': 'Nella demo non si creano contratti: nell\'app vera si genera dal listino, con le rate già calcolate.',
    'demo-messaggio': 'Nell\'app vera si apre WhatsApp o l\'email con il testo già scritto: lo invii tu.'
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'LABEL') return;
    if (a === 'info') return A.infoDemo();
    if (a === 'chiudi') return A.chiudiModale();
    if (a === 'copia') return A.copia(el.getAttribute('data-t'));
    if (a === 'foto') {
      var fd = fotoDi(el), f = fd.lista[+el.getAttribute('data-k')];
      return A.modale('<div class="photo-big">' + window.fotoSVG(f, fd.stamp) + '</div><p class="muted">' + esc(f.label) + ' · ' + esc(fd.titolo) + '</p>', true);
    }
    if (DEMO_MSG[a]) return A.toast(DEMO_MSG[a]);
    if (A.azioni[a]) A.azioni[a](el, id, v);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') A.chiudiModale(); });
  document.addEventListener('input', function (e) { A.input.forEach(function (fn) { fn(e.target); }); });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.getAttribute('data-act') === 'foto-add' && t.files && t.files[0]) {
      var fd = fotoDi(t), fase = t.getAttribute('data-f');
      fd.lista.push({ tipo: 'lago', fase: fase || null, label: 'Foto aggiunta', url: URL.createObjectURL(t.files[0]) });
      A.toast('Foto aggiunta (solo in questa sessione).'); A.render(); return;
    }
    A.change.forEach(function (fn) { fn(t); });
  });

  // le foto aggiunte dal telefono hanno un URL vero: le mostro come immagine
  var fotoOrig = window.fotoSVG;
  window.fotoSVG = function (f, stamp) { return f.url ? '<img src="' + f.url + '" alt="' + esc(f.label) + '">' : fotoOrig(f, stamp); };

  guscio();
  A.render();
  if (window.AZIENDA_MANCANTE) A.toast('Azienda "' + esc(window.AZIENDA_MANCANTE) + '" non trovata in aziende/: uso i dati di base.');
})();
