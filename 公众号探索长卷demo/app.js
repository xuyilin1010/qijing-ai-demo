(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const entry=$('#entry'),experience=$('#experience'),stage=$('#stage'),rail=$('#rail');
  const chapters=$$('.chapter'),chapterButtons=$$('[data-go]');
  const names=['文化核心','产品定位','产品介绍','场景视频','人物画像','人物故事','联系与关注'];
  const momentNames=['星空','攀岩','奔跑'],storyNames=['户外探索者','品质创造者','生活创作者'];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=0,moment=0,story=0,mode='immersive',opening=false,wheelUntil=0,pointer=null;
  let paused=reduced.matches;
  const pad=n=>String(n+1).padStart(2,'0');
  const announce=text=>$('#announcement').textContent=text;
  function applyMode(){
    stage.classList.toggle('is-rotated',mode==='immersive'&&innerHeight>innerWidth);
    $$('.screen-choice [data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    $('#change-mode').textContent=mode==='immersive'?'适应屏幕':'横屏沉浸';
    stage.dataset.mode=mode;
  }
  function setMotion(value){paused=value;document.body.classList.toggle('motion-paused',paused);$('#motion').textContent=paused?'开启动效':'暂停动效';$('#motion').setAttribute('aria-pressed',String(paused));}
  function go(index){
    active=Math.max(0,Math.min(chapters.length-1,index));
    rail.style.transform=`translateX(${-active*100}%)`;
    chapters.forEach((c,i)=>{c.inert=i!==active;c.classList.toggle('is-active',i===active);c.setAttribute('aria-hidden',String(i!==active));});
    chapterButtons.forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    $('#prev').disabled=active===0;$('#next').disabled=active===chapters.length-1;
    $('#chapter-label').textContent=`${pad(active)} / ${names[active]}`;
    $('#chapter-count').textContent=`${pad(active)} / 07`;
    $('#progress').style.transform=`translateX(${active*100}%)`;
    $('#page-hint').textContent=active===5?'上下切换故事 · 左右切换章节':'左右滑动 · 展开长卷';
    stage.dataset.chapter=String(active);announce(`第${active+1}章，${names[active]}`);
  }
  function setMoment(index){
    moment=Math.max(0,Math.min(2,index));
    $$('.moment-panel').forEach((p,i)=>{p.hidden=i!==moment;p.classList.toggle('active',i===moment);});
    $$('[data-moment-go]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===moment)));
    stage.dataset.moment=String(moment);announce(`${momentNames[moment]}，16比9视频占位`);
  }
  function setStory(index){
    story=Math.max(0,Math.min(2,index));
    $$('.story-panel').forEach((p,i)=>{p.hidden=i!==story;p.classList.toggle('active',i===story);});
    $$('[data-story-go]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===story)));
    $('#story-prev').disabled=story===0;$('#story-next').disabled=story===2;
    $('#story-counter').textContent=`${pad(story)} / 03`;stage.dataset.story=String(story);
    announce(`人物故事 ${story+1}/3，${storyNames[story]}`);
  }
  function reveal(reset=true){
    if(opening)return;opening=true;
    if(reset){go(0);setMoment(0);setStory(0);}
    entry.classList.add('is-leaving');
    setTimeout(()=>{entry.hidden=true;experience.hidden=false;entry.classList.remove('is-leaving');applyMode();$('#back').focus({preventScroll:true});opening=false;},paused||reduced.matches?0:520);
  }
  function returnToCover(){experience.hidden=true;entry.hidden=false;entry.classList.remove('is-leaving');opening=false;pointer=null;$('#enter').focus({preventScroll:true});announce('已返回竖屏封面');}
  $('#enter').addEventListener('click',()=>reveal());
  $('#back').addEventListener('click',returnToCover);$('#restart').addEventListener('click',returnToCover);
  $$('.screen-choice [data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;applyMode();}));
  $('#change-mode').addEventListener('click',()=>{mode=mode==='immersive'?'adaptive':'immersive';applyMode();announce(mode==='immersive'?'已切换横屏沉浸':'已切换适应屏幕');});
  $('#motion').addEventListener('click',()=>setMotion(!paused));
  $('#prev').addEventListener('click',()=>go(active-1));$('#next').addEventListener('click',()=>go(active+1));
  chapterButtons.forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.go))));
  $$('[data-moment-go]').forEach(b=>b.addEventListener('click',()=>setMoment(Number(b.dataset.momentGo))));
  $$('[data-story-go]').forEach(b=>b.addEventListener('click',()=>setStory(Number(b.dataset.storyGo))));
  $$('[data-story-open]').forEach(b=>b.addEventListener('click',()=>{setStory(Number(b.dataset.storyOpen));go(5);}));
  $('#story-prev').addEventListener('click',()=>setStory(story-1));$('#story-next').addEventListener('click',()=>setStory(story+1));
  function moveVertical(direction){
    if(active===5){if(direction>0&&story<2){setStory(story+1);return;}if(direction<0&&story>0){setStory(story-1);return;}}
    go(active+direction);
  }
  stage.addEventListener('wheel',e=>{
    e.preventDefault();if(Math.max(Math.abs(e.deltaX),Math.abs(e.deltaY))<8)return;
    const now=performance.now();if(now<wheelUntil)return;wheelUntil=now+650;
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY))go(active+(e.deltaX>0?1:-1));else moveVertical(e.deltaY>0?1:-1);
  },{passive:false});
  stage.addEventListener('pointerdown',e=>{
    if(e.button!==0||e.target.closest('button,a'))return;
    pointer={id:e.pointerId,x:e.clientX,y:e.clientY,rotated:stage.classList.contains('is-rotated')};
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointerup',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
    const x=pointer.rotated?dy:dx,y=pointer.rotated?-dx:dy;pointer=null;
    if(Math.max(Math.abs(x),Math.abs(y))<40)return;
    if(Math.abs(x)>Math.abs(y)*1.15)go(active+(x<0?1:-1));else if(Math.abs(y)>Math.abs(x)*1.15)moveVertical(y<0?1:-1);
  });
  stage.addEventListener('pointercancel',()=>{pointer=null;});
  stage.addEventListener('lostpointercapture',()=>{pointer=null;});
  stage.addEventListener('dragstart',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{
    if(experience.hidden||e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.key==='ArrowRight'){e.preventDefault();go(active+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();go(active-1);}
    if(e.key==='ArrowDown'){e.preventDefault();moveVertical(1);}
    if(e.key==='ArrowUp'){e.preventDefault();moveVertical(-1);}
    if(e.key==='Escape')returnToCover();
  });
  window.addEventListener('resize',applyMode);reduced.addEventListener('change',e=>setMotion(e.matches));
  go(0);setMoment(0);setStory(0);applyMode();setMotion(paused);
  // Local review links open a stable chapter, without changing the normal cover-first entry.
  const query=new URLSearchParams(location.search);
  if(query.get('preview')==='1'){
    mode=query.get('mode')==='adaptive'?'adaptive':'immersive';applyMode();
    entry.hidden=true;experience.hidden=false;go(Number(query.get('chapter'))||0);
    setMoment(Number(query.get('moment'))||0);setStory(Number(query.get('story'))||0);
    if(query.get('still')==='1')setMotion(true);
  }
})();
