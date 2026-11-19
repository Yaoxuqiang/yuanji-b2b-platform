/* ============================================================
   共享交互：询价篮 / 采购车 / 对比勾选 / 角标联动 / Toast
   使用 localStorage 模拟跨页状态（PRD FR-L06 跨页累加）
   ============================================================ */
(function () {
  'use strict';

  var KEY_INQ = 'yj_inquiry';   // 询价篮
  var KEY_CART = 'yj_cart';     // 采购车

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch (e) { return []; }
  }
  function write(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
    refreshBadges();
  }

  // ---- 询价篮 ----
  function addInquiry(item) {
    var list = read(KEY_INQ);
    var max = 8; // 询价篮上限（对应 PRD 异常处理）
    if (list.length >= max && !list.some(function (x) { return x.id === item.id; })) {
      toast('询价篮最多 ' + max + ' 件，请先提交或移除');
      return false;
    }
    if (!list.some(function (x) { return x.id === item.id; })) {
      list.push(item);
      write(KEY_INQ, list);
      toast('已加入询价篮');
    } else {
      toast('该商品已在询价篮');
    }
    renderInquiryDock();
    return true;
  }
  function removeInquiry(id) {
    var list = read(KEY_INQ).filter(function (x) { return x.id !== id; });
    write(KEY_INQ, list);
    renderInquiryDock();
    // 同步取消结果页勾选态
    var cb = document.querySelector('[data-inquiry-cb="' + id + '"]');
    if (cb) cb.checked = false;
  }
  function clearInquiry(ids) {
    var list = read(KEY_INQ).filter(function (x) { return ids.indexOf(x.id) === -1; });
    write(KEY_INQ, list);
    renderInquiryDock();
  }

  // ---- 采购车 ----
  function addCart(item) {
    var list = read(KEY_CART);
    var exist = list.find(function (x) { return x.id === item.id; });
    if (exist) { exist.qty += (item.qty || 1); }
    else { list.push(item); }
    write(KEY_CART, list);
    toast('已加入采购车');
  }

  // ---- 角标 ----
  function refreshBadges() {
    var inqN = read(KEY_INQ).length;
    var cartN = read(KEY_CART).reduce(function (s, x) { return s + (x.qty || 1); }, 0);
    setBadge('badge-inquiry', inqN);
    setBadge('badge-cart', cartN);
  }
  function setBadge(id, n) {
    var el = document.getElementById(id);
    if (el) { el.textContent = n; el.classList.toggle('hidden', n === 0); }
  }

  // ---- 询价篮侧栏渲染 ----
  function renderInquiryDock() {
    var body = document.getElementById('idock-body');
    var cnt = document.getElementById('idock-count');
    if (!body) return;
    var list = read(KEY_INQ);
    if (cnt) cnt.textContent = list.length;
    if (list.length === 0) {
      body.innerHTML = '<div class="idock-empty"><svg class="ico ico-lg" style="margin:0 auto 8px;color:var(--blue-300)"><use href="#i-inquiry"></use></svg>询价篮为空<br>在商品卡片勾选加入</div>';
      return;
    }
    body.innerHTML = list.map(function (x) {
      var sym = x.glyph || 'i-package';
      if (sym.indexOf('i-') !== 0) sym = 'i-package';
      return '<div class="idock-item">' +
        '<div class="thumb"><svg class="ico"><use href="#' + sym + '"></use></svg></div>' +
        '<div class="info"><div class="nm">' + esc(x.title) + '</div>' +
        '<div class="pr">¥' + x.price + ' <span class="muted">/ ' + x.moq + '</span></div></div>' +
        '<svg class="ico ico-sm rm" data-rm="' + x.id + '" title="移除"><use href="#i-close"></use></svg></div>';
    }).join('');
    body.querySelectorAll('[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () { removeInquiry(b.getAttribute('data-rm')); });
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ---- Toast ----
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1800);
  }

  // ---- 视图切换 ----
  function initViewSwitch() {
    var gridBtn = document.getElementById('btn-view-grid');
    var listBtn = document.getElementById('btn-view-list');
    if (!gridBtn || !listBtn) return;
    gridBtn.addEventListener('click', function () {
      document.getElementById('view-grid').classList.remove('hidden');
      document.getElementById('view-list').classList.add('hidden');
      gridBtn.classList.add('active'); listBtn.classList.remove('active');
    });
    listBtn.addEventListener('click', function () {
      document.getElementById('view-grid').classList.add('hidden');
      document.getElementById('view-list').classList.remove('hidden');
      listBtn.classList.add('active'); gridBtn.classList.remove('active');
    });
  }

  // ---- 商品卡片：加入询价篮按钮 ----
  function initInquiryButtons() {
    document.querySelectorAll('[data-add-inquiry]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-add-inquiry');
        addInquiry({
          id: id,
          title: btn.getAttribute('data-title') || '商品',
          price: btn.getAttribute('data-price') || '—',
          moq: btn.getAttribute('data-moq') || '—',
          glyph: btn.getAttribute('data-glyph') || '◫'
        });
        var cb = document.querySelector('[data-inquiry-cb="' + id + '"]');
        if (cb) cb.checked = true;
      });
    });
  }

  // ---- 对比勾选 ----
  function initCompare() {
    var bar = document.getElementById('compare-bar');
    var countEl = document.getElementById('compare-count');
    var btn = document.getElementById('btn-compare');
    if (!bar) return;
    var max = 4; // 对比上限（PRD FR-L05）
    document.querySelectorAll('[data-inquiry-cb]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var checked = document.querySelectorAll('[data-inquiry-cb]:checked');
        if (checked.length > max) {
          cb.checked = false;
          toast('最多对比 ' + max + ' 件');
          return;
        }
        bar.classList.toggle('hidden', checked.length === 0);
        if (countEl) countEl.textContent = checked.length;
        if (btn) btn.disabled = checked.length < 2;
      });
    });
    if (btn) btn.addEventListener('click', function () {
      document.getElementById('btn-view-list').click();
      toast('已切换对比列表，共 ' + document.querySelectorAll('[data-inquiry-cb]:checked').length + ' 件');
    });
  }

  // ---- 首页身份筛选 ----
  function initIdentityChips() {
    document.querySelectorAll('.id-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.id-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        toast('已切换采购身份：' + chip.textContent);
      });
    });
  }

  // ---- 排序切换 ----
  function initSort() {
    document.querySelectorAll('.sort-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.sort-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        toast('排序：' + tab.textContent);
      });
    });
  }

  // ---- 搜索 ----
  function initSearch() {
    var btn = document.querySelector('.btn-search');
    var input = document.querySelector('.search-box input');
    if (!btn) return;
    btn.addEventListener('click', function () { doSearch(); });
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch();
    });
    function doSearch() {
      var kw = input && input.value.trim();
      location.href = '02-listing.html' + (kw ? '?kw=' + encodeURIComponent(kw) : '');
    }
  }

  // ---- 初始化 ----
  document.addEventListener('DOMContentLoaded', function () {
    refreshBadges();
    renderInquiryDock();
    initViewSwitch();
    initInquiryButtons();
    initCompare();
    initIdentityChips();
    initSort();
    initSearch();
    // 回填搜索关键词
    var params = new URLSearchParams(location.search);
    var kw = params.get('kw');
    var kwEl = document.getElementById('kw-display');
    if (kw && kwEl) kwEl.textContent = kw;
    var searchInput = document.querySelector('.search-box input');
    if (kw && searchInput) searchInput.value = kw;
    // 展示询价成功提示
    if (params.get('inquired') === '1') toast('询盘已提交，可在工作台查看');
    if (params.get('added') === '1') toast('已加入采购车');
  });

  // 暴露给详情页使用
  window.YJ = {
    addInquiry: addInquiry,
    removeInquiry: removeInquiry,
    clearInquiry: clearInquiry,
    addCart: addCart,
    read: read,
    write: write,
    toast: toast,
    refreshBadges: refreshBadges
  };
})();
