/*
 * Dati della stagione, TUTTI INVENTATI: ordini di lavoro, barche generate per riempire i posti,
 * prenotazioni di gru e scivolo, contratti di rimessaggio.
 * Le barche generate usano un generatore con seme fisso: a ogni apertura sono le stesse.
 */
(function () {
  'use strict';
  var C = window.CONFIG, D = window.DATI, gg = window.DEMO.gg, OGGI = window.DEMO.OGGI;
  var T = D.tecnici;
  // n-esimo giorno lavorativo (lunedì-sabato) da oggi; negativo = nel passato
  function lav(n) {
    var d = new Date(OGGI), passo = n < 0 ? -1 : 1, k = 0;
    while (k < Math.abs(n)) { d.setDate(d.getDate() + passo); if (d.getDay() !== 0) k++; }
    return d;
  }
  window.DEMO.lav = lav;

  var lavori = [
    { id: 'OL-2026-118', barca: 'B-01', titolo: 'Tagliando 100 ore e invernaggio motore', tipo: 'Tagliando', stato: 'approvato',
      aperto: gg(-6), inviato: gg(-5), approvato: gg(-3), fine: lav(4),
      righe: [{ k: 'mano', d: 'Tagliando: olio, filtri, candele e girante', q: 3.5 }, { k: 'ric', cod: 'F-OLIO-4T', q: 1 }, { k: 'ric', cod: 'F-CARB-10', q: 1 },
        { k: 'ric', cod: 'O-4T-1030', q: 2 }, { k: 'ric', cod: 'O-GEAR-1', q: 1 }, { k: 'ric', cod: 'G-GIR-200', q: 1 }, { k: 'ric', cod: 'C-CAND-6', q: 6 },
        { k: 'ric', cod: 'S-STAB', q: 1 }, { k: 'ric', cod: 'S-ANTIG', q: 1 }, { k: 'corpo', d: 'Lavaggio del circuito di raffreddamento e protezione invernale', q: 1, p: 45 }],
      ore: [], foto: { prima: [{ tipo: 'motore', fase: 'prima', label: 'Motore prima del tagliando' }], dopo: [] } },
    { id: 'OL-2026-121', barca: 'B-02', titolo: 'Antivegetativa, anodi e lucidatura', tipo: 'Antivegetativa', stato: 'inviato',
      aperto: gg(-7), inviato: gg(-6), fine: lav(12),
      righe: [{ k: 'corpo', d: 'Lavaggio carena con idropulitrice (al metro)', um: 'm', q: 8.7, p: 14 }, { k: 'mano', d: 'Carteggiatura e due mani di antivegetativa', q: 6 },
        { k: 'ric', cod: 'V-PRIM-25', q: 1 }, { k: 'ric', cod: 'V-AV-25', q: 2 }, { k: 'ric', cod: 'A-MG-KIT', q: 1 }, { k: 'mano', d: 'Lucidatura dell\'opera morta', q: 4 }, { k: 'ric', cod: 'L-POLISH', q: 1 }],
      ore: [], foto: { prima: [{ tipo: 'carena', fase: 'prima', label: 'Carena all\'alaggio' }, { tipo: 'elica', fase: 'prima', label: 'Elica con calcare' }], dopo: [] } },
    { id: 'OL-2026-112', barca: 'B-03', titolo: 'Verniciatura a coppale del mogano (8 mani)', tipo: 'Restauro', stato: 'incorso',
      aperto: gg(-30), inviato: gg(-29), approvato: gg(-27), fine: lav(14),
      righe: [{ k: 'corpo', d: 'Smontaggio e rimontaggio della ferramenta cromata', q: 1, p: 280 }, { k: 'mano', d: 'Carteggiatura e 8 mani di coppale', q: 38 }, { k: 'ric', cod: 'V-COP-1', q: 6 }],
      ore: [{ data: gg(-24), tec: T[2], ore: 6, nota: 'Smontaggio ferramenta' }, { data: gg(-20), tec: T[2], ore: 8, nota: 'Carteggiatura fianchi' }, { data: gg(-13), tec: T[2], ore: 4, nota: '1ª e 2ª mano' }, { data: gg(-6), tec: T[2], ore: 4, nota: '3ª e 4ª mano' }],
      foto: { prima: [{ tipo: 'legno', fase: 'prima', label: 'Coperta opaca' }], dopo: [{ tipo: 'legno', fase: 'dopo', label: 'Dopo la 4ª mano' }] } },
    { id: 'OL-2026-115', barca: 'B-05', titolo: 'Sostituzione soffietti del piede poppiero', tipo: 'Riparazione', stato: 'finito',
      aperto: gg(-14), inviato: gg(-13), approvato: gg(-12), fine: gg(-3),
      righe: [{ k: 'mano', d: 'Smontaggio piede, sostituzione soffietti, rimontaggio', q: 7 }, { k: 'ric', cod: 'M-SOF-PP', q: 1, scaricato: true }, { k: 'ric', cod: 'O-GEAR-1', q: 2, scaricato: true },
        { k: 'ric', cod: 'A-MG-KIT', q: 1, scaricato: true }, { k: 'corpo', d: 'Prova in acqua', q: 1, p: 60 }],
      ore: [{ data: gg(-6), tec: T[0], ore: 4, nota: 'Smontaggio piede' }, { data: gg(-4), tec: T[0], ore: 3.5, nota: 'Soffietti nuovi e rimontaggio' }],
      foto: { prima: [{ tipo: 'piede', fase: 'prima', label: 'Soffietto crepato' }], dopo: [{ tipo: 'piede', fase: 'dopo', label: 'Soffietti nuovi' }] } },
    { id: 'OL-2026-124', barca: 'B-06', titolo: 'Antivegetativa e anodi', tipo: 'Antivegetativa', stato: 'bozza', aperto: gg(-1), fine: lav(10),
      righe: [{ k: 'corpo', d: 'Lavaggio carena con idropulitrice (al metro)', um: 'm', q: 8, p: 14 }, { k: 'mano', d: 'Carteggiatura e due mani di antivegetativa', q: 5 },
        { k: 'ric', cod: 'V-PRIM-25', q: 1 }, { k: 'ric', cod: 'V-AV-25', q: 2 }, { k: 'ric', cod: 'A-MG-KIT', q: 1 }],
      ore: [], foto: { prima: [], dopo: [] } },
    { id: 'OL-2026-110', barca: 'B-07', titolo: 'Invernaggio fuoribordo e telo su misura', tipo: 'Invernaggio', stato: 'incorso',
      aperto: gg(-10), inviato: gg(-10), approvato: gg(-9), fine: lav(3),
      righe: [{ k: 'mano', d: 'Invernaggio: olio, filtro, piede, stabilizzatore', q: 2 }, { k: 'ric', cod: 'O-4T-1030', q: 1, scaricato: true }, { k: 'ric', cod: 'F-OLIO-4T', q: 1, scaricato: true },
        { k: 'ric', cod: 'O-GEAR-1', q: 1 }, { k: 'ric', cod: 'S-STAB', q: 1 }, { k: 'ric', cod: 'T-TELO-8', q: 1 }],
      ore: [{ data: gg(-2), tec: T[0], ore: 1.5, nota: 'Cambio olio e filtro' }],
      foto: { prima: [{ tipo: 'motore', fase: 'prima', label: 'Fuoribordo all\'alaggio' }], dopo: [] } },
    { id: 'OL-2026-108', barca: 'B-10', titolo: 'Antivegetativa', tipo: 'Antivegetativa', stato: 'fatturato', aperto: gg(-16), inviato: gg(-16), approvato: gg(-15), fine: gg(-9),
      righe: [{ k: 'mano', d: 'Carteggiatura e due mani di antivegetativa', q: 4 }, { k: 'ric', cod: 'V-AV-25', q: 2, scaricato: true }], ore: [{ data: gg(-9), tec: T[1], ore: 4, nota: '' }],
      foto: { prima: [{ tipo: 'carena', fase: 'prima', label: 'Carena' }], dopo: [{ tipo: 'carena', fase: 'dopo', label: 'Antivegetativa nuova' }] } },
    { id: 'OL-2026-097', barca: 'B-09', titolo: 'Tagliando 300 ore', tipo: 'Tagliando', stato: 'fatturato', aperto: gg(-64), inviato: gg(-64), approvato: gg(-63), fine: gg(-60),
      righe: [{ k: 'mano', d: 'Tagliando 300 ore', q: 4 }, { k: 'ric', cod: 'F-OLIO-4T', q: 1, scaricato: true }, { k: 'ric', cod: 'O-4T-1030', q: 2, scaricato: true }],
      ore: [{ data: gg(-60), tec: T[0], ore: 4, nota: '' }], foto: { prima: [], dopo: [] } }
  ];

  /* ---------- barche generate ---------- */
  var s = 20261;
  function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
  function pick(a) { return a[Math.floor(r() * a.length)]; }
  var NOMI_B = ['Libeccio', 'Gabbiano', 'Stella', 'Nina', 'Ondina', 'Calypso', 'Sirena', 'Freccia', 'Mirage', 'Bluette', 'Zefiro', 'Tramontana', 'Luna', 'Margherita',
    'Corsaro', 'Delfino', 'Isola', 'Aria', 'Perla', 'Smeraldo', 'Kiwi', 'Lucky', 'Ginevra', 'Folaga', 'Svasso', 'Airone', 'Cigno', 'Nuvola', 'Bora', 'Scirocco',
    'Ponente', 'Levante', 'Orsa', 'Vega', 'Altair', 'Albatros', 'Gioia', 'Mia', 'Tobia', 'Sole', 'Paguro', 'Lilly', 'Birba', 'Ultimo Sogno', 'Zagara', 'Anemone',
    'Iris', 'Sciabica', 'Gardenia', 'Fiordaliso', 'Rondine', 'Merlo', 'Pettirosso', 'Allodola', 'Sparviero', 'Falco', 'Gufo', 'Volpe', 'Lontra', 'Tasso', 'Marmotta'];
  var MODELLI = [
    ['Jeanneau', 'Cap Camarat 6.5 BR', 'Bowrider', 6.4, 1.6, 'Yamaha', 'F150', 150], ['Quicksilver', 'Activ 555 Open', 'Open', 5.5, 1.0, 'Mercury', 'F100', 100],
    ['Bayliner', 'VR5', 'Bowrider', 5.9, 1.4, 'Mercury', 'F150', 150], ['Sea Ray', 'SPX 190', 'Bowrider', 5.9, 1.5, 'MerCruiser', '4.5 L', 200],
    ['Beneteau', 'Flyer 6 Spacedeck', 'Open', 5.9, 1.3, 'Suzuki', 'DF150', 150], ['Cranchi', 'E26 Classic', 'Cabinato', 7.9, 3.6, 'Volvo Penta', 'V8-350', 350],
    ['Boesch', '750 Portofino', 'Motoscafo', 7.5, 2.1, 'Entrobordo', 'V8', 300], ['Zodiac', 'Medline 6.8', 'Gommone', 6.8, 1.4, 'Yamaha', 'F200', 200],
    ['Frauscher', '747 Mirage', 'Cabinato sportivo', 7.5, 2.4, 'MerCruiser', '6.2 MPI', 300], ['Dolphin', '81', 'Barca a vela', 8.1, 1.8, 'Tohatsu', 'MFS 6', 6],
    ['Asso', '99', 'Barca a vela', 9.9, 1.4, '', '', 0], ['Saver', '690 Cabin', 'Cabinato', 6.9, 1.9, 'Suzuki', 'DF200', 200],
    ['Ranieri', 'Next 220 SH', 'Open', 6.6, 1.5, 'Yamaha', 'F150', 150], ['Capelli', 'Tempest 750', 'Gommone', 7.5, 1.6, 'Mercury', 'F250', 250]
  ];
  var NOMI = ['Luca', 'Andrea', 'Francesca', 'Giovanni', 'Chiara', 'Stefano', 'Silvia', 'Matteo', 'Anna', 'Paola', 'Massimo', 'Valeria', 'Enrico', 'Marta', 'Giulio', 'Cristina'];
  var NOMI_DE = ['Hans', 'Ursula', 'Peter', 'Markus', 'Sabine', 'Jürgen'];
  var COGNOMI = ['Bonetti', 'Ghirardi', 'Moretti', 'Pedretti', 'Bertoli', 'Fontana', 'Galli', 'Colombo', 'Ferrari', 'Brambilla', 'Rota', 'Bianchini', 'Mazzoleni', 'Lancini', 'Archetti', 'Turla'];
  var COGNOMI_DE = ['Meier', 'Schneider', 'Weber', 'Hofmann', 'Keller', 'Brunner'];
  var CITTA = ['Milano', 'Brescia', 'Bergamo', 'Monza', 'Cremona', 'Lecco', 'Como', 'Varese', 'Lodi', 'Mantova', 'Lugano (CH)'];
  var CITTA_DE = ['München (DE)', 'Stuttgart (DE)', 'Zürich (CH)', 'Innsbruck (AT)'];

  var occupati = {}, perArea = {};
  D.barche.forEach(function (b) { occupati[b.posto] = true; perArea[b.posto[0]] = (perArea[b.posto[0]] || 0) + 1; });
  var nb = 13, usati = {};
  D.barche.forEach(function (b) { usati[b.nome] = true; });
  C.aree.forEach(function (area) {
    var pieni = Math.floor(area.posti * (area.tipo === 'coperto' ? 0.95 : 0.8));
    for (var n = 1; n <= area.posti && (perArea[area.id] || 0) < pieni; n++) {
      var posto = area.id + '-' + (n < 10 ? '0' + n : n);
      if (occupati[posto]) continue;
      var m = pick(MODELLI), de = r() < 0.18, nome, tent = 0;
      do { nome = pick(NOMI_B); } while (usati[nome] && ++tent < 50);
      if (usati[nome]) break;
      occupati[posto] = true; usati[nome] = true; perArea[area.id] = (perArea[area.id] || 0) + 1;
      var aid = 'a' + nb;
      D.armatori.push({ id: aid, nome: de ? pick(NOMI_DE) + ' ' + pick(COGNOMI_DE) : pick(NOMI) + ' ' + pick(COGNOMI), citta: de ? pick(CITTA_DE) : pick(CITTA),
        tel: (de ? '+49 000 000' : '333 000 ') + (1100 + nb), email: 'armatore' + nb + '@example.com', lingua: de ? 'de' : 'it' });
      D.barche.push({ id: 'B-' + nb, nome: nome, armatore: aid, marca: m[0], modello: m[1], tipo: m[2], l: m[3], w: Math.round(m[3] * 3.4) / 10, peso: m[4],
        anno: 2004 + Math.floor(r() * 21), motori: m[7] ? [{ marca: m[5], modello: m[6], cv: m[7], ore: 80 + Math.floor(r() * 900) }] : [], posto: posto,
        stato: area.tipo === 'acqua' ? 'acqua' : 'terra', assic: gg(20 + Math.floor(r() * 330)), generata: true,
        foto: [{ tipo: area.tipo === 'acqua' ? 'lago' : 'capannone', label: area.tipo === 'acqua' ? 'Al pontile' : 'In ' + area.nome.toLowerCase() }], storico: [] });
      nb++;
    }
  });

  /* ---------- prenotazioni di gru e scivolo ---------- */
  var pren = [], np = 1;
  function minuti(o) { var p = o.split(':'); return +p[0] * 60 + +p[1]; }
  function libero(ris, data, ora) {
    var a = minuti(ora), dur = C.risorse[ris].durata;
    return !pren.some(function (p) { return p.ris === ris && +p.data === +data && Math.abs(minuti(p.ora) - a) < dur; });
  }
  function prenota(barca, tipo, ris, data, ora, extra) {
    var p = { id: 'PR' + (np++), barca: barca, tipo: tipo, ris: ris, data: data, ora: ora, fatto: data < OGGI };
    for (var k in extra) p[k] = extra[k];
    pren.push(p); return p;
  }
  var ORE = { gru: ['08:30', '09:30', '10:30', '11:30', '14:00', '15:00', '16:00'], scivolo: ['08:30', '09:00', '09:30', '10:00', '11:00', '14:00', '14:30', '15:30', '16:00'] };
  function prossimoLibero(barca, tipo, ris, daGiorno, passo) {
    for (var g = daGiorno; Math.abs(g) < 40; g += passo) {
      var d = lav(g), ore = ORE[ris];
      for (var i = 0; i < 3; i++) { var o = ore[Math.floor(r() * ore.length)]; if (libero(ris, d, o)) return prenota(barca, tipo, ris, d, o); }
    }
  }
  // prenotazioni descritte a mano: la sovrapposizione sullo scivolo e la barca troppo pesante sono volute
  prenota('B-01', 'alaggio', 'gru', lav(1), '09:30');
  prenota('B-05', 'varo', 'gru', lav(1), '14:00', { note: 'Dopo la prova del piede poppiero' });
  prenota('B-04', 'alaggio', 'scivolo', lav(2), '10:00');
  prenota('B-10', 'alaggio', 'scivolo', lav(2), '10:15');
  prenota('B-06', 'alaggio', 'gru', lav(3), '08:30');
  prenota('B-08', 'alaggio', 'gru', lav(4), '10:30', { note: 'Disalberare prima: 30 minuti in più' });
  prenota('B-11', 'alaggio', 'scivolo', lav(6), '09:00');
  prenota('B-02', 'alaggio', 'gru', lav(-6), '09:30');
  prenota('B-07', 'alaggio', 'scivolo', lav(-4), '11:00');
  var senza = 0;
  D.barche.forEach(function (b) {
    if (!b.generata || b.stato === 'acqua') return;
    var x = r(), ris = b.peso > 3 || r() < 0.5 ? 'gru' : 'scivolo';
    if (x < 0.32) {
      b.stato = 'acqua';
      if (senza < 3 && x < 0.08) { senza++; return; } // ancora in acqua, alaggio da prenotare
      prossimoLibero(b.id, 'alaggio', ris, 1 + Math.floor(r() * 14), 1);
    } else if (x < 0.6) prossimoLibero(b.id, 'alaggio', ris, -1 - Math.floor(r() * 9), -1);
  });

  /* ---------- contratti di rimessaggio ---------- */
  var TARIFFA = { coperto: 360, aperto: 210, acqua: 480 }; // €/metro a stagione, di esempio
  var TIPO_C = { coperto: 'Rimessaggio invernale coperto', aperto: 'Rimessaggio invernale all\'aperto', acqua: 'Posto barca annuale in acqua' };
  var NON_PAGATE = { 'B-04': [{ data: gg(-3), canale: 'WhatsApp' }], 'B-11': [], 'B-09': [{ data: gg(-30), canale: 'Email' }, { data: gg(-12), canale: 'WhatsApp' }] };
  var SCADE = { 'B-12': 21, 'B-09': 140, 'B-05': 230 };
  var contratti = [], aY = String(OGGI.getFullYear()).slice(2);
  D.barche.forEach(function (b, i) {
    var area = C.aree.filter(function (a) { return a.id === b.posto[0]; })[0], tipo = area.tipo;
    var canone = Math.round(b.l * TARIFFA[tipo] / 10) * 10;
    var c = { id: 'R-' + aY + '-' + ('00' + (i + 1)).slice(-3), barca: b.id, tipo: tipo, descr: TIPO_C[tipo], canone: canone, solleciti: [], rate: [] };
    var nonPagata = NON_PAGATE[b.id] || (b.generata && i % 9 === 4 ? [] : null);
    if (tipo === 'acqua') {
      var off = SCADE[b.id] != null ? SCADE[b.id] : (12 + i * 37) % 330;
      c.inizio = gg(off - 365); c.fine = gg(off);
      c.rate = [{ scad: gg(off - 355), imp: canone / 2 }, { scad: gg(off - 183), imp: canone / 2 }];
    } else {
      c.inizio = gg(-15); c.fine = gg(197);
      var r1 = Math.round(canone * 0.4), r2 = Math.round(canone * 0.3);
      c.rate = [{ scad: gg(-10), imp: r1 }, { scad: gg(50), imp: r2 }, { scad: gg(140), imp: canone - r1 - r2 }];
    }
    // l'ultima rata già scaduta resta da pagare per i contratti "non pagati"
    var scadute = c.rate.filter(function (rt) { return rt.scad < OGGI; });
    c.rate.forEach(function (rt) {
      var giorniScad = Math.round((rt.scad - OGGI) / 86400000);
      rt.pagata = rt.scad < OGGI && !(nonPagata && rt === scadute[scadute.length - 1]) ? gg(Math.min(-1, giorniScad + 2)) : null;
    });
    if (nonPagata) c.solleciti = nonPagata;
    contratti.push(c);
  });

  D.lavori = lavori; D.prenotazioni = pren; D.contratti = contratti;
})();
