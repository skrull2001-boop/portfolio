/*
 * Dati della demo: TUTTI INVENTATI.
 * Le date sono relative a oggi, così scadenze, vari e alaggi restano credibili
 * in qualunque giorno si apra la demo.
 */
(function () {
  'use strict';
  var C = window.CONFIG;
  var OGGI = new Date();
  OGGI.setHours(0, 0, 0, 0);
  function gg(n) { var d = new Date(OGGI); d.setDate(d.getDate() + n); return d; }
  window.DEMO = { OGGI: OGGI, gg: gg };

  var tecnici = ['Fabio Rinaldi (meccanico)', 'Ivan Bosio (carenatura)', 'Sergio Zatti (falegname)'];

  var armatori = [
    { id: 'a1', nome: 'Giorgio Bettoni', citta: 'Brescia', tel: '333 000 1101', email: 'g.bettoni@example.com', lingua: 'it' },
    { id: 'a2', nome: 'Klaus Kessler', citta: 'München (DE)', tel: '+49 000 0001102', email: 'k.kessler@example.com', lingua: 'de', note: 'Preferisce messaggi in tedesco. Viene sul lago da maggio a settembre.' },
    { id: 'a3', nome: 'Elena Marchetti', citta: 'Milano', tel: '333 000 1103', email: 'e.marchetti@example.com', lingua: 'it', note: 'Barca d\'epoca: vuole le foto di ogni fase del restauro.' },
    { id: 'a4', nome: 'Paolo Ghidini', citta: 'Bergamo', tel: '333 000 1104', email: 'p.ghidini@example.com', lingua: 'it' },
    { id: 'a5', nome: 'Immobiliare Lago Srl', citta: 'Brescia', tel: '030 000 1105', email: 'amministrazione@example.com', lingua: 'it', note: 'Fattura intestata alla società. Referente: Marco Fenaroli.' },
    { id: 'a6', nome: 'Sergio Pedrali', citta: 'Lecco', tel: '333 000 1106', email: 's.pedrali@example.com', lingua: 'it' },
    { id: 'a7', nome: 'Chiara Lanfranchi', citta: 'Milano', tel: '333 000 1107', email: 'c.lanfranchi@example.com', lingua: 'it' },
    { id: 'a8', nome: 'Thomas Huber', citta: 'Zürich (CH)', tel: '+41 000 0001108', email: 't.huber@example.com', lingua: 'de' },
    { id: 'a9', nome: 'Roberto Cominelli', citta: 'Cremona', tel: '333 000 1109', email: 'r.cominelli@example.com', lingua: 'it' },
    { id: 'a10', nome: 'Laura Zanardelli', citta: 'Monza', tel: '333 000 1110', email: 'l.zanardelli@example.com', lingua: 'it' },
    { id: 'a11', nome: 'Alberto Sala', citta: 'Varese', tel: '333 000 1111', email: 'a.sala@example.com', lingua: 'it' },
    { id: 'a12', nome: 'Federica Gatti', citta: 'Brescia', tel: '333 000 1112', email: 'f.gatti@example.com', lingua: 'it' }
  ];

  // barche descritte a mano: sono quelle che si aprono durante la demo
  var barche = [
    { id: 'B-01', nome: 'Aurora', armatore: 'a1', marca: 'Jeanneau', modello: 'Cap Camarat 7.5 WA', tipo: 'Open', l: 7.4, w: 2.54, peso: 2.6, anno: 2019,
      motori: [{ marca: 'Yamaha', modello: 'F200', cv: 200, ore: 412 }], posto: 'A-12', stato: 'acqua', assic: gg(210),
      foto: [{ tipo: 'lago', label: 'Al pontile, settembre' }, { tipo: 'motore', fase: 'prima', label: 'Motore' }],
      storico: [{ data: gg(-190), desc: 'Varo, controllo impianto elettrico', imp: 180 }, { data: gg(-370), desc: 'Tagliando 100 ore e invernaggio', imp: 690 }] },
    { id: 'B-02', nome: 'Lady K', armatore: 'a2', marca: 'Frauscher', modello: '858 Fantom', tipo: 'Cabinato sportivo', l: 8.67, w: 2.49, peso: 3.4, anno: 2021,
      motori: [{ marca: 'MerCruiser', modello: '6.2 MPI (entrobordo)', cv: 350, ore: 286 }], posto: 'A-03', stato: 'terra', assic: gg(140),
      foto: [{ tipo: 'capannone', label: 'In capannone A' }, { tipo: 'carena', fase: 'prima', label: 'Carena all\'alaggio' }],
      storico: [{ data: gg(-200), desc: 'Varo e antivegetativa', imp: 1450 }] },
    { id: 'B-03', nome: 'Clementina', armatore: 'a3', marca: 'Cantiere lariano', modello: 'Runabout in mogano', tipo: 'Motoscafo d\'epoca', l: 6.5, w: 2.0, peso: 1.7, anno: 1964,
      motori: [{ marca: 'V8 benzina', modello: 'entrobordo ricondizionato', cv: 220, ore: 1310 }], posto: 'B-01', stato: 'terra', assic: gg(95),
      foto: [{ tipo: 'legno', fase: 'prima', label: 'Coperta prima del restauro' }, { tipo: 'capannone', label: 'In capannone B' }],
      storico: [{ data: gg(-380), desc: 'Revisione motore V8', imp: 3900 }, { data: gg(-560), desc: 'Rifacimento tappezzeria', imp: 2400 }] },
    { id: 'B-04', nome: 'Tempesta', armatore: 'a4', marca: 'Sea Ray', modello: 'SPX 230', tipo: 'Bowrider', l: 7.0, w: 2.59, peso: 2.4, anno: 2018,
      motori: [{ marca: 'MerCruiser', modello: '4.5 L (entrobordo)', cv: 250, ore: 655 }], posto: 'P-05', stato: 'acqua', assic: gg(60),
      foto: [{ tipo: 'lago', label: 'In navigazione' }], storico: [{ data: gg(-365), desc: 'Invernaggio motore', imp: 420 }] },
    { id: 'B-05', nome: 'Kiara', armatore: 'a5', marca: 'Cranchi', modello: 'Endurance 30', tipo: 'Cabinato', l: 9.4, w: 2.95, peso: 4.6, anno: 2016,
      motori: [{ marca: 'Volvo Penta', modello: 'V6-240 (piede poppiero)', cv: 240, ore: 980 }], posto: 'W-04', stato: 'terra', assic: gg(250),
      foto: [{ tipo: 'lago', label: 'Al pontile' }, { tipo: 'piede', fase: 'prima', label: 'Piede poppiero' }],
      storico: [{ data: gg(-300), desc: 'Tagliando 1.000 ore', imp: 1120 }] },
    { id: 'B-06', nome: 'Ginestra', armatore: 'a6', marca: 'Beneteau', modello: 'Flyer 8 Sundeck', tipo: 'Open', l: 8.0, w: 2.99, peso: 2.9, anno: 2022,
      motori: [{ marca: 'Suzuki', modello: 'DF250', cv: 250, ore: 198 }], posto: 'A-07', stato: 'acqua', assic: gg(180),
      foto: [{ tipo: 'lago', label: 'Al pontile' }], storico: [{ data: gg(-195), desc: 'Varo', imp: 160 }] },
    { id: 'B-07', nome: 'Pepita', armatore: 'a7', marca: 'Quicksilver', modello: 'Activ 605 Open', tipo: 'Open', l: 6.0, w: 2.3, peso: 1.3, anno: 2020,
      motori: [{ marca: 'Mercury', modello: 'F115', cv: 115, ore: 340 }], posto: 'P-11', stato: 'terra', assic: gg(120),
      foto: [{ tipo: 'motore', fase: 'prima', label: 'Fuoribordo all\'alaggio' }], storico: [{ data: gg(-360), desc: 'Invernaggio motore', imp: 310 }] },
    { id: 'B-08', nome: 'Maestrale', armatore: 'a8', marca: 'Dolphin', modello: '81', tipo: 'Barca a vela', l: 8.1, w: 2.5, peso: 1.8, anno: 2012,
      motori: [{ marca: 'Tohatsu', modello: 'MFS 6 (fuoribordo)', cv: 6, ore: 150 }], posto: 'P-02', stato: 'acqua', assic: gg(75), note: 'Disalberare prima dell\'alaggio: serve mezz\'ora in più.',
      foto: [{ tipo: 'lago', label: 'In boa' }], storico: [{ data: gg(-190), desc: 'Varo e armamento', imp: 380 }] },
    { id: 'B-09', nome: 'Nonna Pina', armatore: 'a9', marca: 'Zodiac', modello: 'Medline 7.5', tipo: 'Gommone', l: 7.4, w: 2.9, peso: 1.9, anno: 2017,
      motori: [{ marca: 'Yamaha', modello: 'F250', cv: 250, ore: 720 }], posto: 'W-09', stato: 'acqua', assic: gg(-8),
      foto: [{ tipo: 'lago', label: 'Al pontile' }], storico: [{ data: gg(-60), desc: 'Tagliando 300 ore (OL-2026-097)', imp: 640 }] },
    { id: 'B-10', nome: 'Brezza', armatore: 'a10', marca: 'Bayliner', modello: 'VR6', tipo: 'Bowrider', l: 6.1, w: 2.4, peso: 1.5, anno: 2019,
      motori: [{ marca: 'Mercury', modello: '4.5 L (entrobordo)', cv: 200, ore: 380 }], posto: 'B-06', stato: 'acqua', assic: gg(160),
      foto: [{ tipo: 'lago', label: 'In navigazione' }], storico: [] },
    { id: 'B-11', nome: 'Silver', armatore: 'a11', marca: 'Sessa', modello: 'Key Largo 27', tipo: 'Open', l: 8.3, w: 2.8, peso: 3.9, anno: 2015,
      motori: [{ marca: 'Mercury', modello: 'F150', cv: 150, ore: 610 }, { marca: 'Mercury', modello: 'F150', cv: 150, ore: 608 }], posto: 'A-15', stato: 'acqua', assic: gg(30),
      foto: [{ tipo: 'lago', label: 'Al pontile' }], storico: [{ data: gg(-370), desc: 'Invernaggio due motori', imp: 760 }] },
    { id: 'B-12', nome: 'Altea', armatore: 'a12', marca: 'Sea Ray', modello: '290 Sundancer', tipo: 'Cabinato', l: 9.0, w: 3.0, peso: 4.8, anno: 2014,
      motori: [{ marca: 'MerCruiser', modello: '5.0 L (entrobordo)', cv: 260, ore: 1120 }], posto: 'W-12', stato: 'acqua', assic: gg(90),
      foto: [{ tipo: 'lago', label: 'Al pontile' }], storico: [{ data: gg(-240), desc: 'Antivegetativa e anodi', imp: 1280 }] }
  ];

  var magazzino = [
    { cod: 'F-OLIO-4T', desc: 'Filtro olio fuoribordo 4T 115-250 cv', cat: 'Motore', um: 'pz', giac: 3, min: 4, ubic: 'Scaff. 1-A', acq: 14.8, ven: 24.5 },
    { cod: 'F-CARB-10', desc: 'Filtro carburante separatore acqua 10 micron', cat: 'Motore', um: 'pz', giac: 6, min: 3, ubic: 'Scaff. 1-A', acq: 18.5, ven: 31 },
    { cod: 'O-4T-1030', desc: 'Olio motore 4T 10W-30 nautico, tanica 4 L', cat: 'Lubrificanti', um: 'pz', giac: 9, min: 6, ubic: 'Scaff. 2-B', acq: 38, ven: 59 },
    { cod: 'O-GEAR-1', desc: 'Olio piede e ingranaggi SAE 90, 1 L', cat: 'Lubrificanti', um: 'pz', giac: 2, min: 6, ubic: 'Scaff. 2-B', acq: 9.9, ven: 16.5 },
    { cod: 'G-GIR-200', desc: 'Kit girante pompa acqua F150-F250', cat: 'Motore', um: 'kit', giac: 1, min: 2, ubic: 'Scaff. 1-C', acq: 46, ven: 72 },
    { cod: 'C-CAND-6', desc: 'Candela di accensione per fuoribordo 4T', cat: 'Motore', um: 'pz', giac: 18, min: 12, ubic: 'Scaff. 1-B', acq: 6.2, ven: 10.5 },
    { cod: 'M-SOF-PP', desc: 'Kit soffietti piede poppiero', cat: 'Piede poppiero', um: 'kit', giac: 1, min: 1, ubic: 'Scaff. 3-A', acq: 118, ven: 189 },
    { cod: 'A-MG-KIT', desc: 'Kit anodi in magnesio (acqua dolce)', cat: 'Anodi', um: 'kit', giac: 4, min: 3, ubic: 'Scaff. 3-B', acq: 54, ven: 86 },
    { cod: 'V-AV-25', desc: 'Antivegetativa per acqua dolce, latta 2,5 L', cat: 'Carena', um: 'latta', giac: 7, min: 8, ubic: 'Vernici', acq: 92, ven: 139 },
    { cod: 'V-PRIM-25', desc: 'Primer epossidico, latta 2,5 L', cat: 'Carena', um: 'latta', giac: 3, min: 2, ubic: 'Vernici', acq: 78, ven: 118 },
    { cod: 'V-COP-1', desc: 'Vernice coppale marina per legno, 1 L', cat: 'Legno', um: 'latta', giac: 5, min: 4, ubic: 'Vernici', acq: 41, ven: 64 },
    { cod: 'L-POLISH', desc: 'Pasta abrasiva e polish per gelcoat', cat: 'Carena', um: 'pz', giac: 4, min: 3, ubic: 'Scaff. 2-C', acq: 22, ven: 36 },
    { cod: 'S-STAB', desc: 'Stabilizzatore benzina, 500 ml', cat: 'Consumabili', um: 'pz', giac: 11, min: 6, ubic: 'Scaff. 2-C', acq: 12, ven: 19.9 },
    { cod: 'S-ANTIG', desc: 'Antigelo per circuito di raffreddamento, 4 L', cat: 'Consumabili', um: 'pz', giac: 6, min: 6, ubic: 'Scaff. 2-C', acq: 15, ven: 24 },
    { cod: 'E-AGM-100', desc: 'Batteria AGM 100 Ah', cat: 'Elettrico', um: 'pz', giac: 2, min: 2, ubic: 'Scaff. 4-A', acq: 189, ven: 265 },
    { cod: 'T-TELO-8', desc: 'Telo copribarca su misura, fino a 8 m', cat: 'Rimessaggio', um: 'pz', giac: 0, min: 1, ubic: 'Soppalco', acq: 240, ven: 380 }
  ];

  // movimenti di magazzino già registrati
  var movimenti = [
    { data: gg(-40), tipo: 'Carico', cod: 'V-AV-25', q: 12, rif: 'Fattura 3920/2026, Colorificio Nautico (fittizio)' },
    { data: gg(-40), tipo: 'Carico', cod: 'V-PRIM-25', q: 4, rif: 'Fattura 3920/2026, Colorificio Nautico (fittizio)' },
    { data: gg(-60), tipo: 'Scarico', cod: 'F-OLIO-4T', q: 1, rif: 'OL-2026-097' },
    { data: gg(-60), tipo: 'Scarico', cod: 'O-4T-1030', q: 2, rif: 'OL-2026-097' },
    { data: gg(-25), tipo: 'Carico', cod: 'C-CAND-6', q: 24, rif: 'Fattura 4102/2026, Ricambi Nautici Lombardi (fittizio)' },
    { data: gg(-4), tipo: 'Scarico', cod: 'M-SOF-PP', q: 1, rif: 'OL-2026-115' },
    { data: gg(-4), tipo: 'Scarico', cod: 'O-GEAR-1', q: 2, rif: 'OL-2026-115' },
    { data: gg(-4), tipo: 'Scarico', cod: 'A-MG-KIT', q: 1, rif: 'OL-2026-115' },
    { data: gg(-9), tipo: 'Scarico', cod: 'V-AV-25', q: 5, rif: 'OL-2026-108' }
  ];

  window.DATI = { tecnici: tecnici, armatori: armatori, barche: barche, magazzino: magazzino, movimenti: movimenti };
})();
