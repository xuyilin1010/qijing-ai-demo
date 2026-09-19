import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const config=JSON.parse(fs.readFileSync(path.join(root,'config.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function asset(key) {
  const name=config.assets[key];
  if (/^data:image\/(png|jpeg|webp|gif);base64,/.test(name)) return name;
  const full=path.resolve(root,name);
  if (!full.startsWith(root+path.sep)) throw new Error('图片路径必须在 demo 文件夹内');
  const ext=path.extname(full).slice(1).toLowerCase();
  const mime={png:'png',jpg:'jpeg',jpeg:'jpeg',webp:'webp',gif:'gif'}[ext];
  if(!mime) throw new Error('请使用 PNG/JPEG/WebP/GIF 图片');
  return `data:image/${mime};base64,${fs.readFileSync(full).toString('base64')}`;
}
const imageAssets=Object.fromEntries(Object.keys(config.assets).map(k=>[k,asset(k)]));
const text=(key,x,y,size=28,extra='')=>`<text data-key="${key}" x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(config[key])}</text>`;
const label=(key,x,y)=>text(key,x,y,21,'fill="#d2b98c" letter-spacing="4"');
const heading=(a,b,x,y,size=78)=>text(a,x,y,size,'font-weight="650" letter-spacing="2"')+text(b,x,y+size*1.2,size,'font-weight="650" letter-spacing="2"');
const select=(key)=>['mountain','water','sky'].map(k=>`<set attributeName="visibility" to="${key===k?'visible':'hidden'}" begin="cl_view_${k}.click"/>`).join('');
function person(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" fill="#06101b"><ellipse cx="0" cy="72" rx="26" ry="4" opacity=".3"/><circle cy="-8" r="7"/><path d="M-6 1 Q-14 14 -11 29 L-5 34 -11 68 -3 72 5 38 15 67 23 66 13 31 9 2Z"/><path d="M-9 5 -20 15 -22 33 -15 35 -11 19ZM8 4 19 19 27 24 25 29 13 26 3 11Z"/><rect x="-16" y="4" width="8" height="22" rx="3" fill="#243441"/></g>`;}
const svg=`<svg id="journeyArt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="6000" height="900" viewBox="0 0 6000 900" role="group" aria-label="循光而行，可滑动探索的旅行长卷" style="font-family:Arial,'Microsoft YaHei','PingFang SC',sans-serif;color:#f2f1ed;fill:#f2f1ed">
<title>循光而行 · 海岸、沙丘、峡谷与星空</title><desc>滑动长卷；沙丘可打开和关闭短笺；峡谷可选择三幅风景；星空可点亮和重置。正文始终可读。</desc>
<defs>
 <linearGradient id="cl_shade" x2="0" y2="1"><stop stop-color="#020d21" stop-opacity=".55"/><stop offset=".52" stop-color="#031020" stop-opacity="0"/><stop offset="1" stop-color="#010812" stop-opacity=".72"/></linearGradient>
 <linearGradient id="cl_nightFade"><stop stop-color="white" stop-opacity="0"/><stop offset=".26" stop-color="white"/></linearGradient>
 <mask id="cl_nightMask" maskUnits="userSpaceOnUse" x="3050" y="0" width="2950" height="900"><rect x="3050" width="2950" height="900" fill="url(#cl_nightFade)"/></mask>
 <linearGradient id="cl_path"><stop stop-color="#e9bd78"/><stop offset=".35" stop-color="#e9bd78"/><stop offset=".66" stop-color="#74c8ea"/><stop offset="1" stop-color="#dae7fd"/></linearGradient>
 <filter id="cl_glow" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="7"/></filter>
 <path id="cl_route" d="M120 735 C420 810 740 820 1000 770 S1400 680 1740 743 2100 860 2390 790 2780 700 3080 763 3470 821 3750 738 4200 699 4630 770"/>
 <clipPath id="cl_galleryClip"><rect x="2540" y="260" width="860" height="530" rx="3"/></clipPath>
 <clipPath id="cl_swipeClip"><rect x="3540" y="245" width="940" height="530" rx="3"/></clipPath>
 <style>.cl-hit{cursor:pointer;outline:none}.cl-hit:focus-visible{filter:drop-shadow(0 0 5px #e5ba75)}.cl-hit:hover .cl-hover{stroke:#fff;stroke-width:2}.cl-small{fill:#ddd;letter-spacing:1px}</style>
</defs>
<rect width="6000" height="900" fill="#07172c"/>
<image data-asset="panorama" href="${imageAssets.panorama}" x="0" y="0" width="3650" height="900" preserveAspectRatio="xMidYMid slice"/>
<image data-asset="night" href="${imageAssets.night}" x="3050" y="0" width="2950" height="900" preserveAspectRatio="xMidYMid slice" mask="url(#cl_nightMask)"/>
<rect width="6000" height="900" fill="url(#cl_shade)"/>
<g fill="none" stroke="url(#cl_path)"><use href="#cl_route" stroke-width="7" opacity=".19" filter="url(#cl_glow)"/><use href="#cl_route" stroke-width="1.2" opacity=".45"/></g>
<g data-motion="trail" visibility="hidden"><set attributeName="visibility" to="visible" begin="cl_depart.click"/><use href="#cl_route" fill="none" stroke="url(#cl_path)" stroke-width="2.4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"><animate attributeName="stroke-dashoffset" from="1" to="0" dur="${config.motion.trailSeconds}s" begin="cl_depart.click" fill="freeze"/></use></g>
${label('coastLabel',95,162)}
${heading('coastTitle1','coastTitle2',90,275,87)}
${text('coastBody1',96,447,28,'fill="#e2e8ee"')}${text('coastBody2',96,491,28,'fill="#e2e8ee"')}
<g id="cl_depart" class="cl-hit" role="button" tabindex="0" aria-label="循光出发，描绘前方路线"><rect class="cl-hover" x="94" y="544" width="270" height="78" rx="39" fill="#e5c58f" fill-opacity=".08" stroke="#e1c492" stroke-opacity=".7"/>${text('coastButton',131,593,26)}<path d="M292 583h36m-9-8 9 8-9 8" fill="none" stroke="#e9cf9e" stroke-width="2"/></g>
<text x="100" y="839" font-size="16" letter-spacing="5" fill="#d3bd96">BEGIN WHERE YOU ARE</text>
${person(815,622,.78)}
${label('duneLabel',1280,160)}
${heading('duneTitle1','duneTitle2',1275,262,77)}
${text('duneBody1',1280,429,27)}${text('duneBody2',1280,471,27)}
${person(1900,544,.66)}
<g id="cl_note_open" class="cl-hit" role="button" tabindex="0" aria-label="打开旅途短笺" transform="translate(${config.hotspots.noteX} ${config.hotspots.noteY})"><rect x="-42" y="-46" width="408" height="92" fill="transparent"/><circle r="28" fill="#08192e" fill-opacity=".6" stroke="#e6c78d"/><path d="M-8-7h16v14H-8zM-8-7 0 0 8-7" fill="none" stroke="#f1deb8" stroke-width="1.6"/>${text('noteButton',48,8,25)}<path d="M48 23h235" stroke="#e5c48d" opacity=".45"/></g>
<g id="cl_note_card" visibility="hidden"><set attributeName="visibility" to="visible" begin="cl_note_open.click" end="cl_note_close.click"/>
 <rect x="1280" y="405" width="690" height="278" rx="4" fill="#081b2a" fill-opacity=".97" stroke="#ba9a63" stroke-opacity=".8"/>
 <path d="M1310 438h35m-35 0v35M1940 650h-35m35 0v-35" fill="none" stroke="#c3a774"/>
 ${label('noteLabel',1330,463)}${text('noteTitle',1330,528,33)}${text('noteBody1',1330,580,25,'fill="#c6cfd6"')}${text('noteBody2',1330,622,25,'fill="#c6cfd6"')}
 <g id="cl_note_close" class="cl-hit" role="button" tabindex="0" aria-label="收起短笺"><rect x="1887" y="420" width="66" height="66" fill="transparent"/><path d="m1911 443 18 18m0-18-18 18" stroke="#e9d7b8" stroke-width="2"/></g>
</g>
<text x="1280" y="839" font-size="16" letter-spacing="5" fill="#d3bd96">LEAVE ROOM FOR WANDER</text>
${label('canyonLabel',2400,150)}
${text('canyonTitle2',2395,221,52,'font-weight="650"')}
${['mountain','water','sky'].map((key,i)=>`<g id="cl_scene_${key}" visibility="${i===0?'visible':'hidden'}">${select(key)}<g clip-path="url(#cl_galleryClip)"><svg x="2540" y="260" width="860" height="530" viewBox="${key==='mountain'?'1240 150 932 574':key==='water'?'1550 330 570 352':'0 0 1536 947'}" preserveAspectRatio="xMidYMid slice"><image data-asset="${key}" href="${imageAssets[key]}" width="${key==='sky'?1536:2172}" height="${key==='sky'?1024:724}" preserveAspectRatio="xMidYMid slice"/></svg><rect x="2540" y="696" width="860" height="94" fill="#03111f" fill-opacity=".8"/>${text(key+'Title',2570,754,29)}</g></g>`).join('')}
${['mountain','water','sky'].map((key,i)=>`<g id="cl_view_${key}" class="cl-hit" role="button" tabindex="0" aria-label="${esc(config[key+'Label'])}" aria-pressed="${i===0}" transform="translate(2370 ${300+i*160})"><rect width="150" height="132" fill="transparent"/><circle cx="75" cy="48" r="38" fill="#091b2f" fill-opacity=".7" stroke="#9daebd" stroke-opacity=".5"/><text x="75" y="59" text-anchor="middle" font-size="28" fill="#e4c996">0${i+1}</text><g data-tab-active="${key}" visibility="${i===0?'visible':'hidden'}">${select(key)}<circle cx="75" cy="48" r="43" fill="none" stroke="#e4c996" stroke-width="3"/></g>${text(key+'Label',75,115,27,'text-anchor="middle"')}</g>`).join('')}
<text x="2540" y="835" font-size="22" fill="#d6c39d">点击左侧，切换眼前的风景</text>
${label('journalLabel',3540,150)}${text('journalTitle',3540,220,52,'font-weight="650"')}
<g id="cl_swipe" role="group" tabindex="0" aria-label="旅途图文，上下滑动切换三张卡片">
${['journalCoast','journalDune','journalNight'].map((key,i)=>`<g data-slide="${i}" visibility="${i===0?'visible':'hidden'}" clip-path="url(#cl_swipeClip)"><svg x="3540" y="245" width="940" height="530" viewBox="${i===0?'0 100 1000 564':i===1?'800 100 1000 564':'0 0 1536 866'}" preserveAspectRatio="xMidYMid slice"><image data-asset="${key}" href="${imageAssets[key]}" width="${i===2?1536:2172}" height="${i===2?1024:724}"/></svg><rect x="3540" y="610" width="940" height="165" fill="#03111f" fill-opacity=".82"/>${text(key+'Title',3580,674,36)}${text(key+'Body',3580,729,26)}</g>`).join('')}
<rect x="3540" y="245" width="940" height="530" fill="transparent"/>
</g><text x="3540" y="827" font-size="23" fill="#dfc799">↑ 在图片上上下滑动，翻阅旅途 ↓</text>
${[0,1,2].map(i=>`<g data-slide-to="${i}" class="cl-hit" role="button" tabindex="0" aria-label="第${i+1}张旅途图文" aria-pressed="${i===0}" transform="translate(${4260+i*75} 817)"><rect x="-30" y="-36" width="60" height="72" fill="transparent"/><circle r="${i===0?9:5}" fill="#e6c994"/></g>`).join('')}
<g transform="translate(1200 0)">
${label('nightLabel',3540,149)}
${heading('nightTitle1','nightTitle2',3535,244,67)}
${text('nightBody1',3540,413,26)}${text('nightBody2',3540,454,26)}
<g id="cl_star_on" class="cl-hit" role="button" tabindex="0" aria-label="点亮星空"><rect class="cl-hover" x="3540" y="507" width="330" height="78" rx="39" fill="#081c32" fill-opacity=".58" stroke="#d5bf96" stroke-opacity=".7"/><path d="m3573 535 4 10 10 3-10 3-4 10-3-10-11-3 11-3Z" fill="#f0d7a3"/>${text('starButton',3603,557,25)}</g>
<g id="cl_star_off" class="cl-hit" role="button" tabindex="0" aria-label="重置星空"><rect x="3885" y="507" width="112" height="78" fill="transparent"/><text x="3910" y="555" font-size="24" fill="#c9d8e4">重置</text></g>
<g id="cl_constellation" visibility="hidden" pointer-events="none"><set attributeName="visibility" to="visible" begin="cl_star_on.click" end="cl_star_off.click"/>
 <path d="M4020 454 4110 340 4240 373 4375 263 4490 313 4570 217" fill="none" stroke="#e8cea0" stroke-width="1.4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"><animate attributeName="stroke-dashoffset" from="1" to="0" dur="${config.motion.starsSeconds}s" begin="cl_star_on.click" end="cl_star_off.click" fill="freeze"/></path>
 ${[[4020,454],[4110,340],[4240,373],[4375,263],[4490,313],[4570,217]].map(([x,y],i)=>`<g><circle cx="${x}" cy="${y}" r="15" fill="#eacb92" opacity=".1"/><circle cx="${x}" cy="${y}" r="3.5" fill="#fff3d5"/><animate attributeName="opacity" from="0" to="1" dur=".7s" begin="cl_star_on.click+${i*.24}s" fill="freeze"/></g>`).join('')}
</g>
${person(4160,755,.85)}
${text('closing',3540,832,25,'fill="#d4dee8" letter-spacing="2"')}
</g>
</svg>`;

const siteTemplate=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const inlineConfig=JSON.stringify(config).replaceAll('<','\\u003c');
// H5 uses explicit state for mobile WebViews; native SVG keeps SMIL separately.
let webSvg=svg.replace(/<(?:set|animate)\b[^>]*\/>/g,'');
for(const [key,value] of Object.entries(imageAssets))webSvg=webSvg.replaceAll(value,esc(config.assets[key]));
const page=siteTemplate.replace('<!--ART-->',()=>webSvg).replace('<!--CONFIG-->',()=>inlineConfig).replaceAll('<!--COVER-->',()=>esc(config.assets.panorama)).replace('<!--STYLE-->',()=>fs.readFileSync(path.join(root,'style.css'),'utf8')).replace('<!--APP-->',()=>fs.readFileSync(path.join(root,'app.js'),'utf8'));
const withInitialText=page.replace('</style>',()=>fs.readFileSync(path.join(root,'mobile.css'),'utf8')+'</style>').replace(/(<(?:p|h1|span)[^>]*data-key="([^"]+)"[^>]*>)<\//g,(_,tag,key)=>tag+esc(config[key]??'')+'</');
fs.writeFileSync(path.join(root,'index.html'),withInitialText);
fs.writeFileSync(path.join(root,'journey.svg'),svg);
const native=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none'"><title>循光而行 · 无脚本交互检查</title><style>html,body{margin:0;background:#07172c;color:#e5e8ed;font-family:Arial,'Microsoft YaHei',sans-serif}header{position:fixed;z-index:3;top:0;left:0;right:0;padding:14px 20px;background:#07172ce8;font-size:13px;display:flex;justify-content:space-between}a{color:#e4c18b}main{height:100svh;overflow:auto}svg{display:block;height:100%;width:auto;max-width:none} @media(orientation:portrait){header{font-size:11px}main{padding-top:52px;height:calc(100svh - 52px)}svg{height:65vh}} </style></head><body><header><span>无脚本检查页 · 水平滚动查看四个场景；SVG 热点可直接点击</span><a href="index.html">返回体验</a></header><main>${svg}</main></body></html>`;
fs.writeFileSync(path.join(root,'native.html'),native);
console.log('Built index.html, journey.svg, native.html. Raster assets embedded; SVG contains no script.');
