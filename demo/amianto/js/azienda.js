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

/*
 * Portale per il deposito del piano di lavoro, in base alla provincia della sede (sigla tra parentesi in CONFIG.sede).
 * GeMA esiste solo in Lombardia: fuori regione si usa un testo neutro. Senza sede (o sigla) resta GeMA.
 * Letto al momento dell'uso, così vale anche per i file aziende/*.js caricati dopo questo script.
 * nomePortale(forma): 'nome' (default), 'su' ("su GeMA"), 'a' ("a GeMA"), 'breve' (etichetta corta), 'ente' e 'dell' (organo di vigilanza).
 */
(function () {
  'use strict';
  var LOMBARDIA = ['MI', 'MB', 'BG', 'BS', 'CO', 'CR', 'LC', 'LO', 'MN', 'PV', 'SO', 'VA'];
  var VENETO = ['VR', 'VI', 'PD', 'VE', 'TV', 'RO', 'BL'];
  var TESTI = {
    lombardia: { nome: 'GeMA', su: 'su GeMA', a: 'a GeMA', breve: 'GeMA', ente: 'ATS', dell: 'dell\'ATS' },
    veneto: { nome: 'portale regionale', su: 'sul portale regionale', a: 'al portale regionale', breve: 'ULSS', ente: 'ULSS', dell: 'dell\'ULSS' },
    italia: { nome: 'portale regionale', su: 'sul portale regionale', a: 'al portale regionale', breve: 'ASL/ATS', ente: 'ASL/ATS', dell: 'dell\'ASL/ATS' },
    ticino: { nome: 'autorità competente', su: 'presso l\'autorità competente', a: 'all\'autorità competente', breve: 'SUVA', ente: 'SUVA/autorità cantonale', dell: 'della SUVA/autorità cantonale' }
  };

  function zona() {
    var sede = String((window.CONFIG && window.CONFIG.sede) || '');
    var m = /\(([A-Za-z]{2})\)/.exec(sede), p = m ? m[1].toUpperCase() : '';
    if (p === 'TI' || /svizzera/i.test(sede)) return 'ticino';
    if (!p || LOMBARDIA.indexOf(p) >= 0) return 'lombardia';
    return VENETO.indexOf(p) >= 0 ? 'veneto' : 'italia';
  }

  window.nomePortale = function (forma) {
    var t = TESTI[zona()];
    return t[forma] || t.nome;
  };
})();
