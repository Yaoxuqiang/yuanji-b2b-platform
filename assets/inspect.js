(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (!params.has('inspect')) return;

  const style = document.createElement('style');
  style.textContent = `
    .yj-inspect-box{position:fixed;z-index:99998;pointer-events:none;border:2px solid #0f7a5c;background:#0f7a5c14;border-radius:3px;transition:all .06s}
    .yj-inspect-label{position:fixed;z-index:99999;pointer-events:none;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:#103f33;color:#fff;font:12px/1.6 Consolas,monospace;padding:2px 8px;border-radius:4px}
    .yj-inspect-panel{position:fixed;z-index:100000;left:16px;bottom:16px;width:min(380px,calc(100% - 32px));max-height:calc(100vh - 32px);overflow:auto;background:#fff;border:1px solid #9db3a6;border-radius:8px;box-shadow:0 8px 28px #103f3340;font:14px/1.55 'PingFang SC','Microsoft YaHei',system-ui,sans-serif;color:#16231f}
    .yj-inspect-panel header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:#154f40;color:#fff;font-weight:700}
    .yj-inspect-panel header button{border:0;background:#ffffff22;color:#fff;border-radius:4px;padding:2px 9px;cursor:pointer}
    .yj-inspect-panel .yj-hint{padding:12px 14px;color:#52605a;margin:0}
    .yj-inspect-result{padding:0 14px 14px;display:grid;gap:8px}
    .yj-inspect-result[hidden]{display:none}
    .yj-inspect-result code{display:block;background:#eef4f0;border:1px solid #dce5e0;border-radius:4px;padding:7px 9px;word-break:break-all;font:12px/1.55 Consolas,monospace;max-height:110px;overflow:auto}
    .yj-inspect-meta{color:#52605a;font-size:12px;word-break:break-word}
    .yj-inspect-actions{display:flex;gap:8px;flex-wrap:wrap}
    .yj-inspect-actions button{border:1px solid #96afa3;background:#fff;color:#154f40;border-radius:5px;padding:6px 11px;cursor:pointer;font:inherit;font-size:13px}
    .yj-inspect-actions button[data-primary]{background:#154f40;border-color:#154f40;color:#fff;font-weight:650}
    .yj-inspect-status{min-height:20px;color:#0f7a5c;font-size:12px}
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.className = 'yj-inspect-box';
  box.hidden = true;
  const label = document.createElement('div');
  label.className = 'yj-inspect-label';
  label.hidden = true;
  const panel = document.createElement('aside');
  panel.className = 'yj-inspect-panel';
  panel.innerHTML = `
    <header><span>标注模式</span><button type="button" data-exit>退出</button></header>
    <p class="yj-hint">点击页面中要修改的位置。复制定位信息后发给 Claude，正常访问不会出现此面板。</p>
    <div class="yj-inspect-result" hidden>
      <div class="yj-inspect-page"></div>
      <code class="yj-inspect-sel"></code>
      <div class="yj-inspect-meta"></div>
      <div class="yj-inspect-actions">
        <button type="button" data-copy-all data-primary>复制定位信息</button>
        <button type="button" data-copy-sel>只复制选择器</button>
      </div>
      <div class="yj-inspect-status" role="status"></div>
    </div>`;
  document.body.append(box, label, panel);

  const file = location.pathname.split('/').pop() || 'index.html';
  const result = panel.querySelector('.yj-inspect-result');
  const status = panel.querySelector('.yj-inspect-status');
  let current = null;

  const selectorOf = el => window.YJ?.selectorOf?.(el) || el.tagName.toLowerCase();
  function textOf(el) {
    const value = el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent;
    return (value || '').replace(/\s+/g, ' ').trim().slice(0, 90);
  }
  function tagOf(el) {
    const name = el.tagName.toLowerCase();
    const cls = [...el.classList].find(c => !c.startsWith('yj-inspect'));
    return `<${name}${cls ? '.' + cls : ''}>`;
  }
  function paint(el) {
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    box.hidden = false;
    label.textContent = `${tagOf(el)} · ${textOf(el)}`;
    label.hidden = false;
    label.style.left = `${Math.max(6, Math.min(r.left, innerWidth - 330))}px`;
    label.style.top = `${r.top > 26 ? r.top - 26 : r.bottom + 4}px`;
  }
  function clearPaint() {
    box.hidden = true;
    label.hidden = true;
  }
  function target(event) {
    const el = event.target;
    if (!(el instanceof Element) || panel.contains(el) || box.contains(el) || label.contains(el)) return null;
    return el;
  }
  function infoOf(el) {
    const r = el.getBoundingClientRect();
    return [
      `页面：${file}`,
      `选择器：${selectorOf(el)}`,
      `元素：${tagOf(el)} ${textOf(el)}`,
      `位置：${Math.round(r.left)}, ${Math.round(r.top)}　尺寸：${Math.round(r.width)} × ${Math.round(r.height)}`,
      `视口：${innerWidth} × ${innerHeight}`
    ].join('\n');
  }
  function flash(message) {
    status.textContent = message;
    setTimeout(() => { if (status.textContent === message) status.textContent = ''; }, 2400);
  }
  function legacyCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    Object.assign(area.style, { position: 'fixed', opacity: '0', left: '-9999px' });
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    flash(ok ? '已复制，直接粘贴给 Claude' : '复制失败，请手动选中上方选择器');
  }
  function copy(text) {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => flash('已复制，直接粘贴给 Claude'), () => legacyCopy(text));
    else legacyCopy(text);
  }

  function onHover(event) {
    const el = target(event);
    if (el) paint(el);
    else if (!current) clearPaint();
  }
  function onClick(event) {
    const el = target(event);
    if (!el) return;
    event.preventDefault();
    event.stopPropagation();
    current = el;
    paint(el);
    result.hidden = false;
    panel.querySelector('.yj-inspect-page').textContent = `页面：${file}`;
    panel.querySelector('.yj-inspect-sel').textContent = selectorOf(el);
    panel.querySelector('.yj-inspect-meta').textContent = `${tagOf(el)} ${textOf(el)} · ${Math.round(el.getBoundingClientRect().width)} × ${Math.round(el.getBoundingClientRect().height)}`;
  }
  function onSubmit(event) {
    if (target(event)) { event.preventDefault(); event.stopPropagation(); }
  }
  function onKey(event) {
    if (event.key === 'Escape') exit();
  }
  function onScroll() {
    if (current) paint(current);
  }
  function exit() {
    window.removeEventListener('mouseover', onHover, true);
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('submit', onSubmit, true);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('scroll', onScroll, true);
    box.remove(); label.remove(); panel.remove(); style.remove();
    const url = new URL(location.href);
    url.searchParams.delete('inspect');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  window.addEventListener('mouseover', onHover, true);
  window.addEventListener('click', onClick, true);
  window.addEventListener('submit', onSubmit, true);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('scroll', onScroll, true);
  panel.querySelector('[data-exit]').onclick = exit;
  panel.querySelector('[data-copy-all]').onclick = () => copy(current ? infoOf(current) : '尚未选择元素');
  panel.querySelector('[data-copy-sel]').onclick = () => copy(current ? selectorOf(current) : '尚未选择元素');
})();
