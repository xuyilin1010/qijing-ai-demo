(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const entry=$('#entry'),experience=$('#experience'),viewport=$('#viewport');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let rotated=false,opening=false,story=0,feature=0,drag=null,photoDrag=null,wheelUntil=0;
  let lastW=0,lastH=0;
  let paintFrame=0;
  const landscapeImages=$$('#landscape-sources img');
  function startImage(image){if(image?.dataset.src&&!image.hasAttribute('src'))image.src=image.dataset.src;}
  function readyImage(image){startImage(image);return image.decode?image.decode().catch(()=>{}):Promise.resolve();}
  function paint(){paintFrame=0;backdrop.render(position());}
  function schedulePaint(){if(!paintFrame)paintFrame=requestAnimationFrame(paint);}
  const backdrop=new PanoramaRenderer($('#panorama'),landscapeImages,schedulePaint);
  const entryImage=$('.entry-image');
  const primeCover=()=>setTimeout(()=>startImage(landscapeImages[0]),100);
  if(entryImage.complete&&entryImage.naturalWidth)primeCover();
  else entryImage.addEventListener('load',primeCover,{once:true});
  const position=()=>rotated?viewport.scrollTop:viewport.scrollLeft;
  const maximum=()=>rotated?viewport.scrollHeight-viewport.clientHeight:viewport.scrollWidth-viewport.clientWidth;
  function move(to,smooth=false){viewport.scrollTo({left:rotated?0:to,top:rotated?to:0,behavior:smooth&&!reduced.matches?'smooth':'instant'});}
  function progress(){const fraction=maximum()>0?position()/maximum():0;$('#progress').style.transform=`${rotated?'scaleY':'scaleX'}(${Math.max(.008,fraction)})`;if(!experience.hidden){const chapterWidth=rotated?innerHeight:innerWidth;if(position()>1.32*chapterWidth)$('.product-reveal')?.classList.add('is-visible');if(position()>4.6*chapterWidth)startImage($('.story-panel[data-story="0"] img'));if(position()>5*chapterWidth)startImage($('.closing-background'));}schedulePaint();}
  function layout(preserve=false){
    const fraction=maximum()>0?position()/maximum():0;
    rotated=innerWidth<innerHeight;
    const w=rotated?innerHeight:innerWidth,h=rotated?innerWidth:innerHeight;
    document.documentElement.style.setProperty('--pw',`${w}px`);
    document.documentElement.style.setProperty('--ph',`${h}px`);
    experience.classList.toggle('rotated',rotated);
    lastW=innerWidth;lastH=innerHeight;
    backdrop.resize(innerWidth,innerHeight,rotated);
    move(preserve?fraction*maximum():0);progress();
  }
  function setStory(index){
    story=Math.max(0,Math.min(2,index));
    if(!experience.hidden)startImage($(`.story-panel[data-story="${story}"] img`));
    $$('.story-panel').forEach((p,i)=>{p.hidden=i!==story;p.classList.toggle('active',i===story);});
    $$('[data-story-go]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===story)));
    $('#story-prev').disabled=story===0;$('#story-next').disabled=story===2;
    $('#story-counter').textContent=`0${story+1} / 03`;
    $('#announcement').textContent=`人物故事 ${story+1}/3`;
  }
  function setFeature(index,focus=false){
    feature=Math.max(0,Math.min(2,index));
    $$('[data-feature-tab]').forEach((button,i)=>{const active=i===feature;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus({preventScroll:true});});
    $$('[data-feature-panel]').forEach((panel,i)=>{panel.hidden=i!==feature;panel.classList.toggle('active',i===feature);});
    $('#announcement').textContent=`探索角度：${['感官','体验','情感'][feature]}`;
  }
  async function reveal(){if(opening||entry.hidden)return;opening=true;$('#enter').disabled=true;$('.cover-label').textContent='正在加载探索画面';await Promise.race([readyImage(landscapeImages[0]),new Promise(resolve=>setTimeout(resolve,3500))]);$('.cover-label').textContent='点击开启探索';entry.classList.add('is-leaving');setStory(0);setTimeout(()=>{entry.hidden=true;experience.hidden=false;entry.classList.remove('is-leaving');layout();viewport.focus({preventScroll:true});opening=false;$('#enter').disabled=false;$('#announcement').textContent='横幅已展开，向右连续滑动探索';landscapeImages.slice(1).forEach(startImage);startImage($('.closing-background'));},reduced.matches?0:450);}
  function back(){experience.hidden=true;entry.hidden=false;drag=null;photoDrag=null;$('.product-reveal')?.classList.remove('is-visible');$('#enter').focus({preventScroll:true});}
  entry.addEventListener('click',reveal);
  $('#restart').addEventListener('click',back);
  $$('[data-feature-tab]').forEach(button=>{button.addEventListener('click',()=>setFeature(Number(button.dataset.featureTab)));button.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();setFeature((feature+(['ArrowDown','ArrowRight'].includes(event.key)?1:2))%3,true);});});
  $$('[data-story-open]').forEach(b=>b.addEventListener('click',()=>{setStory(Number(b.dataset.storyOpen));move((rotated?innerHeight:innerWidth)*6,true);}));
  $$('[data-story-go]').forEach(b=>b.addEventListener('click',()=>setStory(Number(b.dataset.storyGo))));
  $('#story-prev').addEventListener('click',()=>setStory(story-1));$('#story-next').addEventListener('click',()=>setStory(story+1));
  viewport.addEventListener('scroll',progress,{passive:true});
  viewport.addEventListener('wheel',e=>{
    if(e.ctrlKey||rotated)return;
    const factor=e.deltaMode===1?16:e.deltaMode===2?viewport.clientWidth:1;
    const delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*factor;
    if(delta){e.preventDefault();move(position()+delta);}
  },{passive:false});
  viewport.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,a,.story-photo'))return;
    drag={id:e.pointerId,start:rotated?e.clientY:e.clientX,scroll:position()};viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId)move(drag.scroll+drag.start-(rotated?e.clientY:e.clientX));});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(event,()=>{drag=null;viewport.classList.remove('is-dragging');});
  viewport.addEventListener('dragstart',e=>e.preventDefault());
  $$('.story-photo').forEach(photo=>{
    photo.addEventListener('pointerdown',e=>{if(e.button!==0)return;photoDrag={id:e.pointerId,x:e.clientX,y:e.clientY,rotated};photo.setPointerCapture(e.pointerId);});
    photo.addEventListener('pointerup',e=>{if(!photoDrag||photoDrag.id!==e.pointerId)return;const dx=e.clientX-photoDrag.x,dy=e.clientY-photoDrag.y;const x=photoDrag.rotated?dy:dx,y=photoDrag.rotated?-dx:dy;photoDrag=null;if(Math.abs(y)>38&&Math.abs(y)>Math.abs(x)*1.25)setStory(story+(y<0?1:-1));});
    for(const event of ['pointercancel','lostpointercapture'])photo.addEventListener(event,()=>{photoDrag=null;});
    photo.addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaY)<8||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const direction=e.deltaY>0?1:-1;if((story===0&&direction<0)||(story===2&&direction>0))return;e.preventDefault();e.stopPropagation();if(performance.now()<wheelUntil)return;wheelUntil=performance.now()+600;setStory(story+direction);},{passive:false});
  });
  document.addEventListener('keydown',e=>{
    if(experience.hidden||e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.key==='Escape'){back();return;}
    if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)){
      e.preventDefault();const delta=['ArrowRight','ArrowDown'].includes(e.key)?120:-120;
      move(e.key==='Home'?0:e.key==='End'?maximum():position()+delta);
    }
  });
  window.addEventListener('resize',()=>{if(Math.abs(lastW-innerWidth)>1||Math.abs(lastH-innerHeight)>120)layout(!experience.hidden);});
  setStory(0);setFeature(0);layout();
})();
