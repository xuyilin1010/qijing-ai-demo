/* ===================================================================
   奇境.ai · 共享外壳（顶栏 + 侧边栏）注入脚本
   每个页面：<body data-active="home"> + <link qj-shell.css> + <script src="qj-shell.js">
   页面只写 .layout > main.page > .inner（内容），外壳由本脚本注入。
   改侧边栏 / 顶栏 = 只改本文件，全站同步。file:// 可用（不依赖 fetch）。
   =================================================================== */
(function () {
  // —— 图标精灵（顶栏+侧边栏用；页面自己的图标各页另带）——
  var SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<symbol id="i-spark" viewBox="0 0 32 32"><path d="M16 3 C16.9 11 21 15.1 29 16 C21 16.9 16.9 21 16 29 C15.1 21 11 16.9 3 16 C11 15.1 15.1 11 16 3 Z"/></symbol>' +
    '<symbol id="i-home" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></symbol>' +
    '<symbol id="i-topic" viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .66-1.74 1.4-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.74.76 1.2 1.5 1.4 2.5"/></symbol>' +
    '<symbol id="i-make" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></symbol>' +
    '<symbol id="i-wand" viewBox="0 0 24 24"><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h0M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"/></symbol>' +
    '<symbol id="i-asset" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></symbol>' +
    '<symbol id="i-data" viewBox="0 0 24 24"><line x1="3" y1="20" x2="21" y2="20"/><line x1="6" y1="20" x2="6" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></symbol>' +
    '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>' +
    '<symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></symbol>' +
    '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></symbol>' +
    '<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></symbol>' +
    '<symbol id="i-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></symbol>' +
    // —— 内容图标（各页卡片/缩略图共用）——
    '<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></symbol>' +
    '<symbol id="i-flame" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></symbol>' +
    '<symbol id="i-video" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></symbol>' +
    '<symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.2" cy="8.3" r="1.45"/><path d="m4.9 18 4.7-4.6 3.15 2.8 2.85-3 3.5 4.8"/></symbol>' +
    '<symbol id="i-audio" viewBox="0 0 24 24"><path d="M15 4v12.2"/><path d="m15 5 5-1.5v11.2"/><circle cx="10" cy="17" r="3"/><circle cx="20" cy="14" r="3"/></symbol>' +
    '<symbol id="i-note" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="13.5" x2="13" y2="13.5"/></symbol>' +
    '<symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></symbol>' +
    '<symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.2"/></symbol>' +
    '<symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="11" r="3"/><path d="M23 21v-1.5a3 3 0 0 0-2.5-2.96"/></symbol>' +
    '<symbol id="i-ads" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></symbol>' +
    '<symbol id="i-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></symbol>' +
    '</defs></svg>';

  // —— 顶栏 ——（团队 / 积分 / 用户 想做成可配置的话，后续从 data-* 读）——
  // 对齐线上(sunrise.dui88.com)：顶栏 = logo + 客户切换(带人数) + 积分 + 用户；无搜索框、无铃铛
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  var TOPBAR_CONFIG = {
    taskLabel: '历史任务',
    credits: '778,163',
    quota: '额度不限',
    user: '一琳',
    role: 'AI 工作室-内部',
    avatar: '琳'
  };

  function buildTopbar() {
    var taskLabel = escapeHtml(TOPBAR_CONFIG.taskLabel);
    var credits = escapeHtml(TOPBAR_CONFIG.credits);
    var quota = escapeHtml(TOPBAR_CONFIG.quota);
    var user = escapeHtml(TOPBAR_CONFIG.user);
    var role = escapeHtml(TOPBAR_CONFIG.role);
    var avatar = escapeHtml(TOPBAR_CONFIG.avatar);
    return '<header class="bar">' +
      '<div class="brand"><span class="logo-slot"><img src="logo-moon.png" alt="奇境AI"></span><span class="brand-name">奇境AI</span></div>' +
      '<div class="sp"></div>' +
      '<button class="team" id="globalTaskHistory" type="button" aria-label="查看历史任务"><span class="team-dot"></span><span class="team-name">' + taskLabel + '</span></button>' +
      '<button class="credits" type="button"><svg class="cspark"><use href="#i-spark"/></svg><b>' + credits + '</b></button>' +
      '<button class="quota" type="button"><span class="quota-bolt">ϟ</span><span>' + quota + '</span><svg class="caret"><use href="#i-chevron"/></svg></button>' +
      '<button class="me" type="button"><span class="av">' + avatar + '</span><span class="mt"><b>' + user + '</b><span>' + role + '</span></span><svg class="caret"><use href="#i-chevron"/></svg></button>' +
    '</header>';
  }

  // —— 侧边栏菜单（改这里 = 全站同步）——
// 全新改造版：灵感 / 创作 / 发布 / 洞察 / 资产
  var NAV = [
  { key: 'inspiration',icon: 'i-topic',  label: '灵感',     href: '奇境-灵感-v1.html' },
    { key: 'make',       icon: 'i-make',   label: '创作',     href: '奇境-创作-Agent-v1.html' },
    { key: 'publish',    icon: 'i-ads',    label: '发布',     href: '奇境-发布-v1.html' },
    { key: 'insight',    icon: 'i-data',   label: '洞察',     href: '奇境-洞察-v1.html' },
    { key: 'asset',      icon: 'i-asset',  label: '资产',     href: '奇境-资产-v3.html' }
  ];

  function buildNav(active) {
    var html = '<nav class="nav">';
    NAV.forEach(function (it) {
      if (it === 'gap')  { html += '<span class="gap"></span>'; return; }
      if (it === 'grow') { html += '<span class="grow"></span>'; return; }
      var on = it.key === active ? ' class="on" aria-current="page"' : '';
      html += '<a' + on + ' href="' + it.href + '"><svg class="icon"><use href="#' + it.icon + '"/></svg>' + it.label + '</a>';
    });
    return html + '</nav>';
  }

  // —— 自定义下拉（§7.5）：事件委托，自动管全站所有 .qj-dropdown ——
  function initDropdowns() {
    if (window.__qjDropdownInit) return; window.__qjDropdownInit = true;
    document.addEventListener('click', function (e) {
      var dd = e.target.closest ? e.target.closest('.qj-dropdown') : null;
      document.querySelectorAll('.qj-dropdown.is-open').forEach(function (d) { if (d !== dd) d.classList.remove('is-open'); });
      if (!dd) return;
      if (e.target.closest('.qj-dropdown-trigger')) { dd.classList.toggle('is-open'); return; }
      var item = e.target.closest('.qj-dropdown-item');
      if (item) {
        dd.querySelectorAll('.qj-dropdown-item').forEach(function (i) { i.classList.remove('is-sel'); });
        item.classList.add('is-sel');
        var val = dd.querySelector('.qj-dropdown-value');
        if (val) val.textContent = item.textContent;
        dd.setAttribute('data-value', item.getAttribute('data-value') || item.textContent);
        dd.classList.remove('is-open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.querySelectorAll('.qj-dropdown.is-open').forEach(function (d) { d.classList.remove('is-open'); });
    });
  }

  // —— 标签页：点一个 tab，激活它、取消同组其它 ——
  function initTabs() {
    if (window.__qjTabsInit) return; window.__qjTabsInit = true;
    document.addEventListener('click', function (e) {
      var tab = e.target.closest ? e.target.closest('.qj-tab') : null;
      if (!tab) return;
      var group = tab.closest('.qj-tabs');
      if (!group) return;
      group.querySelectorAll('.qj-tab').forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
    });
  }

  // —— Toast：qj.toast('已保存') / qj.toast('发布失败','err')，3 秒自动消 ——
  window.qj = window.qj || {};
  window.qj.toast = function (msg, type) {
    var host = document.querySelector('.qj-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'qj-toast-host';
      host.setAttribute('aria-live', 'polite');
      host.setAttribute('aria-atomic', 'false');
      document.body.appendChild(host);
    }
    var t = document.createElement('div');
    t.className = 'qj-toast' + (type === 'err' ? ' is-err' : '');
    t.setAttribute('role', type === 'err' ? 'alert' : 'status');
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .25s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 3000);
  };

  // —— 跨页发布草稿：所有「去发布」入口统一携带标题、正文（含 Tag）与素材 ——
  var PUBLISH_DRAFT_KEY = 'qj.publishDraft.v1';
  function normalizePublishMedia(media) {
    return (Array.isArray(media) ? media : []).map(function (item, index) {
      if (!item || !item.url) return null;
      var url = String(item.url);
      try { url = new URL(url, document.baseURI).href; } catch (error) {}
      return {
        id: String(item.id || 'handoff-' + index),
        kind: item.kind === 'video' ? 'video' : 'image',
        url: url,
        name: String(item.name || (item.kind === 'video' ? '发布视频' : '发布图片')),
        duration: item.duration ? String(item.duration) : ''
      };
    }).filter(Boolean);
  }

  window.qj.goToPublish = function (payload) {
    payload = payload || {};
    var tags = (Array.isArray(payload.tags) ? payload.tags : []).map(function (tag) {
      var value = String(tag || '').trim().replace(/^#+/, '');
      return value ? '#' + value : '';
    }).filter(Boolean);
    var body = String(payload.body || payload.copy || '').trim();
    var text = String(payload.text || '').trim() || [body, tags.join(' ')].filter(Boolean).join('\n\n');
    var draft = {
      version: 1,
      source: String(payload.source || 'system'),
      status: String(payload.status || 'approved'),
      title: String(payload.title || '').trim(),
      body: body,
      tags: tags,
      text: text,
      media: normalizePublishMedia(payload.media),
      createdAt: Date.now()
    };
    try {
      sessionStorage.setItem(PUBLISH_DRAFT_KEY, JSON.stringify(draft));
      window.location.href = '奇境-发布-v1.html?compose=1';
    } catch (error) {
      window.qj.toast('暂时无法带入发布内容，请重试', 'err');
    }
  };

  window.qj.takePublishDraft = function () {
    if (new URLSearchParams(window.location.search).get('compose') !== '1') return null;
    try {
      var raw = sessionStorage.getItem(PUBLISH_DRAFT_KEY);
      sessionStorage.removeItem(PUBLISH_DRAFT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  };

  function mount() {
    var active = document.body.getAttribute('data-active') || 'home';
    // 1) 精灵 + 顶栏 注入到 body 最前
    document.body.insertAdjacentHTML('afterbegin', SPRITE + buildTopbar());
    // 2) 侧边栏 注入为 .layout 第一个子元素（main.page 之前）
    var layout = document.querySelector('.layout');
    if (layout) layout.insertAdjacentHTML('afterbegin', buildNav(active));
    var historyButton = document.getElementById('globalTaskHistory');
    if (historyButton) historyButton.addEventListener('click', function () { window.open('奇境-历史任务-v0.1.0.html', '_blank'); });
    // 3) 自动接管所有自定义下拉 + 标签页
    initDropdowns();
    initTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
