/*
 * Personalizzazione per singola azienda dal parametro URL: index.html?a=bbt
 * carica aziende/bbt.js, che sovrascrive solo i campi indicati di config.js (nome, colore, logo...).
 * La sigla accetta solo lettere minuscole, cifre e trattini. Se il file non esiste resta config.js.
 */
(function () {
  'use strict';
  var m = /[?&]a=([a-z0-9-]{1,40})(?:&|$)/.exec(location.search);
  if (!m) return;
  window.AZIENDA = m[1];
  // document.write mantiene l'ordine: il file dell'azienda è letto prima di app.js
  document.write('<script src="aziende/' + m[1] + '.js"><\/script>');
})();
