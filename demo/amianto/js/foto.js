/*
 * Foto di sopralluogo FINTE: disegni SVG generati al volo.
 * Nell'app vera sono le foto scattate dal telefono del tecnico.
 */
(function () {
  'use strict';
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647; return h || 1; }
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function macchie(r, n, x0, y0, w, h) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var cx = x0 + r() * w, cy = y0 + r() * h, rx = 8 + r() * 34, ry = 5 + r() * 18;
      var col = r() > 0.5 ? '#5f6b3a' : '#3f3d36';
      out += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="' + col + '" opacity="' + (0.15 + r() * 0.25).toFixed(2) + '"/>';
    }
    return out;
  }

  var cielo = '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc3e4"/><stop offset="1" stop-color="#dfeaf2"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky)"/>';

  function tetto(r) {
    var s = cielo;
    for (var t = 0; t < 9; t++) s += '<circle cx="' + (t * 50 + r() * 30) + '" cy="' + (78 + r() * 10) + '" r="' + (18 + r() * 14) + '" fill="#4d6b45"/>';
    s += '<polygon points="0,112 400,72 400,300 0,300" fill="#a3a197"/>';
    for (var x = -200; x < 520; x += 13) {
      var top = 112 - (x / 400) * 40;
      s += '<line x1="' + x + '" y1="' + top.toFixed(1) + '" x2="' + (x * 1.35 - 70).toFixed(1) + '" y2="300" stroke="' + (x % 26 === 0 ? '#8a887e' : '#b6b4aa') + '" stroke-width="5"/>';
    }
    s += '<polygon points="0,112 400,72 400,79 0,120" fill="#7c7a71"/>';
    s += macchie(r, 16, 0, 110, 400, 190);
    return s;
  }

  function dettaglio(r) {
    var s = '<rect width="400" height="300" fill="#a9a79d"/>';
    for (var x = 0; x < 400; x += 28) s += '<rect x="' + x + '" y="0" width="14" height="300" fill="#bdbbb1"/><rect x="' + (x + 14) + '" y="0" width="5" height="300" fill="#8f8d84"/>';
    s += macchie(r, 22, 0, 0, 400, 300);
    s += '<path d="M120 0 L135 60 L128 110 L150 170 L140 230" stroke="#3a3833" stroke-width="2.5" fill="none" opacity=".7"/>';
    s += '<rect x="230" y="200" width="150" height="22" fill="#f2c335" stroke="#8a6d10"/>';
    for (var t = 0; t < 15; t++) s += '<line x1="' + (234 + t * 10) + '" y1="200" x2="' + (234 + t * 10) + '" y2="' + (t % 5 === 0 ? 214 : 207) + '" stroke="#3b2f05"/>';
    return s;
  }

  function capannone(r) {
    var s = cielo + '<rect y="232" width="400" height="68" fill="#8d8a80"/>';
    s += '<rect x="40" y="120" width="320" height="115" fill="#d9d3c4"/>';
    for (var i = 0; i < 4; i++) s += '<polygon points="' + (40 + i * 80) + ',120 ' + (40 + i * 80) + ',84 ' + (120 + i * 80) + ',120" fill="#a19f95" stroke="#7c7a71" stroke-width="2"/><rect x="' + (42 + i * 80) + '" y="86" width="5" height="34" fill="#cfe1ee"/>';
    s += '<rect x="70" y="160" width="70" height="75" fill="#6f7c86"/><rect x="170" y="160" width="70" height="75" fill="#6f7c86"/>';
    for (var w = 0; w < 5; w++) s += '<rect x="' + (262 + w * 18) + '" y="150" width="12" height="16" fill="#9fb8c8"/>';
    s += macchie(r, 6, 40, 86, 320, 34);
    return s;
  }

  function canna(r) {
    var s = cielo + '<rect y="150" width="400" height="150" fill="#e6dccb"/>';
    s += '<polygon points="-20,160 200,60 420,160" fill="#a3503a"/>';
    for (var y = 80; y < 160; y += 12) s += '<line x1="0" y1="' + y + '" x2="400" y2="' + y + '" stroke="#8a3f2c" stroke-width="2" opacity=".5"/>';
    s += '<rect x="250" y="30" width="34" height="110" fill="#b0aea4"/><rect x="246" y="26" width="42" height="10" fill="#8f8d84"/>';
    s += macchie(r, 5, 250, 30, 34, 110);
    s += '<rect x="80" y="190" width="60" height="70" fill="#7f95a6"/><rect x="250" y="190" width="60" height="70" fill="#7f95a6"/>';
    return s;
  }

  var DISEGNI = { tetto: tetto, dettaglio: dettaglio, capannone: capannone, canna: canna };

  // Restituisce il markup SVG della foto. stamp = testo in sovrimpressione (data, luogo)
  window.fotoSVG = function (f, stamp) {
    var r = rng(hash(f.label + f.tipo));
    var corpo = (DISEGNI[f.tipo] || tetto)(r);
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + f.label + '">' + corpo +
      '<rect x="0" y="266" width="400" height="34" fill="#000" opacity=".45"/>' +
      '<text x="12" y="288" fill="#fff" font-size="15" font-family="system-ui, sans-serif">' + f.label + '</text>' +
      '<text x="388" y="288" fill="#ffd27a" font-size="13" text-anchor="end" font-family="ui-monospace, monospace">' + (stamp || '') + '</text></svg>';
  };
})();
