/*
 * Personalizzazione della demo per una singola azienda.
 * Si cambia SOLO questo file (più, se serve, il logo in assets/).
 * Tutti i dati sono inventati: non inserire dati reali di clienti o lavoratori.
 */
window.CONFIG = {
  // Nome mostrato in alto e nell'intestazione dei documenti
  nome: "Coperture Rossi Srl",
  sottotitolo: "Bonifica amianto e coperture",

  // Colore principale (meglio un colore scuro o medio: il testo sopra è bianco)
  colore: "#b4471f",

  // Percorso del logo (SVG o PNG, quadrato). null = iniziali del nome su fondo colorato
  logo: "assets/logo.svg",

  // Dati che finiscono nell'intestazione di piano di lavoro e preventivo (tutti finti)
  sede: "Via dei Mestieri 8, 20851 Lissone (MB)",
  piva: "IT 00000000000",
  telefono: "039 000 0000",
  email: "ufficio@copertura-rossi.example",
  albo: "Albo Gestori Ambientali MI/000000, cat. 10A e 10B (dato fittizio)",
  datoreLavoro: "Mario Rossi",
  responsabileTecnico: "Ing. Paola Rossi",

  // Fornitori abituali, usati per precompilare i moduli (nomi inventati)
  trasportatore: "EcoTrasporti Lombardi Srl (fittizio)",
  impianto: "Impianto di smaltimento Cava Nord (fittizio)",
  laboratorio: "Laboratorio Analisi Ambientali Lario Srl (fittizio)",

  // Chi sta usando l'app nella demo
  utente: { nome: "Giulia", ruolo: "Ufficio tecnico" }
};
