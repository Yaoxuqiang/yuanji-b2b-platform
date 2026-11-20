(function () {
  'use strict';
  if (new URLSearchParams(location.search).has('inspect') || !window.YJ) return;

  const page = location.pathname.split('/').pop() || 'index.html';
  const storeKey = 'yj_edits_v1';
  const toolbar = document.createElement('div');
  toolbar.className = 'yj-edit-toolbar';
  toolbar.innerHTML = `
    <button type="button" data-toggle aria-pressed="false">编辑页面</button>
    <button type="button" data-export disabled>导出修改</button>
    <button type="button" data-reset disabled>清除</button>
    <span class="yj-edit-count" role="status"></span>`;
  const style = document.createElement('style');
  style.textContent = `
    .yj-edit-toolbar{position:fixed;z-index:99990;right:16px;bottom:16px;display:flex;align-items:center;gap:4px;padding:5px;max-width:calc(100% - 32px);flex-wrap:wrap;background:#fff;border:1px solid #9db3a6;border-radius:8px;box-shadow:0 4px 18px #103f3326;font:13px/1.4 'PingFang SC','Microsoft YaHei',system-ui,sans-serif;color:#16231f}
    .yj-edit-toolbar button{border:1px solid transparent;background:#eef4f0;color:#154f40;border-radius:5px;padding:5px 10px;cursor:pointer;font:inherit}
    .yj-edit-toolbar button[data-toggle][aria-pressed=true]{background:#154f40;border-color:#154f40;color:#fff;font-weight:650}
    .yj-edit-toolbar button:disabled{opacity:.45;cursor:not-allowed}
    .yj-edit-count{color:#52605a;font-size:12px;padding-inline:4px}
    .yj-editing{outline:2px dashed #0f7a5c!important;outline-offset:2px;background:#f2fbf7;cursor:text}
    .yj-edit-temp{outline:2px dashed #0f7a5c;outline-offset:1px;background:#f2fbf7}
    body.yj-editing-mode a,body.yj-editing-mode button,body.yj-editing-mode label,body.yj-editing-mode summary{cursor:text}
  `;
  document.head.appendChild(style);
  document.body.appendChild(toolbar);

  const toggleBtn = toolbar.querySelector('[data-toggle]');
  const exportBtn = toolbar.querySelector('[data-export]');
  const resetBtn = toolbar.querySelector('[data-reset]');
  const countEl = toolbar.querySelector('.yj-edit-count');
  let editing = false;
  let active = null;
  let applying = false;
  let observerTimer;

  function readAll() {
    try { return JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch { return {}; }
  }
  let edits = readAll()[page] && typeof readAll()[page] === 'object' ? readAll()[page] : {};
  function persist() {
    const all = readAll();
    if (Object.keys(edits).length) all[page] = edits;
    else delete all[page];
    try { localStorage.setItem(storeKey, JSON.stringify(all)); return true; } catch { return false; }
  }
  function elementFor(selector) {
    try { return selector ? document.querySelector(selector) : null; } catch { return null; }
  }
  function applyEdit(entry) {
    const el = elementFor(entry.selector);
    if (!el || el.isContentEditable) return;
    if (entry.mode === 'self') {
      if (el.childElementCount === 0 && el.textContent !== entry.text) el.textContent = entry.text;
      return;
    }
    const nodes = [...el.childNodes].filter(node => node.nodeType === 3);
    if (!nodes.length) return;
    const node = nodes[entry.index] || nodes[0];
    if (node.nodeValue !== entry.text) node.nodeValue = entry.text;
  }
  function applyAll() {
    if (applying) return;
    applying = true;
    Object.values(edits).forEach(applyEdit);
    applying = false;
  }
  function renderBar() {
    const count = Object.keys(edits).length;
    exportBtn.disabled = resetBtn.disabled = !count;
    countEl.textContent = count ? `${count} 处修改` : editing ? '点击文字直接修改' : '';
  }

  function textNodeAt(target, x, y) {
    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(x, y);
      if (range?.startContainer?.nodeType === 3 && target.contains(range.startContainer)) return range.startContainer;
    }
    if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos?.offsetNode?.nodeType === 3 && target.contains(pos.offsetNode)) return pos.offsetNode;
    }
    return [...target.childNodes].find(node => node.nodeType === 3 && node.nodeValue.trim()) || null;
  }
  function editTarget(target, x, y) {
    if (!(target instanceof Element)) return null;
    if (target.closest('.yj-edit-toolbar, dialog, input, select, textarea, option, img, svg, video, script, style, noscript')) return null;
    if (target.isContentEditable) return null;
    if (target.childElementCount === 0 && target.textContent.trim()) return { el: target, mode: 'self' };
    const node = textNodeAt(target, x, y);
    if (!node || !node.parentElement) return null;
    const container = node.parentElement;
    if (container === document.body || container.closest('input, select, textarea, option, script, style')) return null;
    const index = [...container.childNodes].filter(child => child.nodeType === 3).indexOf(node);
    const span = document.createElement('span');
    span.className = 'yj-edit-temp';
    node.replaceWith(span);
    span.appendChild(node);
    return { el: span, container, index, mode: 'text' };
  }
  function placeCaret(el, x, y) {
    const range = document.createRange();
    let point = null;
    try {
      if (document.caretRangeFromPoint) point = document.caretRangeFromPoint(x, y);
      else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos) { range.setStart(pos.offsetNode, pos.offset); point = range; }
      }
    } catch { point = null; }
    if (point && el.contains(point.startContainer)) {
      range.setStart(point.startContainer, point.startOffset);
      range.collapse(true);
    } else {
      range.selectNodeContents(el);
      range.collapse(false);
    }
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
  function saveEdit(info, text) {
    const key = info.mode === 'text' ? `${YJ.selectorOf(info.container)}::text:${info.index}` : YJ.selectorOf(info.el);
    if (text === info.original) delete edits[key];
    else {
      edits[key] = {
        selector: info.mode === 'text' ? YJ.selectorOf(info.container) : YJ.selectorOf(info.el),
        mode: info.mode,
        index: info.mode === 'text' ? info.index : 0,
        text,
        original: info.original
      };
    }
    const ok = persist();
    renderBar();
    if (!ok) YJ.toast('已在当前页修改，但浏览器未保存到本地');
  }
  function endEditing(save) {
    const info = active;
    if (!info) return;
    active = null;
    info.el.removeEventListener('keydown', onEditingKey);
    info.el.removeEventListener('blur', onBlur);
    info.el.removeAttribute('contenteditable');
    info.el.classList.remove('yj-editing');
    let text = save ? info.el.textContent.replace(/\u00a0/g, ' ') : info.original;
    if (!text.trim()) text = info.original;
    if (info.mode === 'text') {
      info.el.replaceWith(document.createTextNode(text));
      if (save) saveEdit(info, text);
    } else {
      info.el.textContent = text;
      if (save) saveEdit(info, text);
    }
  }
  function onBlur() {
    endEditing(true);
  }
  function onEditingKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      endEditing(false);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }
  function beginEdit(info, event) {
    info.original = info.el.textContent;
    if (!info.original.trim()) return;
    active = info;
    info.el.setAttribute('contenteditable', 'true');
    info.el.setAttribute('spellcheck', 'false');
    info.el.classList.add('yj-editing');
    info.el.addEventListener('keydown', onEditingKey);
    info.el.addEventListener('blur', onBlur);
    info.el.focus();
    placeCaret(info.el, event.clientX, event.clientY);
  }
  function onEditClick(event) {
    if (event.target.closest('.yj-edit-toolbar')) return;
    if (active && active.el.contains(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (active) endEditing(true);
    const info = editTarget(event.target, event.clientX, event.clientY);
    if (!info) {
      YJ.toast('这里没有可直接修改的文字');
      return;
    }
    beginEdit(info, event);
  }
  function onBlock(event) {
    if (event.target.closest('.yj-edit-toolbar, [contenteditable="true"]')) return;
    if (event.target.closest('a, button, label, summary, input, select, textarea, option, details')) event.preventDefault();
  }
  function onBlockSubmit(event) {
    if (active) event.preventDefault();
  }
  function onModeKey(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (active) endEditing(false);
    else setEditing(false);
  }
  function setEditing(next) {
    editing = next;
    toggleBtn.setAttribute('aria-pressed', String(next));
    toggleBtn.textContent = next ? '完成编辑' : '编辑页面';
    document.body.classList.toggle('yj-editing-mode', next);
    if (next) {
      addEventListener('click', onEditClick, true);
      addEventListener('mousedown', onBlock, true);
      addEventListener('submit', onBlockSubmit, true);
      addEventListener('keydown', onModeKey, true);
      YJ.toast('编辑模式：点击文字直接修改，Esc 取消当前编辑');
    } else {
      if (active) endEditing(false);
      removeEventListener('click', onEditClick, true);
      removeEventListener('mousedown', onBlock, true);
      removeEventListener('submit', onBlockSubmit, true);
      removeEventListener('keydown', onModeKey, true);
    }
    renderBar();
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    } else legacyCopy(text);
  }
  function legacyCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    Object.assign(area.style, { position: 'fixed', opacity: '0', left: '-9999px' });
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch { /* Export file still works. */ }
    area.remove();
  }
  function exportEdits() {
    const entries = Object.entries(edits);
    if (!entries.length) return;
    const lines = ['源集页面修改清单', `页面：${page}`, `时间：${new Date().toLocaleString('zh-CN')}`, ''];
    entries.forEach(([, entry], i) => {
      lines.push(`${i + 1}. 选择器：${entry.selector}${entry.mode === 'text' ? '（文本节点）' : ''}`);
      lines.push(`   原文：${entry.original}`);
      lines.push(`   改为：${entry.text}`);
    });
    lines.push('', '说明：以上修改仅保存在当前浏览器，尚未改写源码。');
    const text = lines.join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    link.download = `源集修改-${page.replace(/\.html$/, '')}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    copyText(text);
    YJ.toast('修改清单已下载，并已尝试复制到剪贴板');
  }

  toggleBtn.onclick = () => setEditing(!editing);
  exportBtn.onclick = exportEdits;
  resetBtn.onclick = () => {
    if (!confirm('确定清除本页所有页面内修改？此操作不可撤销。')) return;
    edits = {};
    persist();
    location.reload();
  };

  const observer = new MutationObserver(() => {
    if (applying || active) return;
    if (!Object.keys(edits).length) return;
    clearTimeout(observerTimer);
    observerTimer = setTimeout(applyAll, 60);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  applyAll();
  addEventListener('DOMContentLoaded', applyAll);
  addEventListener('load', applyAll);
  addEventListener('yj-change', applyAll);
  renderBar();
})();
