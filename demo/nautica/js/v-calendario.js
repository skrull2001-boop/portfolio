/* 3. Calendario di vari e alaggi, con gru e scivolo come risorse. */
(function () {
  'use strict';
  var A = window.A, C = window.CONFIG, D = window.DATI, OGGI = window.DEMO.OGGI;
  var ico = A.ico, esc = A.esc, fmt = A.fmt;
  var RIS = Object.keys(C.risorse);
  var lunedi = null, evidenzia = null;

  function lunediDi(d) { var x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function chipPren(p) {
    var b = A.barca(p.barca), pr = A.problemi(p);
    return '<button class="pren pren-' + p.tipo + (pr.length ? ' pren-err' : '') + (p.fatto ? ' pren-fatto' : '') + '" data-act="pren-apri" data-id="' + p.id + '">' +
      '<span class="pren-ora">' + p.ora + '</span>' + ico(p.tipo === 'varo' ? 'giu' : 'su') + '<span class="pren-txt"><strong>' + esc(b.nome) + '</strong><small>' + (p.fatto ? 'fatto' : (p.tipo === 'varo' ? 'varo' : 'alaggio') + ' · ' + A.num(b.peso, 1) + ' t') + '</small></span>' +
      (pr.length ? ico('alert') : p.fatto ? ico('check') : '') + '</button>';
  }

  A.viste.calendario = function (arg) {
    if (arg) { evidenzia = A.fromISO(arg); lunedi = lunediDi(evidenzia); }
    if (!lunedi) lunedi = lunediDi(OGGI);
    var fine = A.piu(lunedi, 5);
    var azioni = '<button class="btn" data-act="pren-nuova">' + ico('plus') + 'Nuova prenotazione</button>';
    var h = A.intestazione('Vari e alaggi', RIS.map(function (k) { var r = C.risorse[k]; return '<span class="tag tag-' + k + '">' + r.nome + '</span> ' + esc(r.dettaglio) + ', fino a ' + A.num(r.portata, 1) + ' t, ' + r.durata + ' min'; }).join(' · '), azioni);

    var daPren = D.barche.filter(function (b) { return b.stato === 'acqua' && A.area(b.posto).tipo !== 'acqua' && !A.prenDi(b.id); });
    if (daPren.length) h += '<div class="banner banner-warn">' + ico('alert') + '<div><strong>Ancora in acqua, alaggio da prenotare</strong><small>' + daPren.map(function (b) { return '<button class="link-btn" data-act="pren-nuova" data-b="' + b.id + '">' + esc(b.nome) + ' (' + A.num(b.peso, 1) + ' t)</button>'; }).join(' · ') + '</small></div></div>';

    var sett = D.prenotazioni.filter(function (p) { return p.data >= lunedi && p.data <= fine; });
    var err = sett.filter(function (p) { return A.problemi(p).length; }).length;
    h += '<div class="cal-nav"><div class="seg"><button data-act="sett" data-v="-1" aria-label="Settimana precedente">' + ico('back') + '</button><button data-act="sett" data-v="0">Oggi</button><button data-act="sett" data-v="1" aria-label="Settimana successiva">' + ico('chev') + '</button></div>' +
      '<strong>' + lunedi.getDate() + ' ' + lunedi.toLocaleDateString('it-IT', { month: 'short' }) + ' – ' + fmt(fine) + '</strong><span class="muted">' + sett.length + ' operazioni' + (err ? ' · <b class="txt-danger">' + err + ' da sistemare</b>' : '') + '</span></div>';

    h += '<div class="cal-week">';
    for (var i = 0; i < 6; i++) {
      var d = A.piu(lunedi, i), oggi = +d === +OGGI, ev = evidenzia && +d === +evidenzia;
      h += '<section class="cal-day' + (oggi ? ' oggi' : '') + (ev ? ' ev' : '') + (d < OGGI ? ' passato' : '') + '"><header><b>' + d.toLocaleDateString('it-IT', { weekday: 'short' }) + '</b> ' + d.getDate() + ' ' + d.toLocaleDateString('it-IT', { month: 'short' }) + (oggi ? ' <span class="pill pill-brand">oggi</span>' : '') + '</header>';
      RIS.forEach(function (k) {
        var lista = D.prenotazioni.filter(function (p) { return p.ris === k && +p.data === +d; }).sort(function (a, b) { return A.minuti(a.ora) - A.minuti(b.ora); });
        h += '<div class="lane"><div class="lane-head"><span class="tag tag-' + k + '">' + C.risorse[k].nome + '</span>' + (d >= OGGI ? '<button class="icon-btn sm" data-act="pren-nuova" data-d="' + A.toISO(d) + '" data-r="' + k + '" aria-label="Prenota ' + C.risorse[k].nome + '">' + ico('plus') + '</button>' : '') + '</div>' +
          (lista.length ? lista.map(chipPren).join('') : '<p class="lane-vuota">libero</p>') + '</div>';
      });
      h += '</section>';
    }
    h += '</div><p class="note">' + ico('info') + 'La domenica il cantiere è chiuso. Nell\'app vera l\'avviso del giorno prima all\'armatore si prepara da qui e si invia dall\'ufficio.</p>';
    return h;
  };
  A.azioni.sett = function (el, id, v) { evidenzia = null; lunedi = +v === 0 ? lunediDi(OGGI) : A.piu(lunedi, 7 * +v); if (location.hash.indexOf('#/calendario/') === 0) location.hash = '#/calendario'; else A.render(); };

  A.azioni['pren-apri'] = function (el, id) {
    var p = D.prenotazioni.filter(function (x) { return x.id === id; })[0], b = A.barca(p.barca), a = A.armatoreDi(b), pr = A.problemi(p);
    var testo = (a.lingua === 'de' ? 'Guten Tag ' + a.nome + ', ' + (p.tipo === 'varo' ? 'der Stapellauf' : 'das Auswassern') + ' von ' + b.nome + ' ist am ' + fmt(p.data) + ' um ' + p.ora + ' Uhr geplant. ' + C.nome
      : 'Buongiorno ' + a.nome + ', ' + (p.tipo === 'varo' ? 'il varo' : 'l\'alaggio') + ' di ' + b.nome + ' è previsto ' + A.fmtGiorno(p.data) + ' alle ' + p.ora + '. ' + C.nome);
    A.modale('<h2>' + (p.tipo === 'varo' ? 'Varo' : 'Alaggio') + ' di ' + esc(b.nome) + '</h2><p class="muted">' + A.fmtGiorno(p.data) + ' alle ' + p.ora + ' · ' + esc(C.risorse[p.ris].nome) + ' (' + C.risorse[p.ris].durata + ' min)</p>' +
      (pr.length ? '<div class="banner banner-danger">' + ico('alert') + '<div><strong>Da sistemare</strong><small>' + esc(pr.join('; ')) + '. Sposta l\'orario o cambia risorsa.</small></div></div>' : '') +
      '<dl class="dl">' + A.dl('Barca', '<a class="link" href="#/barca/' + b.id + '">' + esc(b.nome) + '</a> · ' + esc(b.marca + ' ' + b.modello)) + A.dl('Misure', A.num(b.l, 2) + ' m · ' + A.num(b.peso, 1) + ' t') +
      A.dl('Armatore', esc(a.nome) + ' · ' + esc(a.tel)) + A.dl('Destinazione', p.tipo === 'varo' ? 'In acqua' : esc(A.postoLabel(b.posto))) + (p.note ? A.dl('Note', esc(p.note)) : '') + '</dl>' +
      (p.fatto ? '' : '<h3>' + ico('msg') + ' Avviso all\'armatore</h3><pre class="msg">' + esc(testo) + '</pre>') +
      '<div class="modal-actions">' + (p.fatto ? '<span class="pill pill-ok">Fatto</span>' : '<button class="btn btn-ghost" data-act="pren-annulla" data-id="' + p.id + '">Annulla prenotazione</button><button class="btn btn-ghost" data-act="copia" data-t="' + esc(testo) + '">Copia avviso</button><button class="btn" data-act="pren-fatto" data-id="' + p.id + '">' + ico('check') + 'Segna come fatto</button>') + '</div>');
  };
  A.azioni['pren-fatto'] = function (el, id) {
    var p = D.prenotazioni.filter(function (x) { return x.id === id; })[0], b = A.barca(p.barca);
    p.fatto = true; b.stato = p.tipo === 'varo' ? 'acqua' : 'terra';
    A.chiudiModale(); A.toast(b.nome + (p.tipo === 'varo' ? ' è in acqua.' : ' è a terra: ' + A.postoLabel(b.posto) + '.')); A.render();
  };
  A.azioni['pren-annulla'] = function (el, id) {
    D.prenotazioni = D.prenotazioni.filter(function (x) { return x.id !== id; });
    A.chiudiModale(); A.toast('Prenotazione annullata.'); A.render();
  };

  function controllo(f) {
    var b = A.barca(f.barca.value), dt = A.fromISO(f.data.value);
    if (!dt) return '<div class="banner banner-warn">' + ico('clock') + '<div><strong>Scegli il giorno</strong></div></div>';
    var p = { barca: b.id, ris: f.ris.value, data: dt, ora: f.ora.value, tipo: f.tipo.value }, pr = A.problemi(p);
    if (dt.getDay() === 0) pr.push('la domenica il cantiere è chiuso');
    if (dt < OGGI) pr.push('il giorno è già passato');
    return pr.length ? '<div class="banner banner-danger">' + ico('alert') + '<div><strong>Non va bene</strong><small>' + esc(pr.join('; ')) + '</small></div></div>'
      : '<div class="banner banner-ok">' + ico('check') + '<div><strong>Libero</strong><small>' + esc(C.risorse[p.ris].nome) + ' disponibile, ' + A.num(b.peso, 1) + ' t entro la portata.</small></div></div>';
  }
  A.azioni['pren-nuova'] = function (el) {
    var bid = el.getAttribute('data-b'), b = bid ? A.barca(bid) : null;
    var giorno = el.getAttribute('data-d') || A.toISO(window.DEMO.lav(1)), ris = el.getAttribute('data-r') || (b && b.peso > C.risorse.scivolo.portata ? 'gru' : 'gru');
    var ore = []; for (var m = 8 * 60; m <= 17 * 60; m += 15) if (m < 12 * 60 + 30 || m >= 13 * 60 + 30) ore.push(A.pad(Math.floor(m / 60)) + ':' + A.pad(m % 60));
    var barche = D.barche.slice().sort(function (x, y) { return x.nome.localeCompare(y.nome); });
    A.modale('<h2>Nuova prenotazione</h2><p class="muted">Il controllo di portata e sovrapposizioni è immediato.</p><form class="form" id="form-pren"><fieldset>' +
      '<label class="full"><span>Barca</span><select name="barca">' + barche.map(function (x) { return '<option value="' + x.id + '"' + (b === x ? ' selected' : '') + '>' + esc(x.nome) + ' · ' + A.num(x.l, 1) + ' m, ' + A.num(x.peso, 1) + ' t · ' + (x.stato === 'acqua' ? 'in acqua' : 'a terra') + '</option>'; }).join('') + '</select></label>' +
      '<label><span>Operazione</span><select name="tipo"><option value="alaggio"' + (!b || b.stato === 'acqua' ? ' selected' : '') + '>Alaggio (fuori dall\'acqua)</option><option value="varo"' + (b && b.stato === 'terra' ? ' selected' : '') + '>Varo (in acqua)</option></select></label>' +
      '<label><span>Risorsa</span><select name="ris">' + RIS.map(function (k) { return '<option value="' + k + '"' + (k === ris ? ' selected' : '') + '>' + C.risorse[k].nome + ' (fino a ' + A.num(C.risorse[k].portata, 1) + ' t)</option>'; }).join('') + '</select></label>' +
      '<label><span>Giorno</span><input type="date" name="data" value="' + giorno + '"></label><label><span>Ora</span><select name="ora">' + ore.map(function (o) { return '<option' + (o === '09:00' ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' +
      '</fieldset><div id="pren-check"></div></form><div class="modal-actions"><button class="btn btn-ghost" data-act="chiudi">Annulla</button><button class="btn" data-act="pren-salva">' + ico('check') + 'Prenota</button></div>');
    A.$('#pren-check').innerHTML = controllo(A.$('#form-pren'));
  };
  A.change.push(function (t) { var f = t.closest && t.closest('#form-pren'); if (f) A.$('#pren-check').innerHTML = controllo(f); });
  A.azioni['pren-salva'] = function () {
    var f = A.$('#form-pren'), dt = A.fromISO(f.data.value), b = A.barca(f.barca.value);
    if (A.$('#pren-check .banner-danger') || !dt) { A.toast('Prima sistema l\'orario o la risorsa.'); return; }
    D.prenotazioni.push({ id: 'PR' + Date.now(), barca: b.id, tipo: f.tipo.value, ris: f.ris.value, data: dt, ora: f.ora.value, fatto: false });
    A.chiudiModale(); A.toast((f.tipo.value === 'varo' ? 'Varo' : 'Alaggio') + ' di ' + b.nome + ' prenotato ' + A.fmtGiorno(dt) + ' alle ' + f.ora.value + '.');
    location.hash = '#/calendario/' + A.toISO(dt); A.render();
  };
})();
