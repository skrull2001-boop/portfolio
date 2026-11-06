"use strict";
/**
 * Orbita: lingue. L'italiano è la lingua di riferimento; se in una lingua
 * manca una frase si usa l'inglese, poi l'italiano.
 * La lingua si sceglie da quella di Windows; se non è tra queste, inglese.
 */
const LINGUE = ["en", "it", "es", "pt", "de", "fr"];
const cache = {};

function carica(codice) {
  if (!LINGUE.includes(codice)) codice = "en";
  if (cache[codice]) return cache[codice];
  const base = require("./it");
  const en = require("./en");
  const l = require("./" + codice);
  const unisci = (sez) => ({ ...base[sez], ...(codice === "it" ? {} : en[sez]), ...l[sez] });
  cache[codice] = {
    codice, nomeLingua: l.nomeLingua,
    ui: unisci("ui"), categorie: unisci("categorie"), descrizioni: unisci("descrizioni"),
    pulibili: unisci("pulibili"), cartelle: unisci("cartelle"),
  };
  return cache[codice];
}

/** Da "it-IT", "pt-BR", "en-US"... al codice di Orbita. */
function scegli(locale) {
  const c = String(locale || "").slice(0, 2).toLowerCase();
  return LINGUE.includes(c) ? c : "en";
}

function elenco() {
  return LINGUE.map((c) => ({ codice: c, nome: require("./" + c).nomeLingua }));
}

module.exports = { LINGUE, carica, scegli, elenco };
