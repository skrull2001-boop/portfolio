/*
 * Dati della demo: TUTTI INVENTATI.
 * Le date sono relative a oggi, così scadenze e allarmi restano credibili
 * in qualunque giorno si apra la demo.
 */
(function () {
  'use strict';
  var OGGI = new Date();
  OGGI.setHours(0, 0, 0, 0);
  function gg(n) { var d = new Date(OGGI); d.setDate(d.getDate() + n); return d; }
  window.DEMO = { OGGI: OGGI, gg: gg };

  var operai = [
    { id: 'op1', nome: 'Giuseppe Rota', ruolo: 'Preposto e capo cantiere', tel: '333 000 0101', dal: 2011,
      corso: { livello: 'Gestionale (50 h)', data: gg(-700), agg: gg(395) },
      visita: { ultima: gg(-200), scad: gg(165), giudizio: 'Idoneo' },
      quota: gg(420), ple: gg(610) },
    { id: 'op2', nome: 'Stefano Brambilla', ruolo: 'Operaio specializzato', tel: '333 000 0102', dal: 2016,
      corso: { livello: 'Operativo (30 h)', data: gg(-980), agg: gg(115) },
      visita: { ultima: gg(-330), scad: gg(35), giudizio: 'Idoneo' },
      quota: gg(210), ple: gg(48) },
    { id: 'op3', nome: 'Ionut Popescu', ruolo: 'Operaio', tel: '333 000 0103', dal: 2019,
      corso: { livello: 'Operativo (30 h)', data: gg(-420), agg: gg(510) },
      visita: { ultima: gg(-356), scad: gg(9), giudizio: 'Idoneo con prescrizioni' },
      quota: gg(300), ple: null },
    { id: 'op4', nome: 'Karim Benali', ruolo: 'Operaio', tel: '333 000 0104', dal: 2020,
      corso: { livello: 'Operativo (30 h)', data: gg(-1830), agg: gg(-5) },
      visita: { ultima: gg(-125), scad: gg(240), giudizio: 'Idoneo' },
      quota: gg(150), ple: gg(700) },
    { id: 'op5', nome: 'Matteo Galli', ruolo: 'Gruista e operatore PLE', tel: '333 000 0105', dal: 2014,
      corso: { livello: 'Operativo (30 h)', data: gg(-150), agg: gg(640) },
      visita: { ultima: gg(-85), scad: gg(280), giudizio: 'Idoneo' },
      quota: gg(22), ple: gg(40) },
    { id: 'op6', nome: 'Roberto Sala', ruolo: 'Operaio specializzato', tel: '333 000 0106', dal: 2009,
      corso: { livello: 'Operativo (30 h)', data: gg(-1100), agg: gg(58) },
      visita: { ultima: gg(-175), scad: gg(190), giudizio: 'Idoneo' },
      quota: gg(330), ple: gg(260) },
    { id: 'op7', nome: 'Alessio Cattaneo', ruolo: 'Apprendista', tel: '333 000 0107', dal: 2026,
      corso: { livello: 'Operativo (30 h)', data: gg(-40), agg: gg(1785) },
      visita: { ultima: gg(-40), scad: gg(325), giudizio: 'Idoneo' },
      quota: gg(690), ple: null }
  ];

  var cantieri = [
    { id: 'C-2026-041', titolo: 'Capannone logistico, copertura a shed', committente: 'Brianza Logistica Srl',
      referente: 'Ufficio tecnico del committente, 039 000 1111', indirizzo: "Via dell'Artigianato 14", comune: 'Lissone', prov: 'MB', ats: 'ATS Brianza',
      intervento: 'Rimozione e smaltimento di lastre in cemento-amianto, posa di nuova copertura in pannelli sandwich',
      materiale: 'Lastre ondulate in cemento-amianto (amianto compatto)', mq: 1240, altezza: 9.5,
      stato: 'piano', inizio: gg(34), durata: 15, importo: 86400,
      squadra: ['op1', 'op2', 'op4', 'op5', 'op6'],
      sopralluogo: { data: gg(-21), tecnico: 'Ing. Paola Rossi',
        falde: [{ nome: 'Shed 1-4 (lato nord)', l: 62, w: 5.4, p: 35 }, { nome: 'Shed 5-8 (lato sud)', l: 62, w: 5.4, p: 35 }, { nome: 'Pensilina carico', l: 28, w: 6, p: 10 }],
        accesso: 'Piazzale interno, ingresso mezzi da via secondaria. Attività del committente in corso durante i lavori.',
        degrado: 'Superficie erosa con fibre affioranti, muschi e licheni su circa il 40% delle lastre. Due lastre rotte vicino ai lucernari.',
        note: 'Concordare con il committente la chiusura della baia di carico 3. Linea elettrica aerea sul lato est a circa 6 m.' },
      foto: [{ tipo: 'capannone', label: 'Fronte nord' }, { tipo: 'tetto', label: 'Falda shed 2' }, { tipo: 'dettaglio', label: 'Erosione lastre' }, { tipo: 'tetto', label: 'Pensilina carico' }] },

    { id: 'C-2026-038', titolo: 'Condominio, copertura box auto', committente: 'Condominio Via Manzoni 21',
      referente: 'Amministratore di condominio, 0362 000 222', indirizzo: 'Via Manzoni 21', comune: 'Seregno', prov: 'MB', ats: 'ATS Brianza',
      intervento: 'Rimozione e smaltimento delle lastre di copertura dei box, posa di lamiera grecata coibentata',
      materiale: 'Lastre ondulate in cemento-amianto (amianto compatto)', mq: 380, altezza: 3.2,
      stato: 'depositato', depositato: gg(-12), inizio: gg(18), durata: 5, importo: 24900,
      squadra: ['op1', 'op3', 'op7'],
      sopralluogo: { data: gg(-55), tecnico: 'Ing. Paola Rossi',
        falde: [{ nome: 'Corsia box A', l: 38, w: 5, p: 8 }, { nome: 'Corsia box B', l: 38, w: 5, p: 8 }],
        accesso: 'Cortile condominiale, accesso da passo carraio. Avvisare i condòmini 7 giorni prima.',
        degrado: 'Lastre con lieve erosione superficiale, nessuna rottura.', note: 'Lavori in orario 8-17, niente sabato.' },
      foto: [{ tipo: 'tetto', label: 'Corsia box A' }, { tipo: 'dettaglio', label: 'Fissaggi' }] },

    { id: 'C-2026-035', titolo: 'Fienile e porticato, azienda agricola', committente: 'Az. agricola Cascina Ronchetto',
      referente: 'Titolare, 039 000 3333', indirizzo: 'Strada vicinale Ronchetto 3', comune: 'Vimercate', prov: 'MB', ats: 'ATS Brianza',
      intervento: 'Rimozione di copertura in cemento-amianto e posa di pannelli sandwich, rifacimento lattonerie',
      materiale: 'Lastre ondulate in cemento-amianto (amianto compatto)', mq: 620, altezza: 7,
      stato: 'incorso', depositato: gg(-40), inizio: gg(-3), durata: 8, importo: 41200,
      squadra: ['op1', 'op2', 'op5', 'op6'],
      sopralluogo: { data: gg(-80), tecnico: 'Ing. Paola Rossi',
        falde: [{ nome: 'Falda est', l: 31, w: 9.6, p: 30 }, { nome: 'Falda ovest', l: 31, w: 9.6, p: 30 }],
        accesso: 'Strada sterrata: verificare il passaggio del camion con gru.',
        degrado: 'Lastre molto degradate, porzioni friabili ai bordi.', note: 'Presenza di animali nel porticato: spostarli prima dell\'inizio.' },
      foto: [{ tipo: 'capannone', label: 'Fienile lato strada' }, { tipo: 'tetto', label: 'Falda est' }, { tipo: 'dettaglio', label: 'Bordo friabile' }] },

    { id: 'C-2026-033', titolo: 'Officina meccanica, copertura e tamponamenti', committente: 'Officine Meccaniche Lambro Srl',
      referente: 'Responsabile di stabilimento, 039 000 4444', indirizzo: 'Viale Industria 77', comune: 'Monza', prov: 'MB', ats: 'ATS Brianza',
      intervento: 'Rimozione di copertura e pannelli di tamponamento in cemento-amianto',
      materiale: 'Lastre ondulate e pannelli piani in cemento-amianto', mq: 950, altezza: 8,
      stato: 'restituibilita', depositato: gg(-110), inizio: gg(-78), durata: 12, importo: 63800,
      squadra: ['op1', 'op3', 'op4', 'op6'],
      sopralluogo: { data: gg(-140), tecnico: 'Ing. Paola Rossi',
        falde: [{ nome: 'Copertura', l: 48, w: 17.5, p: 15 }, { nome: 'Tamponamento ovest', l: 48, w: 2.5, p: 0 }],
        accesso: 'Area esterna recintata.', degrado: 'Lastre erose, nessuna rottura.', note: 'In attesa del certificato di restituibilità.' },
      foto: [{ tipo: 'capannone', label: 'Officina, fronte' }, { tipo: 'tetto', label: 'Copertura' }] },

    { id: 'C-2026-044', titolo: 'Villetta, tettoia e canna fumaria', committente: 'Laura Ferri (privato, nome inventato)',
      referente: 'Committente, 347 000 5555', indirizzo: 'Via Bergamo 112', comune: 'Cesano Maderno', prov: 'MB', ats: 'ATS Brianza',
      intervento: 'Rimozione di tettoia e canna fumaria in cemento-amianto, nuova copertura in pannelli coibentati',
      materiale: 'Lastre ondulate e canna fumaria in cemento-amianto', mq: 86, altezza: 3.4,
      stato: 'sopralluogo', inizio: null, durata: 2, importo: null,
      squadra: [],
      sopralluogo: { data: gg(-2), tecnico: 'Geom. Luca Rossi',
        falde: [{ nome: 'Tettoia falda 1', l: 9.5, w: 4.3, p: 30 }, { nome: 'Tettoia falda 2', l: 9.5, w: 4.3, p: 30 }],
        accesso: 'Giardino privato, accesso pedonale. Gru da strada (occupazione suolo pubblico da chiedere).',
        degrado: 'Lastre ricoperte di muschio, una lastra crepata. Canna fumaria non più in uso.', note: 'Il cliente chiede anche il preventivo per la canna fumaria (circa 6 m).' },
      foto: [{ tipo: 'tetto', label: 'Tettoia, vista dal giardino' }, { tipo: 'dettaglio', label: 'Lastra crepata' }, { tipo: 'canna', label: 'Canna fumaria' }] },

    { id: 'C-2026-042', titolo: 'Laboratorio artigiano, copertura', committente: 'Falegnameria Brianzola Snc (nome inventato)',
      referente: 'Titolare, 0362 000 666', indirizzo: 'Via Volta 5', comune: 'Desio', prov: 'MB', ats: 'ATS Brianza',
      intervento: 'Rimozione copertura in cemento-amianto e nuova copertura con lucernari',
      materiale: 'Lastre ondulate in cemento-amianto (amianto compatto)', mq: 410, altezza: 6,
      stato: 'preventivo', inizio: null, durata: 6, importo: 28600,
      squadra: [],
      sopralluogo: { data: gg(-16), tecnico: 'Ing. Paola Rossi',
        falde: [{ nome: 'Falda nord', l: 24, w: 8.2, p: 25 }, { nome: 'Falda sud', l: 24, w: 8.2, p: 25 }],
        accesso: 'Cortile interno.', degrado: 'Erosione media.', note: 'Preventivo inviato, cliente valuta il bando incentivi.' },
      foto: [{ tipo: 'tetto', label: 'Falda nord' }, { tipo: 'capannone', label: 'Laboratorio' }] },

    { id: 'C-2026-029', titolo: 'Deposito attrezzi comunale', committente: 'Comune (ente inventato)',
      referente: 'Ufficio tecnico comunale', indirizzo: 'Via del Lavoro 2', comune: 'Muggiò', prov: 'MB', ats: 'ATS Brianza',
      intervento: 'Rimozione copertura in cemento-amianto', materiale: 'Lastre ondulate in cemento-amianto', mq: 300, altezza: 5,
      stato: 'chiuso', depositato: gg(-190), inizio: gg(-158), durata: 4, importo: 19800,
      squadra: ['op1', 'op2', 'op3'],
      sopralluogo: { data: gg(-230), tecnico: 'Ing. Paola Rossi', falde: [{ nome: 'Copertura', l: 25, w: 12, p: 10 }],
        accesso: '—', degrado: '—', note: 'Chiuso con certificato di restituibilità.' },
      foto: [{ tipo: 'capannone', label: 'Deposito' }] }
  ];

  var fir = [
    { numero: 'RXB 104552/26', cantiere: 'C-2026-033', data: gg(-84), kgStimati: 6200, kgDestino: null, quarta: null },
    { numero: 'RXB 104553/26', cantiere: 'C-2026-033', data: gg(-80), kgStimati: 5900, kgDestino: 5960, quarta: gg(-61) },
    { numero: 'RXB 104554/26', cantiere: 'C-2026-033', data: gg(-77), kgStimati: 3100, kgDestino: 3045, quarta: gg(-55) },
    { numero: 'RXB 104601/26', cantiere: 'C-2026-035', data: gg(-1), kgStimati: 5400, kgDestino: null, quarta: null },
    { numero: 'RXB 103870/26', cantiere: 'C-2026-029', data: gg(-156), kgStimati: 4700, kgDestino: 4815, quarta: gg(-139) }
  ];

  window.DATI = { operai: operai, cantieri: cantieri, fir: fir };
})();
