/*
 * Personalizzazione della demo.
 * Questo file contiene i valori di base (azienda inventata). Per un'azienda vera
 * non si tocca: si crea aziende/<nome>.js e si apre index.html?a=<nome>.
 * Tutti i dati sono inventati: non inserire dati reali di clienti o armatori.
 */
window.CONFIG = {
  // Nome mostrato in alto, nella pagina dell'armatore e nell'intestazione dei documenti
  nome: "Cantiere Nautico del Lago",
  sottotitolo: "Rimessaggio e assistenza",

  // Colore principale (meglio un colore scuro o medio: il testo sopra è bianco)
  colore: "#1d5c8a",

  // Percorso del logo (SVG o PNG, quadrato). null = iniziali del nome su fondo colorato
  logo: "assets/logo.svg",

  // Lago, usato nei testi
  lago: "Lago d'Iseo",

  // Dati dell'intestazione di preventivi e solleciti (tutti finti)
  sede: "Via del Porto 4, 25049 Iseo (BS)",
  piva: "IT 00000000000",
  telefono: "030 000 0000",
  email: "ufficio@cantiere-lago.example",
  iban: "IT00 X000 0000 0000 0000 0000 000",
  titolare: "Franco Bianchi",

  // Tariffa oraria della manodopera nei preventivi (€/ora, IVA esclusa)
  tariffaOraria: 62,

  // Risorse per vari e alaggi: portata in tonnellate e durata di un'operazione in minuti
  risorse: {
    gru: { nome: "Gru", dettaglio: "gru a bandiera", portata: 10, durata: 60 },
    scivolo: { nome: "Scivolo", dettaglio: "scivolo con carrello e trattore", portata: 3.5, durata: 30 }
  },

  // Aree e numero di posti barca
  aree: [
    { id: "A", nome: "Capannone A", tipo: "coperto", posti: 20 },
    { id: "B", nome: "Capannone B", tipo: "coperto", posti: 16 },
    { id: "P", nome: "Piazzale", tipo: "aperto", posti: 24 },
    { id: "W", nome: "Pontile", tipo: "acqua", posti: 18 }
  ],

  // Chi sta usando l'app nella demo
  utente: { nome: "Sara", ruolo: "Ufficio e accettazione" }
};
