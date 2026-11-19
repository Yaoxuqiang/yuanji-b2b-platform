/* ============================================================
   产品工艺线稿生成器 · Blueprint Product Art
   ------------------------------------------------------------
   目的：替换"商品主图"占位符（AI 原型最大破绽），用工程线稿
        呈现商品真实形态。零依赖、纯 SVG、单一强调色，契合 Swiss 视觉。
   用法：<div data-art="tumbler"></div>  → 注入 <svg>...</svg>
   支持：tumbler / bag / earbuds / display / bottle / shelf
   ============================================================ */
(function () {
  'use strict';

  // 所有线稿统一 viewBox 200x200，stroke=currentColor，无填充色块（Swiss 线性）
  var ART = {
    // 保温杯：杯身 + 杯盖 + 螺纹 + 高光 + 度量标注
    tumbler: [
      '<line class="ax" x1="100" y1="12" x2="100" y2="188"/>',
      '<rect x="66" y="46" width="68" height="126" rx="8"/>',
      '<rect x="62" y="30" width="76" height="20" rx="4"/>',
      '<line x1="66" y1="52" x2="134" y2="52"/>',
      '<path d="M74 60 v104 M126 60 v104" class="hl"/>',
      '<ellipse cx="100" cy="46" rx="34" ry="7" class="hl"/>',
      '<rect x="92" y="78" width="16" height="30" rx="2" class="hl"/>',
      '<line class="dim" x1="140" y1="46" x2="140" y2="172"/>',
      '<line class="dim" x1="136" y1="46" x2="144" y2="46"/>',
      '<line class="dim" x1="136" y1="172" x2="144" y2="172"/>',
      '<text class="lbl" x="146" y="112">H 178</text>',
      '<text class="lbl" x="24" y="182">Ø 66</text>'
    ],
    // 快递袋：封口锯齿 + 袋体 + 折角 + 环保标
    bag: [
      '<path d="M40 52 h120 l-8 116 H48 Z"/>',
      '<path d="M40 52 l10 -12 h100 l10 12" class="hl"/>',
      '<path d="M40 52 l16 10 h88 l16 -10" />',
      '<path d="M56 62 v96 M144 62 v96" class="hl"/>',
      '<circle cx="100" cy="112" r="22" class="hl"/>',
      '<path d="M92 112 q8 -14 16 0 q-8 14 -16 0 Z"/>',
      '<text class="lbl" x="70" y="150">PLA · 可降解</text>'
    ],
    // 蓝牙耳机：充电盒 + 双耳 + 盖缝
    earbuds: [
      '<rect x="52" y="104" width="96" height="62" rx="12"/>',
      '<path d="M52 128 h96" class="hl"/>',
      '<circle cx="64" cy="146" r="4" class="hl"/>',
      '<path d="M74 44 a14 14 0 1 1 20 12 l-4 34 a10 10 0 0 1 -20 0 Z"/>',
      '<path d="M126 44 a14 14 0 1 0 -20 12 l4 34 a10 10 0 0 0 20 0 Z"/>',
      '<line x1="84" y1="90" x2="80" y2="104" class="hl"/>',
      '<line x1="116" y1="90" x2="120" y2="104" class="hl"/>',
      '<text class="lbl" x="60" y="182">TWS · ANC</text>'
    ],
    // 亚克力展示架：多层搁板 + 支撑 + 透视
    display: [
      '<path d="M46 44 h108 v12 H46 Z"/>',
      '<path d="M52 88 h96 v10 H52 Z"/>',
      '<path d="M58 132 h84 v10 H58 Z"/>',
      '<line x1="54" y1="56" x2="60" y2="132"/>',
      '<line x1="146" y1="56" x2="140" y2="132"/>',
      '<path d="M58 142 l-8 22 M142 142 l8 22" class="hl"/>',
      '<line class="dim" x1="40" y1="44" x2="40" y2="142"/>',
      '<text class="lbl" x="14" y="96">3 层</text>'
    ],
    // 分装瓶：瓶身 + 泵头 + 液位 + 容量标
    bottle: [
      '<rect x="72" y="70" width="56" height="102" rx="10"/>',
      '<rect x="86" y="44" width="28" height="26" rx="3"/>',
      '<path d="M100 44 v-14 h18 v8" />',
      '<path d="M78 108 h44" class="hl"/>',
      '<path d="M84 60 v6 M100 60 v6 M116 60 v6" class="hl"/>',
      '<line class="dim" x1="134" y1="70" x2="134" y2="172"/>',
      '<text class="lbl" x="138" y="124">30ml</text>'
    ],
    // 折叠置物架：层板 + 支撑臂 + 挂钩
    shelf: [
      '<rect x="40" y="70" width="120" height="12" rx="2"/>',
      '<rect x="40" y="122" width="120" height="12" rx="2"/>',
      '<path d="M52 82 v40 M148 82 v40"/>',
      '<path d="M52 134 l-6 30 M148 134 l6 30" class="hl"/>',
      '<path d="M60 82 q10 14 20 0 M120 82 q10 14 20 0" class="hl"/>',
      '<text class="lbl" x="60" y="60">免打孔 · 承重</text>'
    ]
  };

  var STYLE =
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" ' +
    'preserveAspectRatio="xMidYMid meet" class="p-art" aria-hidden="true">' +
    '<g fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="square" stroke-linejoin="miter">__BODY__</g></svg>';

  function render(type) {
    var body = ART[type] || ART.tumbler;
    // 为不同线稿元素补 class：hl=高光(浅)、dim=尺寸线(虚线)、lbl=文字
    var html = STYLE.replace('__BODY__', body.join(''))
      .replace(/class="hl"/g, 'stroke-opacity="0.38"')
      .replace(/class="ax"/g, 'stroke-opacity="0.12" stroke-dasharray="4 4"')
      .replace(/class="dim"/g, 'stroke-opacity="0.55" stroke-width="1"')
      .replace(/<text class="lbl"([^>]*)>([^<]*)<\/text>/g,
        '<text$1 font-size="9" font-family="Helvetica,Arial" ' +
        'fill="currentColor" stroke="none" opacity="0.6">$2</text>');
    return html;
  }

  function mount(root) {
    var nodes = (root || document).querySelectorAll('[data-art]');
    nodes.forEach(function (el) {
      if (el.getAttribute('data-mounted')) return;
      el.innerHTML = render(el.getAttribute('data-art'));
      el.setAttribute('data-mounted', '1');
    });
  }

  window.YJ_ART = { render: render, mount: mount };
  document.addEventListener('DOMContentLoaded', function () { mount(document); });
})();
