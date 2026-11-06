"use strict";
/**
 * Dati finti per vedere l'interfaccia in un normale browser (senza Electron).
 * Se esiste window.orbita (siamo dentro l'app) questo file non fa niente.
 */
(function () {
  if (window.orbita) return;
  const GB = 1024 ** 3, MB = 1024 ** 2;
  const C = {
    giochi: ["Giochi", "#ff9f1c", "◈"], appdata: ["Dati delle app", "#7c8cff", "⚙"],
    protetto: ["Sistema protetto", "#3a4560", "🔒"], aggiornamenti: ["Aggiornamenti Windows", "#ff5d73", "⟳"],
    temp: ["File temporanei e cache", "#00e5a0", "✦"], documenti: ["Documenti e Desktop", "#5ee7ff", "▤"],
    programmi: ["Programmi", "#9b6bff", "▣"], sistema: ["Windows", "#4f7dff", "◆"],
    altro: ["Altro", "#6b7a99", "…"], download: ["Download", "#2ec4ff", "↓"],
    memoria: ["Memoria virtuale", "#9aa7c7", "≋"], media: ["Foto, video e musica", "#ff4fd8", "◉"],
    cestino: ["Cestino", "#ffd23f", "⌫"],
  };
  const cat = (id, gb) => ({ id, byte: gb * GB, nome: C[id][0], colore: C[id][1], icona: C[id][2] });
  const pul = (id, categoria, nome, gb, sic, pre, spieg, extra = {}) =>
    ({ id, categoria, nome, byte: gb * GB, byteCartella: gb * GB, sicurezza: sic, preselezionato: pre,
       spiegazione: spieg, percorsi: ["C:\\..."], tipo: "pulibile", admin: false, ...extra });
  const scan = {
    radice: "C:\\", totale: 951.6 * GB, libero: 294.6 * GB, usato: 657 * GB, letti: 609 * GB,
    file: 776543, cartelle: 205741, errori: 590, durataMs: 26000,
    categorie: [cat("giochi", 444.4), cat("appdata", 38.6), cat("protetto", 47.8), cat("temp", 43.0),
      cat("aggiornamenti", 24.2), cat("documenti", 17.0), cat("programmi", 14.5), cat("sistema", 12.2),
      cat("altro", 9.5), cat("download", 5.8), cat("memoria", 0.05)],
    pulibili: [
      pul("cache_shader", "temp", "Cache grafica dei giochi (NVIDIA, AMD, Intel, DirectX)", 23.9, "sicuro", true,
        "La scheda video salva qui gli effetti grafici dei giochi già \"compilati\". Cresce senza limiti."),
      pul("cache_sviluppo", "temp", "Cache per sviluppatori (npm, pip, yarn)", 11.4, "sicuro", true, "Pacchetti scaricati da npm e pip."),
      pul("cache_browser", "temp", "Cache dei browser (Chrome, Edge, Firefox, Brave, Opera)", 2.2, "sicuro", true, "Copie di immagini e pagine già viste."),
      pul("cache_app", "temp", "Cache di app (Discord, Teams, Spotify, VS Code, Slack)", 0.1, "sicuro", true, "Le app le riscaricano da sole."),
      pul("miniature", "temp", "Anteprime delle immagini", 0.1, "sicuro", true, "Windows le ricrea da solo."),
      pul("crash", "temp", "Rapporti di errore e crash", 0.08, "sicuro", true, "Servono solo ai tecnici."),
      pul("temp_utente", "temp", "File temporanei dell'utente", 0.02, "sicuro", true, "File che i programmi si dimenticano."),
      pul("wu_download", "aggiornamenti", "Aggiornamenti Windows già installati", 0.75, "sicuro", true, "Pacchetti degli aggiornamenti già installati.", { admin: true }),
      pul("winsxs", "aggiornamenti", "Vecchie versioni dei componenti di Windows (WinSxS)", 0, "sicuro", true,
        "Usiamo lo strumento ufficiale di Microsoft (DISM), che toglie solo le versioni superate.", { admin: true, stimaParziale: true, byteCartella: 23.4 * GB }),
    ],
  };
  const cartelle = {
    giochi: [["C:\\Program Files (x86)\\Steam\\steamapps\\common\\HighOnLife2", 92.1], ["C:\\Program Files\\GOG Galaxy\\Games\\Cyberpunk 2077", 78.4],
      ["C:\\Program Files (x86)\\Steam\\steamapps\\common\\God of War Ragnarok", 74.9], ["C:\\XboxGames\\Forza Horizon 5", 61.2]],
    download: [["C:\\Users\\utente\\Downloads", 5.8, true]],
  };
  const lingua = (new URLSearchParams(location.search).get("lang")) || "it";
  async function caricaLingua(cod) {
    // niente eval (la CSP lo vieta): carichiamo i file come script con un "module" finto
    const prendi = (c) => new Promise((ok, ko) => {
      window.module = { exports: {} };
      const s = document.createElement("script");
      s.src = `../src/lingue/${c}.js`;
      s.onload = () => ok(window.module.exports);
      s.onerror = ko;
      document.head.appendChild(s);
    });
    const it = await prendi("it"), en = await prendi("en"), l = await prendi(cod);
    const un = (s) => ({ ...it[s], ...(cod === "it" ? {} : en[s]), ...l[s] });
    return { codice: cod, nomeLingua: l.nomeLingua, ui: un("ui"), categorie: un("categorie"), descrizioni: un("descrizioni"), pulibili: un("pulibili"), cartelle: un("cartelle") };
  }
  let accettato = true; // nella demo del sito il contratto non serve: non si installa niente
  window.orbita = {
    demo: true,
    testi: () => caricaLingua(lingua),
    info: async () => ({ prova: true, admin: false, ia: false, versione: "0.3.0", anno: 2026, lingua,
      lingue: [["en","English"],["it","Italiano"],["es","Español"],["pt","Português"],["de","Deutsch"],["fr","Français"]].map(([codice, nome]) => ({ codice, nome })),
      eulaAccettata: accettato }),
    lingua: async (c) => { location.search = "?lang=" + c; },
    eula: async () => (await fetch(lingua === "it" ? "../legal/EULA_it.txt" : "../legal/EULA_en.txt")).text(),
    accettaEula: async () => { accettato = true; },
    esci: async () => {},
    prezzo: async () => ({ paese: "IT", fascia: "A", importo: 9.99, valuta: "EUR", testo: "9,99 €", lancio: { importo: 4.99, testo: "4,99 €" } }),
    autoStato: async () => ({ attiva: false, giorno: 0, ora: "20:00" }),
    autoAttiva: async () => ({ attiva: true }),
    autoDisattiva: async () => ({ attiva: false }),
    unita: async () => [{ radice: "C:\\", totale: scan.totale, libero: scan.libero }, { radice: "D:\\", totale: 1863 * GB, libero: 902 * GB }],
    scansiona: async () => {
      // come l'app vera: l'anello e le barre si riempiono man mano (giochi e cache prima, poi il resto)
      const cartelleFinte = ["C:\\Program Files (x86)\\Steam\\steamapps\\common", "C:\\Users\\utente\\AppData\\Local\\NVIDIA\\DXCache",
        "C:\\Windows\\WinSxS", "C:\\Users\\utente\\Documents", "C:\\Program Files", "C:\\Users\\utente\\Downloads"];
      const passi = 40;
      for (let i = 1; i <= passi; i++) {
        await new Promise((r) => setTimeout(r, 150));
        const f = i / passi;
        const vivo = scan.categorie.filter((c) => c.id !== "protetto").map((c, k) => {
          const quota = Math.min(1, Math.max(0, f * 1.35 - k * 0.035));
          return { id: c.id, byte: c.byte * quota, colore: c.colore, nome: c.nome };
        });
        const letti = vivo.reduce((t, c) => t + c.byte, 0);
        if (window._prog) window._prog({ file: Math.round(f * scan.file), byte: letti, corrente: cartelleFinte[Math.floor(f * 5.99)], cat: vivo });
      }
      return scan;
    },
    annulla: async () => {},
    categoria: async (id) => ({
      pulibili: scan.pulibili.filter((v) => v.categoria === id),
      cartelle: (cartelle[id] || []).map(([p, gb, s]) => ({ tipo: "cartella", p, byte: gb * GB, soloFile: !!s,
        spiegazione: id === "giochi" ? "Gioco installato. Disinstallalo dal launcher se non ci giochi più." : null })),
      file: id === "download" ? [
        { tipo: "file", p: "C:\\Users\\utente\\Downloads\\Windows11_InsiderPreview.iso", byte: 5.1 * GB, mtime: Date.now() - 300 * 864e5 },
        { tipo: "file", p: "C:\\Users\\utente\\Downloads\\setup_vecchio.exe", byte: 420 * MB, mtime: Date.now() - 120 * 864e5 },
      ] : [],
    }),
    grandi: async () => [],
    pulisci: async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); return { prova: true, liberati: 37.6 * GB, liberatiDisco: 37.6 * GB,
      esiti: [{ nome: "Cache grafica dei giochi", liberati: 23.9 * GB }, { nome: "Cache per sviluppatori", liberati: 11.4 * GB }, { nome: "Cache dei browser", liberati: 2.2 * GB }],
      licenza: { attiva: false, gratuite: 2, usate: 1, rimaste: 1 } }; },
    spiega: async () => null,
    apri: async () => {},
    appInstallate: async () => {},
    licenza: async () => ({ attiva: false, gratuite: 2, usate: 0, rimaste: 2 }),
    attiva: async () => ({ ok: false }),
    onProgresso: (cb) => { window._prog = cb; },
    onPasso: () => {},
  };
})();
