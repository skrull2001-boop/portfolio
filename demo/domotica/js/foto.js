/*
 * Foto di cantiere FINTE: disegni SVG generati al volo.
 * Nell'app vera sono le foto scattate dal telefono del tecnico.
 */
(function () {
  'use strict';
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647; return h || 1; }
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var cielo = '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc3e4"/><stop offset="1" stop-color="#e3edf4"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky)"/>';

  function villa(r) {
    var s = cielo;
    for (var t = 0; t < 7; t++) s += '<circle cx="' + (t * 64 + r() * 30) + '" cy="' + (150 + r() * 14) + '" r="' + (24 + r() * 16) + '" fill="#4d6b45"/>';
    s += '<rect y="226" width="400" height="74" fill="#7f9a6a"/>';
    s += '<rect x="70" y="120" width="260" height="110" fill="#efe8da"/><polygon points="58,122 200,70 342,122" fill="#9b5b43"/>';
    s += '<rect x="250" y="150" width="110" height="80" fill="#e6dccb"/><rect x="246" y="144" width="118" height="8" fill="#8d8a80"/>';
    for (var w = 0; w < 4; w++) s += '<rect x="' + (88 + w * 40) + '" y="140" width="24" height="34" fill="#7f95a6"/>';
    s += '<rect x="262" y="166" width="86" height="56" fill="#9fb8c8"/><rect x="180" y="186" width="34" height="44" fill="#6b5240"/>';
    s += '<rect x="0" y="262" width="400" height="38" fill="#5a8fb5" opacity="' + (0.5 + r() * 0.4).toFixed(2) + '"/>';
    return s;
  }
  function quadro(r) {
    var s = '<rect width="400" height="300" fill="#d8d4cb"/><rect x="60" y="20" width="280" height="270" rx="8" fill="#f4f3ef" stroke="#a8a49a" stroke-width="3"/>';
    for (var row = 0; row < 4; row++) {
      s += '<rect x="78" y="' + (44 + row * 60) + '" width="244" height="8" fill="#9a968c"/>';
      var x = 80;
      while (x < 300) {
        var w = [18, 36, 54][Math.floor(r() * 3)]; if (x + w > 320) break;
        var col = r() > 0.6 ? '#2f6fb0' : r() > 0.5 ? '#3a3d43' : '#e9e7e2';
        s += '<rect x="' + x + '" y="' + (36 + row * 60) + '" width="' + (w - 2) + '" height="44" rx="2" fill="' + col + '" stroke="#8b877d"/>';
        if (r() > 0.4) s += '<circle cx="' + (x + 6) + '" cy="' + (44 + row * 60) + '" r="2.5" fill="' + (r() > 0.3 ? '#3fd06b' : '#f2c335') + '"/>';
        x += w;
      }
    }
    s += '<path d="M120 290 C130 250 160 260 170 290 M220 290 C230 240 270 270 280 290" stroke="#3b6b9c" stroke-width="4" fill="none"/>';
    return s;
  }
  function rack(r) {
    var s = '<rect width="400" height="300" fill="#cfccc4"/><rect x="100" y="10" width="200" height="290" fill="#2a2c30"/>';
    for (var u = 0; u < 8; u++) {
      var y = 24 + u * 32;
      s += '<rect x="112" y="' + y + '" width="176" height="26" rx="2" fill="' + (u % 3 === 0 ? '#3c4046' : '#e8e6e1') + '"/>';
      for (var p = 0; p < 12; p++) {
        s += '<rect x="' + (122 + p * 13) + '" y="' + (y + 9) + '" width="9" height="8" fill="#1d1f22"/>';
        if (r() > 0.45) s += '<circle cx="' + (126 + p * 13) + '" cy="' + (y + 5) + '" r="1.6" fill="' + (r() > 0.2 ? '#3fd06b' : '#f2a33a') + '"/>';
      }
    }
    for (var c = 0; c < 9; c++) s += '<path d="M' + (124 + c * 18) + ' 290 q' + (r() * 30 - 15) + ' -40 0 -80" stroke="' + ['#2f6fb0', '#e9e7e2', '#f2c335', '#1d7a6a'][c % 4] + '" stroke-width="3" fill="none"/>';
    return s;
  }
  function stanza(r) {
    var s = '<rect width="400" height="300" fill="#efe9df"/><polygon points="0,0 400,0 330,70 70,70" fill="#f8f6f2"/><polygon points="70,230 330,230 400,300 0,300" fill="#b89a78"/>';
    s += '<rect x="70" y="70" width="260" height="160" fill="#ece5d8"/><rect x="230" y="96" width="76" height="110" fill="#bcd2df"/>';
    for (var i = 0; i < 2; i++) { var cx = 150 + i * 100 + r() * 10; s += '<ellipse cx="' + cx + '" cy="34" rx="22" ry="7" fill="#fff" stroke="#c9c4b9"/><ellipse cx="' + cx + '" cy="34" rx="16" ry="4.5" fill="none" stroke="#d9d4ca"/>'; }
    s += '<rect x="96" y="128" width="16" height="22" rx="2" fill="#fff" stroke="#bdb8ad"/><circle cx="104" cy="134" r="1.6" fill="#2f6fb0"/><circle cx="104" cy="144" r="1.6" fill="#2f6fb0"/>';
    s += '<rect x="100" y="180" width="110" height="38" rx="6" fill="#6b6f76"/>';
    return s;
  }
  function telecamera(r) {
    var s = cielo + '<rect x="0" y="80" width="240" height="220" fill="#e6dccb"/>';
    for (var y = 92; y < 300; y += 22) s += '<line x1="0" y1="' + y + '" x2="240" y2="' + y + '" stroke="#d3c7b2"/>';
    s += '<rect x="150" y="110" width="22" height="12" fill="#bdb8ad"/><g transform="rotate(14 160 120)"><rect x="160" y="108" width="96" height="34" rx="10" fill="#f4f3ef" stroke="#a8a49a"/><rect x="246" y="104" width="22" height="42" rx="4" fill="#e9e7e2" stroke="#a8a49a"/><circle cx="262" cy="125" r="9" fill="#1d1f22"/><circle cx="262" cy="125" r="3" fill="#2f6fb0"/></g>';
    s += '<rect x="250" y="190" width="150" height="110" fill="#6b7a5c"/><rect x="300" y="170" width="8" height="130" fill="#3a3d43"/><rect x="340" y="170" width="8" height="130" fill="#3a3d43"/>';
    for (var b = 0; b < 6; b++) s += '<rect x="' + (300 + b * 8) + '" y="176" width="3" height="120" fill="#4a4d52" opacity="' + (0.4 + r() * 0.4).toFixed(2) + '"/>';
    return s;
  }
  function cantiere(r) {
    var s = '<rect width="400" height="300" fill="#bdb7aa"/><rect y="250" width="400" height="50" fill="#8f8a7f"/>';
    for (var t = 0; t < 7; t++) { var x = 40 + t * 52 + r() * 10; s += '<path d="M' + x + ' 300 V' + (120 + r() * 40) + ' q0 -20 20 -20 H' + (x + 60) + '" stroke="' + (t % 2 ? '#3b6b9c' : '#d8732a') + '" stroke-width="7" fill="none"/>'; }
    for (var k = 0; k < 4; k++) s += '<rect x="' + (60 + k * 85) + '" y="' + (150 + r() * 20) + '" width="34" height="34" fill="#5d6066" stroke="#3a3d43"/>';
    s += '<rect x="250" y="230" width="140" height="22" fill="#f2c335" stroke="#8a6d10"/>';
    return s;
  }
  var DISEGNI = { villa: villa, quadro: quadro, rack: rack, stanza: stanza, telecamera: telecamera, cantiere: cantiere };

  // Restituisce il markup SVG della foto. stamp = testo in sovrimpressione (data, luogo)
  window.fotoSVG = function (f, stamp) {
    var r = rng(hash(f.label + f.tipo));
    var corpo = (DISEGNI[f.tipo] || villa)(r);
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + f.label + '">' + corpo +
      '<rect x="0" y="266" width="400" height="34" fill="#000" opacity=".45"/>' +
      '<text x="12" y="288" fill="#fff" font-size="15" font-family="system-ui, sans-serif">' + f.label + '</text>' +
      '<text x="388" y="288" fill="#ffd27a" font-size="13" text-anchor="end" font-family="ui-monospace, monospace">' + (stamp || '') + '</text></svg>';
  };
})();
