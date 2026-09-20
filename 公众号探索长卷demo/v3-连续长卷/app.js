(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const entry = $('#entry'), experience = $('#experience'), stage = $('#stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'immersive', moment = 0, story = 0, opening = false;
  let paused = reduced.matches, gesture = null, wheelUntil = 0, viewWidth = 0, viewHeight = 0;
  const announce = text => { $('#announcement').textContent = text; };
  const names = ['户外探索者', '品质创造者', '生活创作者'];
  function layout(preserve = false) {
    const previousHeight = document.documentElement.scrollHeight - innerHeight;
    const fraction = previousHeight > 0 ? scrollY / previousHeight : 0;
    const width = Math.min(document.documentElement.clientWidth, 1440);
    const portrait = width <= 900 && innerHeight > innerWidth;
    const rotated = mode === 'immersive' && portrait;
    const panelWidth = rotated ? innerHeight - (width <= 900 ? 48 : 64) : width;
    const panelHeight = rotated ? width : portrait ? Math.max(width * 2, 740) : width * 9 / 16;
    stage.style.setProperty('--panel-width', `${panelWidth}px`);
    stage.style.setProperty('--panel-height', `${panelHeight}px`);
    stage.classList.toggle('is-rotated', rotated);
    stage.dataset.mode = mode;
    $('#change-mode').textContent = mode === 'immersive' ? '适应屏幕' : '横屏沉浸';
    $('.scroll-invitation').firstChild.textContent = rotated ? '沿着风景 · 向右继续 ' : '沿着风景 · 向下继续 ';
    viewWidth = innerWidth; viewHeight = innerHeight;
    if (preserve) scrollTo(0, fraction * (document.documentElement.scrollHeight - innerHeight));
  }
  function setMotion(value) {
    paused = value;
    document.body.classList.toggle('motion-paused', paused);
    $('#motion').textContent = paused ? '开启动效' : '暂停动效';
    $('#motion').setAttribute('aria-pressed', String(paused));
  }
  function setMoment(index) {
    moment = Math.max(0, Math.min(2, index));
    $$('.moment-panel').forEach((p, i) => { p.hidden = i !== moment; p.classList.toggle('active', i === moment); });
    $$('[data-moment-go]').forEach((b, i) => b.setAttribute('aria-pressed', String(i === moment)));
    announce(`${['星空', '攀岩', '奔跑'][moment]}，16比9视频占位`);
  }
  function setStory(index) {
    story = Math.max(0, Math.min(2, index));
    $$('.story-panel').forEach((p, i) => { p.hidden = i !== story; p.classList.toggle('active', i === story); });
    $$('[data-story-go]').forEach((b, i) => b.setAttribute('aria-pressed', String(i === story)));
    $('#story-prev').disabled = story === 0; $('#story-next').disabled = story === 2;
    $('#story-counter').textContent = `0${story + 1} / 03`;
    announce(`人物故事 ${story + 1}/3，${names[story]}`);
  }
  function reveal() {
    if (opening || entry.hidden) return;
    opening = true; entry.classList.add('is-leaving'); $('#enter').disabled = true;
    setMoment(0); setStory(0);
    setTimeout(() => {
      entry.hidden = true; experience.hidden = false;
      document.body.classList.remove('cover-open');
      entry.classList.remove('is-leaving'); layout(); scrollTo(0, 0);
      $('#back').focus({preventScroll:true}); opening = false; $('#enter').disabled = false;
      announce('封面已收起，整篇长卷已展开，可以连续滚动阅读');
    }, paused ? 0 : 450);
  }
  function returnToCover() {
    experience.hidden = true; entry.hidden = false; gesture = null;
    document.body.classList.add('cover-open'); scrollTo(0, 0);
    $('#enter').focus({preventScroll:true}); announce('已返回封面');
  }
  // One cover-wide click target; the native button also supports Enter and Space.
  entry.addEventListener('click', reveal);
  $('#back').addEventListener('click', returnToCover);
  $('#restart').addEventListener('click', returnToCover);
  $('#motion').addEventListener('click', () => setMotion(!paused));
  $('#change-mode').addEventListener('click', () => { mode = mode === 'immersive' ? 'adaptive' : 'immersive'; layout(true); });
  $$('[data-moment-go]').forEach(b => b.addEventListener('click', () => setMoment(Number(b.dataset.momentGo))));
  $$('[data-story-go]').forEach(b => b.addEventListener('click', () => setStory(Number(b.dataset.storyGo))));
  $$('[data-story-open]').forEach(b => b.addEventListener('click', () => {
    setStory(Number(b.dataset.storyOpen));
    // An ordinary anchor-style scroll: all preceding and following content remains in the document.
    $('.stories').parentElement.scrollIntoView({behavior: paused ? 'instant' : 'smooth', block:'start'});
  }));
  $('#story-prev').addEventListener('click', () => setStory(story - 1));
  $('#story-next').addEventListener('click', () => setStory(story + 1));
  // Only the portrait photo handles story gestures. Page scrolling everywhere else is native.
  $$('.story-photo').forEach(photo => {
    photo.addEventListener('dragstart', e => e.preventDefault());
    photo.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      gesture = {id:e.pointerId, x:e.clientX, y:e.clientY, rotated:stage.classList.contains('is-rotated')};
      photo.setPointerCapture(e.pointerId);
    });
    photo.addEventListener('pointerup', e => {
      if (!gesture || gesture.id !== e.pointerId) return;
      const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
      const localY = gesture.rotated ? -dx : dy, localX = gesture.rotated ? dy : dx;
      gesture = null;
      if (Math.abs(localY) > 38 && Math.abs(localY) > Math.abs(localX) * 1.25) setStory(story + (localY < 0 ? 1 : -1));
    });
    photo.addEventListener('pointercancel', () => { gesture = null; });
    photo.addEventListener('lostpointercapture', () => { gesture = null; });
    photo.addEventListener('wheel', e => {
      if (e.ctrlKey || Math.abs(e.deltaY) < 5) return;
      const direction = e.deltaY > 0 ? 1 : -1;
      if ((story === 0 && direction < 0) || (story === 2 && direction > 0)) return;
      e.preventDefault();
      if (performance.now() < wheelUntil) return;
      wheelUntil = performance.now() + 600; setStory(story + direction);
    }, {passive:false});
  });
  $('.swipe-story-hint span:nth-child(2)').textContent = '在人物图片上 · 上下滑动查看更多';
  document.addEventListener('keydown', e => { if (!experience.hidden && e.key === 'Escape') returnToCover(); });
  window.addEventListener('resize', () => {
    // Ignore mobile browser address-bar movement so a native scroll never shifts the layout.
    if (Math.abs(innerWidth - viewWidth) > 1 || Math.abs(innerHeight - viewHeight) > 120) layout(!experience.hidden);
  });
  reduced.addEventListener('change', e => setMotion(e.matches));
  document.body.classList.add('cover-open'); setMotion(paused); setMoment(0); setStory(0); layout();
})();
