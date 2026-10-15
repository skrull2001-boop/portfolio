/*
 * Dati della demo: TUTTI INVENTATI (clienti, ville, prezzi, codici articolo).
 * Le date sono relative a oggi, così scadenze e allarmi restano credibili
 * in qualunque giorno si apra la demo.
 */
(function () {
  'use strict';
  var OGGI = new Date();
  OGGI.setHours(0, 0, 0, 0);
  function gg(n) { var d = new Date(OGGI); d.setDate(d.getDate() + n); return d; }
  window.DEMO = { OGGI: OGGI, gg: gg };
  var F = window.CONFIG.fornitori;

  var sistemi = [
    { id: 'knx', nome: 'KNX e luci', breve: 'KNX', colore: '#2f6fb0' },
    { id: 'audio', nome: 'Audio multiroom', breve: 'Audio', colore: '#8a4fb4' },
    { id: 'video', nome: 'Videosorveglianza', breve: 'Video', colore: '#c0571d' },
    { id: 'allarme', nome: 'Antintrusione', breve: 'Allarme', colore: '#b42343' },
    { id: 'rete', nome: 'Rete e Wi-Fi', breve: 'Rete', colore: '#1d7a6a' }
  ];

  // Listino interno: costo d'acquisto, prezzo di vendita, ore di posa. Prezzi e codici di esempio.
  var catalogo = [
    { id: 'k-alim', cod: 'MDT-ALI640', marca: 'MDT', desc: 'Alimentatore KNX 640 mA con bobina', sis: 'knx', costo: 128, prezzo: 189, ore: 0.5, forn: 'elettrico' },
    { id: 'k-att8', cod: 'MDT-AKS0816', marca: 'MDT', desc: 'Attuatore KNX 8 canali 16 A', sis: 'knx', costo: 180, prezzo: 265, ore: 0.6, forn: 'elettrico' },
    { id: 'k-dim4', cod: 'MDT-AKD0424', marca: 'MDT', desc: 'Attuatore dimmer KNX 4 canali', sis: 'knx', costo: 290, prezzo: 420, ore: 0.6, forn: 'elettrico' },
    { id: 'k-tapp', cod: 'MDT-JAL0410', marca: 'MDT', desc: 'Attuatore tapparelle KNX 4 canali', sis: 'knx', costo: 170, prezzo: 250, ore: 0.6, forn: 'elettrico' },
    { id: 'k-puls', cod: 'GIR-TS4LED', marca: 'Gira', desc: 'Pulsantiera KNX 4 tasti con LED', sis: 'knx', costo: 95, prezzo: 148, ore: 0.4, forn: 'elettrico' },
    { id: 'k-term', cod: 'EKX-TH-DSP', marca: 'Ekinex', desc: 'Termostato KNX con display', sis: 'knx', costo: 160, prezzo: 235, ore: 0.5, forn: 'elettrico' },
    { id: 'k-sens', cod: 'MDT-SCN-P360', marca: 'MDT', desc: 'Sensore di presenza KNX a soffitto', sis: 'knx', costo: 85, prezzo: 129, ore: 0.4, forn: 'elettrico' },
    { id: 'k-ip', cod: 'MDT-IP-ROUT', marca: 'MDT', desc: 'Interfaccia IP KNX', sis: 'knx', costo: 210, prezzo: 310, ore: 0.5, forn: 'elettrico' },
    { id: 'k-srv', cod: 'GIR-X1-SRV', marca: 'Gira', desc: 'Server di visualizzazione e app per il cliente', sis: 'knx', costo: 690, prezzo: 990, ore: 1, forn: 'elettrico' },
    { id: 'k-cavo', cod: 'CAV-KNX-100', marca: 'Generico', desc: 'Cavo bus KNX, matassa da 100 m', sis: 'knx', costo: 48, prezzo: 72, ore: 0, forn: 'elettrico' },
    { id: 'a-diff', cod: 'SON-IC6-PR', marca: 'Sonance', desc: 'Coppia di diffusori a incasso 6,5"', sis: 'audio', costo: 260, prezzo: 390, ore: 1, forn: 'av' },
    { id: 'a-amp', cod: 'SNS-AMP-G2', marca: 'Sonos', desc: 'Amplificatore streaming multiroom', sis: 'audio', costo: 560, prezzo: 749, ore: 0.8, forn: 'av' },
    { id: 'a-sub', cod: 'SON-SUB-IW10', marca: 'Sonance', desc: 'Subwoofer a incasso 10"', sis: 'audio', costo: 520, prezzo: 760, ore: 1, forn: 'av' },
    { id: 'a-cavo', cod: 'CAV-SPK-100', marca: 'Generico', desc: 'Cavo diffusori 2×2,5 mm², matassa da 100 m', sis: 'audio', costo: 65, prezzo: 95, ore: 0, forn: 'av' },
    { id: 'v-cam', cod: 'HIK-B4-NV', marca: 'Hikvision', desc: 'Telecamera IP bullet 4 MP con visione notturna', sis: 'video', costo: 145, prezzo: 235, ore: 1.2, forn: 'sicurezza' },
    { id: 'v-dome', cod: 'HIK-D4-IR', marca: 'Hikvision', desc: 'Telecamera IP dome 4 MP', sis: 'video', costo: 130, prezzo: 215, ore: 1.2, forn: 'sicurezza' },
    { id: 'v-nvr', cod: 'HIK-NVR8-4T', marca: 'Hikvision', desc: 'Videoregistratore NVR 8 canali PoE, disco 4 TB', sis: 'video', costo: 390, prezzo: 590, ore: 1.5, forn: 'sicurezza' },
    { id: 's-cent', cod: 'KSE-LARES-48', marca: 'Ksenia', desc: 'Centrale antintrusione con comunicatore IP', sis: 'allarme', costo: 520, prezzo: 790, ore: 2, forn: 'sicurezza' },
    { id: 's-tast', cod: 'KSE-ERGO-T', marca: 'Ksenia', desc: 'Tastiera touch di comando', sis: 'allarme', costo: 180, prezzo: 270, ore: 0.5, forn: 'sicurezza' },
    { id: 's-ir', cod: 'KSE-VOL-DT', marca: 'Ksenia', desc: 'Rivelatore volumetrico doppia tecnologia', sis: 'allarme', costo: 48, prezzo: 79, ore: 0.4, forn: 'sicurezza' },
    { id: 's-cont', cod: 'KSE-CTM-RF', marca: 'Ksenia', desc: 'Contatto magnetico radio per infisso', sis: 'allarme', costo: 22, prezzo: 38, ore: 0.2, forn: 'sicurezza' },
    { id: 's-sir', cod: 'KSE-SIR-EXT', marca: 'Ksenia', desc: 'Sirena esterna autoalimentata', sis: 'allarme', costo: 120, prezzo: 185, ore: 0.8, forn: 'sicurezza' },
    { id: 's-batt', cod: 'BAT-12V-7AH', marca: 'Generico', desc: 'Batteria al piombo 12 V 7 Ah', sis: 'allarme', costo: 18, prezzo: 32, ore: 0.1, forn: 'sicurezza' },
    { id: 'r-gw', cod: 'UBQ-UCG-ULT', marca: 'Ubiquiti', desc: 'Router e firewall', sis: 'rete', costo: 260, prezzo: 380, ore: 1, forn: 'elettrico' },
    { id: 'r-sw', cod: 'UBQ-USW-16P', marca: 'Ubiquiti', desc: 'Switch gestito 16 porte PoE', sis: 'rete', costo: 330, prezzo: 480, ore: 1, forn: 'elettrico' },
    { id: 'r-ap', cod: 'UBQ-U6-PRO', marca: 'Ubiquiti', desc: 'Access point Wi-Fi 6 a soffitto', sis: 'rete', costo: 120, prezzo: 185, ore: 0.6, forn: 'elettrico' },
    { id: 'r-punto', cod: 'PNT-CAT6', marca: 'Generico', desc: 'Punto rete Cat6 con frutto RJ45', sis: 'rete', costo: 18, prezzo: 45, ore: 0.7, forn: 'elettrico' },
    { id: 'r-rack', cod: 'RCK-12U-PP', marca: 'Generico', desc: 'Armadio rack 19" 12U con patch panel', sis: 'rete', costo: 210, prezzo: 320, ore: 2, forn: 'elettrico' },
    { id: 'r-ups', cod: 'UPS-1500-LI', marca: 'Generico', desc: 'Gruppo di continuità 1500 VA', sis: 'rete', costo: 240, prezzo: 350, ore: 0.5, forn: 'elettrico' },
    { id: 'r-cavo', cod: 'CAV-CAT6-305', marca: 'Generico', desc: 'Cavo Cat6, matassa da 305 m', sis: 'rete', costo: 115, prezzo: 170, ore: 0, forn: 'elettrico' }
  ];

  var tecnici = [
    { id: 't1', nome: 'Marco Fumagalli', ruolo: 'Programmatore KNX', tel: '333 000 0201' },
    { id: 't2', nome: 'Luca Brivio', ruolo: 'Tecnico audio-video', tel: '333 000 0202' },
    { id: 't3', nome: 'Simone Galbiati', ruolo: 'Reti e videosorveglianza', tel: '333 000 0203' },
    { id: 't4', nome: 'Paolo Arosio', ruolo: 'Installatore', tel: '333 000 0204' }
  ];

  // stanza: nome, piano, livello per KNX, audio, video, allarme, rete (0 = niente, 1 = base, 2 = plus)
  function st(nome, piano, k, a, v, s, r) { return { nome: nome, piano: piano, liv: { knx: k, audio: a, video: v, allarme: s, rete: r } }; }

  var progetti = [
    { id: 'P-2026-014', titolo: 'Villa sul lago, Tremezzina', cliente: 'Famiglia Ricci (nome inventato)', referente: 'Cliente, 347 000 1414', architetto: 'Studio di architettura Lario (fittizio)',
      indirizzo: 'Via Regina 41', comune: 'Tremezzina', prov: 'CO', stato: 'programmazione', inizio: gg(-128), installazione: gg(-60), consegna: gg(12), tecnici: ['t1', 't2', 't3'],
      stanze: [st('Ingresso', 'PT', 1, 0, 1, 2, 0), st('Soggiorno', 'PT', 2, 2, 0, 2, 1), st('Cucina', 'PT', 2, 1, 0, 1, 1), st('Studio', 'PT', 1, 1, 0, 1, 2), st('Camera padronale', 'P1', 2, 1, 0, 1, 1),
        st('Bagno padronale', 'P1', 1, 1, 0, 0, 0), st('Camera ospiti', 'P1', 1, 0, 0, 1, 1), st('Taverna e cinema', 'PS', 2, 2, 0, 1, 2), st('Esterno e darsena', 'Est.', 1, 1, 2, 1, 1)],
      avanz: { knx: 85, audio: 70, video: 100, allarme: 90, rete: 100 }, mat: {}, contratto: null,
      note: 'Il cliente vuole le scene "cinema" e "rientro dalla barca" pronte per la consegna. Accesso con chiave dal custode.',
      foto: [{ tipo: 'villa', label: 'Fronte lago' }, { tipo: 'quadro', label: 'Quadro domotico PT' }, { tipo: 'rack', label: 'Rack locale tecnico' }, { tipo: 'stanza', label: 'Taverna, diffusori' }, { tipo: 'telecamera', label: 'Telecamera darsena' }] },

    { id: 'P-2026-017', titolo: 'Attico, Monza centro', cliente: 'Famiglia Villa (nome inventato)', referente: 'Cliente, 335 000 1717', architetto: 'Arch. Chiara Sangalli (fittizio)',
      indirizzo: 'Via Italia 9', comune: 'Monza', prov: 'MB', stato: 'installazione', inizio: gg(-46), installazione: gg(-9), consegna: gg(30), tecnici: ['t1', 't4'],
      stanze: [st('Ingresso', 'P5', 1, 0, 1, 2, 0), st('Living', 'P5', 2, 2, 0, 1, 1), st('Cucina', 'P5', 1, 1, 0, 1, 1), st('Camera', 'P5', 2, 1, 0, 1, 1), st('Cameretta', 'P5', 1, 0, 0, 1, 1), st('Terrazzo', 'P5', 1, 1, 1, 1, 1)],
      avanz: { knx: 40, audio: 20, video: 60, allarme: 30, rete: 80 }, mat: { 's-cent': { ordine: 'OF-2026-115' }, 's-ir': { ordine: 'OF-2026-115' } }, contratto: null,
      note: 'Lavori solo dalle 9 alle 17, ascensore condominiale da prenotare con l\'amministratore.',
      foto: [{ tipo: 'cantiere', label: 'Living, scatole incassate' }, { tipo: 'quadro', label: 'Quadro in posa' }, { tipo: 'stanza', label: 'Living, controsoffitto' }] },

    { id: 'P-2026-019', titolo: 'Villa con piscina, Carate Brianza', cliente: 'Famiglia Molteni (nome inventato)', referente: 'Cliente, 339 000 1919', architetto: 'Studio Tecnico Brianza (fittizio)',
      indirizzo: 'Via dei Colli 3', comune: 'Carate Brianza', prov: 'MB', stato: 'predisposizione', inizio: gg(-20), installazione: gg(25), consegna: gg(70), tecnici: ['t4', 't3'],
      stanze: [st('Ingresso', 'PT', 1, 0, 1, 2, 0), st('Soggiorno', 'PT', 2, 2, 0, 2, 1), st('Cucina', 'PT', 2, 1, 0, 1, 1), st('Camera padronale', 'P1', 2, 1, 0, 1, 1), st('Camera figli', 'P1', 1, 1, 0, 1, 1),
        st('Studio', 'P1', 1, 0, 0, 1, 2), st('Palestra', 'PS', 1, 1, 0, 1, 1), st('Giardino e piscina', 'Est.', 1, 2, 2, 1, 1)],
      avanz: { knx: 0, audio: 0, video: 0, allarme: 0, rete: 20 },
      mat: { 'k-srv': { ordine: 'OF-2026-118' }, 'k-dim4': { ordine: 'OF-2026-118' }, 'a-diff': { ordine: 'OF-2026-121' }, 'a-amp': { ordine: 'OF-2026-121' }, 'a-sub': { st: 'da ordinare' } }, contratto: null,
      note: 'Tubazioni posate dall\'elettricista del cantiere: verificare i diametri verso il locale tecnico prima della chiusura dei massetti.',
      foto: [{ tipo: 'cantiere', label: 'Soggiorno, tubazioni' }, { tipo: 'villa', label: 'Villa in costruzione' }, { tipo: 'cantiere', label: 'Locale tecnico' }] },

    { id: 'P-2026-022', titolo: 'Villa storica, Erba', cliente: 'Famiglia Corti (nome inventato)', referente: 'Cliente, 348 000 2222', architetto: 'Studio Restauri Prealpi (fittizio)',
      indirizzo: 'Via Volta 18', comune: 'Erba', prov: 'CO', stato: 'accettato', inizio: gg(10), installazione: gg(40), consegna: gg(95), tecnici: ['t1', 't4'],
      stanze: [st('Ingresso', 'PT', 1, 0, 1, 1, 0), st('Salone', 'PT', 2, 2, 0, 1, 1), st('Sala da pranzo', 'PT', 2, 1, 0, 1, 0), st('Cucina', 'PT', 1, 1, 0, 1, 1),
        st('Camera padronale', 'P1', 2, 1, 0, 1, 1), st('Biblioteca', 'P1', 1, 1, 0, 1, 2), st('Parco', 'Est.', 1, 0, 2, 1, 1)],
      avanz: { knx: 0, audio: 0, video: 0, allarme: 0, rete: 0 }, mat: {}, contratto: null,
      note: 'Edificio vincolato: niente tracce sui soffitti affrescati, solo pulsantiere radio dove indicato dall\'architetto.',
      foto: [{ tipo: 'villa', label: 'Facciata' }, { tipo: 'stanza', label: 'Salone' }] },

    { id: 'P-2026-024', titolo: 'Villa nuova costruzione, Arcore', cliente: 'Famiglia Brambilla (nome inventato)', referente: 'Cliente, 340 000 2424', architetto: 'Arch. Davide Riva (fittizio)',
      indirizzo: 'Via Monte Grappa 27', comune: 'Arcore', prov: 'MB', stato: 'preventivo', inizio: null, installazione: null, consegna: null, tecnici: [],
      stanze: [st('Ingresso', 'PT', 1, 0, 1, 2, 0), st('Soggiorno', 'PT', 2, 2, 0, 2, 1), st('Cucina', 'PT', 2, 1, 0, 1, 1), st('Studio', 'PT', 1, 1, 0, 1, 2), st('Camera padronale', 'P1', 2, 1, 0, 1, 1),
        st('Bagno padronale', 'P1', 1, 1, 0, 0, 0), st('Camera 2', 'P1', 1, 0, 0, 1, 1), st('Camera 3', 'P1', 1, 0, 0, 1, 1), st('Taverna', 'PS', 2, 2, 0, 1, 1), st('Giardino', 'Est.', 1, 1, 2, 1, 1)],
      avanz: { knx: 0, audio: 0, video: 0, allarme: 0, rete: 0 }, mat: {}, contratto: null,
      note: 'Sopralluogo sulle tavole dell\'architetto. Il cliente chiede una versione "base" e una "completa" da confrontare.',
      foto: [{ tipo: 'cantiere', label: 'Piano terra al grezzo' }, { tipo: 'villa', label: 'Rendering facciata' }] },

    { id: 'P-2026-025', titolo: 'Casa vacanze, Bellagio', cliente: 'Famiglia Weber (nome inventato)', referente: 'Cliente (estero), via email', architetto: '—',
      indirizzo: 'Salita Serbelloni 6', comune: 'Bellagio', prov: 'CO', stato: 'preventivo', inizio: null, installazione: null, consegna: null, tecnici: [],
      stanze: [st('Living', 'PT', 1, 1, 0, 1, 1), st('Cucina', 'PT', 1, 0, 0, 1, 0), st('Camera', 'P1', 1, 1, 0, 1, 1), st('Camera ospiti', 'P1', 1, 0, 0, 1, 0), st('Terrazza', 'Est.', 1, 1, 1, 1, 1)],
      avanz: { knx: 0, audio: 0, video: 0, allarme: 0, rete: 0 }, mat: {}, contratto: null,
      note: 'Casa abitata solo d\'estate: priorità a videosorveglianza e controllo remoto.',
      foto: [{ tipo: 'villa', label: 'Vista dal lago' }] },

    { id: 'P-2025-031', titolo: 'Villa in collina, Lesmo', cliente: 'Famiglia Ferrario (nome inventato)', referente: 'Cliente, 333 000 3131', architetto: 'Studio di architettura Lario (fittizio)',
      indirizzo: 'Via Peregallo 15', comune: 'Lesmo', prov: 'MB', stato: 'assistenza', inizio: gg(-420), installazione: gg(-330), consegna: gg(-260), tecnici: ['t1', 't2', 't3'],
      stanze: [st('Ingresso', 'PT', 1, 0, 1, 2, 0), st('Soggiorno', 'PT', 2, 2, 0, 2, 1), st('Cucina', 'PT', 2, 1, 0, 1, 1), st('Camera padronale', 'P1', 2, 1, 0, 1, 1), st('Camera figli', 'P1', 1, 1, 0, 1, 1), st('Giardino', 'Est.', 1, 1, 2, 1, 1)],
      avanz: { knx: 100, audio: 100, video: 100, allarme: 100, rete: 100 }, mat: {}, contratto: 'CM-2025-011',
      note: 'Impianto consegnato. Contratto Premium con monitoraggio remoto.',
      foto: [{ tipo: 'villa', label: 'Villa' }, { tipo: 'rack', label: 'Rack' }, { tipo: 'telecamera', label: 'Telecamera cancello' }] },

    { id: 'P-2025-027', titolo: 'Villa liberty, Cernobbio', cliente: 'Famiglia Nava (nome inventato)', referente: 'Custode, 331 000 2727', architetto: '—',
      indirizzo: 'Via Regina 102', comune: 'Cernobbio', prov: 'CO', stato: 'assistenza', inizio: gg(-300), installazione: gg(-200), consegna: gg(-95), tecnici: ['t3', 't4'],
      stanze: [st('Ingresso', 'PT', 1, 0, 1, 2, 0), st('Salone', 'PT', 2, 1, 0, 1, 1), st('Cucina', 'PT', 1, 0, 0, 1, 1), st('Camere', 'P1', 1, 1, 0, 1, 1), st('Parco e cancello', 'Est.', 1, 0, 2, 1, 1)],
      avanz: { knx: 100, audio: 100, video: 100, allarme: 100, rete: 100 }, mat: {}, contratto: null,
      note: 'Consegnato senza contratto di manutenzione: il cliente aveva chiesto di pensarci dopo l\'estate.',
      foto: [{ tipo: 'villa', label: 'Villa liberty' }, { tipo: 'telecamera', label: 'Cancello' }] }
  ];

  // Ordini ai fornitori. ricevuti = quantità già arrivate con DDT
  var ordini = [
    { id: 'OF-2026-110', forn: 'elettrico', data: gg(-16), progetto: null, stato: 'ricevuto', consegna: gg(-9), ddt: 'DDT 7781 del ' + gg(-9).toLocaleDateString('it-IT'), righe: [{ art: 'r-ap', q: 10, ricevuti: 10 }, { art: 'r-cavo', q: 2, ricevuti: 2 }] },
    { id: 'OF-2026-115', forn: 'sicurezza', data: gg(-12), progetto: 'P-2026-017', stato: 'confermato', consegna: gg(-2), ddt: null, righe: [{ art: 's-cent', q: 1, ricevuti: 0 }, { art: 's-ir', q: 6, ricevuti: 0 }] },
    { id: 'OF-2026-118', forn: 'elettrico', data: gg(-7), progetto: 'P-2026-019', stato: 'confermato', consegna: gg(1), ddt: null, righe: [{ art: 'k-srv', q: 1, ricevuti: 0 }, { art: 'k-dim4', q: 3, ricevuti: 0 }] },
    { id: 'OF-2026-121', forn: 'av', data: gg(-5), progetto: 'P-2026-019', stato: 'inviato', consegna: null, ddt: null, righe: [{ art: 'a-diff', q: 6, ricevuti: 0 }, { art: 'a-amp', q: 3, ricevuti: 0 }] }
  ];

  // Magazzino: giacenza fisica e scorta minima
  var magazzino = {
    'k-alim': [3, 1], 'k-att8': [9, 3], 'k-dim4': [2, 2], 'k-tapp': [6, 2], 'k-puls': [34, 10], 'k-term': [7, 3], 'k-sens': [8, 3], 'k-ip': [3, 1], 'k-srv': [0, 1], 'k-cavo': [6, 2],
    'a-diff': [4, 2], 'a-amp': [2, 1], 'a-sub': [0, 0], 'a-cavo': [3, 1],
    'v-cam': [11, 4], 'v-dome': [5, 2], 'v-nvr': [2, 1],
    's-cent': [0, 1], 's-tast': [3, 1], 's-ir': [3, 6], 's-cont': [40, 15], 's-sir': [3, 1], 's-batt': [4, 12],
    'r-gw': [2, 1], 'r-sw': [3, 1], 'r-ap': [12, 4], 'r-punto': [60, 20], 'r-rack': [2, 1], 'r-ups': [1, 1], 'r-cavo': [3, 1]
  };

  // Contratti di manutenzione. scadTecniche = rinnovi licenze, batterie, firmware
  var contratti = [
    { id: 'CM-2025-011', cliente: 'Famiglia Ferrario (nome inventato)', comune: 'Lesmo', progetto: 'P-2025-031', impianto: 'KNX, audio multiroom, video, allarme, rete', valore: 46500, livello: 'Premium', canone: 2900,
      inizio: gg(-225), scad: gg(140), visiteFatte: 2, oreUsate: 4, prossimaVisita: gg(19),
      scadTecniche: [['Licenza accesso remoto al server KNX', gg(140)], ['Batterie dei sensori radio (14 pz)', gg(52)]] },
    { id: 'CM-2024-006', cliente: 'Famiglia Conti (nome inventato)', comune: 'Monza', progetto: null, impianto: 'KNX e audio multiroom, appartamento', valore: 21800, livello: 'Base', canone: 690,
      inizio: gg(-373), scad: gg(-8), visiteFatte: 1, oreUsate: 0, prossimaVisita: null,
      scadTecniche: [['Firmware server di visualizzazione', gg(-30)]] },
    { id: 'CM-2024-009', cliente: 'Famiglia Galli (nome inventato)', comune: 'Besana in Brianza', progetto: null, impianto: 'KNX, video, allarme', valore: 31200, livello: 'Plus', canone: 1390,
      inizio: gg(-344), scad: gg(21), visiteFatte: 1, oreUsate: 3, prossimaVisita: gg(6),
      scadTecniche: [['Batterie centrale e sirena', gg(9)], ['Disco del videoregistratore (5 anni)', gg(400)]] },
    { id: 'CM-2024-012', cliente: 'Villa Rosales (nome inventato)', comune: 'Como', progetto: null, impianto: 'KNX, audio, video, allarme, rete', valore: 58900, livello: 'Premium', canone: 3400,
      inizio: gg(-317), scad: gg(48), visiteFatte: 2, oreUsate: 7, prossimaVisita: gg(27),
      scadTecniche: [['Licenza accesso remoto', gg(48)], ['Batterie dei sensori radio (22 pz)', gg(33)]] },
    { id: 'CM-2025-003', cliente: 'Famiglia Pirovano (nome inventato)', comune: 'Vimercate', progetto: null, impianto: 'KNX e rete', valore: 24600, livello: 'Plus', canone: 1190,
      inizio: gg(-165), scad: gg(200), visiteFatte: 1, oreUsate: 1, prossimaVisita: gg(44), scadTecniche: [] },
    { id: 'CM-2025-007', cliente: 'Famiglia Longoni (nome inventato)', comune: 'Seregno', progetto: null, impianto: 'Video e allarme', valore: 9800, livello: 'Base', canone: 590,
      inizio: gg(-290), scad: gg(75), visiteFatte: 0, oreUsate: 0, prossimaVisita: gg(35), scadTecniche: [['Batterie centrale', gg(75)]] },
    { id: 'CM-2025-015', cliente: 'Famiglia Cattaneo (nome inventato)', comune: 'Lecco', progetto: null, impianto: 'KNX, audio, rete', valore: 33400, livello: 'Plus', canone: 1450,
      inizio: gg(-105), scad: gg(260), visiteFatte: 0, oreUsate: 2, prossimaVisita: gg(80), scadTecniche: [] },
    { id: 'CM-2025-019', cliente: 'Famiglia Sormani (nome inventato)', comune: 'Cantù', progetto: null, impianto: 'KNX e allarme', valore: 18900, livello: 'Base', canone: 650,
      inizio: gg(-55), scad: gg(310), visiteFatte: 0, oreUsate: 0, prossimaVisita: gg(120), scadTecniche: [] }
  ];

  // Ticket di assistenza
  var ticket = [
    { id: 'T-0416', titolo: 'Il videocitofono non squilla più sui telefoni', cliente: 'Villa Rosales (nome inventato)', comune: 'Como', indirizzo: 'Via per Cernobbio 22', contratto: 'CM-2024-012', progetto: null,
      canale: 'App cliente', priorita: 'alta', stato: 'nuovo', aperto: gg(-1), data: null, tecnico: null, sistema: 'rete',
      messaggio: 'Da ieri sera quando suonano al cancello non arriva più la chiamata sui nostri telefoni, solo sul monitor in cucina.' },
    { id: 'T-0418', titolo: 'Telecamere esterne offline dopo il temporale', cliente: 'Famiglia Ferrario (nome inventato)', comune: 'Lesmo', indirizzo: 'Via Peregallo 15', contratto: 'CM-2025-011', progetto: 'P-2025-031',
      canale: 'Monitoraggio remoto', priorita: 'alta', stato: 'pianificato', aperto: gg(-1), data: gg(0), tecnico: 't3', sistema: 'video',
      messaggio: 'Allarme automatico: 2 telecamere su 5 non raggiungibili dalle 23:40. Switch PoE del garage senza risposta.' },
    { id: 'T-0417', titolo: 'Il Sonos della cucina non si collega', cliente: 'Famiglia Conti (nome inventato)', comune: 'Monza', indirizzo: 'Viale Cesare Battisti 30', contratto: 'CM-2024-006', progetto: null,
      canale: 'WhatsApp', priorita: 'media', stato: 'nuovo', aperto: gg(-1), data: null, tecnico: null, sistema: 'audio',
      messaggio: 'Buongiorno, da qualche giorno la musica in cucina non parte più dall\'app. Nelle altre stanze funziona.' },
    { id: 'T-0414', titolo: 'Allarme: zona 4 in guasto', cliente: 'Famiglia Nava (nome inventato)', comune: 'Cernobbio', indirizzo: 'Via Regina 102', contratto: null, progetto: 'P-2025-027',
      canale: 'Telefono', priorita: 'alta', stato: 'nuovo', aperto: gg(-2), data: null, tecnico: null, sistema: 'allarme',
      messaggio: 'Il custode segnala che la tastiera mostra "guasto zona 4" e non si riesce a inserire l\'allarme totale.' },
    { id: 'T-0412', titolo: 'Tapparelle della camera non rispondono', cliente: 'Famiglia Galli (nome inventato)', comune: 'Besana in Brianza', indirizzo: 'Via Viarana 7', contratto: 'CM-2024-009', progetto: null,
      canale: 'Telefono', priorita: 'media', stato: 'pianificato', aperto: gg(-3), data: gg(2), tecnico: 't1', sistema: 'knx',
      messaggio: 'Le due tapparelle della camera matrimoniale non si muovono né dal pulsante né dall\'app.' },
    { id: 'T-0415', titolo: 'Nuovo scenario "cena" in soggiorno', cliente: 'Famiglia Ferrario (nome inventato)', comune: 'Lesmo', indirizzo: 'Via Peregallo 15', contratto: 'CM-2025-011', progetto: 'P-2025-031',
      canale: 'App cliente', priorita: 'bassa', stato: 'pianificato', aperto: gg(-4), data: gg(4), tecnico: 't1', sistema: 'knx',
      messaggio: 'Vorremmo un tasto che abbassa le luci del soggiorno al 30%, accende la musica e chiude le tende.' },
    { id: 'T-0409', titolo: 'Wi-Fi debole in taverna', cliente: 'Famiglia Pirovano (nome inventato)', comune: 'Vimercate', indirizzo: 'Via Cavour 51', contratto: 'CM-2025-003', progetto: null,
      canale: 'Email', priorita: 'media', stato: 'chiuso', aperto: gg(-9), data: gg(-6), chiuso: gg(-6), tecnico: 't3', sistema: 'rete', ore: 1.5,
      messaggio: 'In taverna il Wi-Fi cade spesso, soprattutto la sera.', attivita: 'Spostato l\'access point della taverna sul nuovo punto rete e aggiornato il firmware. Segnale verificato in tutta la taverna.' },
    { id: 'T-0405', titolo: 'Cancello: telecamera sfocata', cliente: 'Famiglia Nava (nome inventato)', comune: 'Cernobbio', indirizzo: 'Via Regina 102', contratto: null, progetto: 'P-2025-027',
      canale: 'Telefono', priorita: 'bassa', stato: 'chiuso', aperto: gg(-15), data: gg(-12), chiuso: gg(-12), tecnico: 't3', sistema: 'video', ore: 1,
      messaggio: 'L\'immagine della telecamera del cancello è sfocata.', attivita: 'Pulita la cupola e rifatta la messa a fuoco. Fuori contratto: addebitate uscita e un\'ora.' }
  ];

  window.DATI = { sistemi: sistemi, catalogo: catalogo, tecnici: tecnici, progetti: progetti, ordini: ordini, magazzino: magazzino, contratti: contratti, ticket: ticket, F: F };
})();
