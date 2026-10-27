/* ===========================================================
   DevToolbox 公共脚本：主题、提示、复制、分段控件
   =========================================================== */
(function (global) {
  'use strict';

  var THEME_KEY = 'devtoolbox.theme.v1';

  /* ------------------------------------------------ 主题 */
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  }

  function initTheme() {
    var q = /[?&]theme=(dark|light)\b/.exec(location.search);
    if (q) { applyTheme(q[1]); return; }
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === 'light' || saved === 'dark') { applyTheme(saved); return; }
    var light = global.matchMedia && global.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(light ? 'light' : 'dark');
  }
  initTheme();

  function bindThemeButton() {
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  /* ------------------------------------------------ 提示条 */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1600);
  }

  /* ------------------------------------------------ 复制 */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function copyWithToast(text, label) {
    if (!text) { toast('没有可复制的内容'); return; }
    copyText(text)
      .then(function () { toast('已复制' + (label ? '：' + label : '')); })
      .catch(function () { toast('复制失败，请手动选中复制'); });
  }

  /* ------------------------------------------------ 分段控件 */
  function bindSeg(node, current, onChange) {
    if (!node) return;
    var buttons = Array.prototype.slice.call(node.querySelectorAll('button'));
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.value === current));
      b.addEventListener('click', function () {
        buttons.forEach(function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        onChange(b.dataset.value);
      });
    });
  }

  function syncSeg(node, value) {
    if (!node) return;
    Array.prototype.forEach.call(node.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.value === value));
    });
  }

  /* ------------------------------------------------ 小工具 */
  function isMac() {
    return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  }

  function kbdHint() {
    return isMac() ? '⌘⏎' : 'Ctrl⏎';
  }

  function debounce(fn, wait) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 120);
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // textarea 里 Tab 插空格，而不是跳走焦点
  function enableTabIndent(ta, size) {
    ta.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      var pad = ' '.repeat(size || 2);
      var s = this.selectionStart, en = this.selectionEnd;
      this.value = this.value.slice(0, s) + pad + this.value.slice(en);
      this.selectionStart = this.selectionEnd = s + pad.length;
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  // ⌘/Ctrl + Enter
  function bindRunKey(handler, target) {
    var node = target || document;
    node.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handler();
      }
    });
  }

  // 填充 kbd 提示
  function fillKbdHints() {
    var text = kbdHint();
    Array.prototype.forEach.call(document.querySelectorAll('[data-kbd]'), function (el) {
      el.textContent = text;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindThemeButton();
    fillKbdHints();
  });

  global.TB = {
    toast: toast,
    copyText: copyText,
    copyWithToast: copyWithToast,
    bindSeg: bindSeg,
    syncSeg: syncSeg,
    isMac: isMac,
    kbdHint: kbdHint,
    debounce: debounce,
    escapeHtml: escapeHtml,
    enableTabIndent: enableTabIndent,
    bindRunKey: bindRunKey,
    setTheme: applyTheme
  };
})(window);
