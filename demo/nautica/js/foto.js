/*
 * Foto FINTE di barche e lavori: disegni SVG generati al volo.
 * Nell'app vera sono le foto scattate dal telefono del tecnico.
 * f.fase = 'prima' o 'dopo' cambia il disegno (sporco / pulito).
 */
(function () {
  'use strict';
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647; return h || 1; }
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function macchie(r, n, x0, y0, w, h, colori, op) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var cx = x0 + r() * w, cy = y0 + r() * h, rx = 6 + r() * 30, ry = 4 + r() * 14;
      out += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="' + colori[i % colori.length] + '" opacity="' + ((op || 0.3) + r() * 0.3).toFixed(2) + '"/>';
    }
    return out;
  }
  function puntini(r, n, x0, y0, w, h, col) {
    var out = '';
    for (var i = 0; i < n; i++) out += '<circle cx="' + (x0 + r() * w).toFixed(1) + '" cy="' + (y0 + r() * h).toFixed(1) + '" r="' + (1 + r() * 2.5).toFixed(1) + '" fill="' + col + '" opacity=".75"/>';
    return out;
  }
  // scafo visto di fianco, prua a destra
  function scafo(x, y, w, h, col) {
    return '<path d="M' + x + ' ' + y + ' L' + (x + w * 0.82) + ' ' + y + ' Q' + (x + w) + ' ' + (y - h * 0.1) + ' ' + (x + w * 1.02) + ' ' + (y - h * 0.25) +
      ' Q' + (x + w * 0.9) + ' ' + (y + h * 0.8) + ' ' + (x + w * 0.6) + ' ' + (y + h) + ' L' + (x + w * 0.04) + ' ' + (y + h) + ' Z" fill="' + col + '"/>' +
      '<path d="M' + (x + w * 0.02) + ' ' + (y + h * 0.35) + ' L' + (x + w * 0.9) + ' ' + (y + h * 0.35) + '" stroke="#1d5c8a" stroke-width="4" opacity=".7"/>' +
      '<path d="M' + (x + w * 0.35) + ' ' + y + ' L' + (x + w * 0.42) + ' ' + (y - h * 0.55) + ' L' + (x + w * 0.62) + ' ' + (y - h * 0.55) + ' L' + (x + w * 0.66) + ' ' + y + '" fill="#cfe0ea" stroke="#8aa3b3" stroke-width="2"/>';
  }

  function lago(r) {
    var s = '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fbbe0"/><stop offset="1" stop-color="#e3eef5"/></linearGradient></defs><rect width="400" height="300" fill="url(#sk)"/>';
    s += '<polygon points="0,150 60,' + (70 + r() * 20) + ' 130,140 200,' + (60 + r() * 25) + ' 280,135 350,' + (80 + r() * 20) + ' 400,130 400,170 0,170" fill="#6d8a78"/>';
    s += '<polygon points="0,165 90,120 170,160 260,115 400,160 400,180 0,180" fill="#4f6d5c"/>';
    s += '<rect y="172" width="400" height="128" fill="#4a7ea3"/>';
    for (var i = 0; i < 14; i++) s += '<path d="M' + (r() * 400).toFixed(0) + ' ' + (185 + r() * 110).toFixed(0) + ' q8 -4 16 0" stroke="#d6e7f2" stroke-width="2" fill="none" opacity=".6"/>';
    s += scafo(110, 196, 190, 46, '#f4f3ef');
    s += '<path d="M100 248 q100 10 210 0" stroke="#2f5f80" stroke-width="5" fill="none" opacity=".5"/>';
    return s;
  }
  function capannone(r) {
    var s = '<rect width="400" height="300" fill="#c9c6bd"/><rect y="215" width="400" height="85" fill="#8e8b83"/>';
    for (var x = 0; x < 400; x += 50) s += '<rect x="' + x + '" y="0" width="6" height="215" fill="#b2aea4"/>';
    s += '<polygon points="0,0 400,0 400,30 0,60" fill="#a7a49b"/>';
    s += '<rect x="120" y="190" width="10" height="40" fill="#4b4e54"/><rect x="270" y="190" width="10" height="40" fill="#4b4e54"/><rect x="100" y="226" width="200" height="8" fill="#4b4e54"/>';
    s += scafo(70, 120, 260, 70, '#f1f0eb');
    s += '<rect x="150" y="96" width="120" height="6" fill="#2c6c9c" opacity=".7"/>';
    s += macchie(r, 4, 10, 225, 380, 60, ['#6f6c64'], 0.15);
    return s;
  }
  function carena(r, dopo) {
    var s = '<rect width="400" height="300" fill="#bdb9ae"/>';
    s += '<path d="M-10 40 Q200 10 410 50 L410 300 L-10 300 Z" fill="' + (dopo ? '#24344d' : '#c9c3b0') + '"/>';
    s += '<path d="M-10 40 Q200 10 410 50 L410 70 Q200 32 -10 62 Z" fill="#f3f2ee"/>';
    s += '<path d="M-10 62 Q200 32 410 70" stroke="' + (dopo ? '#b42318' : '#7d7a6f') + '" stroke-width="6" fill="none"/>';
    if (dopo) { s += '<path d="M40 120 Q200 100 360 140" stroke="#ffffff" stroke-width="10" opacity=".12" fill="none"/>'; }
    else { s += macchie(r, 26, 0, 70, 400, 230, ['#5f6b3a', '#7a6a3e', '#45502a'], 0.25) + puntini(r, 140, 0, 80, 400, 220, '#e9e4d2'); }
    return s;
  }
  function elica(r, dopo) {
    var s = '<rect width="400" height="300" fill="' + (dopo ? '#2a3a52' : '#b8b4a8') + '"/><g transform="translate(200 150)">';
    for (var i = 0; i < 3; i++) s += '<path transform="rotate(' + (i * 120 + 10) + ')" d="M0 -14 C40 -30 95 -40 108 -8 C112 10 60 14 0 14 Z" fill="' + (dopo ? '#c9ccd1' : '#9a958a') + '" stroke="#55524b" stroke-width="2"/>';
    s += '<circle r="22" fill="' + (dopo ? '#dfe2e6' : '#8a857a') + '" stroke="#55524b" stroke-width="2"/></g>';
    if (!dopo) s += puntini(r, 120, 90, 40, 220, 220, '#ece7d6') + macchie(r, 10, 90, 40, 220, 220, ['#6b7240'], 0.2);
    return s;
  }
  function motore(r, dopo) {
    var s = '<rect width="400" height="300" fill="#cbc8bf"/><rect y="240" width="400" height="60" fill="#9a978e"/>';
    s += '<path d="M150 40 Q200 20 255 40 L265 120 Q205 135 140 120 Z" fill="#20252c"/>';
    s += '<rect x="185" y="122" width="34" height="100" fill="#2b3038"/><path d="M165 220 L250 220 L240 250 L175 250 Z" fill="#2b3038"/>';
    s += '<path d="M150 70 L262 70" stroke="#c7ccd2" stroke-width="3" opacity=".6"/>';
    if (!dopo) s += macchie(r, 9, 160, 140, 90, 110, ['#c9c3b0', '#7a6a3e'], 0.35) + puntini(r, 50, 165, 200, 80, 50, '#e9e4d2');
    else s += '<path d="M160 50 Q200 38 240 50" stroke="#fff" stroke-width="5" opacity=".25" fill="none"/>';
    return s;
  }
  function piede(r, dopo) {
    var s = '<rect width="400" height="300" fill="#c5c2b9"/><rect x="0" y="0" width="120" height="300" fill="#f1f0eb"/>';
    s += '<rect x="120" y="90" width="70" height="60" rx="8" fill="#3a3f47"/>';
    for (var i = 0; i < 6; i++) s += '<rect x="' + (192 + i * 10) + '" y="' + (98 + i) + '" width="8" height="' + (44 - i * 2) + '" rx="3" fill="' + (dopo ? '#111' : '#2d2b28') + '"/>';
    s += '<path d="M255 80 L330 80 L320 240 L290 240 L285 160 L255 150 Z" fill="#3a3f47"/>';
    if (!dopo) s += '<path d="M205 104 l6 14 l-4 10 M226 110 l-3 12" stroke="#d8c7a0" stroke-width="2" fill="none"/>' + macchie(r, 6, 250, 120, 80, 120, ['#c9c3b0'], 0.35);
    return s;
  }
  function legno(r, dopo) {
    var s = '<rect width="400" height="300" fill="' + (dopo ? '#6b2c14' : '#8d6b55') + '"/>';
    for (var y = 0; y < 300; y += 30) s += '<rect x="0" y="' + y + '" width="400" height="2" fill="#f2e6cf" opacity="' + (dopo ? '.8' : '.45') + '"/>';
    for (var i = 0; i < 18; i++) s += '<path d="M' + (r() * 400).toFixed(0) + ' ' + (r() * 300).toFixed(0) + ' q40 ' + (r() * 6 - 3).toFixed(1) + ' 90 0" stroke="' + (dopo ? '#4a1c0b' : '#6f5241') + '" stroke-width="2" fill="none" opacity=".6"/>';
    if (dopo) s += '<path d="M-20 80 Q200 40 420 90" stroke="#fff" stroke-width="22" opacity=".14" fill="none"/>';
    else s += macchie(r, 14, 0, 0, 400, 300, ['#b9a796', '#5c4a3e'], 0.25);
    return s;
  }

  var DISEGNI = { lago: lago, capannone: capannone, carena: carena, elica: elica, motore: motore, piede: piede, legno: legno };

  // Restituisce il markup SVG della foto. stamp = testo in sovrimpressione (data, barca)
  window.fotoSVG = function (f, stamp) {
    var r = rng(hash(f.label + f.tipo + (f.fase || '')));
    var corpo = (DISEGNI[f.tipo] || lago)(r, f.fase === 'dopo');
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + f.label + '">' + corpo +
      (f.fase ? '<rect x="10" y="10" width="' + (f.fase === 'dopo' ? 64 : 70) + '" height="26" rx="6" fill="' + (f.fase === 'dopo' ? '#1d7a4c' : '#a15c07') + '"/><text x="' + (f.fase === 'dopo' ? 42 : 45) + '" y="28" fill="#fff" font-size="14" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">' + f.fase.toUpperCase() + '</text>' : '') +
      '<rect x="0" y="266" width="400" height="34" fill="#000" opacity=".45"/>' +
      '<text x="12" y="288" fill="#fff" font-size="15" font-family="system-ui, sans-serif">' + f.label + '</text>' +
      '<text x="388" y="288" fill="#ffd27a" font-size="13" text-anchor="end" font-family="ui-monospace, monospace">' + (stamp || '') + '</text></svg>';
  };
})();
