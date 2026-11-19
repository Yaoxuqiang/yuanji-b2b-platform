(function (root) {
  'use strict';

  const suppliers = {
    jinghe: { name: '永康景禾工贸', place: '浙江金华', cert: '源头工厂', year: 2016, repeat: 38, photo: 'factory' },
    chengwu: { name: '宁波澄物家居', place: '浙江宁波', cert: '实力商家', year: 2019 },
    huaxin: { name: '华信包装', place: '浙江温州', cert: '源头工厂' },
    wenchuang: { name: '文创办公', place: '广东深圳', cert: '实力商家' },
    youpin: { name: '深圳优品家居', place: '广东深圳', cert: '源头工厂' },
    meisheng: { name: '杭州美生活用品', place: '浙江杭州', cert: '实力商家' },
    haojia: { name: '中山好家居', place: '广东中山', cert: '深度认证' },
    yuanchuang: { name: '义乌源创日用', place: '浙江金华', cert: '源头工厂' },
    chenxi: { name: '晨熙杯业', place: '江苏苏州', cert: '深度认证' },
    jianhe: { name: '简禾生活馆', place: '广东广州', cert: '实力商家' }
  };
  const categories = {
    '日用百货': ['杯壶水具', '随行用品'], '家居收纳': ['桌面收纳', '居家整理'],
    '办公文具': ['纸本笔记'], '服饰配件': ['通勤布包', '服装配饰'],
    '包装耗材': ['快递包装'], '食品饮料': ['餐饮周边']
  };
  const cupSkus = [
    { id: 'green', label: '雾松绿 / 500mL', color: '雾松绿', size: '500mL', stock: 3200, delta: 0 },
    { id: 'white', label: '砂岩白 / 500mL', color: '砂岩白', size: '500mL', stock: 2500, delta: 30 },
    { id: 'gray', label: '石墨灰 / 500mL', color: '石墨灰', size: '500mL', stock: 2300, delta: 60 },
    { id: 'large', label: '雾松绿 / 750mL', color: '雾松绿', size: '750mL', stock: 0, delta: 150 }
  ];
  // Quote tiers are [minimum units, unit price in cents].
  const catalog = [
    ['p1', '304 不锈钢保温杯', 'A-203', 'jinghe', 'bottle', '日用百货', '杯壶水具', 48, 12000, [[50,1480],[500,1250],[2000,1080]], '雾松绿 / 500mL', ['品牌定制'], cupSkus],
    ['p2', '桌面收纳盒', 'B-110', 'chengwu', 'organizer', '家居收纳', '桌面收纳', 24, 85000, [[100,1680],[1000,1490],[2500,1280]], '暖白 / 中号', ['一件代发'], [{ id:'base', label:'暖白 / 中号', stock:4200, delta:0 }, { id:'wide', label:'暖白 / 大号', stock:2400, delta:280 }]],
    ['p3', '快递纸箱', 'C-056', 'huaxin', 'carton', '包装耗材', '快递包装', 48, 123000, [[100,120],[1000,100],[5000,89]], '三层瓦楞 / 中号', ['品牌定制']],
    ['p4', '商务笔记本', 'D-178', 'wenchuang', 'notebook', '办公文具', '纸本笔记', 48, 67000, [[50,780],[500,650],[1500,580]], '深灰 / A5', ['品牌定制']],
    ['p5', '316 便携保温杯', 'A-118', 'youpin', 'portable', '日用百货', '杯壶水具', 48, 9800, [[50,1620],[300,1380],[1200,1240]], '奶油白 / 450mL', ['一件代发']],
    ['p6', '直饮保温杯', 'A-620', 'meisheng', 'travel', '日用百货', '杯壶水具', 72, 7600, [[50,2250],[200,1980],[1000,1680]], '石墨黑 / 500mL', []],
    ['p7', '迷你保温杯', 'A-272', 'haojia', 'mini', '日用百货', '杯壶水具', 168, 6400, [[50,1780],[300,1520],[1500,1390]], '浅紫 / 300mL', ['进口']],
    ['p8', '提环保温杯', 'A-415', 'yuanchuang', 'loop', '日用百货', '杯壶水具', 48, 5200, [[50,1990],[200,1750],[1000,1490]], '燕麦白 / 500mL', []],
    ['p9', '双层保温杯', 'A-506', 'chenxi', 'bottle', '日用百货', '杯壶水具', 48, 3100, [[100,1320],[500,1170],[2000,1040]], '雾松绿 / 500mL', ['品牌定制']],
    ['p10', '卡扣保温杯', 'A-227', 'yuanchuang', 'portable', '日用百货', '随行用品', 24, 2700, [[20,2120],[200,1790],[1000,1590]], '暖白 / 450mL', ['一件代发']],
    ['p11', '帆布通勤袋', 'E-036', 'jianhe', 'custom', '服饰配件', '通勤布包', 72, 4600, [[20,890],[200,760],[1000,620]], '本白 / 立式', ['品牌定制', '一件代发']],
    ['p12', '陶瓷马克杯', 'F-205', 'chengwu', 'trial', '食品饮料', '餐饮周边', 24, 4000, [[20,850],[200,740],[1000,610]], '暖白 / 350mL', ['小单试采']],
    ['p13', '便携咖啡保温杯', 'A-631', 'youpin', 'travel', '日用百货', '随行用品', 24, 3400, [[30,1890],[300,1690],[2000,1490]], '黑色 / 400mL', []],
    ['p14', '轻巧茶漏保温杯', 'A-332', 'chenxi', 'mini', '日用百货', '杯壶水具', 96, 2100, [[60,1590],[300,1420],[1500,1270]], '浅紫 / 320mL', []],
    ['p15', '户外提手保温杯', 'A-491', 'meisheng', 'loop', '日用百货', '随行用品', 72, 2200, [[80,2340],[300,2190],[2000,1890]], '砂白 / 550mL', []],
    ['p16', '叠放收纳筐', 'B-119', 'chengwu', 'bin', '家居收纳', '居家整理', 24, 7200, [[25,1290],[200,1090],[1500,980]], '暖白 / 中号', ['一件代发']],
    ['p17', '插肩通勤衫', 'E-109', 'jianhe', 'dropship', '服饰配件', '服装配饰', 48, 1600, [[20,3200],[200,2800],[1000,2490]], '米白 / M', ['一件代发']]
  ].map(([id, name, code, supplierId, photo, category, subcategory, lead, sold, tiers, spec, scenes, skus]) => ({
    id, name, code, supplierId, supplier: suppliers[supplierId], photo, category, subcategory, lead, sold, tiers, spec, scenes,
    moq: tiers[0][0], skus: skus || [{ id:'base', label:spec, stock:7000, delta:0 }],
    shipFrom: (id === 'p6' ? '江苏' : suppliers[supplierId].place.slice(0, 2))
  }));
  const byId = Object.fromEntries(catalog.map(p => [p.id, p]));
  const product = id => Object.hasOwn(byId, id) ? byId[id] : undefined;
  const skuFor = (p, id) => p?.skus.find(s => s.id === id);
  const money = cents => '¥' + (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const leadText = h => h <= 48 || h % 24 ? `${h} 小时` : `${h / 24} 天`;
  const soldText = n => (n >= 10000 ? `${Number((n / 10000).toFixed(1))} 万` : n.toLocaleString('zh-CN')) + ' 件';
  const detailLink = p => `03-detail.html?id=${p.id}`;
  const listingLink = keyvals => '02-listing.html?' + new URLSearchParams(keyvals);

  function quote(p, qty, sku = p.skus[0]) {
    if (!sku || !Number.isSafeInteger(qty) || qty < p.moq || qty > sku.stock) return null;
    const index = p.tiers.findLastIndex(([min]) => qty >= min);
    const unit = p.tiers[index][1] + sku.delta;
    return { index, unit, total: unit * qty };
  }

  const lineKey = ({ id, sku }) => `${id}:${sku}`;
  const initial = () => ({
    cart: [{ id:'p1', sku:'green', qty:500 }, { id:'p2', sku:'base', qty:200 }],
    basket: [{ id:'p1', note:'' }, { id:'p5', note:'' }],
    records: [
      { key:'demo1', id:'p1', title:'保温杯定制询盘', note:'请提供 500 件定制报价。', status:'待回复', date:'2026-11-18T10:24:00' },
      { key:'demo2', id:'p2', title:'收纳盒交期确认', note:'请确认 200 件发货时间。', status:'已回复', date:'2026-11-17T09:50:00' }
    ]
  });
  const key = 'yj_demo_v2';
  let fallback;
  function state() {
    if (fallback) return fallback;
    try {
      const raw = root.localStorage.getItem(key);
      if (raw === null) return initial();
      const value = JSON.parse(raw);
      if (!Array.isArray(value?.cart) || !Array.isArray(value.basket) || !Array.isArray(value.records)) return initial();
      return {
        cart: value.cart.filter(l => l && product(l.id) && skuFor(product(l.id), l.sku) && quote(product(l.id), l.qty, skuFor(product(l.id), l.sku))),
        basket: value.basket.filter(l => l && product(l.id) && typeof l.note === 'string'),
        records: value.records.filter(r => r && product(r.id) && typeof r.key === 'string' && typeof r.note === 'string' && typeof r.title === 'string' && Number.isFinite(Date.parse(r.date)) && ['待回复', '已回复', '已关闭'].includes(r.status))
      };
    } catch { return initial(); }
  }
  function save(value) {
    let lasting = true;
    try { root.localStorage.setItem(key, JSON.stringify(value)); fallback = undefined; }
    catch { fallback = value; lasting = false; }
    if (root.document) root.dispatchEvent(new Event('yj-change'));
    return lasting;
  }
  function addCart(p, sku, qty) {
    const draft = state(), exists = draft.cart.find(l => l.id === p.id && l.sku === sku.id);
    const count = (exists?.qty || 0) + qty;
    if (!quote(p, qty, sku) || !quote(p, count, sku)) return '请检查起批量和所选规格库存';
    if (exists) exists.qty = count;
    else draft.cart.push({ id:p.id, sku:sku.id, qty });
    return save(draft) ? '已加入采购车' : '已加入当前页面；浏览器未保存到本地';
  }
  function appendBasket(draft, ids, note = '') {
    const valid = [...new Set(ids)].filter(id => product(id));
    const fresh = valid.filter(id => !draft.basket.some(x => x.id === id));
    if (draft.basket.length + fresh.length > 8) return false;
    fresh.forEach(id => draft.basket.push({ id, note }));
    if (note) draft.basket.forEach(row => { if (valid.includes(row.id)) row.note = note; });
    return true;
  }
  function addBasket(ids, note) {
    const draft = state();
    if (!appendBasket(draft, ids, note)) return '询价篮最多 8 项，请先提交或移除';
    return save(draft) ? '已加入询价篮' : '已加入当前页面；浏览器未保存到本地';
  }
  function submitBasket(ids, note) {
    const draft = state();
    const selected = draft.basket.filter(row => ids.includes(row.id));
    if (!selected.length) return '请先勾选待询价商品';
    const date = new Date().toISOString();
    draft.records.unshift(...selected.map((row, i) => ({ key:`${date}-${i}`, id:row.id, title:product(row.id).name, status:'待回复', date, note:note || row.note })));
    draft.basket = draft.basket.filter(row => !ids.includes(row.id));
    return save(draft) ? `已提交 ${selected.length} 条模拟询盘` : `已生成 ${selected.length} 条询盘，仅在当前页保留`;
  }

  const api = { catalog, categories, product, skuFor, quote, money, leadText, soldText, state, save, lineKey, addCart, appendBasket, addBasket, submitBasket, detailLink, listingLink };
  if (!root.document) { module.exports = api; return; }

  const $ = (s, parent = document) => parent.querySelector(s);
  const $$ = (s, parent = document) => Array.from(parent.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const params = new URLSearchParams(location.search);
  const icon = name => `<svg class="ico" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const photo = (name, alt, cls = '', eager = false) => `<img class="photo ${cls}" src="assets/photos/${name}.jpg" width="180" height="160" alt="${esc(alt)}" ${eager ? '' : 'loading="lazy"'} decoding="async">`;
  const item = (p, meta = '') => `<a class="item" href="${detailLink(p)}">${photo(p.photo, '', 'mini-photo')}<span><strong>${esc(p.name)}</strong>${meta ? `<small class="muted">${esc(meta)}</small>` : ''}</span></a>`;
  const inquiryButton = (p, basket) => `<button class="link" type="button" data-inquire="${p.id}" ${basket.some(x => x.id === p.id) ? 'disabled>已加入' : '>加入询价篮'}</button>`;
  function card(p, options = {}) {
    return `<article class="panel product-card"><div class="card-top">
      <a class="card-photo" href="${detailLink(p)}" aria-label="查看${esc(p.name)}">${photo(p.photo, '', '', options.eager)}<span class="image-count">${p.id === 'p1' ? 3 : 1} 张</span></a>
      <div class="card-prices">${p.tiers.slice(0,2).map(([q,c]) => `<p><b class="money">${money(c)}</b> <span>/ ${q} 件起</span></p>`).join('')}<p class="row-inline">${icon('clock')}${leadText(p.lead)}发货</p><p class="source" title="${esc(p.supplier.name)}">${p.supplier.name} · ${p.supplier.place}</p></div></div>
      <div class="card-body"><h3 class="card-title"><a href="${detailLink(p)}">${p.name}</a></h3><small class="muted">30 天销量：${soldText(p.sold)} · ${p.spec}</small><div class="card-foot"><span class="tag">${p.supplier.cert || '暂无资质'}</span><small class="muted">货号 ${p.code}</small></div>
      ${options.basket ? `<div class="card-actions"><label class="choice"><input type="checkbox" data-compare="${p.id}" ${options.compare.has(p.id) ? 'checked' : ''}>加入对比</label>${inquiryButton(p, options.basket)}</div>` : ''}</div></article>`;
  }
  let toastTimer;
  function toast(text) {
    const el = $('#toast');
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3300);
  }
  function dialog(title, content, submit, action) {
    const box = $('#modal');
    if (box.open) box.close();
    box.innerHTML = `<h2 id="modal-title">${esc(title)}</h2><form method="dialog">${content}<div class="dialog-actions"><button type="button" class="button outline" data-dismiss>${submit ? '取消' : '关闭'}</button>${submit ? `<button class="button primary" type="submit">${esc(submit)}</button>` : ''}</div></form>`;
    $('[data-dismiss]', box).onclick = () => box.close();
    $('form', box).onsubmit = e => {
      e.preventDefault();
      const error = action?.(new FormData(e.currentTarget), box);
      if (error) {
        const status = $('.dialog-error', box) || e.currentTarget.appendChild(document.createElement('p'));
        status.className = 'dialog-error'; status.setAttribute('role', 'alert'); status.textContent = error;
      } else box.close();
    };
    box.showModal();
    return box;
  }
  function badges() {
    const s = state();
    $$('[data-count]').forEach(el => { el.textContent = s[el.dataset.count].length; });
  }
  function mount() {
    $('#site-header').innerHTML = `<div class="wrap header-main"><a class="logo" href="01-home.html" aria-label="源集首页">源集<small>YUANJI</small></a>
      <form class="search" action="02-listing.html" role="search"><input type="search" name="kw" aria-label="搜索商品、货号或供应商" placeholder="搜商品、货号或供应商"><button type="button" class="button image-search">${icon('image')}图片找货</button><button class="button primary" type="submit">搜索</button></form>
      <nav class="header-actions" aria-label="账户和采购"><a href="04-workbench.html?tab=cart">${icon('cart')}采购车 <span class="badge" data-count="cart"></span></a><a href="04-workbench.html?tab=inquiry">${icon('inquiry')}询价篮 <span class="badge" data-count="basket"></span></a><button class="link" id="account" type="button">${icon('user')}登录 / 注册</button></nav></div>`;
    document.body.insertAdjacentHTML('beforeend', '<dialog class="dialog" id="modal" aria-labelledby="modal-title"></dialog><div class="toast" id="toast" role="status" hidden></div>');
    $('.search input').value = params.get('kw') || (document.body.dataset.page === 'listing' && !location.search ? '保温杯' : '');
    $('.image-search').onclick = () => {
      const box = dialog('图片找货', '<p class="muted">选择或拖入一张图片。此功能仅演示本地选图，不上传、不识别商品。</p><label>选择本地图片 <input name="image" type="file" accept="image/*" required></label>', '查看示例结果', data => {
        if (!data.get('image')?.type?.startsWith('image/')) return '请选择图片文件';
        location.href = listingLink({kw:'保温杯'});
      });
      box.ondragover = e => e.preventDefault();
      box.ondrop = e => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) $('input[type=file]', box).files = e.dataTransfer.files;
      };
      box.addEventListener('close', () => { box.ondragover = box.ondrop = null; }, {once:true});
    };
    $('#account').onclick = () => dialog('登录 / 注册', '<p class="muted">当前为采购演示，不收集账号信息。你可以直接浏览商品并试用本地采购工作台。</p>');
    document.addEventListener('error', e => {
      if (!e.target.matches?.('img.photo')) return;
      const div = document.createElement('span');
      div.className = e.target.className + ' photo-fallback';
      div.textContent = '暂无图片';
      e.target.replaceWith(div);
    }, true);
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-inquire]');
      if (btn) toast(addBasket([btn.dataset.inquire]));
    });
    addEventListener('yj-change', badges);
    addEventListener('storage', e => { if (e.key === key) { fallback = undefined; root.dispatchEvent(new Event('yj-change')); } });
    addEventListener('pageshow', () => root.dispatchEvent(new Event('yj-change')));
    badges();
  }
  root.YJ = Object.assign(api, { $, $$, esc, params, icon, photo, item, inquiryButton, card, toast, dialog });
  mount();
})(typeof window === 'undefined' ? globalThis : window);
