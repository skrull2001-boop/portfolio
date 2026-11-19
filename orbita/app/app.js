"use strict";
/* Orbita: interfaccia. Copyright (c) 2026 Andrea Vacchini. All rights reserved.
   Parla col processo principale solo tramite window.orbita; tutti i testi
   arrivano già tradotti (src/lingue). */

const O = window.orbita;
const $ = (id) => document.getElementById(id);
const GB = 1024 ** 3, MB = 1024 ** 2;
const CIRC = 2 * Math.PI * 205;      // anello delle categorie
const CIRC_R = 2 * Math.PI * 150;    // anello verde "recuperabile"

let T = null; // testi
const t = (k, v = {}) => String((T && T.ui[k]) ?? k).replace(/\{(\w+)\}/g, (m, x) => (x in v ? v[x] : m));

const stato = {
  info: { prova: false, ia: false },
  radice: "C:\\",
  unita: [],
  scan: null,
  vista: "consigliata",
  selezione: new Map(),   // chiave -> { richiesta, byte, stima }
  licenza: null,
  grandi: [],
  inScansione: false,
  vecchi: { byte: 0, n: 0, lista: [] },   // file personali non toccati da almeno 1 mese
  mesi: 6,                                // periodo scelto: "inutilizzati da più di N mesi"
  gruppiAperti: new Set(),                // gruppi per tipo di file aperti dall'utente
  fileGruppi: {},                         // gruppo -> file mostrati adesso (per "Seleziona tutti" del gruppo)
  pulitiOra: new Set(),                   // voci appena pulite: mostrano "✓ Pulito" e valgono 0
};

// ---------------------------------------------------------------- utilità

function fmt(b, decimali) {
  const loc = (T && T.codice) || "en";
  if (!b || b < 0) return "0 MB";
  if (b >= GB) {
    const v = b / GB;
    return v.toLocaleString(loc, { maximumFractionDigits: decimali ?? (v >= 100 ? 0 : 1) }) + " GB";
  }
  if (b >= MB) return Math.round(b / MB).toLocaleString(loc) + " MB";
  return Math.max(1, Math.round(b / 1024)) + " KB";
}
const perc = (a, b) => ((a / b) * 100).toLocaleString((T && T.codice) || "en", { maximumFractionDigits: 1 });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nomeFile = (p) => p.split("\\").filter(Boolean).pop() || p;
function eta(ms) {
  if (!ms) return "";
  const giorni = (Date.now() - ms) / 864e5;
  if (giorni < 30) return t("recente");
  if (giorni < 365) return t("mesi", { n: Math.round(giorni / 30) });
  return t("anni", { n: (giorni / 365).toLocaleString(T.codice, { maximumFractionDigits: 1 }) });
}
const GIORNO = 864e5;
const MESI_SCELTA = [1, 2, 3, 4, 6, 9, 12, 18, 24, 36];
const TIPI_GRUPPO = [["video", "🎬", "tipoVideo"], ["foto", "🖼", "tipoFoto"], ["musica", "♫", "tipoMusica"],
  ["documenti", "📄", "tipoDocumenti"], ["archivi", "📦", "tipoArchivi"], ["altri", "◇", "tipoAltri"]];
/** File vecchi del periodo scelto (compresi gli importanti, che si mostrano ma non si selezionano da soli). */
const vecchiDelPeriodo = () => { const lim = Date.now() - stato.mesi * 30 * GIORNO; return stato.vecchi.lista.filter((f) => f.mtime && f.mtime < lim); };
const vecchiSelezionabili = () => vecchiDelPeriodo().filter((f) => !f.importante);
const byteVecchi = () => vecchiSelezionabili().reduce((x, f) => x + f.byte, 0);
const selezionaFile = (f) => seleziona(chiaveF(f), { tipo: "file", p: f.p }, f.byte, false);
const catDi = (id) => (stato.scan && stato.scan.categorie.find((c) => c.id === id)) || null;

function applicaTesti() {
  document.documentElement.lang = T.codice;
  document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll("[data-t-title]").forEach((el) => { el.title = t(el.dataset.tTitle); el.setAttribute("aria-label", el.title); });
}

// ---------------------------------------------------------------- avvio

// Tema: parte chiaro; il pulsante in alto passa all'Ossidiana scuro. Ricordato tra un avvio e l'altro.
const TEMA_SCURO = "ossidiana";
function applicaTema(tema) {
  document.documentElement.dataset.tema = tema;
  try { localStorage.setItem("orbita-tema", tema); } catch { /* niente */ }
  const css = getComputedStyle(document.documentElement);
  const sfondo = css.getPropertyValue("--sfondo").trim(), simboli = css.getPropertyValue("--testo2").trim();
  if (window.orbita && window.orbita.tema) window.orbita.tema(sfondo, simboli).catch(() => {});
}
(() => {
  let salvato = null;
  try { salvato = localStorage.getItem("orbita-tema"); } catch { /* niente */ }
  applicaTema(salvato === TEMA_SCURO ? TEMA_SCURO : "chiaro");
})();

async function avvio() {
  T = await O.testi();
  stato.info = await O.info();
  applicaTesti();
  $("badgeProva").hidden = !stato.info.prova;
  $("centroEtichetta").textContent = t("disco", { d: "C:" });
  $("centroSotto").textContent = t("premiScansiona");
  hud("pronto");
  stato.licenza = await O.licenza();
  stato.unita = await O.unita();
  disegnaUnita();
  aggiornaPiede();
  O.onProgresso(mostraProgresso);
  O.onPasso((testo) => { const el = $("passo"); if (el) el.textContent = testo; if (stato.suPasso) stato.suPasso(); });
  $("btnScansiona").onclick = () => scansiona(stato.radice);
  $("btnAnnulla").onclick = () => O.annulla();
  $("btnPulisci").onclick = chiediConferma;
  $("btnIndietro").onclick = () => mostraVista("consigliata");
  $("btnImpostazioni").onclick = mostraImpostazioni;
  $("btnPro").onclick = () => mostraLicenza(true);
  if ($("btnGuida")) $("btnGuida").onclick = () => { if (stato.scan) { mostraVista("consigliata").then(avviaGuida); } };
  aggiornaBottonePro();
  if (!stato.info.eulaAccettata) await mostraContratto(true);
  scansiona(stato.radice);
  controllaAggiornamento();
}

function disegnaUnita() {
  $("unita").innerHTML = stato.unita.map((u) =>
    `<button data-r="${esc(u.radice)}" class="${u.radice === stato.radice ? "attiva" : ""}">
       ${esc(t("unitaLiberi", { d: u.radice.slice(0, 2), l: fmt(u.libero, 0) }))}</button>`).join("");
  $("unita").querySelectorAll("button").forEach((b) => {
    b.onclick = () => { if (stato.inScansione) return; stato.radice = b.dataset.r; disegnaUnita(); scansiona(stato.radice); };
  });
}

// ---------------------------------------------------------------- scansione

async function scansiona(radice, dopoPulizia) {
  if (!dopoPulizia) stato.pulitiOra = new Set();
  stato.inScansione = true;
  stato.scan = null;
  stato.selezione.clear();
  const u = stato.unita.find((x) => x.radice === radice);
  stato.usatoAtteso = u ? u.totale - u.libero : 0;
  stato.totaleAtteso = u ? u.totale : 0;
  $("orbitaWrap").classList.add("in-scansione");
  $("radar").hidden = false;
  $("statoScan").hidden = false;
  ["rUsato", "rRecuperabile", "rLibero"].forEach((id) => { $(id).textContent = "—"; });
  hud("scan");
  mostraProgresso({ file: 0, byte: 0, corrente: radice });
  $("btnScansiona").disabled = true;
  $("btnScansionaTesto").textContent = t("scansioneInCorso");
  $("centroEtichetta").textContent = t("scansioneDi", { d: radice.slice(0, 2) });
  $("centroValore").textContent = "0 GB";
  $("centroSotto").textContent = t("lettiFinora");
  $("settori").innerHTML = "";
  $("legenda").innerHTML = "";
  aggiornaRecuperabile(0);
  aggiornaPiede();
  const r = await O.scansiona(radice);
  stato.inScansione = false;
  $("orbitaWrap").classList.remove("in-scansione");
  $("radar").hidden = true;
  $("statoScan").hidden = true;
  try { stato.unita = await O.unita(); disegnaUnita(); } catch { /* niente */ }
  $("btnScansiona").disabled = false;
  $("btnScansionaTesto").textContent = t("scansionaDiNuovo");
  if (!r || r.annullato) { $("centroSotto").textContent = t("scansioneAnnullata"); hud("pronto"); return; }
  stato.scan = r;
  hud("ok");
  for (const v of r.pulibili) {
    if (stato.pulitiOra.has(v.id)) continue;
    if (v.admin && !stato.info.admin) continue;   // niente richiesta di Windows se non la chiedi tu
    if (v.preselezionato && (v.byte > 0 || v.stimaParziale)) seleziona(chiaveP(v), richiestaP(v), v.byte, v.stimaParziale);
  }
  try { stato.grandi = await O.grandi(); } catch { stato.grandi = []; }
  try { stato.vecchi = (O.vecchi && await O.vecchi()) || { byte: 0, n: 0, lista: [] }; } catch { stato.vecchi = { byte: 0, n: 0, lista: [] }; }
  stato.gruppiAperti = new Set();
  // installer e archivi vecchi nei Download (non da 1 mese: da 6): si spuntano da soli e vanno nel Cestino
  const seiMesi = Date.now() - 180 * GIORNO;
  for (const f of stato.vecchi.lista) if (f.sicuro && f.mtime < seiMesi) selezionaFile(f);
  preparaMesi();
  if (!stato.info.guidaVista && !stato.info.prova) setTimeout(avviaGuida, 900);
  disegnaAnello($("settori").childElementCount > 0);
  disegnaLegenda();
  aggiornaCentro();
  aggiornaRiepilogo();
  aggiornaPiede();
  mostraVista("consigliata");
}

function mostraProgresso(p) {
  const perc = stato.usatoAtteso ? Math.min(99, Math.floor((p.byte / stato.usatoAtteso) * 100)) : 0;
  $("ssPerc").textContent = perc + "%";
  $("ssBarra").style.width = perc + "%";
  $("ssFile").textContent = t("scanFile", { n: p.file.toLocaleString(T.codice) });
  $("ssByte").textContent = stato.usatoAtteso ? t("scanLetti", { l: fmt(p.byte, 0), t: fmt(stato.usatoAtteso, 0) }) : fmt(p.byte);
  // solo le ultime cartelle del percorso: si capisce dove siamo senza un muro di testo
  const pezzi = String(p.corrente || "").split("\\").filter(Boolean);
  $("ssPercorso").textContent = pezzi.length > 3 ? "…\\" + pezzi.slice(-3).join("\\") : (p.corrente || "");
  $("centroValore").textContent = fmt(p.byte, 0);
  if (p.cat) { disegnaAnelloVivo(p.cat); disegnaLegendaViva(p.cat); }
  $("rUsato").textContent = fmt(p.byte, 0);
}

/** Barre a sinistra durante la scansione: categorie vere, crescono man mano. */
function disegnaLegendaViva(cats) {
  const pezzi = cats.filter((c) => c.byte > 50 * MB).sort((a, b) => b.byte - a.byte);
  const max = Math.max(...pezzi.map((c) => c.byte), 1);
  const box = $("legenda");
  for (const c of pezzi) {
    let el = box.querySelector(`[data-id="${c.id}"]`);
    if (!el) {
      el = document.createElement("div");
      el.className = "barra-cat viva";
      el.dataset.id = c.id;
      el.style.setProperty("--c", c.colore);
      el.innerHTML = `<span class="bn"><i></i>${esc(c.nome)}</span><span class="bv"></span><span class="bt"><b></b></span>`;
      box.appendChild(el);
    }
    el.querySelector(".bv").textContent = fmt(c.byte, 0);
    el.querySelector(".bt b").style.width = Math.max(2, (c.byte / max) * 100).toFixed(1) + "%";
  }
  // in ordine di grandezza, senza ricreare gli elementi
  pezzi.forEach((c) => { const el = box.querySelector(`[data-id="${c.id}"]`); if (el) box.appendChild(el); });
}

/**
 * Anello durante la scansione, con i numeri veri: ogni categoria cresce con i
 * byte letti finora, in un tono spento. A fine scansione prende i colori pieni.
 */
function disegnaAnelloVivo(cats) {
  const totale = stato.totaleAtteso || stato.usatoAtteso;
  if (!totale) return;
  const g = $("settori");
  const pezzi = cats.filter((c) => c.byte / totale > 0.002).sort((a, b) => b.byte - a.byte);
  let inizio = 0;
  const visti = new Set();
  for (const c of pezzi) {
    const len = (c.byte / totale) * CIRC;
    const gap = len > 6 ? 2.5 : 0;
    let el = g.querySelector(`[data-id="${c.id}"]`);
    if (!el) {
      el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("class", "settore vivo");
      el.setAttribute("data-id", c.id);
      el.setAttribute("cx", "300"); el.setAttribute("cy", "300"); el.setAttribute("r", "205");
      el.setAttribute("stroke", c.colore);
      el.setAttribute("stroke-dasharray", `0 ${CIRC}`);
      el.setAttribute("stroke-dashoffset", String(-inizio));
      g.appendChild(el);
    }
    el.setAttribute("stroke-dasharray", `${Math.max(0, len - gap)} ${CIRC}`);
    el.setAttribute("stroke-dashoffset", String(-inizio));
    visti.add(c.id);
    inizio += len;
  }
  g.querySelectorAll(".settore.vivo").forEach((el) => { if (!visti.has(el.dataset.id)) el.remove(); });
}

// ---------------------------------------------------------------- anello

function disegnaAnello(daVivo) {
  const s = stato.scan;
  const g = $("settori");
  const totale = s.totale || s.usato || 1;
  const pezzi = s.categorie.filter((c) => c.byte / totale > 0.0015);
  pezzi.push({ id: "libero", byte: s.libero, colore: "#000" });
  let inizio = 0;
  g.innerHTML = pezzi.map((c, i) => {
    const len = (c.byte / totale) * CIRC;
    const gap = len > 6 ? 2.5 : 0;
    // Il valore finale è già nell'attributo: l'animazione CSS parte da zero e,
    // se il browser la salta (finestra in secondo piano), l'anello è comunque giusto.
    const el = `<circle class="settore ${daVivo ? "aggancia" : "entra"} ${c.id === "libero" ? "libero" : ""}" data-id="${c.id}"
      cx="300" cy="300" r="205" stroke="${c.colore}"
      stroke-dasharray="${Math.max(0, len - gap)} ${CIRC}" stroke-dashoffset="${-inizio}"
      style="animation-delay: ${i * 60}ms"/>`;
    inizio += len;
    return el;
  }).join("");
  g.querySelectorAll(".settore:not(.libero)").forEach((el) => {
    el.addEventListener("mousemove", (e) => mostraTooltip(e, el.dataset.id));
    el.addEventListener("mouseleave", () => { $("tooltip").hidden = true; });
    el.addEventListener("click", () => mostraVista(el.dataset.id));
  });
}

function mostraTooltip(e, id) {
  const c = catDi(id);
  if (!c) return;
  const box = $("orbitaWrap").getBoundingClientRect();
  const tt = $("tooltip");
  tt.innerHTML = `<span style="color:${c.colore}">●</span> ${esc(c.nome)}<br><b>${fmt(c.byte)}</b> · ${esc(t("delDisco", { p: perc(c.byte, stato.scan.totale) }))}`;
  tt.style.left = e.clientX - box.left + "px";
  tt.style.top = e.clientY - box.top + "px";
  tt.hidden = false;
}

function disegnaLegenda() {
  const cats = stato.scan.categorie.filter((c) => c.byte > 50 * MB);
  const max = Math.max(...cats.map((c) => c.byte), 1);
  $("legenda").innerHTML = cats.map((c) =>
    `<button type="button" class="barra-cat" data-id="${c.id}" style="--c:${c.colore}">
       <span class="bn"><i></i>${esc(c.nome)}</span><span class="bv">${fmt(c.byte)}</span>
       <span class="bt"><b style="width:${Math.max(2, (c.byte / max) * 100).toFixed(1)}%"></b></span>
     </button>`).join("");
  $("legenda").querySelectorAll(".barra-cat").forEach((el) => { el.onclick = () => mostraVista(el.dataset.id); });
}

/** Riga di stato in alto a destra (stile cruscotto). */
function hud(modo) {
  const el = $("statoHud");
  if (!el) return;
  if (modo === "ok" && stato.scan) {
    el.innerHTML = `<span class="ok">${esc(t("hudOk", { n: stato.scan.file.toLocaleString(T.codice), s: Math.round(stato.scan.durataMs / 1000) }))}</span>`;
  } else if (modo === "scan") {
    el.innerHTML = `<span class="lavoro">${esc(t("hudScan"))}</span>`;
  } else {
    el.textContent = t("hudPronto");
  }
}

function evidenzia(id) {
  const g = $("settori");
  g.classList.toggle("focus", !!id);
  g.querySelectorAll(".settore").forEach((el) => el.classList.toggle("scelto", el.dataset.id === id));
  $("legenda").querySelectorAll(".barra-cat").forEach((el) => el.classList.toggle("scelto", el.dataset.id === id));
}

function aggiornaCentro() {
  const s = stato.scan;
  if (!s) return;
  const c = stato.vista !== "consigliata" ? catDi(stato.vista) : null;
  if (c) {
    $("centroEtichetta").textContent = c.nome;
    $("centroValore").textContent = fmt(c.byte);
    $("centroSotto").textContent = t("delDisco", { p: perc(c.byte, s.totale) });
  } else {
    $("centroEtichetta").textContent = t("disco", { d: s.radice.slice(0, 2) });
    $("centroValore").textContent = fmt(s.libero);
    $("centroSotto").textContent = t("liberiSu", { t: fmt(s.totale, 0) });
  }
}

// sotto 1 MB non conta: dopo una pulizia deve leggersi "0", non "1 KB"
const totaleRecuperabile = () => { const b = stato.scan ? stato.scan.pulibili.filter((v) => !stato.pulitiOra.has(v.id)).reduce((x, v) => x + v.byte, 0) : 0; return b < MB ? 0 : b; };

/** Tutto quello che si può liberare: voci del catalogo non ancora pulite + tutti i file vecchi.
    Mai meno di quanto è già spuntato (la selezione può comprendere file scelti a mano). */
function totaleLiberabile() {
  const sel = [...stato.selezione.values()].reduce((x, s) => x + s.byte, 0);
  return Math.max(totaleRecuperabile() + byteVecchi(), sel);
}

function aggiornaRiepilogo() {
  const s = stato.scan;
  $("rUsato").textContent = fmt(s.usato);
  $("rLibero").textContent = fmt(s.libero);
  $("rRecuperabile").textContent = fmt(totaleLiberabile());
  const rv = $("rVecchi");
  if (rv) rv.textContent = byteVecchi() > 100 * MB ? t("vecchiRecuperabili", { b: fmt(byteVecchi()) }) : "";
}

function aggiornaRecuperabile(byte) {
  const usato = (stato.scan && stato.scan.usato) || 1;
  $("arcoRecuperabile").setAttribute("stroke-dasharray", `${Math.min(1, byte / usato) * CIRC_R} ${CIRC_R}`);
}

// ---------------------------------------------------------------- selezione

const chiaveP = (v) => "p:" + v.id;
const richiestaP = (v) => ({ tipo: "pulibile", id: v.id });
const chiaveF = (f) => "f:" + f.p;
function seleziona(chiave, richiesta, byte, stima) { stato.selezione.set(chiave, { richiesta, byte, stima: !!stima }); }

function aggiornaPiede() {
  const sel = [...stato.selezione.values()];
  const tot = sel.reduce((x, s) => x + s.byte, 0);
  const stime = sel.filter((x) => x.stima).length;
  const fileTuoi = sel.filter((x) => x.richiesta.tipo === "file").reduce((x, s) => x + s.byte, 0);
  $("selTotale").textContent = fmt(tot) + (stime ? " +" : "");
  $("selTesto").textContent = (sel.length === 0 ? t("selNessuna") : sel.length === 1 ? t("selUna") : t("selPiu", { n: sel.length })) +
    (stime ? t("selStima") : "") +
    (fileTuoi ? t("selFile", { b: fmt(fileTuoi) }) : "");
  $("btnPulisci").disabled = !sel.length || !stato.scan;
  aggiornaRecuperabile(tot);
  // il totale "si può liberare" segue la selezione, a sinistra e in cima al pannello
  if (stato.scan) {
    $("rRecuperabile").textContent = fmt(totaleLiberabile());
    if (stato.vista === "consigliata") $("pannelloDim").textContent = fmt(totaleLiberabile());
  }
  const l = stato.licenza;
  if (stato.info.prova) $("gratuite").innerHTML = `${esc(t("provaPiede1"))}<br><b>${esc(t("provaPiede2"))}</b>`;
  else if (l && l.attiva) $("gratuite").innerHTML = `${esc(t("licenzaAttiva"))} <b>${esc(t("attivaParola"))}</b>`;
  else if (l) $("gratuite").innerHTML = `${esc(t("gratuiteRimaste"))}<br><b>${esc(t("diN", { r: l.rimaste, g: l.gratuite }))}</b>`;
}

// ---------------------------------------------------------------- pannello

// categorie fatte di cartelle tecniche: le "Cartelle più pesanti" stanno chiuse in una riga
const CAT_SISTEMA = new Set(["sistema", "aggiornamenti", "programmi", "appdata", "protetto", "memoria", "temp"]);

async function mostraVista(vista) {
  if (!stato.scan) return;
  stato.vista = vista;
  evidenzia(vista === "consigliata" ? null : vista);
  aggiornaCentro();
  $("btnIndietro").hidden = vista === "consigliata";
  const lista = $("lista");
  if (vista === "consigliata") {
    $("pannelloSopra").textContent = t("sezPulizia");
    $("pannelloTitolo").textContent = t("consigliataTitolo");
    $("pannelloDim").textContent = fmt(totaleLiberabile());
    $("pannelloIntro").textContent = t("consigliataIntro");
    const sicure = stato.scan.pulibili.filter((v) => v.sicurezza === "sicuro");
    const valuta = stato.scan.pulibili.filter((v) => v.sicurezza !== "sicuro");
    lista.innerHTML =
      (sicure.length ? `<div class="gruppo">${esc(t("gruppoSicuro"))}</div>` + sicure.map(htmlPulibile).join("") : "") +
      htmlVecchi() +
      (valuta.length ? `<div class="gruppo">${esc(t("gruppoValuta"))}</div>` + valuta.map(htmlPulibile).join("") : "") ||
      `<div class="vuoto">${esc(t("niente"))}</div>`;
  } else {
    const c = catDi(vista);
    $("pannelloSopra").innerHTML = `<span style="color:${c.colore}">●</span> ${esc(t("categoria"))}`;
    $("pannelloTitolo").textContent = c.nome;
    $("pannelloDim").textContent = fmt(c.byte);
    $("pannelloIntro").textContent = (T.descrizioni && T.descrizioni[vista]) || "";
    lista.innerHTML = `<div class="vuoto">${esc(t("carico"))}</div>`;
    const d = await O.categoria(vista);
    if (stato.vista !== vista) return;
    const totCat = c.byte || 1;
    let html = "";
    if (d.pulibili.length) html += `<div class="gruppo">${esc(t("gruppoDaPulire"))}</div>` + d.pulibili.map(htmlPulibile).join("");
    if (vista === "giochi" || vista === "programmi") {
      html += `<div class="gruppo">${esc(t("gruppoDisinstallare"))}</div><div class="voce"><div class="icona-voce">▣</div>
        <div><div class="nome">${esc(t("appInstallate"))}</div><div class="percorso">${esc(t("appInstallatePercorso"))}</div></div>
        <button class="mini" data-azione="app">${esc(t("apri"))}</button></div>`;
    }
    if (d.cartelle.length && CAT_SISTEMA.has(vista)) {
      // nomi tecnici che non dicono niente a nessuno: una riga sola, si apre a richiesta
      const tot = d.cartelle.reduce((x, y) => x + y.byte, 0);
      html += `<div class="gruppo">${esc(t("gruppoCartelle"))}</div>
        <div class="voce gruppo-protetti" data-protetti="1"><div class="icona-voce">📁</div>
        <div><div class="nome">${esc(t("cartelleSistemaTitolo", { n: d.cartelle.length }))}</div><div class="percorso">${esc(t("cartelleSistemaSotto"))}</div></div>
        <div class="dim">${fmt(tot)}</div></div>
        <div class="elenco-protetti" hidden>${d.cartelle.map((x) => htmlCartella(x, totCat, c.colore)).join("")}</div>`;
    } else if (d.cartelle.length) html += `<div class="gruppo">${esc(t("gruppoCartelle"))}</div>` + d.cartelle.map((x) => htmlCartella(x, totCat, c.colore)).join("");
    const normali = d.file.filter((f) => !f.sistema && !f.protetto);
    const protetti = d.file.filter((f) => f.sistema || f.protetto);
    stato.fileVista = normali;
    if (normali.length) html += `<div class="gruppo gruppo-azioni">${esc(t("gruppoFile"))} · ${fmt(normali.filter((f) => !f.importante).reduce((x, f) => x + f.byte, 0))}
      <span><button class="btn-sel pieno" data-tuttifile="si">${esc(t("vecchiTutti"))}</button><button class="btn-sel" data-tuttifile="no">${esc(t("vecchiNessuno"))}</button></span></div>` + htmlGruppiFile(normali);
    if (protetti.length) {
      const tot = protetti.reduce((x, f) => x + f.byte, 0);
      html += `<div class="voce gruppo-protetti" data-protetti="1"><div class="icona-voce">🔒</div>
        <div><div class="nome">${esc(t("fileProtettiTitolo", { n: protetti.length }))}</div><div class="percorso">${esc(t("fileProtetto"))}</div></div>
        <div class="dim">${fmt(tot)}</div></div>
        <div class="elenco-protetti" hidden>${protetti.map(htmlFile).join("")}</div>`;
    }
    lista.innerHTML = html || `<div class="vuoto">${esc(t("nienteQui"))}</div>`;
  }
  collegaLista();
}

function tagSicurezza(v) {
  let s = v.sicurezza === "sicuro" ? `<span class="tag sicuro">${esc(t("sicuro"))}</span>` : `<span class="tag attenzione">${esc(t("attenzione"))}</span>`;
  if (v.admin) s += `<span class="tag admin" title="${esc(t("adminTitolo"))}">🛡 ${esc(t("admin"))}</span>`;
  return s;
}

function htmlPulibile(v) {
  const k = chiaveP(v);
  if (stato.pulitiOra.has(v.id)) {
    return `<div class="voce pulita"><div class="icona-voce">✓</div><div><div class="nome">${esc(v.nome)}</div></div>
      <div class="dim">${esc(t("pulitoOra"))}</div></div>`;
  }
  const sel = stato.selezione.has(k);
  const dim = v.stimaParziale
    ? `<div class="dim">${esc(t("finoA"))}<small>${esc(t("cartellaDim", { b: fmt(v.byteCartella) }))}</small></div>`
    : `<div class="dim">${fmt(v.byte)}</div>`;
  return `<div class="voce ${sel ? "attiva" : ""}" data-k="${esc(k)}">
    <input type="checkbox" class="spunta" ${sel ? "checked" : ""} data-k="${esc(k)}">
    <div><div class="nome">${esc(v.nome)}</div></div>
    ${dim}
    <div class="riga2">${tagSicurezza(v)}<button class="mini" data-azione="spiega">${esc(t("cosE"))}</button></div>
    <div class="spiega">${esc(v.spiegazione)}</div>
  </div>`;
}

function htmlFile(f) {
  const k = chiaveF(f);
  const sel = stato.selezione.has(k);
  return `<div class="voce ${sel ? "attiva" : ""}" data-k="${esc(k)}" data-p="${esc(f.p)}" data-b="${f.byte}">
    ${f.sistema || f.protetto ? `<div class="icona-voce">≋</div>` : `<input type="checkbox" class="spunta" ${sel ? "checked" : ""} data-k="${esc(k)}">`}
    <div style="min-width:0"><div class="nome">${esc(nomeFile(f.p))}</div><div class="percorso">${esc(f.p)}</div></div>
    <div class="dim">${fmt(f.byte)}</div>
    <div class="riga2">${f.mtime ? `<span class="tag vecchio">${esc(eta(f.mtime))}</span>` : ""}
      <button class="mini" data-azione="apri">${esc(t("mostraCartella"))}</button>
      ${f.sistema ? `<span class="tag attenzione">${esc(t("fileSistema"))}</span>` : f.protetto ? `<span class="tag attenzione">${esc(t("fileProtetto"))}</span>` : `<span class="tag vecchio">${esc(t("vaNelCestino"))}</span>`}</div>
  </div>`;
}

/** Riquadro "file che non apri da più di N mesi": totale, Seleziona tutti / Togli tutti, file divisi per tipo. */
function htmlVecchi() {
  if (!stato.vecchi || !stato.vecchi.n) return "";
  const lista = vecchiDelPeriodo();
  const buoni = lista.filter((f) => !f.importante);
  const byte = buoni.reduce((x, f) => x + f.byte, 0);
  const sel = buoni.filter((f) => stato.selezione.has(chiaveF(f))).reduce((x, f) => x + f.byte, 0);
  return `<div class="gruppo">${esc(t("vecchiTitolo", { m: stato.mesi }))}</div>
    <div class="vecchi-card"><div class="vc-num">${fmt(byte)}</div>
      <div class="vc-txt">${esc(t("vecchiTesto", { b: fmt(byte), n: buoni.length.toLocaleString(T.codice) }))}${sel ? ` <b>· ${fmt(sel)} ✓</b>` : ""}</div>
      <div class="vc-btn"><button class="btn-sel pieno" data-vecchi="tutti">${esc(t("vecchiTutti"))}</button>
        <button class="btn-sel" data-vecchi="nessuno">${esc(t("vecchiNessuno"))}</button></div></div>` +
    (lista.length ? htmlGruppiFile(lista) : `<div class="vuoto">${esc(t("mesiNiente"))}</div>`);
}

const MAX_PER_GRUPPO = 250;
/**
 * File divisi per tipo (Film e video, Foto, Musica, Documenti, Archivi, Altri): una riga per gruppo,
 * si apre con un clic, con Seleziona tutti / Togli tutti del gruppo. I documenti importanti
 * (fatture, tasse, contratti...) stanno in un gruppo a parte e non si selezionano mai in blocco.
 */
function htmlGruppiFile(files) {
  const normali = files.filter((f) => !f.importante);
  const importanti = files.filter((f) => f.importante);
  let h = "";
  for (const [id, icona, chiave] of TIPI_GRUPPO) {
    const g = normali.filter((f) => (f.gruppo || "altri") === id);
    if (!g.length) continue;
    stato.fileGruppi[id] = g;
    const nSel = g.filter((f) => stato.selezione.has(chiaveF(f))).length;
    const aperto = stato.gruppiAperti.has(id);
    h += `<div class="voce gruppo-tipo ${aperto ? "aperta" : ""}" data-gtipo="${id}"><div class="icona-voce">${icona}</div>
      <div><div class="nome">${esc(t(chiave))}</div><div class="percorso">${esc(t("gruppoN", { n: g.length.toLocaleString(T.codice) }))}${nSel ? ` · ${nSel} ✓` : ""}</div></div>
      <div class="dim">${fmt(g.reduce((x, f) => x + f.byte, 0))}</div>
      <div class="riga2"><button class="btn-sel piccolo pieno" data-gsel="${id}" data-si="1">${esc(t("vecchiTutti"))}</button>
        <button class="btn-sel piccolo" data-gsel="${id}" data-si="0">${esc(t("vecchiNessuno"))}</button></div></div>
      <div class="elenco-protetti" ${aperto ? "" : "hidden"}>${aperto ? htmlElencoGruppo(g) : ""}</div>`;
  }
  if (importanti.length) {
    h += `<div class="voce gruppo-protetti gruppo-importanti" data-protetti="1"><div class="icona-voce">🔒</div>
      <div><div class="nome">${esc(t("importantiTitolo", { n: importanti.length }))}</div><div class="percorso">${esc(t("importantiSotto"))}</div></div>
      <div class="dim">${fmt(importanti.reduce((x, f) => x + f.byte, 0))}</div></div>
      <div class="elenco-protetti" hidden>${importanti.slice(0, MAX_PER_GRUPPO).map(htmlFile).join("")}</div>`;
  }
  return h;
}
const htmlElencoGruppo = (g) => g.slice(0, MAX_PER_GRUPPO).map(htmlFile).join("") +
  (g.length > MAX_PER_GRUPPO ? `<div class="vuoto">+ ${(g.length - MAX_PER_GRUPPO).toLocaleString(T.codice)}</div>` : "");

function htmlCartella(x, totCat, colore) {
  const p = Math.max(2, Math.round((x.byte / totCat) * 100));
  const nome = x.soloFile ? nomeFile(x.p) + " " + t("fileSciolti") : nomeFile(x.p);
  const spiega = x.spiegazione || (stato.info.ia ? "" : t("nonSai"));
  return `<div class="voce" data-p="${esc(x.p)}">
    <div class="icona-voce">▤</div>
    <div style="min-width:0"><div class="nome">${esc(nome)}</div><div class="percorso">${esc(x.p)}</div></div>
    <div class="dim">${fmt(x.byte)}</div>
    <div class="barretta" style="--c:${colore}"><i style="width:${p}%"></i></div>
    <div class="riga2"><button class="mini" data-azione="apri">${esc(t("apri"))}</button>
      <button class="mini" data-azione="spiega" data-ia="1">${esc(t("cosE"))}</button></div>
    <div class="spiega">${esc(spiega)}</div>
  </div>`;
}

function collegaLista() {
  const lista = $("lista");
  lista.querySelectorAll(".spunta").forEach((cb) => {
    cb.onchange = () => {
      const k = cb.dataset.k;
      const voce = cb.closest(".voce");
      if (cb.checked) {
        if (k.startsWith("p:")) {
          const v = stato.scan.pulibili.find((x) => "p:" + x.id === k);
          seleziona(k, richiestaP(v), v.byte, v.stimaParziale);
        } else {
          seleziona(k, { tipo: "file", p: k.slice(2) }, Number(voce.dataset.b) || 0, false);
        }
      } else stato.selezione.delete(k);
      voce.classList.toggle("attiva", cb.checked);
      aggiornaPiede();
    };
  });
  lista.querySelectorAll("[data-tuttifile]").forEach((b) => {
    b.onclick = () => {
      const si = b.dataset.tuttifile === "si";
      for (const f of (stato.fileVista || [])) {
        if (si && !f.importante) selezionaFile(f); else if (!si) stato.selezione.delete(chiaveF(f));
      }
      aggiornaPiede();
      ridisegnaLista();
    };
  });
  lista.querySelectorAll("[data-protetti]:not([data-gtipo])").forEach((b) => {
    b.onclick = () => { const e = b.nextElementSibling; if (e) e.hidden = !e.hidden; b.classList.toggle("aperta", !e.hidden); };
  });
  lista.querySelectorAll("[data-vecchi]").forEach((b) => {
    b.onclick = () => {
      const az = b.dataset.vecchi;
      if (az === "tutti") for (const f of vecchiSelezionabili()) selezionaFile(f);
      if (az === "nessuno") for (const f of stato.vecchi.lista) stato.selezione.delete(chiaveF(f));
      aggiornaPiede();
      ridisegnaLista();
    };
  });
  // gruppi per tipo: clic sulla riga = apri/chiudi; pulsanti = seleziona/togli tutto il gruppo
  lista.querySelectorAll("[data-gtipo]").forEach((riga) => {
    riga.onclick = (e) => {
      if (e.target.closest("[data-gsel]")) return;
      const id = riga.dataset.gtipo, elenco = riga.nextElementSibling;
      const apri = elenco.hidden;
      if (apri) { stato.gruppiAperti.add(id); elenco.innerHTML = htmlElencoGruppo(stato.fileGruppi[id] || []); collegaLista(); }
      else stato.gruppiAperti.delete(id);
      elenco.hidden = !apri; riga.classList.toggle("aperta", apri);
    };
  });
  lista.querySelectorAll("[data-gsel]").forEach((b) => {
    b.onclick = (e) => {
      e.stopPropagation();
      const si = b.dataset.si === "1";
      for (const f of (stato.fileGruppi[b.dataset.gsel] || [])) { if (si) selezionaFile(f); else stato.selezione.delete(chiaveF(f)); }
      aggiornaPiede();
      ridisegnaLista();
    };
  });
  lista.querySelectorAll("[data-azione]").forEach((b) => {
    b.onclick = async () => {
      const voce = b.closest(".voce");
      const az = b.dataset.azione;
      if (az === "apri") O.apri(voce.dataset.p);
      else if (az === "app") O.appInstallate();
      else if (az === "spiega") {
        voce.classList.toggle("aperta");
        if (b.dataset.ia && stato.info.ia && voce.classList.contains("aperta") && !voce.dataset.chiesto) {
          voce.dataset.chiesto = "1";
          const box = voce.querySelector(".spiega");
          const prima = box.textContent;
          box.textContent = t("chiedoIA");
          const r = await O.spiega(voce.dataset.p);
          box.textContent = (r && r.testo) || prima || (r && r.errore) || t("nessunaSpiegazione");
        }
      }
    };
  });
}

// ---------------------------------------------------------------- modali

function apriModale(html, largo) {
  $("modale").className = "modale vetro" + (largo ? " largo" : "");
  $("modale").innerHTML = html;
  $("velo").hidden = false;
  $("modale").setAttribute("role", "dialog");
  $("modale").setAttribute("aria-modal", "true");
  // tastiera: il fuoco va sul primo pulsante in basso, che è sempre quello prudente
  // (Annulla, Chiudi, Più tardi): un Invio di troppo non avvia mai una pulizia.
  // Si guarda l'ULTIMA fila di pulsanti: nella finestra Pro la prima è "Compra".
  const file = $("modale").querySelectorAll(".bottoni");
  const primo = file.length ? file[file.length - 1].querySelector("button:not([disabled])") : null;
  if (primo) setTimeout(() => primo.focus(), 30);
}
function chiudiModale() { $("velo").hidden = true; }

// Esc chiude le finestre che hanno un pulsante per chiudere (mai il contratto obbligatorio
// né la pulizia in corso, che non hanno uscite).
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || $("velo").hidden) return;
  const uscita = ["mChiudi", "mAnnulla", "impChiudi", "mOk"].map((id) => document.getElementById(id)).find(Boolean)
    || (!document.getElementById("eulaAccetto") && document.getElementById("eulaOk"));
  if (uscita) uscita.click();
});

/** Pulsante "Orbita Pro" in alto: solo se la licenza non è attiva. */
function aggiornaBottonePro() {
  const b = $("btnPro");
  if (!b) return;
  b.hidden = !!(stato.licenza && stato.licenza.attiva);
}

/** Versione nuova sul sito: pastiglia in alto (solo versione scaricata dal sito). */
async function controllaAggiornamento() {
  let r = null;
  try { r = O.aggiornamento ? await O.aggiornamento() : null; } catch { r = null; }
  const b = $("btnAggiorna");
  if (!r || !b) return;
  b.textContent = "↑ " + t("nuovaVersione", { v: r.versione });
  b.title = t("nuovaVersioneTesto", { v: r.versione });
  b.hidden = false;
  b.onclick = () => O.apriAggiornamento(r.link);
}

/** Contratto di licenza: obbligatorio al primo avvio. */
async function mostraContratto(obbligatorio) {
  const testo = await O.eula();
  return new Promise((fatto) => {
    apriModale(`
      <div class="pannello-sopra">${esc(t("eulaTitolo"))}</div>
      <h2>${esc(obbligatorio ? t("eulaIntro") : t("eulaTitolo"))}</h2>
      <div class="eula-testo">${esc(testo)}</div>
      ${obbligatorio ? `<label class="spunta-riga"><input type="checkbox" class="spunta" id="eulaAccetto"> ${esc(t("eulaAccetto"))}</label>` : ""}
      <div class="bottoni">
        ${obbligatorio ? `<button class="btn-secondario" id="eulaEsci">${esc(t("eulaEsci"))}</button>
        <button class="btn-pulisci" id="eulaOk" disabled>${esc(t("eulaAccetta"))}</button>`
          : `<button class="btn-secondario" id="eulaOk">${esc(t("chiudi"))}</button>`}
      </div>`, true);
    if (obbligatorio) {
      $("eulaAccetto").onchange = () => { $("eulaOk").disabled = !$("eulaAccetto").checked; };
      $("eulaEsci").onclick = () => O.esci();
      $("eulaOk").onclick = async () => { await O.accettaEula(); chiudiModale(); fatto(); };
    } else {
      $("eulaOk").onclick = () => { chiudiModale(); fatto(); };
    }
  });
}

async function mostraImpostazioni() {
  const [auto, info] = await Promise.all([O.autoStato(), O.info()]);
  const giorni = T.ui.giorni || [];
  const pro = stato.info.prova || (stato.licenza && stato.licenza.attiva);
  apriModale(`
    <div class="pannello-sopra">${esc(t("impostazioni"))}</div>
    <h2>Orbita</h2>
    <div class="sezione">
      <h3>${esc(t("lingua"))}</h3>
      <div class="riga-campi"><select id="selLingua">
        ${info.lingue.map((l) => `<option value="${l.codice}" ${l.codice === T.codice ? "selected" : ""}>${esc(l.nome)}</option>`).join("")}
      </select></div>
    </div>
    <div class="sezione">
      <h3>${esc(t("licenzaSopra"))}</h3>
      <div class="riga-campi">
        <p style="margin:0;flex:1">${esc(stato.licenza && stato.licenza.attiva ? t("proAttivo")
          : t("proNonAttivo", { r: stato.licenza ? stato.licenza.rimaste : 0, g: stato.licenza ? stato.licenza.gratuite : 1 }))}</p>
        ${stato.licenza && stato.licenza.attiva ? "" : `<button class="btn-piccolo" id="impPro">${esc(t("passaPro"))}</button>`}
      </div>
      <p class="copyright">${esc(info.totale ? t("totaleOrbita", { b: fmt(info.totale.byte), n: info.totale.pulizie }) : t("nessunTotale"))}</p>
    </div>
    <div class="sezione">
      <h3>${esc(t("autoTitolo"))} <span class="tag admin">PRO</span></h3>
      <p>${esc(t("autoTesto"))}</p>
      <div class="riga-campi">
        <label>${esc(t("autoGiorno"))} <select id="autoGiorno">${giorni.map((g, i) => `<option value="${i}" ${i === auto.giorno ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></label>
        <label>${esc(t("autoOra"))} <input type="time" id="autoOra" value="${esc(auto.ora || "20:00")}"></label>
        ${auto.attiva ? `<button class="btn-piccolo secondario" id="autoOff">${esc(t("autoDisattiva"))}</button>` : ""}
        <button class="btn-piccolo" id="autoOn" ${pro ? "" : "disabled"}>${esc(t("autoAttiva"))}</button>
      </div>
      <div class="stato-auto ${auto.attiva ? "" : "off"}" id="autoStato">${esc(auto.attiva
        ? t("autoStatoOn", { g: giorni[auto.giorno] || "", o: auto.ora }) : (pro ? t("autoStatoOff") : t("autoSoloPro")))}</div>
    </div>
    <div class="sezione">
      <h3>${esc(t("info"))}</h3>
      <p class="copyright">${esc(t("versione", { v: info.versione }))} · ${esc(t("copyright", { anno: info.anno }))}</p>
      <button class="link" id="leggiEula">${esc(t("leggiContratto"))}</button>
    </div>
    <div class="bottoni"><button class="btn-secondario" id="impChiudi">${esc(t("chiudi"))}</button></div>`, true);
  $("impChiudi").onclick = chiudiModale;
  if ($("impPro")) $("impPro").onclick = () => mostraLicenza(true);
  $("selLingua").onchange = () => O.lingua($("selLingua").value);
  $("leggiEula").onclick = async () => { await mostraContratto(false); mostraImpostazioni(); };
  $("autoOn").onclick = async () => {
    const r = await O.autoAttiva({ giorno: Number($("autoGiorno").value), ora: $("autoOra").value });
    if (r && r.errore) { $("autoStato").textContent = r.errore; $("autoStato").className = "stato-auto off"; return; }
    mostraImpostazioni();
  };
  if ($("autoOff")) $("autoOff").onclick = async () => { await O.autoDisattiva(); mostraImpostazioni(); };
}

async function chiediConferma() {
  const sel = [...stato.selezione.values()];
  const l = stato.licenza;
  if (!stato.info.prova && l && !l.attiva && l.rimaste <= 0) return mostraLicenza();
  const tot = sel.reduce((x, s) => x + s.byte, 0);
  const admin = stato.scan.pulibili.some((v) => v.admin && stato.selezione.has(chiaveP(v)));
  const file = sel.filter((x) => x.richiesta.tipo === "file").length;
  // Browser e app aperti tengono bloccate le loro cache: diciamo quali chiudere.
  const vociScelte = sel.filter((x) => x.richiesta.tipo === "pulibile").map((x) => x.richiesta.id);
  let aperte = [];
  try { aperte = (O.appAperte && await O.appAperte(vociScelte)) || []; } catch { aperte = []; }
  const avvisoAperte = aperte.length
    ? `<div class="avviso-app"><b>${esc(t("appAperte"))}</b><div class="chips">${aperte.map((a) => `<span class="chip">${esc(a.nome)}</span>`).join("")}</div></div>`
    : `<p style="font-size:12px">${esc(t("consiglioChiudi"))}</p>`;
  apriModale(`
    <div class="pannello-sopra">${esc(stato.info.prova ? t("provaPiede1") : t("conferma"))}</div>
    <h2>${esc(t("liberare", { b: fmt(tot) + (sel.some((x) => x.stima) ? t("eOltre") : "") }))}</h2>
    <p>${esc(t("vociSel", { n: sel.length }))}${file ? esc(t("fileCestino", { n: file })) : ""}</p>
    ${admin ? `<p class="nota">${esc(t("notaAdmin"))}</p>` : ""}
    ${stato.info.prova ? `<p class="nota">${esc(t("notaProva"))}</p>` : ""}
    ${avvisoAperte}
    <div class="bottoni"><button class="btn-secondario" id="mAnnulla">${esc(t("annulla"))}</button>
      <button class="btn-pulisci" id="mVai">${esc(t("pulisci"))}</button></div>`);
  $("mAnnulla").onclick = chiudiModale;
  $("mVai").onclick = eseguiPulizia;
}

async function eseguiPulizia() {
  apriModale(`<div class="spinner"></div><h2>${esc(t("puliziaInCorso"))}</h2>
    <div class="avanz"><i id="avanzBarra"></i></div><div class="avanz-perc" id="avanzPerc">0%</div>
    <div class="passo" id="passo">${esc(t("preparo"))}</div>`);
  const richieste = [...stato.selezione.values()].map((x) => x.richiesta);
  // passi attesi: una voce per riga del catalogo, più i file scelti a mano e lo script da amministratore
  const nVoci = richieste.filter((x) => x.tipo === "pulibile").length;
  const attesi = Math.max(1, nVoci + (richieste.some((x) => x.tipo === "file") ? 1 : 0) + 1);
  let fatti = 0, finto = 0;
  stato.suPasso = () => { fatti++; finto = 0; };
  const timerAvanz = setInterval(() => {
    // tra un passo e l'altro avanza piano da solo (DISM può durare minuti), senza mai arrivare al 100%
    finto = Math.min(0.9, finto + (1 - finto) * 0.04);
    const p = Math.min(97, Math.round(((fatti + finto) / attesi) * 100));
    if ($("avanzBarra")) { $("avanzBarra").style.width = p + "%"; $("avanzPerc").textContent = p + "%"; }
  }, 400);
  const r = await O.pulisci(richieste);
  clearInterval(timerAvanz);
  stato.suPasso = null;
  if (!r.bloccato && !r.errore) stato.pulitiOra = new Set(richieste.filter((x) => x.tipo === "pulibile").map((x) => x.id));
  if (r.bloccato) { stato.licenza = r.licenza; aggiornaPiede(); return mostraLicenza(); }
  if (r.errore) {
    apriModale(`<h2>${esc(t("ops"))}</h2><div class="bottoni"><button class="btn-secondario" id="mOk">${esc(t("chiudi"))}</button></div>`);
    $("mOk").onclick = chiudiModale;
    return;
  }
  if (r.licenza) stato.licenza = r.licenza;
  if (r.totale) stato.info.totale = r.totale;
  aggiornaBottonePro();
  const liberati = Math.max(r.liberatiDisco || 0, r.liberati || 0);
  const liberoPrima = stato.scan ? stato.scan.libero : 0;
  const saltati = r.esiti.reduce((x, e) => x + (e.saltati || 0), 0);
  // WinSxS (DISM) non si misura voce per voce: se è l'unica voce così, le diamo il resto
  // dello spazio liberato sul disco, così si vede quanto ha fatto davvero.
  const daDisco = r.esiti.filter((e) => e.misuraDaDisco);
  const sommaVoci = r.esiti.filter((e) => !e.misuraDaDisco).reduce((x, e) => x + (e.liberati || 0), 0);
  const cestinoByte = !r.prova ? r.esiti.filter((e) => e.id === "file").reduce((x, e) => x + (e.liberati || 0), 0) : 0;
  let cestinoTot = cestinoByte;
  if (!r.prova) { try { cestinoTot = Math.max(cestinoByte, Number(await O.cestino()) || 0); } catch { /* resta quello della pulizia */ } }
  const restoDisco = !r.prova && daDisco.length === 1 ? Math.max(0, (r.liberatiDisco || 0) - sommaVoci) : 0;
  const righe = r.esiti.filter((e) => e.liberati > 0 || e.nota || e.misuraDaDisco).map((e) =>
    `<div><span>${esc(e.nome)}${e.nota ? `<br><small class="nota">${esc(e.nota)}</small>` : ""}</span>
     <span>${e.misuraDaDisco ? (e.prova ? "—" : restoDisco > MB ? fmt(restoDisco) : "✓") : fmt(e.liberati)}</span></div>`).join("");
  apriModale(`
    <div class="pannello-sopra">${esc(r.prova ? t("simulazione") : t("fatto"))}</div>
    <div class="grande">${fmt(liberati)}</div>
    <h2>${esc(r.prova ? t("siPotrebbero") : t("liberati"))}</h2>
    ${!r.prova && liberoPrima ? `<p>${esc(t("liberoPrimaDopo", { a: fmt(liberoPrima), b: fmt(liberoPrima + (r.liberatiDisco || liberati)) }))}</p>` : ""}
    <div class="dettagli">${righe || `<div><span>${esc(t("nienteDaLiberare"))}</span><span></span></div>`}</div>
    ${saltati > 20 ? `<p class="nota">${esc(t("fileInUso", { n: saltati.toLocaleString(T.codice) }))}</p>` : ""}
    ${r.totale && r.totale.pulizie > 1 ? `<p class="totale-orbita">✦ ${esc(t("totaleOrbita", { b: fmt(r.totale.byte), n: r.totale.pulizie }))}</p>` : ""}
    ${cestinoTot > MB ? `<div class="cestino-box"><p>${esc(t("cestinoTesto"))}</p>
      <button class="btn-pulisci" id="mCestino">🗑 ${esc(t("cestinoTitolo", { b: fmt(cestinoTot) }))}</button></div>` : ""}
    <div class="bottoni"><button class="btn-secondario" id="mOk">${esc(t("vediAggiornato"))}</button></div>`);
  esplosione();
  aggiornaPiede();
  if ($("mCestino")) $("mCestino").onclick = () => chiediSvuotaCestino(cestinoTot);
  // La mappa si rifà subito da sola: i numeri mostrano com'è il disco ADESSO,
  // non lo spazio "ancora da liberare" di prima della pulizia.
  scansiona(stato.radice, true);
  $("mOk").onclick = chiudiModale;
}

/**
 * Orbita Pro. `volontaria`: aperta dall'utente (pulsante in alto o impostazioni),
 * non perché le pulizie gratuite sono finite.
 */
/** Svuota il Cestino (dopo conferma): è lì che finiscono i file scelti a mano. */
function chiediSvuotaCestino(byte) {
  apriModale(`<div class="pannello-sopra">${esc(t("conferma"))}</div>
    <h2>${esc(t("cestinoTitolo", { b: fmt(byte) }))}</h2><p>${esc(t("cestinoConferma"))}</p>
    <div class="bottoni"><button class="btn-secondario" id="mAnnulla">${esc(t("annulla"))}</button>
      <button class="btn-pulisci" id="mSvuota">${esc(t("cestinoSi"))}</button></div>`);
  $("mAnnulla").onclick = chiudiModale;
  $("mSvuota").onclick = async () => {
    apriModale(`<div class="spinner"></div><h2>${esc(t("cestinoSi"))}…</h2>`);
    const r = await O.svuotaCestino();
    const liberati = Math.max((r && r.liberati) || 0, r && r.prova ? byte : 0);
    apriModale(`<div class="pannello-sopra">${esc(t("fatto"))}</div><div class="grande">${fmt(liberati)}</div>
      <h2>${esc(t("cestinoFatto", { b: fmt(liberati) }))}</h2>
      <div class="bottoni"><button class="btn-pulisci" id="mOk">${esc(t("chiudi"))}</button></div>`);
    esplosione();
    $("mOk").onclick = chiudiModale;
    // niente nuova scansione (un milione di file = 3 secondi di blocco): basta rileggere lo spazio libero
    try {
      stato.unita = await O.unita();
      disegnaUnita();
      const u = stato.unita.find((x) => x.radice === stato.radice);
      if (u && stato.scan) stato.scan.libero = u.libero;
      aggiornaCentro();
      if (stato.scan) aggiornaRiepilogo();
    } catch { /* niente: resta il valore di prima */ }
  };
}

// ---------------------------------------------------------------- guida rapida
const PASSI_GUIDA = [
  ["#orbitaWrap", "guida1T", "guida1"],
  ["#legenda", "guida2T", "guida2"],
  ["#lista .voce", "guida3T", "guida3"],
  [".vecchi-card", "guida4T", "guida4"],
  ["#btnPulisci", "guida5T", "guida5"],
];
function avviaGuida() {
  if (!stato.scan) return;
  const passi = PASSI_GUIDA.filter(([sel]) => document.querySelector(sel));
  let i = 0;
  let g = $("guida");
  if (!g) { g = document.createElement("div"); g.id = "guida"; document.body.appendChild(g); }
  const fine = () => { g.remove(); O.guidaVista && O.guidaVista(); stato.info.guidaVista = true; };
  const mostra = () => {
    const [sel, tit, txt] = passi[i];
    const el = document.querySelector(sel);
    el.scrollIntoView({ block: "nearest" });
    const r = el.getBoundingClientRect();
    const pad = 8;
    const destra = r.left + r.width / 2 < innerWidth / 2;
    const bx = Math.min(innerWidth - 380, Math.max(20, destra ? r.right + 24 : r.left - 384));
    const by = Math.min(innerHeight - 260, Math.max(70, r.top + r.height / 2 - 110));
    g.innerHTML = `<div class="g-luce" style="left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px"></div>
      <div class="g-box" style="left:${bx}px;top:${by}px">
        <div class="g-passo">${esc(t("guidaPasso", { i: i + 1, n: passi.length }))}</div>
        <h3>${esc(t(tit))}</h3><p>${esc(t(txt))}</p>
        <div class="g-btn"><button class="link" id="gSalta">${esc(t("guidaSalta"))}</button>
          <span>${i ? `<button class="btn-secondario" id="gIndietro">${esc(t("guidaIndietro"))}</button>` : ""}
          <button class="btn-pulisci" id="gAvanti">${esc(i === passi.length - 1 ? t("guidaFine") : t("guidaAvanti"))}</button></span></div></div>`;
    $("gSalta").onclick = fine;
    $("gAvanti").onclick = () => { if (i === passi.length - 1) fine(); else { i++; mostra(); } };
    if ($("gIndietro")) $("gIndietro").onclick = () => { i--; mostra(); };
    $("gAvanti").focus();
  };
  mostra();
}

async function mostraLicenza(volontaria) {
  const l = stato.licenza;
  if (volontaria && l && l.attiva) {
    apriModale(`
      <div class="pannello-sopra">${esc(t("licenzaSopra"))}</div>
      <h2>✦ ${esc(t("proAttivo"))}</h2>
      ${stato.info.totale ? `<p>${esc(t("totaleOrbita", { b: fmt(stato.info.totale.byte), n: stato.info.totale.pulizie }))}</p>` : ""}
      <div class="bottoni"><button class="btn-secondario" id="mChiudi">${esc(t("chiudi"))}</button></div>`);
    $("mChiudi").onclick = chiudiModale;
    return;
  }
  const finite = !volontaria || (l && !l.attiva && l.rimaste <= 0);
  apriModale(`
    <div class="pannello-sopra">${esc(t("licenzaSopra"))}</div>
    <h2>${esc(finite ? t("licenzaTitolo", { g: l ? l.gratuite : 1 }) : t("proSblocca"))}</h2>
    <p>${esc(t("proTesto"))}</p>
    <ul class="punti-pro">${["pro1", "pro2", "pro3", "pro4"].map((k) => `<li>${esc(t(k))}</li>`).join("")}</ul>
    <div class="slogan">${esc(t("slogan"))}</div>
    <div class="bottoni compra">
      <button class="btn-pulisci" id="mVita">${esc(t("compraVita"))}</button>
    </div>
    <p class="nota">${esc(t("acquistoPresto"))}</p>
    <input id="mChiave" placeholder="${esc(t("chiaveSegnaposto"))}" spellcheck="false">
    <div class="bottoni"><button class="btn-secondario" id="mChiudi">${esc(t("piuTardi"))}</button>
      <button class="btn-pulisci" id="mAttiva">${esc(t("attiva"))}</button></div>`);
  $("mChiudi").onclick = chiudiModale;
  $("mVita").onclick = () => O.compra && O.compra("vita");
  $("mAttiva").onclick = async () => {
    $("mAttiva").disabled = true;
    const r = await O.attiva($("mChiave").value);
    $("mAttiva").disabled = false;
    if (r.ok) { stato.licenza = r.stato; aggiornaPiede(); aggiornaBottonePro(); chiudiModale(); esplosione(); return; }
    $("mChiave").style.borderColor = "var(--rosso)";
    const msg = { formato: "errFormato", rete: "errRete", limite: "errLimite" }[r.errore] || "errChiave";
    let n = document.getElementById("mErrore");
    if (!n) { n = document.createElement("p"); n.id = "mErrore"; n.className = "nota"; n.style.color = "var(--rosso)"; $("mChiave").after(n); }
    n.textContent = t(msg);
  };
}

function esplosione() {
  const colori = ["#00e5a0", "#5ee7ff", "#8f8bff", "#ffd23f", "#ff4fd8"];
  const cx = innerWidth / 2, cy = innerHeight / 2 - 60;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.className = "particella";
    const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 260;
    p.style.left = cx + "px"; p.style.top = cy + "px";
    p.style.background = colori[i % colori.length];
    p.style.boxShadow = `0 0 10px ${colori[i % colori.length]}`;
    p.style.setProperty("--dx", Math.cos(a) * d + "px");
    p.style.setProperty("--dy", Math.sin(a) * d + "px");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

// Parallasse: l'anello si inclina appena e gli strati dello sfondo si spostano a velocità
// diverse seguendo il mouse (--px/--py tra -1 e 1, li usa style.css). Niente se Windows
// chiede meno animazioni.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const radice = document.documentElement.style;
  let x = 0, y = 0, inAttesa = false;
  addEventListener("mousemove", (e) => {
    x = (e.clientX / innerWidth) * 2 - 1;
    y = (e.clientY / innerHeight) * 2 - 1;
    if (inAttesa) return;
    inAttesa = true;
    requestAnimationFrame(() => {
      radice.setProperty("--px", x.toFixed(3));
      radice.setProperty("--py", y.toFixed(3));
      inAttesa = false;
    });
  }, { passive: true });
  // il mouse esce dalla finestra: l'anello torna dritto
  document.addEventListener("mouseleave", () => { radice.setProperty("--px", "0"); radice.setProperty("--py", "0"); });
})();

// Riposo: le animazioni decorative costano processore (l'SVG si ridisegna a ogni fotogramma).
// Girano mentre la persona usa Orbita; dopo 30 s senza mouse/tastiera, o quando la finestra
// passa in secondo piano, si fermano. Ripartono al primo movimento. Mai durante la scansione.
(() => {
  const RIPOSO_MS = 30000;
  const html = document.documentElement;
  const svg = document.getElementById("anello");
  let timer = null;
  function dormi() {
    if (window.maiRiposo) return;   // registrazione dei video promozionali (main.js --video)
    if (stato.inScansione) { timer = setTimeout(dormi, RIPOSO_MS); return; }
    html.classList.add("a-riposo");
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
  }
  function sveglia() {
    if (html.classList.contains("a-riposo")) {
      html.classList.remove("a-riposo");
      if (svg && svg.unpauseAnimations) svg.unpauseAnimations();
    }
    clearTimeout(timer);
    timer = setTimeout(dormi, RIPOSO_MS);
  }
  ["mousemove", "mousedown", "keydown", "wheel"].forEach((ev) => addEventListener(ev, sveglia, { passive: true }));
  addEventListener("focus", sveglia);
  addEventListener("blur", () => { clearTimeout(timer); dormi(); });
  sveglia();
})();

document.getElementById("btnTema").onclick = () =>
  applicaTema(document.documentElement.dataset.tema === "chiaro" ? TEMA_SCURO : "chiaro");
avvio();

// ---------------------------------------------------------------- inutilizzati da più di N mesi

/** Riquadro in alto a sinistra: scegli il periodo, un clic seleziona tutti i file vecchi (mai gli importanti). */
function preparaMesi() {
  const card = $("mesiCard"), sel = $("mesiSel");
  if (!card || !sel) return;
  try { const m = Number(localStorage.getItem("orbita-mesi")); if (MESI_SCELTA.includes(m)) stato.mesi = m; } catch { /* niente */ }
  sel.innerHTML = MESI_SCELTA.map((m) => `<option value="${m}" ${m === stato.mesi ? "selected" : ""}>${esc(m === 1 ? t("mese1") : t("mesiN", { n: m }))}</option>`).join("");
  card.hidden = !stato.vecchi.n;
  $("mesiEsito").textContent = "";
  sel.onchange = () => {
    stato.mesi = Number(sel.value);
    try { localStorage.setItem("orbita-mesi", String(stato.mesi)); } catch { /* niente */ }
    $("mesiEsito").textContent = "";
    aggiornaRiepilogo(); aggiornaPiede();
    if (stato.vista === "consigliata") ridisegnaLista();
  };
  $("btnMesi").onclick = () => {
    for (const f of stato.vecchi.lista) stato.selezione.delete(chiaveF(f));
    const scelti = vecchiSelezionabili();
    for (const f of scelti) selezionaFile(f);
    $("mesiEsito").textContent = scelti.length
      ? t("mesiFatto", { n: scelti.length.toLocaleString(T.codice), b: fmt(scelti.reduce((x, f) => x + f.byte, 0)) })
      : t("mesiNiente");
    aggiornaPiede();
    mostraVista("consigliata").then(() => {
      const c = document.querySelector(".vecchi-card");
      if (c) c.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
}

/** Ridisegna il pannello di destra tenendo la posizione di scorrimento. */
function ridisegnaLista() {
  const lista = $("lista"), su = lista.scrollTop;
  return mostraVista(stato.vista).then(() => { lista.scrollTop = su; });
}
