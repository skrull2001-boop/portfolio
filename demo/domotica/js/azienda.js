/*
 * Personalizzazione per singola azienda dal link, senza file per azienda nel repo pubblico.
 * index.html?d=<base64url di un JSON> sovrascrive solo i campi ammessi di config.js (nome, colore, sede...).
 * Il link si genera con genera_link.py. Colore accettato solo come #rrggbb; i testi restano testo
 * (l'app li passa sempre da esc() e avviso.js usa textContent). Se ?d= è malformato resta config.js.
 * Compatibilità: index.html?a=bbt carica ancora aziende/bbt.js (online c'è solo quello, link già inviato).
 */
(function () {
  'use strict';
  var CAMPI = ['nome', 'sottotitolo', 'sede', 'lago', 'telefono', 'email', 'albo', 'qualifiche'];

  function leggi(b64) {
    var s = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), byte = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) byte[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(byte));
  }

  var d = /[?&]d=([A-Za-z0-9_-]{1,3000})(?:&|$)/.exec(location.search);
  if (d) {
    try {
      var o = leggi(d[1]), c = {};
      if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('non è un oggetto');
      CAMPI.forEach(function (k) {
        if (typeof o[k] === 'string' && o[k].trim()) c[k] = o[k].replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 160);
      });
      if (typeof o.colore === 'string' && /^#[0-9a-fA-F]{6}$/.test(o.colore)) c.colore = o.colore;
      if (c.nome) c.logo = null; // il logo di base è dell'azienda inventata: con un nome vero restano le iniziali
      Object.assign(window.CONFIG, c);
      window.AZIENDA = 'link';
    } catch (e) { /* link rovinato o incompleto: demo generica */ }
    return;
  }

  var m = /[?&]a=([a-z0-9-]{1,40})(?:&|$)/i.exec(location.search);
  if (!m) return;
  window.AZIENDA = m[1].toLowerCase();
  // document.write mantiene l'ordine: il file dell'azienda è letto prima di app.js
  document.write('<script src="aziende/' + window.AZIENDA + '.js" onerror="window.AZIENDA_MANCANTE=\'' + window.AZIENDA + '\'"><\/script>');
})();
