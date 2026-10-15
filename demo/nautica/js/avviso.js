/* Fascia "bozza dimostrativa": chiarisce che la pagina non è dell'azienda nominata (indicazione di Paolo, 15/10/2026). */
document.addEventListener('DOMContentLoaded', function () {
  var nome = (window.CONFIG && window.CONFIG.nome) || 'questa azienda';
  var d = document.createElement('div');
  d.setAttribute('role', 'note');
  d.style.cssText = 'background:#fff7d6;color:#5b4a00;font:13px/1.4 system-ui,sans-serif;padding:6px 12px;text-align:center;border-bottom:1px solid #e9d98a;position:relative;z-index:9999';
  d.textContent = 'Bozza dimostrativa preparata da Studio Vacchini per ' + nome + ' · non affiliata all’azienda · tutti i dati sono inventati';
  document.body.insertBefore(d, document.body.firstChild);
});
