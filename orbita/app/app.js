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
  O.onPasso((testo) => { const el = $("passo"); if (el) el.textContent = testo; });
  $("btnScansiona").onclick = () => scansiona(stato.radice);
  $("btnAnnulla").onclick = () => O.annulla();
  $("btnPulisci").onclick = chiediConferma;
  $("btnIndietro").onclick = () => mostraVista("consigliata");
  $("btnImpostazioni").onclick = mostraImpostazioni;
  if (!stato.info.eulaAccettata) await mostraContratto(true);
  scansiona(stato.radice);
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

async function scansiona(radice) {
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
    if (v.preselezionato && (v.byte > 0 || v.stimaParziale)) seleziona(chiaveP(v), richiestaP(v), v.byte, v.stimaParziale);
  }
  try { stato.grandi = await O.grandi(); } catch { stato.grandi = []; }
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

const totaleRecuperabile = () => (stato.scan ? stato.scan.pulibili.reduce((x, v) => x + v.byte, 0) : 0);

function aggiornaRiepilogo() {
  const s = stato.scan;
  $("rUsato").textContent = fmt(s.usato);
  $("rLibero").textContent = fmt(s.libero);
  $("rRecuperabile").textContent = fmt(totaleRecuperabile());
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
  const l = stato.licenza;
  if (stato.info.prova) $("gratuite").innerHTML = `${esc(t("provaPiede1"))}<br><b>${esc(t("provaPiede2"))}</b>`;
  else if (l && l.attiva) $("gratuite").innerHTML = `${esc(t("licenzaAttiva"))} <b>${esc(t("attivaParola"))}</b>`;
  else if (l) $("gratuite").innerHTML = `${esc(t("gratuiteRimaste"))}<br><b>${esc(t("diN", { r: l.rimaste, g: l.gratuite }))}</b>`;
}

// ---------------------------------------------------------------- pannello

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
    $("pannelloDim").textContent = fmt(totaleRecuperabile());
    $("pannelloIntro").textContent = t("consigliataIntro");
    const sicure = stato.scan.pulibili.filter((v) => v.sicurezza === "sicuro");
    const valuta = stato.scan.pulibili.filter((v) => v.sicurezza !== "sicuro");
    const vecchi = stato.grandi.filter((f) => f.mtime && Date.now() - f.mtime > 90 * 864e5).slice(0, 8);
    lista.innerHTML =
      (sicure.length ? `<div class="gruppo">${esc(t("gruppoSicuro"))}</div>` + sicure.map(htmlPulibile).join("") : "") +
      (valuta.length ? `<div class="gruppo">${esc(t("gruppoValuta"))}</div>` + valuta.map(htmlPulibile).join("") : "") +
      (vecchi.length ? `<div class="gruppo">${esc(t("gruppoVecchi"))}</div>` + vecchi.map(htmlFile).join("") : "") ||
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
    if (d.cartelle.length) html += `<div class="gruppo">${esc(t("gruppoCartelle"))}</div>` + d.cartelle.map((x) => htmlCartella(x, totCat, c.colore)).join("");
    if (d.file.length) html += `<div class="gruppo">${esc(t("gruppoFile"))}</div>` + d.file.map(htmlFile).join("");
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
    ${f.sistema ? `<div class="icona-voce">≋</div>` : `<input type="checkbox" class="spunta" ${sel ? "checked" : ""} data-k="${esc(k)}">`}
    <div style="min-width:0"><div class="nome">${esc(nomeFile(f.p))}</div><div class="percorso">${esc(f.p)}</div></div>
    <div class="dim">${fmt(f.byte)}</div>
    <div class="riga2">${f.mtime ? `<span class="tag vecchio">${esc(eta(f.mtime))}</span>` : ""}
      <button class="mini" data-azione="apri">${esc(t("mostraCartella"))}</button>
      ${f.sistema ? `<span class="tag attenzione">${esc(t("fileSistema"))}</span>` : `<span class="tag vecchio">${esc(t("vaNelCestino"))}</span>`}</div>
  </div>`;
}

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

function apriModale(html, largo) { $("modale").className = "modale vetro" + (largo ? " largo" : ""); $("modale").innerHTML = html; $("velo").hidden = false; }
function chiudiModale() { $("velo").hidden = true; }

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
  $("selLingua").onchange = () => O.lingua($("selLingua").value);
  $("leggiEula").onclick = async () => { await mostraContratto(false); mostraImpostazioni(); };
  $("autoOn").onclick = async () => {
    const r = await O.autoAttiva({ giorno: Number($("autoGiorno").value), ora: $("autoOra").value });
    if (r && r.errore) { $("autoStato").textContent = r.errore; $("autoStato").className = "stato-auto off"; return; }
    mostraImpostazioni();
  };
  if ($("autoOff")) $("autoOff").onclick = async () => { await O.autoDisattiva(); mostraImpostazioni(); };
}

function chiediConferma() {
  const sel = [...stato.selezione.values()];
  const l = stato.licenza;
  if (!stato.info.prova && l && !l.attiva && l.rimaste <= 0) return mostraLicenza();
  const tot = sel.reduce((x, s) => x + s.byte, 0);
  const admin = stato.scan.pulibili.some((v) => v.admin && stato.selezione.has(chiaveP(v)));
  const file = sel.filter((x) => x.richiesta.tipo === "file").length;
  apriModale(`
    <div class="pannello-sopra">${esc(stato.info.prova ? t("provaPiede1") : t("conferma"))}</div>
    <h2>${esc(t("liberare", { b: fmt(tot) + (sel.some((x) => x.stima) ? t("eOltre") : "") }))}</h2>
    <p>${esc(t("vociSel", { n: sel.length }))}${file ? esc(t("fileCestino", { n: file })) : ""}</p>
    ${admin ? `<p class="nota">${esc(t("notaAdmin"))}</p>` : ""}
    ${stato.info.prova ? `<p class="nota">${esc(t("notaProva"))}</p>` : ""}
    <p style="font-size:12px">${esc(t("consiglioChiudi"))}</p>
    <div class="bottoni"><button class="btn-secondario" id="mAnnulla">${esc(t("annulla"))}</button>
      <button class="btn-pulisci" id="mVai">${esc(t("pulisci"))}</button></div>`);
  $("mAnnulla").onclick = chiudiModale;
  $("mVai").onclick = eseguiPulizia;
}

async function eseguiPulizia() {
  apriModale(`<div class="spinner"></div><h2>${esc(t("puliziaInCorso"))}</h2><div class="passo" id="passo">${esc(t("preparo"))}</div>`);
  const richieste = [...stato.selezione.values()].map((x) => x.richiesta);
  const r = await O.pulisci(richieste);
  if (r.bloccato) { stato.licenza = r.licenza; aggiornaPiede(); return mostraLicenza(); }
  if (r.errore) {
    apriModale(`<h2>${esc(t("ops"))}</h2><div class="bottoni"><button class="btn-secondario" id="mOk">${esc(t("chiudi"))}</button></div>`);
    $("mOk").onclick = chiudiModale;
    return;
  }
  if (r.licenza) stato.licenza = r.licenza;
  const liberati = Math.max(r.liberatiDisco || 0, r.liberati || 0);
  const liberoPrima = stato.scan ? stato.scan.libero : 0;
  const saltati = r.esiti.reduce((x, e) => x + (e.saltati || 0), 0);
  const righe = r.esiti.filter((e) => e.liberati > 0 || e.nota).map((e) =>
    `<div><span>${esc(e.nome)}${e.nota ? `<br><small class="nota">${esc(e.nota)}</small>` : ""}</span>
     <span>${e.misuraDaDisco ? (e.prova ? "—" : "✓") : fmt(e.liberati)}</span></div>`).join("");
  apriModale(`
    <div class="pannello-sopra">${esc(r.prova ? t("simulazione") : t("fatto"))}</div>
    <div class="grande">${fmt(liberati)}</div>
    <h2>${esc(r.prova ? t("siPotrebbero") : t("liberati"))}</h2>
    ${!r.prova && liberoPrima ? `<p>${esc(t("liberoPrimaDopo", { a: fmt(liberoPrima), b: fmt(liberoPrima + (r.liberatiDisco || liberati)) }))}</p>` : ""}
    <div class="dettagli">${righe || `<div><span>${esc(t("nienteDaLiberare"))}</span><span></span></div>`}</div>
    ${saltati > 20 ? `<p class="nota">${esc(t("fileInUso", { n: saltati.toLocaleString(T.codice) }))}</p>` : ""}
    <div class="bottoni"><button class="btn-pulisci" id="mOk">${esc(t("vediAggiornato"))}</button></div>`);
  esplosione();
  aggiornaPiede();
  // La mappa si rifà subito da sola: i numeri mostrano com'è il disco ADESSO,
  // non lo spazio "ancora da liberare" di prima della pulizia.
  scansiona(stato.radice);
  $("mOk").onclick = chiudiModale;
}

async function mostraLicenza() {
  const p = await O.prezzo();
  const prezzoHtml = p.lancio
    ? `<span class="badge-lancio">${esc(t("prezzoLancio"))}</span><div class="prezzo">${esc(p.lancio.testo)}<s>${esc(p.testo)}</s></div>`
    : `<div class="prezzo">${esc(p.testo)}</div>`;
  apriModale(`
    <div class="pannello-sopra">${esc(t("licenzaSopra"))}</div>
    <h2>${esc(t("licenzaTitolo", { g: stato.licenza ? stato.licenza.gratuite : 3 }))}</h2>
    <p>${esc(t("licenzaTesto"))}</p>
    <div class="slogan">${esc(t("slogan"))}</div>
    ${prezzoHtml}
    <div class="prezzo-sotto">${esc(t("unaVolta"))}${p.lancio ? " · " + esc(t("poi", { p: p.testo })) : ""}</div>
    <p class="nota">${esc(t("acquistoPresto"))}</p>
    <input id="mChiave" placeholder="${esc(t("chiaveSegnaposto"))}" spellcheck="false">
    <div class="bottoni"><button class="btn-secondario" id="mChiudi">${esc(t("piuTardi"))}</button>
      <button class="btn-pulisci" id="mAttiva">${esc(t("attiva"))}</button></div>`);
  $("mChiudi").onclick = chiudiModale;
  $("mAttiva").onclick = async () => {
    const r = await O.attiva($("mChiave").value);
    if (r.ok) { stato.licenza = r.stato; aggiornaPiede(); chiudiModale(); }
    else $("mChiave").style.borderColor = "var(--rosso)";
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

document.getElementById("btnTema").onclick = () =>
  applicaTema(document.documentElement.dataset.tema === "chiaro" ? TEMA_SCURO : "chiaro");
avvio();
