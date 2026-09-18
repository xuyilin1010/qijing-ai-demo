import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const C={blue:'#40a5d5',green:'#438c34',pink:'#f3a6b6',yellow:'#f2df65',ink:'#294d37',paper:'#fffdf3',mint:'#dfeecb'};
const scenes=[
 {time:'08:00',period:'早起',name:'早餐路口',title:['人还没醒透','咖啡先到了。'],broadcast:['早餐尚未到站，','咖啡已申请优先通行。'],body:'第一口早餐入口，消化就开始了。咀嚼与唾液先接手，再由胃和肠道继续处理这份订单。',tip:'给早餐留一点时间，别让每一口都在赶路。',question:'第一口早餐，身体如何接单？',accent:'#58934e',actor:0,station:0,sign:'咖啡快速通道',quip:'等等，还有我。'},
 {time:'13:00',period:'午间',name:'午休停靠区',title:['午饭已经签收','人想原地关机。'],broadcast:['下一站，午休。','当前工位暂未放行。'],body:'吃完想歇一会儿，胃里的工作还在继续。胃会搅拌食物，再逐步送往小肠。这张订单，有它自己的处理步骤。',tip:'有空起身走动一下，给工位按个暂停。',question:'你想午休，胃里的工作结束了吗？',accent:'#58934e',actor:5,station:1,sign:'午休申请中',quip:'饭到了，人想躺了。'},
 {time:'15:30',period:'下午茶',name:'下午茶岔路',title:['说好今天少吃点','奶茶说它顺路。'],broadcast:['您已偏离“今天少吃点”路线。','正在重新规划。'],body:'嘴巴负责下单，小肠接着忙。多数营养物质在小肠被吸收。点下午茶之前，也可以先问问自己，这会儿真的饿了吗？',tip:'想喝就认真选一杯，也给白水留个位置。',question:'下午茶这张订单，接着交给谁？',accent:'#c7688c',actor:5,station:2,sign:'甜品临时加站',quip:'就拐这一次。'},
 {time:'21:00',period:'晚饭后',name:'晚间加站区',title:['晚饭刚说再见','夜宵发来定位。'],broadcast:['检测到新增目的地。','您的晚间路线正在变长。'],body:'如果你容易反酸，酒精和高脂食物可能让症状加重，具体诱因因人而异。饭局怎么安排，也听听身体的反馈。',tip:'留意自己的不适诱因，吃得舒服比赶场重要。',question:'晚间加站，也听听身体的反馈。',accent:'#b7803e',actor:5,station:3,sign:'夜宵新增点',quip:'要不，再吃一口？'},
 {time:'23:30',period:'睡前',name:'睡眠站前',title:['月亮已经就位','手机还在加戏。'],broadcast:['已到达睡眠站。','乘客仍在刷手机。'],body:'如果你在夜里或躺下时容易反流，睡前至少 3 小时结束进食，可能有助于改善症状。给晚饭与躺下之间，留一段距离。',tip:'今晚少绕一圈，把屏幕留到明天。',question:'睡前的路线，还能再从容一点。',accent:'#537caa',actor:5,station:4,sign:'再刷五分钟环线',quip:'怎么又绕回来了？'},
 {time:'00:30',period:'入睡后',name:'夜间运行区',title:['你终于下线','身体还在值班。'],broadcast:['乘客已休息。','身体还有工作正在进行。'],body:'消化道里的食物继续被处理。到了大肠，水分被吸收，剩余物逐渐形成粪便。有些工作，在你没留意时照常进行。',tip:'日常摄入适量膳食纤维，也记得补充水分。',question:'你已下线，身体还有哪些工作？',accent:'#6f81ae',actor:5,station:5,sign:'乘客已休息',quip:'这班还没下。'}
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(x,y,s,size=28,fill=C.ink,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attrs}>${esc(s)}</text>`;
const wrap=(s,max=19)=>{let result=[],line='',n=0;for(const ch of s){let w=/[\x00-\x7f]/.test(ch)?.55:1;if(n+w>max&&!/[，。、！？；：”）]/.test(ch)){result.push(line);line='';n=0;}line+=ch;n+=w;}if(line)result.push(line);return result;};
const lines=(x,y,arr,size=28,fill=C.ink,gap=40,attrs='')=>arr.map((s,i)=>text(x,y+i*gap,s,size,fill,attrs)).join('');
const pill=(x,y,w,label,fill=C.yellow,rotation=0)=>`<g transform="rotate(${rotation} ${x+w/2} ${y+25})"><rect x="${x}" y="${y+5}" width="${w}" height="50" rx="15" fill="#294d37" opacity=".19"/><rect x="${x}" y="${y}" width="${w}" height="50" rx="15" fill="${fill}"/>${text(x+w/2,y+34,label,24,C.ink,'text-anchor="middle" font-weight="700"')}</g>`;
const visible=(begin,end)=>`<set attributeName="visibility" to="visible" begin="${begin}" end="${end}"/>`;
const hidden=(begin,end)=>`<set attributeName="visibility" to="hidden" begin="${begin}" end="${end}"/>`;
const sprite=(id,index,x,y,size)=>`<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${(index%3)*512} ${Math.floor(index/3)*512} 512 512" overflow="hidden"><use href="#${id}" xlink:href="#${id}"/></svg>`;
const button=(id,x,y,w,label,fill=C.green)=>`<g id="${id}" role="button" tabindex="0" aria-label="${esc(label)}" style="cursor:pointer"><title>${esc(label)}</title><rect x="${x}" y="${y+5}" width="${w}" height="62" rx="31" fill="#234b31" opacity=".18"/><rect x="${x}" y="${y}" width="${w}" height="62" rx="31" fill="${fill}"/>${text(x+w/2,y+41,label,28,fill===C.green?'#fffdf3':C.ink,'text-anchor="middle" font-weight="700" pointer-events="none"')}</g>`;
const HERO=1070, STEP=1260, END=HERO+scenes.length*STEP, TOTAL=END+830;
const asset=(name,external)=>external?`https://anitashianyi-create.github.io/mengniu-body-route/assets/${name}`:`data:image/webp;base64,${fs.readFileSync(path.join(dir,'assets',name)).toString('base64')}`;

function makeSVG(external=false){
let svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="route-top" width="720" height="${TOTAL}" viewBox="0 0 720 ${TOTAL}" preserveAspectRatio="xMidYMin meet" style="display:block;width:100%;height:auto;overflow:hidden;background:${C.mint}" role="group" aria-labelledby="art-title art-desc" font-family="'Microsoft YaHei','PingFang SC',sans-serif">
<title id="art-title">当代人身体“拥堵”地图 · 原生 SVG 交互版</title><desc id="art-desc">点击开始，沿着六站长图探索一天的路线。每站可以重播路线动画、展开和收起知识卡片。所有交互由 SVG SMIL 实现，无 JavaScript。素材及原文来自用户指定的参考页面，尚未验证微信公众号发布兼容性。</desc>
<defs><image id="hero-art" width="1536" height="1024" href="${asset('hero.webp',external)}"/><image id="actors-art" width="1536" height="1024" href="${asset('actors-v2.webp',external)}"/><image id="atlas-art" width="1536" height="1024" href="${asset('atlas.webp',external)}"/><pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#c7dcaf" stroke-width="1" opacity=".45"/></pattern></defs>
<rect width="720" height="${TOTAL}" fill="${C.mint}"/><rect y="${HERO}" width="720" height="${TOTAL-HERO}" fill="url(#grid)"/>
<rect width="720" height="${HERO-25}" fill="${C.blue}"/>
${text(38,58,'蒙牛',30,C.ink,'font-weight="900"')}${text(122,58,'生活观察',20,'#225567')}${text(680,56,'● 身体路况局',20,'#245e5a','text-anchor="end"')}
<g transform="rotate(-1.5 360 448)"><rect x="37" y="108" width="646" height="690" rx="36" fill="#2783a9"/><rect x="37" y="98" width="646" height="690" rx="36" fill="${C.paper}"/>
${pill(217,122,286,'一份当代人的日常导航',C.pink,2)}
${text(360,235,'当代人身体',42,'#17291f','text-anchor="middle" font-weight="900"')}${text(360,324,'“拥堵”地图',86,C.green,'text-anchor="middle" font-weight="900"')}
<path d="M176 342Q368 357 550 335" fill="none" stroke="${C.green}" stroke-width="5" stroke-linecap="round"/>
<svg x="48" y="350" width="624" height="380" viewBox="0 0 1536 1024"><use href="#hero-art" xlink:href="#hero-art"/></svg>
${text(360,758,'嘴巴一路加站 · 身体一路接单',28,C.ink,'text-anchor="middle" font-weight="700"')}</g>
${text(360,852,'您的一天，已生成路线。',34,'#fffdf3','text-anchor="middle" font-weight="800"')}${text(360,897,'点开一站，看看身体都经过了什么。',26,'#fffdf3','text-anchor="middle"')}
<a href="#station_0" xlink:href="#station_0">${button('start',190,938,340,'开始今天的路线 ↓',C.yellow)}</a>
<path d="M0 1045Q170 1010 360 1040T720 1045V1070H0Z" fill="${C.mint}"/>
`;
scenes.forEach((s,i)=>{
 const origin=HERO+i*STEP, previous=i===0?'start':`next_${i-1}`, trigger=`${previous}.click+0.65s;play_${i}.click`;
 const road=i%2===0?'M110 738 C110 890 320 730 415 825 S615 880 580 1022':'M600 738 C605 905 385 735 290 825 S100 895 142 1022';
 const sx=i%2===0?110:600,ex=i%2===0?580:142,artX=i%2===0?398:50,signX=i%2===0?380:42;
 svg+=`<g id="station_${i}" transform="translate(0 ${origin})">
<path d="M360 0V35" stroke="#fffdf1" stroke-width="48"/><path d="M360 0V35" stroke="#b8ce96" stroke-width="32"/>
<rect x="53" y="50" width="614" height="568" rx="31" fill="#b8ce9e"/><rect x="53" y="42" width="614" height="568" rx="31" fill="${C.paper}" stroke="#cadab6"/>
<path d="M${i%2?535:151} 609l18 20 18-20" fill="${C.paper}"/>
${pill(82,68,192,`${s.time} · ${s.period}`,i%2?C.pink:C.yellow,-2)}
${text(635,101,`${String(i+1).padStart(2,'0')} / ${s.name}`,20,'#718064','text-anchor="end"')}
${text(85,177,s.title[0],46,C.ink,'font-weight="900"')}${text(85,237,s.title[1],46,s.accent,'font-weight="900"')}
<rect x="85" y="264" width="550" height="112" rx="15" fill="#f7efc8"/><rect x="85" y="278" width="5" height="82" rx="2" fill="${s.accent}"/>
${lines(108,308,s.broadcast,28,C.ink,42,'font-weight="700"')}
<g visibility="hidden">${visible(`info_${i}.click`,`close_${i}.click;replay.click`)}
${text(85,415,'路况背后',20,'#718064')}${lines(85,456,wrap(s.body,19),25,C.ink,34)}
<g id="close_${i}" role="button" tabindex="0" aria-label="收起本站知识" style="cursor:pointer"><rect x="540" y="385" width="95" height="42" rx="21" fill="#e6eddb"/>${text(587,413,'收起 −',19,C.ink,'text-anchor="middle" pointer-events="none"')}</g>
</g>
<g id="info_${i}" role="button" tabindex="0" aria-label="展开${s.name}知识" style="cursor:pointer">${hidden(`info_${i}.click`,`close_${i}.click;replay.click`)}
<rect x="84" y="391" width="551" height="192" rx="17" fill="#eef3e4"/>
${text(108,435,'路况背后',21,'#718064')}${text(108,481,s.question,26,C.ink,'font-weight="700"')}${text(108,544,'轻点这张卡片，查看小知识',23,'#718064')}
<circle cx="597" cy="429" r="19" fill="${s.accent}"/>${text(597,437,'+',27,'#fffdf3','text-anchor="middle" pointer-events="none"')}
</g>
${pill(signX,649,i===4?265:235,s.sign,i%2?'#bde4ed':C.pink,3)}
<path d="${road}" fill="none" stroke="#8cad7066" stroke-width="67" transform="translate(0 6)" stroke-linecap="round"/>
<path d="${road}" fill="none" stroke="#fffdf1" stroke-width="65" stroke-linecap="round"/>
<path d="${road}" fill="none" stroke="#c1d29d" stroke-width="49" stroke-linecap="round"/>
<path id="road_${i}" d="${road}" fill="none" stroke="${s.accent}" stroke-width="49" stroke-linecap="round" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100"><animate attributeName="stroke-dashoffset" values="100;0" begin="${trigger}" dur="3.2s" fill="freeze"/><set attributeName="stroke-dashoffset" to="100" begin="replay.click"/></path>
<path d="${road}" fill="none" stroke="#fffdef" stroke-width="3" stroke-dasharray="4 18" stroke-linecap="round"/>
<circle cx="${sx}" cy="738" r="10" fill="#fffdf3" stroke="${s.accent}" stroke-width="4"/>
<circle cx="${ex}" cy="1022" r="12" fill="${C.yellow}" stroke="#fffdf3" stroke-width="4"/>
<circle cx="${artX+130}" cy="843" r="121" fill="#c9dbb3"/><svg x="${artX}" y="710" width="260" height="260" viewBox="0 0 260 260"><defs><clipPath id="clip_${i}"><circle cx="130" cy="130" r="116"/></clipPath></defs><g clip-path="url(#clip_${i})">${sprite('atlas-art',s.station,0,0,260)}</g></svg>
<g transform="translate(${sx} 738)"><g id="actor_${i}"><animateMotion path="${i%2===0?'M0 0 C0 152 210 -8 305 87 S505 142 470 284':'M0 0 C5 167 -215 -3 -310 87 S-500 157 -458 284'}" begin="${trigger}" dur="3.2s" fill="freeze"/><animateMotion path="M0 0" begin="replay.click" dur=".001s" fill="freeze"/>
${sprite('actors-art',s.actor,-68,-82,136)}
</g></g>
${text(i%2?365:70,1007,s.quip,25,'#657951','font-weight="600"')}
${button(`play_${i}`,i%2?400:62,1044,252,'再走一次 ↻','#f2df65')}
${lines(360,1150,wrap(s.tip,23),23,'#6a7b5b',32,'text-anchor="middle"')}
<a href="#${i===5?'route-end':`station_${i+1}`}" xlink:href="#${i===5?'route-end':`station_${i+1}`}">${button(`next_${i}`,190,1190,340,i===5?'完成今日路线 ↓':`下一站 · ${scenes[i+1].time} ↓`)}</a>
</g>`;
});
svg+=`<g id="route-end" transform="translate(0 ${END})"><path d="M0 70Q0 0 70 0H650Q720 0 720 70V830H0Z" fill="#3f8e3b"/>
<g transform="rotate(-2 360 170)"><rect x="55" y="56" width="610" height="228" rx="36" fill="#a96373"/><rect x="55" y="48" width="610" height="228" rx="36" fill="${C.pink}"/>${text(360,103,'今日导航结束',25,C.ink,'text-anchor="middle" font-weight="700"')}${lines(360,169,['下一站','好好吃饭，好好休息。'],43,C.ink,65,'text-anchor="middle" font-weight="900"')}</g>
${lines(360,347,['身体每天都在认真接单。','给它的日常安排，也可以从容一点。'],28,'#fffbe5',48,'text-anchor="middle"')}
${pill(66,442,180,'饮食多样','#e3edba')}${pill(270,442,180,'记得喝水','#e3edba')}${pill(474,442,180,'动一动','#e3edba')}
<a href="#route-top" xlink:href="#route-top">${button('replay',183,540,354,'↻ 再走一遍今天的路线',C.yellow)}</a>
${lines(360,658,['路线、时间和播报为生活场景的趣味比喻，','不代表身体检测结果；身体感受因人而异。','如反复出现不适，请及时就医。'],21,'#e3eed8',34,'text-anchor="middle"')}
${text(360,787,'蒙牛 · 生活观察',24,'#fffbe5','text-anchor="middle" font-weight="700"')}
</g></svg>`;
return svg;
}
const svg=makeSVG();
fs.writeFileSync(path.join(dir,'mengniu-native.svg'),svg);
const external=makeSVG(true);
fs.writeFileSync(path.join(dir,'article-fragment.html'),`<!-- 发布候选片段：无脚本。图片 URL 尚需替换为公众号素材 URL，并验证 SMIL 是否被保存。 -->\n<section style="margin:0;padding:0;line-height:0">${external}</section>`);
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>身体拥堵地图 · 原生 SVG 版</title><style>*{box-sizing:border-box}body{margin:0;background:#e9eee1;color:#294d37;font-family:'Microsoft YaHei','PingFang SC',sans-serif}.layout{max-width:1120px;margin:0 auto;padding:44px 28px 70px;display:grid;grid-template-columns:1fr minmax(320px,460px);gap:64px;align-items:start}.intro{position:sticky;top:44px;padding-top:14px}.eyebrow{font-size:12px;letter-spacing:2px;color:#718064}h1{font-size:39px;line-height:1.4;letter-spacing:-1px;margin:22px 0;font-weight:800}.tag{display:inline-block;background:#d3e4c5;padding:7px 13px;border-radius:20px;font-size:13px}p{font-size:15px;line-height:1.95;color:#63735a}.steps{margin:26px 0;padding:16px 0;border-top:1px solid #ccd8bf;border-bottom:1px solid #ccd8bf}.steps p{margin:8px 0}.links{display:flex;gap:16px;flex-wrap:wrap}a{color:#365e36;text-underline-offset:4px}small{display:block;font-size:12px;line-height:1.9;color:#74836c}.art{border-radius:9px;overflow:hidden;box-shadow:0 24px 70px #2647291c;background:#dfeecb}.mobile-note{display:none}@media(max-width:760px){.layout{display:flex;flex-direction:column;padding:0;gap:0}.intro{position:static;padding:24px 22px 22px}h1{font-size:26px;margin:12px 0}h1 br{display:none}.intro .steps,.intro>p,.intro>small{display:none}.tag{font-size:12px}.links{font-size:13px;margin-top:16px}.art{width:100%;border-radius:0;max-width:520px;align-self:center}.mobile-note{display:block;margin:14px 0 0;font-size:13px}}@media(prefers-reduced-motion:reduce){.art{scroll-behavior:auto}}</style></head><body><main class="layout"><aside class="intro"><span class="eyebrow">BODY ROUTE / SVG EDITION</span><h1>跟着一条路线，<br>走过你的一天。</h1><span class="tag">原生 SVG · 六站路线 · 无 JavaScript</span><div class="steps"><p>01　点击「开始」，进入第一站。</p><p>02　小车沿路出发，点击卡片查看知识。</p><p>03　点击「下一站」，沿着地图接着读。</p><p>04　每站可以重播，结尾可以重新出发。</p></div><p>沿用参考页的黏土素材与薄荷绿地图，把滚动驱动改成原生点击触发。路线、图层和动画均由 SVG 实现。</p><div class="links"><a href="mengniu-native.svg" target="_blank">打开独立 SVG</a><a href="mengniu-native.svg" download>下载 SVG</a><a href="README.md">交付说明</a></div><p class="mobile-note">点击出发 · 知识卡可展开 · 每站可重播</p><p>此页是浏览器预览；公众号候选片段另附。微信草稿保存与手机端兼容尚未验收。</p><small>视觉与原文来源：<a href="https://anitashianyi-create.github.io/mengniu-body-route/" target="_blank" rel="noopener">用户指定参考页</a>。<br>科普资料：<a href="https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works">消化系统</a> · <a href="https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition">纤维与饮水</a> · <a href="https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/eating-diet-nutrition">反流与饮食</a>。文案沿用参考页。</small></aside><section class="art" aria-label="原生 SVG 互动长图">${svg}</section></main></body></html>`;
fs.writeFileSync(path.join(dir,'index.html'),html);
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({created:'2026-09-18',reference:'https://anitashianyi-create.github.io/mengniu-body-route/',width:720,heroHeight:HERO,totalHeight:TOTAL,stageHeight:STEP,stages:scenes.map(s=>({time:s.time,title:s.title.join('')})),javascriptInArtifact:false,assets:['hero.webp','actors-v2.webp','atlas.webp'],wechatStatus:'UNVERIFIED — replace media URLs and validate imported draft'},null,2));
console.log(JSON.stringify({files:['mengniu-native.svg','index.html','article-fragment.html','manifest.json'],svgBytes:Buffer.byteLength(svg),totalHeight:TOTAL}));
