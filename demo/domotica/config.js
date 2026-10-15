/*
 * Personalizzazione della demo per una singola azienda.
 * Si cambia SOLO questo file (più, se serve, il logo in assets/).
 * Per preparare la demo di un'azienda senza copiare la cartella: aziende/<sigla>.js (solo in locale) e il link di genera_link.py (?d=).
 * Tutti i dati sono inventati: non inserire dati reali di clienti.
 */
window.CONFIG = {
  // Nome mostrato in alto e nell'intestazione dei documenti
  nome: "Lario Smart Home Srl",
  sottotitolo: "Domotica, audio-video e sicurezza",

  // Colore principale (meglio un colore scuro o medio: il testo sopra è bianco)
  colore: "#1d5c7a",

  // Percorso del logo (SVG o PNG, quadrato). null = iniziali del nome su fondo colorato
  logo: "assets/logo.svg",

  // Dati che finiscono nell'intestazione di preventivo, rapportino e fascicolo (tutti finti)
  sede: "Via delle Industrie 12, 20900 Monza (MB)",
  piva: "IT 00000000000",
  telefono: "039 000 0000",
  email: "progetti@lario-smarthome.example",
  qualifiche: "KNX Partner, abilitazione DM 37/2008 lettere a) e b) (dati fittizi)",
  titolare: "Stefano Mauri",
  responsabileTecnico: "Ing. Laura Mauri",

  // Tariffe usate da preventivo e rapportini (di esempio)
  tariffaPosa: 48,            // €/h venduti per la posa
  tariffaProgrammazione: 65,  // €/h venduti per programmazione e collaudo
  costoOrario: 29,            // €/h costo interno di un tecnico, per il margine
  dirittoUscita: 60,          // € per gli interventi fuori contratto

  // Fornitori abituali (nomi inventati)
  fornitori: {
    elettrico: "Distribuzione Elettrica Brianza Srl (fittizio)",
    av: "AV Pro Distribuzione Srl (fittizio)",
    sicurezza: "Sicurtec Ingrosso Srl (fittizio)"
  },

  // Chi sta usando l'app nella demo
  utente: { nome: "Elisa", ruolo: "Project manager" }
};
