(function (YJ) {
  'use strict';
  const { $, $$, esc, params, catalog, product, quote, money, icon, photo, item, card, toast, dialog, detailLink, listingLink } = YJ;
  const { leadText, soldText } = YJ;
  const number = n => n.toLocaleString('zh-CN');
  const tag = label => `<span class="tag">${esc(label)}</span>`;
  const dateText = date => new Date(date).toLocaleDateString('zh-CN');
  const empty = (text, action = '') => `<div class="empty"><p>${esc(text)}</p>${action}</div>`;
  const press = (el, active) => el.setAttribute('aria-pressed', String(active));

  function home() {
    const categories = Object.entries(YJ.categories);
    $('#category-links').innerHTML = categories.map(([name]) => `<a href="${esc(listingLink({cat:name}))}">${name}</a>`).join('');
    $('#category-menu').innerHTML = categories.flatMap(([cat, children]) => children.map(sub => `<a href="${esc(listingLink({cat,sub}))}">${sub}</a>`)).join('') + '<a href="02-listing.html?kw=">浏览全部商品</a>';
    $('#board-cup').textContent = money(product('p1').tiers[0][1]);
    $('#board-carton').textContent = money(product('p3').tiers[0][1]);
    let start = 0, count = 4;
    function render(announce = false) {
      const ordered = catalog.slice(start).concat(catalog.slice(0, start));
      $('#recommend-grid').innerHTML = ordered.slice(0,count).map((p,i) => card(p, { eager:i < 4 })).join('');
      if (announce) $('#recommend-status').textContent = `已更新推荐，展示 ${Math.min(count, catalog.length)} 件商品`;
      $('#load-more').disabled = count >= catalog.length;
      $('#load-more').textContent = count >= catalog.length ? '已展示全部商品' : '加载更多';
    }
    $('#shuffle').onclick = () => { start = (start + 4) % catalog.length; count = 4; render(true); };
    $('#load-more').onclick = () => { count = Math.min(count + 4, catalog.length); render(true); };
    render();
  }

  function listing() {
    const defaultView = !location.search;
    const keyword = (params.get('kw') || (defaultView ? '保温杯' : '')).trim();
    const ctx = { cat:params.get('cat') || '', sub:params.get('sub') || '', scene:params.get('scene') || '' };
    const groups = [
      ['moq', '起批量', [['low','50 件以下'], ['mid','50–200 件'], ['high','200 件以上']]],
      ['lead', '交期', [['48','48 小时内'], ['72','3 天内'], ['168','7 天内']]],
      ['region', '产地', ['浙江','广东','江苏']], ['cert', '认证', ['源头工厂','实力商家','深度认证']],
      ['ship', '发货地', ['浙江','广东','江苏']]
    ].map(([key,label,values]) => [key,label,values.map(v => Array.isArray(v) ? v : [v,v])]);
    const filters = { min:'', max:'', moq:[], lead:[], region:[], cert:[], ship:[] };
    if (groups[3][2].some(([value]) => value === params.get('cert'))) filters.cert = [params.get('cert')];
    const selected = new Set(defaultView ? ['p1','p5'] : []);
    let view = 'list', sort = 'recommended', page = 1;
    const limit = 5;
    const form = $('#filters');
    const results = $('#results');
    $('#filter-options').innerHTML = groups.map(([key,label,values]) => `<fieldset><legend>${label}</legend>${values.map(([v,text]) => `<label class="choice"><input type="checkbox" name="${key}" value="${v}">${text}</label>`).join('')}</fieldset>`).join('');
    function syncForm() {
      $$('input', form).forEach(el => { if (el.type === 'checkbox') el.checked = filters[el.name].includes(el.value); else el.value = filters[el.name]; });
    }
    function syncContext() {
      $('#list-title').textContent = keyword || ctx.sub || ctx.cat || ctx.scene || '全部商品';
      $('#list-crumb').textContent = [ctx.cat,ctx.sub].filter(Boolean).join(' / ') || (defaultView ? '日用百货 / 杯壶水具' : '搜索结果');
    }
    const matchScene = p => !ctx.scene || (ctx.scene === '现货快发' ? p.lead <= 48 : ctx.scene === '小单试采' ? p.moq < 50 : p.scenes.includes(ctx.scene));
    const any = (values, predicate) => !values.length || values.some(predicate);
    function matches(p) {
      const price = p.tiers[0][1] / 100;
      return (!keyword || `${p.name} ${p.code} ${p.supplier.name} ${p.subcategory}`.toLowerCase().includes(keyword.toLowerCase())) &&
        (!ctx.cat || p.category === ctx.cat) && (!ctx.sub || p.subcategory === ctx.sub) && matchScene(p) &&
        (!filters.min || price >= Number(filters.min)) && (!filters.max || price <= Number(filters.max)) &&
        any(filters.moq, v => v === 'low' ? p.moq < 50 : v === 'mid' ? p.moq >= 50 && p.moq <= 200 : p.moq > 200) &&
        any(filters.lead, v => p.lead <= Number(v)) && any(filters.region, v => p.supplier.place.startsWith(v)) &&
        any(filters.cert, v => p.supplier.cert === v) && any(filters.ship, v => p.shipFrom === v) &&
        (!$('#only-selected').checked || selected.has(p.id));
    }
    function drawChips() {
      const chips = [[ctx.cat,'context','cat'],[ctx.sub,'context','sub'],[ctx.scene,'context','scene']].filter(([label]) => label);
      if (filters.min) chips.push([`单价 ≥ ${money(Math.round(+filters.min * 100))}`,'min','']);
      if (filters.max) chips.push([`单价 ≤ ${money(Math.round(+filters.max * 100))}`,'max','']);
      groups.forEach(([key,label,values]) => values.forEach(([v,text]) => { if (filters[key].includes(v)) chips.push([`${label}：${text}`,key,v]); }));
      $('#filters-active').innerHTML = chips.length ? chips.map(([label,key,v]) => `<button type="button" class="chip" data-chip="${key}" data-value="${esc(v)}" aria-label="移除 ${esc(label)}">${esc(label)} <span aria-hidden="true">×</span></button>`).join('') + '<button class="link" type="button" data-clear>清空筛选</button>' : '<small class="muted">快捷筛选</small><button type="button" class="chip" data-quick="cert">源头工厂</button><button type="button" class="chip" data-quick="lead">48 小时内发货</button>';
    }
    function drawTrial() {
      const qty = Number($('#trial-qty').value);
      $('#trial-results').innerHTML = selected.size ? [...selected].map(id => {
        const p = product(id), q = quote(p,qty);
        const text = !Number.isSafeInteger(qty) || qty < 1 ? '请输入正整数' : qty < p.moq ? `未达 ${p.moq} 件起批量` : '超出默认规格库存';
        return `<p><strong>${p.name}</strong><br>${q ? `${money(q.unit)} / 件 · 预估 ${money(q.total)}` : text}</p>`;
      }).join('') : '<p class="muted">先勾选商品，再按同一数量比较报价。</p>';
    }
    function drawDock(basket) {
      $('#dock-count').textContent = basket.length;
      $('#dock-list').innerHTML = basket.length ? basket.map(({id}) => `<li>${item(product(id))}<button class="link" type="button" data-remove-basket="${id}" aria-label="移除${product(id).name}">移除</button></li>`).join('') : '<li class="muted">询价篮为空，先添加想询价的商品。</li>';
    }
    function table(list,basket) {
      return `<div class="overflow" tabindex="0" role="region" aria-label="可横向滚动的对比列表"><table class="table results-table"><thead><tr><th scope="col"><span class="visually-hidden">勾选</span></th><th scope="col">商品</th><th scope="col">阶梯价</th><th scope="col">起批量</th><th scope="col">交期</th><th scope="col">近 30 天销量</th><th scope="col">供应商 / 资质</th><th scope="col"><span class="visually-hidden">操作</span></th></tr></thead><tbody>${list.map(p => `<tr class="${selected.has(p.id) ? 'selected' : ''}"><td><input type="checkbox" data-compare="${p.id}" aria-label="对比${p.name}" ${selected.has(p.id) ? 'checked' : ''}></td><td>${item(p)}</td><td>${p.tiers.slice(0,2).map(([q,c]) => `<span><b class="money">${money(c)}</b> <small>/ ${q} 件起</small></span>`).join('')}</td><td>${p.moq} 件</td><td>${leadText(p.lead)}</td><td>${soldText(p.sold)}</td><td>${p.supplier.name}<small class="muted">${p.supplier.place}</small>${tag(p.supplier.cert || '暂无资质')}</td><td>${YJ.inquiryButton(p,basket)}</td></tr>`).join('')}</tbody></table></div>`;
    }
    function restore(container, selector, dataKey, dataValue) {
      $$(selector, container).find(el => el.dataset[dataKey] === dataValue)?.focus();
    }
    function drawResults() {
      const basket = YJ.state().basket;
      const all = catalog.filter(matches);
      const compare = { price:(a,b) => a.tiers[0][1] - b.tiers[0][1], sold:(a,b) => b.sold - a.sold, lead:(a,b) => a.lead - b.lead };
      if (compare[sort]) all.sort(compare[sort]);
      const pages = Math.max(1,Math.ceil(all.length / limit));
      page = Math.min(page,pages);
      const slice = all.slice((page - 1) * limit, page * limit);
      $('#result-count').textContent = all.length;
      $('#compare-count').textContent = `已勾选 ${selected.size} / 4`;
      results.innerHTML = !slice.length ? empty('没有符合条件的商品。可以调整条件或更换关键词。','<button class="button outline" type="button" data-clear>清空筛选</button>') : view === 'list' ? table(slice,basket) : `<div class="product-grid">${slice.map(p => card(p,{basket,compare:selected})).join('')}</div>`;
      const pageButton = (n, label = n, disabled = false, current = false) => `<button type="button" data-page-number="${n}" class="button ${current ? 'primary' : 'outline'}" ${disabled ? 'disabled' : ''} ${current ? 'aria-current="page"' : ''}>${label}</button>`;
      $('#pagination').innerHTML = all.length ? `<small class="muted">共 ${all.length} 件</small>${pageButton(page-1,'上一页',page===1)}${Array.from({length:pages},(_,i) => pageButton(i+1,i+1,false,i+1===page)).join('')}${pageButton(page+1,'下一页',page===pages)}` : '';
      drawDock(basket);
      drawTrial();
    }
    form.onsubmit = e => {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get('min') && data.get('max') && Number(data.get('min')) > Number(data.get('max'))) { toast('最低价不能高于最高价'); return; }
      filters.min = data.get('min'); filters.max = data.get('max');
      groups.forEach(([key]) => { filters[key] = data.getAll(key); });
      page = 1; drawChips(); drawResults();
    };
    document.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const d = btn.dataset;
      if ('clear' in d) {
        filters.min = filters.max = ctx.cat = ctx.sub = ctx.scene = '';
        groups.forEach(([key]) => { filters[key] = []; });
        $('#only-selected').checked = false;
      } else if (d.chip) {
        if (d.chip === 'context') ctx[d.value] = '';
        else if (Array.isArray(filters[d.chip])) filters[d.chip] = filters[d.chip].filter(v => v !== d.value);
        else filters[d.chip] = '';
      } else if (d.quick) filters[d.quick] = [d.quick === 'cert' ? '源头工厂' : '48'];
      else if (d.sort) { sort = d.sort; $$('[data-sort]').forEach(el => press(el,el === btn)); }
      else if (d.view) { view = d.view; $$('[data-view]').forEach(el => press(el,el === btn)); drawResults(); return; }
      else if (d.pageNumber) { page = Number(d.pageNumber); drawResults(); restore($('#pagination'),'[data-page-number]','pageNumber',d.pageNumber); return; }
      else if (d.removeBasket) { const draft = YJ.state(); draft.basket = draft.basket.filter(x => x.id !== d.removeBasket); toast(YJ.save(draft) ? '已移除询价篮商品' : '已从当前页移除，浏览器未保存到本地'); $('#dock-title').setAttribute('tabindex','-1'); $('#dock-title').focus(); return; }
      else return;
      page = 1; syncContext(); syncForm(); drawChips(); drawResults();
      if (d.chip || d.quick || 'clear' in d) ($('#filters-active button') || $('#filters button')).focus();
    });
    results.onchange = e => {
      const el = e.target;
      const id = el.dataset.compare;
      if (!id) return;
      if (el.checked && selected.size === 4) { el.checked = false; toast('最多对比 4 件'); return; }
      el.checked ? selected.add(id) : selected.delete(id);
      drawResults(); restore(results,'[data-compare]','compare',id);
    };
    $('#only-selected').onchange = () => { page = 1; drawResults(); };
    $('#trial-qty').oninput = drawTrial;
    addEventListener('yj-change', () => {
      const id = document.activeElement?.dataset.inquire;
      drawResults();
      if (id) restore(results,'[data-compare]','compare',id);
    });
    syncContext(); syncForm(); drawChips(); drawResults();
  }

  function detail() {
    const p = product(params.get('id') || 'p1');
    if (!p) { $('#detail-content').hidden = true; $('#detail-missing').hidden = false; return; }
    document.title = `${p.name} · 源集`;
    $('#product-title').textContent = p.name;
    const category = $('#detail-category');
    category.textContent = `${p.category} / ${p.subcategory}`;
    category.href = listingLink({cat:p.category,sub:p.subcategory});
    $('#product-meta').innerHTML = `${p.scenes.includes('品牌定制') ? tag('支持定制 Logo') : ''}<span>货号 ${p.code}</span><span>近 30 天成交 ${soldText(p.sold)}</span>`;
    let sku = p.skus[0];
    const qty = $('#detail-qty');
    qty.min = p.moq; qty.value = p.id === 'p1' ? 500 : p.moq;
    const gallery = p.id === 'p1' ? [[p.photo,p.name],['mouth','保温杯内胆和瓶口'],['cap','拉丝银色杯盖']] : [[p.photo,p.name]];
    $('#gallery-thumbs').innerHTML = `${gallery.map(([name,label],i) => `<button type="button" aria-label="${esc(label)}" data-image="${i}" aria-pressed="${i===0}">${photo(name,'')}</button>`).join('')}<button type="button" data-video>视频</button>`;
    function showImage(index) {
      $('#gallery-main').innerHTML = photo(...gallery[index], '', true);
      $$('[data-image]').forEach(btn => press(btn,+btn.dataset.image === index));
    }
    showImage(0);
    $('#gallery-thumbs').onclick = e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if ('video' in btn.dataset) dialog('商品视频','<p class="muted">暂无视频，仍可通过图片查看商品细节。</p>');
      else showImage(Number(btn.dataset.image));
    };
    const option = (text,name,value,active,disabled = false) => `<button class="option" type="button" data-${name}="${esc(value)}" aria-pressed="${active}" ${disabled ? 'disabled' : ''}>${esc(text)}</button>`;
    function drawSku() {
      $('#sku-options').innerHTML = p.id === 'p1' ? `<div class="sku-row" role="group" aria-label="颜色"><span>颜色</span>${[...new Set(p.skus.map(s => s.color))].map(c => option(c,'color',c,sku.color === c)).join('')}</div><div class="sku-row" role="group" aria-label="容量"><span>容量</span>${[...new Set(p.skus.map(s => s.size))].map(size => {
        const found = p.skus.find(s => s.size === size && s.color === sku.color && s.stock > 0);
        return option(size + (found ? '' : '（缺货）'),'sku',found?.id || '',sku.size === size,!found);
      }).join('')}</div>` : `<div class="sku-row" role="group" aria-label="规格"><span>规格</span>${p.skus.map(s => option(s.label,'sku',s.id,sku.id === s.id,!s.stock)).join('')}</div>`;
    }
    function drawQuote() {
      const q = quote(p,Number(qty.value),sku);
      $('#quote-tiers').innerHTML = p.tiers.map(([min,cents],i) => {
        const on = q?.index === i, up = p.tiers[i+1]?.[0];
        return `<div class="quote-tier ${on ? 'current' : ''}">${on ? '<span class="tier-label">当前档</span>' : ''}<span class="num">${up ? `${min} – ${up-1}` : `≥ ${min}`} 件</span><strong class="money">${money(cents+sku.delta)}</strong></div>`;
      }).join('');
      $('#stock-note').textContent = `${p.moq} 件起批　库存 ${number(sku.stock)} 件`;
      $('#estimate').textContent = q ? money(q.total) : '—';
      $('#add-cart').disabled = !q;
    }
    $('#sku-options').onclick = e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const key = btn.dataset.color ? 'color' : 'sku';
      sku = key === 'color' ? p.skus.find(s => s.color === btn.dataset.color && s.stock) : YJ.skuFor(p,btn.dataset.sku);
      qty.max = sku.stock;
      drawSku(); drawQuote();
      $$(`[data-${key}]`).find(el => el.dataset[key] === btn.dataset[key])?.focus();
    };
    $$('[data-step]').forEach(btn => { btn.onclick = () => { qty.value = Math.max(p.moq,Math.min(sku.stock,(Number(qty.value) || p.moq) + Number(btn.dataset.step))); drawQuote(); }; });
    qty.max = sku.stock; qty.oninput = drawQuote;
    $('#add-cart').onclick = () => toast(YJ.addCart(p,sku,Number(qty.value)));
    $('#ask-product').onclick = () => dialog('发起询盘', `<p>${p.name} · ${esc(sku.label)}</p><label for="ask-note">给供应商的留言</label><textarea id="ask-note" name="note" rows="3" maxlength="300" required placeholder="例如：500 件是否支持 Logo 定制？"></textarea>`, '加入询价篮', data => {
      const note = data.get('note').trim();
      if (!note) return '请输入询盘内容';
      const message = YJ.addBasket([p.id],note);
      if (message.startsWith('询价篮最多')) return message;
      toast(message);
    });
    $('#services').innerHTML = `<span>${icon('clock')}${leadText(p.lead)}发货</span><button class="link" type="button" id="return-policy">${icon('shield')}退换政策</button>${p.scenes.includes('品牌定制') ? `<span>${icon('ruler')}支持 Logo 定制</span>` : ''}`;
    $('#return-policy').onclick = () => dialog('退换政策','<p class="muted">现货与定制品的退换条件不同，请在询盘中向供应商确认。本页面不产生真实订单。</p>');
    const s = p.supplier;
    $('#supplier-strip').innerHTML = `<figure>${s.photo ? photo(s.photo,'工厂环境示意') : '<span class="photo photo-fallback">暂无工厂图</span>'}${s.photo ? '<figcaption>工厂环境示意</figcaption>' : ''}</figure><div><h2>${s.name}</h2><div class="product-meta"><span>${s.place}</span>${tag(s.cert ? `${s.cert}（示例）` : '暂无资质')}<span>成立 ${s.year ? `${s.year} 年` : '暂无'}</span><span>近 90 天回头率 ${s.repeat ? `${s.repeat}%` : '暂无'}</span><span>营业执照 暂无</span></div></div><button class="button outline" type="button" id="supplier-profile">查看档案</button>`;
    $('#supplier-profile').onclick = () => dialog('供应商档案', `<p><strong>${s.name}</strong> · ${s.place}</p><p class="muted">供应商、资质标签和统计数据均为模拟示例，不构成认证。营业执照：暂无。</p>`);
    const same = p.id === 'p1' ? product('p9') : p.id === 'p9' ? product('p1') : null;
    $('#other-offers').innerHTML = same ? `${item(same, `${same.supplier.name} · ${money(same.tiers[0][1])} / 件 · ${same.moq} 件起批`)}` : '<p class="muted">暂无同款供应商报价。</p>';
    $('#related').innerHTML = catalog.filter(x => x.id !== p.id && (x.category === p.category || x.id === 'p1' || x.id === 'p2')).slice(0,4).map(x => `<a href="${detailLink(x)}">${photo(x.photo,'')}<span>${x.name}</span></a>`).join('');
    drawSku(); drawQuote();
  }

  function workbench() {
    const tab = ['cart','inquiry','order','fav','data'].includes(params.get('tab')) ? params.get('tab') : 'cart';
    $(`[data-pane="${tab}"]`).hidden = false;
    $(`[data-tab="${tab}"]`).setAttribute('aria-current','page');
    const choice = new Set(YJ.state().cart.map(YJ.lineKey));
    const inqChoice = new Set(YJ.state().basket.map(l => l.id));
    const lineKey = YJ.lineKey;
    function refreshCart() {
      const lines = YJ.state().cart.map(l => ({...l,key:lineKey(l),p:product(l.id)}));
      const selected = lines.filter(l => choice.has(l.key));
      const groups = new Map();
      lines.forEach(l => {
        l.variant = YJ.skuFor(l.p,l.sku); l.price = quote(l.p,l.qty,l.variant);
        if (!groups.has(l.p.supplierId)) groups.set(l.p.supplierId,[]);
        groups.get(l.p.supplierId).push(l);
      });
      const sum = rows => rows.reduce((a,x) => a + x.price.total,0);
      $('#cart-lines').innerHTML = lines.length ? `<div class="overflow" tabindex="0" role="region" aria-label="可横向滚动的采购车表格"><table class="table cart-table"><thead><tr><th scope="col"><span class="visually-hidden">勾选</span></th><th scope="col">商品 / 规格</th><th scope="col">起批量</th><th scope="col">单价</th><th scope="col">采购数量</th><th scope="col">小计</th><th scope="col">操作</th></tr></thead>${[...groups].map(([id,rows]) => {
        const s = rows[0].p.supplier;
        return `<tbody><tr class="group"><td><input type="checkbox" aria-label="勾选${s.name}商品" data-group="${id}" ${rows.every(l => choice.has(l.key)) ? 'checked' : ''}></td><th scope="rowgroup" colspan="4">${s.name} · ${s.place}</th><td class="money">${money(sum(rows))}</td><td></td></tr>${rows.map(l => {
          const {p, key, variant, price, qty} = l;
          return `<tr><td><input type="checkbox" data-line="${key}" aria-label="勾选${p.name} ${esc(variant.label)}" ${choice.has(key) ? 'checked' : ''}></td><td>${item(p,variant.label)}</td><td>${p.moq} 件起批</td><td class="num">${money(price.unit)}</td><td class="qty-cell"><div class="quantity"><button type="button" data-line-key="${key}" data-qty-step="-1" aria-label="减少${p.name}采购数量" ${qty <= p.moq ? 'disabled' : ''}>−</button><input type="number" data-qty="${key}" step="1" min="${p.moq}" max="${variant.stock}" value="${qty}" aria-label="${p.name}采购数量"><button type="button" data-line-key="${key}" data-qty-step="1" aria-label="增加${p.name}采购数量" ${qty >= variant.stock ? 'disabled' : ''}>+</button></div></td><td class="money">${money(price.total)}</td><td class="cart-actions-cell">${p.skus.length > 1 ? `<button class="link" type="button" data-edit="${key}">改规格</button> ` : ''}<button class="link" type="button" data-delete="${key}">移除</button></td></tr>`;
        }).join('')}</tbody>`;
      }).join('')}</table></div>` : empty('采购车为空，先去挑选要采购的商品。','<a class="button outline" href="02-listing.html">去找货</a>');
      const checked = $('#cart-all');
      checked.disabled = !lines.length; checked.checked = !!lines.length && selected.length === lines.length; checked.indeterminate = selected.length > 0 && selected.length < lines.length;
      $$('[data-group]').forEach(ch => { const group = groups.get(ch.dataset.group); ch.indeterminate = group.some(l => choice.has(l.key)) && !ch.checked; });
      $$('[data-batch]').forEach(btn => { btn.disabled = selected.length === 0; });
      $('#cart-inquiry').disabled = !selected.length;
      $('#cart-total').innerHTML = `<div class="cart-stats"><span>已选 <b>${selected.length}</b> 项</span><span><b>${new Set(selected.map(l => l.p.supplierId)).size}</b> 家供应商</span></div><div class="cart-sum">预估合计 <output class="money">${money(sum(selected))}</output></div>`;
      $('#follow-items').innerHTML = YJ.state().records.filter(r => r.status !== '已关闭').slice(0,2).map(r => `<div class="follow-link"><strong>${esc(r.title)}</strong> · ${r.status}<span class="row-inline"><small class="muted">${dateText(r.date)}</small><a class="link" href="04-workbench.html?tab=inquiry#record-${encodeURIComponent(r.key)}">查看询盘</a></span></div>`).join('') || '<p class="muted">暂无待跟进询盘。</p>';
    }
    function refreshInquiry() {
      const {basket,records} = YJ.state();
      $('#work-basket').innerHTML = basket.length ? `<form class="inquiry-form" id="inquiry-form">${basket.map(l => `<label class="inquiry-choice"><input type="checkbox" name="items" value="${l.id}" ${inqChoice.has(l.id) ? 'checked' : ''}><span><strong>${product(l.id).name}</strong>${l.note ? `<small class="muted"> · ${esc(l.note)}</small>` : ''}</span></label>`).join('')}<label for="work-note">统一询盘留言（选填）</label><textarea id="work-note" name="note" rows="2" maxlength="300" placeholder="留空则沿用商品询盘留言"></textarea><button type="submit" class="button primary">提交模拟询盘</button></form>` : empty('询价篮为空。你可以在结果页或详情页添加商品。');
      $('#inquiry-records').innerHTML = records.length ? records.map(r => `<article class="record" id="record-${esc(r.key)}"><div class="record-header"><strong>${esc(r.title)}</strong>${tag(r.status)}<time datetime="${esc(r.date)}" class="small muted">${dateText(r.date)}</time></div><p>${r.note ? esc(r.note) : '询问当前批发价和交期。'}</p><small class="muted">${dateText(r.date)} 发起采购询盘${r.status === '已回复' ? ' · 供应商回复（模拟）：现货发货时间请以确认单为准。' : ''}${r.status === '已关闭' ? ' · 已关闭' : ''}</small>${r.status !== '已关闭' ? `<button class="link" data-close-record="${esc(r.key)}" type="button">关闭询盘</button>` : ''}</article>`).join('') : empty('暂无询盘记录。');
      const form = $('#inquiry-form');
      if (!form) return;
      form.onchange = e => {
        const input = e.target;
        if (input.name === 'items') input.checked ? inqChoice.add(input.value) : inqChoice.delete(input.value);
      };
      form.onsubmit = e => {
        e.preventDefault();
        const data = new FormData(form);
        toast(YJ.submitBasket(data.getAll('items'),data.get('note').trim()));
        $('#inquiry-records h2, #inquiry-records .record')?.scrollIntoView({block:'nearest'});
      };
    }
    function validateQuantities(draft) {
      const keys = new Set();
      return draft.cart.every(l => {
        const key = lineKey(l), p = product(l.id);
        const valid = !keys.has(key) && quote(p,l.qty,YJ.skuFor(p,l.sku));
        keys.add(key);
        return valid;
      });
    }
    const save = (draft,text) => toast(YJ.save(draft) ? text : '已在当前页修改，浏览器未保存到本地');
    function setQty(key, qty, focus) {
      const draft = YJ.state();
      const l = draft.cart.find(x => lineKey(x) === key);
      if (!l) return;
      const p = product(l.id);
      if (!quote(p,qty,YJ.skuFor(p,l.sku))) { toast(`请输入 ${p.moq} 至 ${YJ.skuFor(p,l.sku).stock} 的整数数量`); refreshCart(); }
      else { l.qty = qty; if (!YJ.save(draft)) toast('已在当前页修改，浏览器未保存到本地'); }
      if (focus) $$('[data-qty-step]').find(x => x.dataset.lineKey === key && x.dataset.qtyStep === focus && !x.disabled)?.focus();
    }
    function batch(kind, keys, goToInquiry = false) {
      if (!keys.length) return;
      const draft = YJ.state();
      const lines = draft.cart.filter(l => keys.includes(lineKey(l)));
      if (kind === 'delete') {
        return dialog('移除采购车商品', `<p>从采购车移除 ${lines.length} 项商品？</p>`, '确认移除', () => {
          draft.cart = draft.cart.filter(l => !keys.includes(lineKey(l)));
          keys.forEach(key => choice.delete(key));
          save(draft,'已移除采购车商品');
        });
      }
      if (kind === 'move') {
        if (!YJ.appendBasket(draft,lines.map(l => l.id))) { toast('询价篮最多 8 项，请先提交或移除'); return; }
        if (!goToInquiry) draft.cart = draft.cart.filter(l => !keys.includes(lineKey(l)));
        const lasting = YJ.save(draft);
        if (goToInquiry && lasting) location.href = '04-workbench.html?tab=inquiry';
        else toast(lasting ? '已移入询价篮' : '当前页已更新，浏览器未保存到本地');
        return;
      }
      const spec = kind === 'spec';
      if (spec && lines.every(l => product(l.id).skus.filter(s => s.stock > 0).length === 1)) { toast('所选商品没有其他可选规格'); return; }
      dialog(spec ? '修改所选商品规格' : '修改所选商品数量', spec ? lines.map(l => `<label>${product(l.id).name} <select name="${lineKey(l)}">${product(l.id).skus.map(s => `<option value="${s.id}" ${s.stock ? '' : 'disabled'} ${s.id === l.sku ? 'selected' : ''}>${esc(s.label)}${s.stock ? '' : '（缺货）'}</option>`).join('')}</select></label>`).join('') : '<label>每项采购数量 <input type="number" name="qty" min="1" step="1" required></label><p class="small muted">统一为所选商品应用同一数量，仍须符合每件商品的起批量和库存。</p>', '保存修改', data => {
        const next = YJ.state();
        const changed = next.cart.filter(l => keys.includes(lineKey(l)));
        if (!changed.length) return '所选商品已变化，请关闭后重新选择。';
        changed.forEach(l => {
          if (spec) l.sku = data.get(lineKey(l));
          else l.qty = Number(data.get('qty'));
        });
        if (!validateQuantities(next)) return '所选规格重复，或数量不符合起批量／库存，请调整后重试。';
        keys.forEach(k => choice.delete(k)); changed.forEach(l => choice.add(lineKey(l)));
        save(next,'已更新采购车');
      });
    }
    $('#cart-all').onchange = e => { YJ.state().cart.forEach(l => e.target.checked ? choice.add(lineKey(l)) : choice.delete(lineKey(l))); refreshCart(); };
    $('#cart-lines').onchange = e => {
      const el = e.target;
      if (el.dataset.qty) { setQty(el.dataset.qty,Number(el.value)); return; }
      if (el.dataset.line) el.checked ? choice.add(el.dataset.line) : choice.delete(el.dataset.line);
      else if (el.dataset.group) YJ.state().cart.filter(l => product(l.id).supplierId === el.dataset.group).forEach(l => el.checked ? choice.add(lineKey(l)) : choice.delete(lineKey(l)));
      else return;
      const key = el.dataset.line || el.dataset.group;
      refreshCart(); $$('[data-line], [data-group]').find(x => (x.dataset.line || x.dataset.group) === key)?.focus();
    };
    document.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const d = btn.dataset;
      if (d.qtyStep) {
        const l = YJ.state().cart.find(x => lineKey(x) === d.lineKey);
        if (l) setQty(d.lineKey,l.qty+Number(d.qtyStep),d.qtyStep);
      } else if (d.edit) batch('spec',[d.edit]);
      else if (d.delete) batch('delete',[d.delete]);
      else if (d.batch) batch(d.batch,[...choice]);
      else if (btn.id === 'cart-inquiry') batch('move',[...choice],true);
      else if (d.closeRecord) dialog('关闭询盘','<p>关闭后仅能查看，不能恢复为待回复。</p>','确认关闭',() => {
        const draft = YJ.state();
        const record = draft.records.find(r => r.key === d.closeRecord);
        if (record) { record.status = '已关闭'; save(draft,'已关闭询盘'); }
      });
    });
    const orders = [ ['SO-1118-01','p1',500,'待确认'], ['SO-1117-05','p2',200,'待发货'], ['SO-1116-02','p3',1000,'已发货'], ['SO-1114-03','p4',500,'已签收'] ];
    const orderFilter = $('#order-filter');
    orderFilter.innerHTML = ['全部','待确认','待发货','已发货','已签收'].map(s => `<option>${s}</option>`).join('');
    function showOrders() {
      $('#order-list').innerHTML = orders.filter(o => orderFilter.value === '全部' || orderFilter.value === o[3]).map(([code,id,qty,status]) => {
        const p = product(id);
        return `<article class="record"><div class="record-header"><strong>${code}</strong>${tag(status)}</div><p><a class="link" href="${detailLink(p)}">${p.name}</a> × ${qty} · ${p.supplier.name}</p><span class="money">${money(quote(p,qty).total)}</span></article>`;
      }).join('');
    }
    orderFilter.onchange = showOrders; showOrders();
    $('#favorite-products').innerHTML = ['p1','p2'].map(id => card(product(id))).join('');
    $('#favorite-suppliers').innerHTML = ['p1','p2'].map(id => {
      const p = product(id);
      return `<article class="record"><div class="record-header"><strong>${p.supplier.name}</strong>${tag(p.supplier.cert)}<span class="muted">${p.supplier.place}</span></div><a class="link" href="${esc(listingLink({kw:p.supplier.name}))}">查看供应商商品</a></article>`;
    }).join('');
    const months = [['6 月',18200],['7 月',21500],['8 月',19800],['9 月',25300],['10 月',23100],['本月',48730]];
    const last = months.at(-1)[1];
    $$('[data-summary]').forEach(el => { el.innerHTML = `<div class="kpis"><dl><dt>采购额</dt><dd class="money">${money(last*100)}</dd><small class="muted">已确认订单金额</small></dl><dl><dt>节支</dt><dd class="money">${money(326000)}</dd><small class="muted">模拟议价前后差额</small></dl><dl><dt>头部供应商占比</dt><dd class="money">65%</dd><progress max="100" value="65" aria-label="头部供应商采购额占比 65%"></progress><small class="muted">采购额最高一家 / 本月采购额</small></dl></div>`; });
    $('#purchase-chart').innerHTML = `<h3 class="sub-heading">近 6 个月采购额</h3><ul class="purchase-bars">${months.map(([m,v]) => `<li><span>${m}</span><progress aria-label="${m}采购额" value="${v}" max="${last}"></progress><b class="money">${money(v*100)}</b></li>`).join('')}</ul>`;
    function refresh() { if (tab === 'cart') refreshCart(); else if (tab === 'inquiry') refreshInquiry(); }
    addEventListener('yj-change',refresh);
    refresh();
    if (tab === 'inquiry' && location.hash) {
      try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); } catch { /* Ignore malformed URL fragments. */ }
    }
  }

  ({ home, listing, detail, workbench })[document.body.dataset.page]();
})(window.YJ);
