/* ============================================================
   SVG 线性图标库（Swiss 风格：1.7 描边、方头、无填充）
   用法：<svg class="ico"><use href="#i-search"></use></svg>
   在页面 <body> 后由 app.js 注入 sprite
   ============================================================ */
(function () {
  'use strict';
  var SPRITE = '' +
    '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none" aria-hidden="true">' +
    '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></symbol>' +
    '<symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16"/><circle cx="8.5" cy="9" r="1.5"/><polyline points="21 16 16 11 5 20"/></symbol>' +
    '<symbol id="i-cart" viewBox="0 0 24 24"><path d="M3 4h2l2.4 11h10.2l2.4-8H6"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></symbol>' +
    '<symbol id="i-inquiry" viewBox="0 0 24 24"><path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="12.5" x2="13" y2="12.5"/></symbol>' +
    '<symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></symbol>' +
    '<symbol id="i-list" viewBox="0 0 24 24"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><rect x="3" y="4.5" width="3" height="3"/><rect x="3" y="10.5" width="3" height="3"/><rect x="3" y="16.5" width="3" height="3"/></symbol>' +
    '<symbol id="i-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></symbol>' +
    '<symbol id="i-check" viewBox="0 0 24 24"><polyline points="4 12 9 17 20 6"/></symbol>' +
    '<symbol id="i-factory" viewBox="0 0 24 24"><path d="M3 21V10l6 4V10l6 4V4h6v17z"/><line x1="3" y1="21" x2="21" y2="21"/></symbol>' +
    '<symbol id="i-truck" viewBox="0 0 24 24"><rect x="2" y="6" width="12" height="10"/><path d="M14 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></symbol>' +
    '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><polyline points="8.5 12 11 14.5 15.5 9.5"/></symbol>' +
    '<symbol id="i-star" viewBox="0 0 24 24"><polygon points="12 3 14.8 9 21 9.6 16.3 14 17.7 20 12 16.8 6.3 20 7.7 14 3 9.6 9.2 9"/></symbol>' +
    '<symbol id="i-chart" viewBox="0 0 24 24"><line x1="3" y1="21" x2="21" y2="21"/><rect x="5" y="12" width="3" height="7"/><rect x="10.5" y="7" width="3" height="12"/><rect x="16" y="10" width="3" height="9"/></symbol>' +
    '<symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></symbol>' +
    '<symbol id="i-menu" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></symbol>' +
    '<symbol id="i-package" viewBox="0 0 24 24"><path d="M12 2l9 5-9 5-9-5z"/><path d="M3 7v10l9 5 9-5V7"/><line x1="12" y1="12" x2="12" y2="22"/></symbol>' +
    '<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3c3 3 3 15 0 18-3-3-3-15 0-18z"/></symbol>' +
    '<symbol id="i-cog" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></symbol>' +
    '<symbol id="i-ruler" viewBox="0 0 24 24"><rect x="2" y="8" width="20" height="8"/><line x1="7" y1="8" x2="7" y2="12"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="17" y1="8" x2="17" y2="12"/></symbol>' +
    '<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></symbol>' +
    '<symbol id="i-location" viewBox="0 0 24 24"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></symbol>' +
    '<symbol id="i-file" viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6z"/><polyline points="14 2 14 6 18 6"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/></symbol>' +
    '<symbol id="i-plus" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></symbol>' +
    '<symbol id="i-minus" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></symbol>' +
    '<symbol id="i-close" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></symbol>' +
    '<symbol id="i-verified" viewBox="0 0 24 24"><path d="M12 2l2.4 2 3.3-.3 1 3.1 2.6 2-1 3.1 1 3.1-2.6 2-1 3.1-3.3-.3-2.4 2-2.4-2-3.3.3-1-3.1-2.6-2 1-3.1-1-3.1 2.6-2 1-3.1 3.3.3z"/><polyline points="8.5 12 11 14.5 15.5 9.5"/></symbol>' +
    '</svg>';

  function inject() {
    if (document.getElementById('yj-icons')) return;
    var div = document.createElement('div');
    div.id = 'yj-icons';
    div.innerHTML = SPRITE;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
