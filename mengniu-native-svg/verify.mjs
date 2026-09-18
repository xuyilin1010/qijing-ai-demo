import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const profile=path.join(dir,'.qa-profile-'+process.pid);fs.mkdirSync(profile,{recursive:true});
const server=http.createServer((req,res)=>{const p=path.resolve(dir,'.'+decodeURIComponent((req.url||'/').split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(dir+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',p.endsWith('.svg')?'image/svg+xml':p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.webp')?'image/webp':'text/plain; charset=utf-8');res.setHeader('Content-Security-Policy',"script-src 'none'");res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const child=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let log='';child.stderr.on('data',d=>{log+=d.toString()});
let ws,cdp,id=0,pending=new Map();const results=[];
try{
 let port;for(let i=0;i<100;i++){try{port=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);if(port)break;}catch{}await sleep(100);}if(!port)throw Error('Edge did not start: '+log.slice(-1500));
 let target;for(let i=0;i<30;i++){try{target=await(await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(base+'/index.html')}`,{method:'PUT'})).json();break;}catch{await sleep(100);}}if(!target)throw Error('No debug target');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const q=pending.get(m.id);if(q){pending.delete(m.id);m.error?q.reject(Error(JSON.stringify(m.error))):q.resolve(m.result);}}};
 cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const check=(name,pass,details)=>{results.push({name,pass:!!pass,details});if(!pass)throw Error(name+': '+JSON.stringify(details));};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);await sleep(100);const p=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',clickCount:1});await sleep(80);};
 const screenshot=async name=>{const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(dir,name),Buffer.from(r.data,'base64'));};
 await cdp('Page.enable');await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await cdp('Page.navigate',{url:base+'/index.html'});await sleep(700);
 let initial=await evaluate(`({height:document.querySelector('.art>svg').getBoundingClientRect().height,vb:document.querySelector('.art>svg').viewBox.animVal.height,scripts:document.scripts.length,overflow:document.documentElement.scrollWidth>innerWidth})`);
 check('Mobile no page scripts or horizontal overflow',initial.scripts===0&&!initial.overflow,initial);check('Responsive long SVG ratio',initial.vb===9460&&Math.abs(initial.height-9460*390/720)<2,initial);
 await evaluate(`document.querySelector('.art').scrollIntoView({block:'start'})`);await screenshot('preview-mobile-cover.png');
 await click('#start');await sleep(800);check('Start navigates to first station',await evaluate(`location.hash==='#station_0'`));
 await click('#info_0');await sleep(80);console.log('INFO DIAG',await evaluate(`(()=>{const el=document.querySelector('#info_0'),a=el.querySelector('set');let t;try{t=a.getStartTime()}catch(e){t=e.message}const r=el.getBoundingClientRect();return {visibility:getComputedStyle(el).visibility,begin:a.getAttribute('begin'),start:t,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML?.slice(0,400),time:document.querySelector('.art>svg').getCurrentTime()}})()`));check('Knowledge card opens',await evaluate(`getComputedStyle(document.querySelector('#info_0')).visibility==='hidden'`));
 await evaluate(`window.scrollTo(0,document.querySelector('#station_0').getBoundingClientRect().top+scrollY)`);await screenshot('preview-mobile-station.png');
 await click('#close_0');check('Knowledge card closes',await evaluate(`getComputedStyle(document.querySelector('#info_0')).visibility==='visible'`));
 await click('#play_0');await sleep(80);const pose1=await evaluate(`({x:document.querySelector('#actor_0').getCTM().e,y:document.querySelector('#actor_0').getCTM().f})`);await sleep(950);const pose2=await evaluate(`({x:document.querySelector('#actor_0').getCTM().e,y:document.querySelector('#actor_0').getCTM().f})`);check('Native animateMotion changes actor position',Math.hypot(pose2.x-pose1.x,pose2.y-pose1.y)>20,{pose1,pose2});
 for(let i=0;i<6;i++){await click('#next_'+i);await sleep(180);const hash=await evaluate(`location.hash`);check('Navigate next after station '+i,hash===(i===5?'#route-end':'#station_'+(i+1)),hash);}
 await click('#info_4');check('Late station knowledge opens',await evaluate(`getComputedStyle(document.querySelector('#info_4')).visibility==='hidden'`));
 await click('#play_4');await sleep(1500);await evaluate(`window.scrollTo(0,document.querySelector('#station_4').getBoundingClientRect().top+scrollY+350)`);await screenshot('preview-mobile-night.png');
 await click('#replay');await sleep(150);check('Replay returns and resets cards',await evaluate(`location.hash==='#route-top'&&getComputedStyle(document.querySelector('#info_4')).visibility==='visible'`));
 await click('#start');await sleep(150);await click('#info_0');await click('#close_0');check('Second run works',await evaluate(`getComputedStyle(document.querySelector('#info_0')).visibility==='visible'`));
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:base+'/index.html'});await sleep(500);await screenshot('preview-desktop.png');
 check('Desktop has no overflow',await evaluate(`document.documentElement.scrollWidth<=innerWidth`));
 await cdp('Page.navigate',{url:base+'/mengniu-native.svg'});await sleep(400);check('Standalone SVG loads',await evaluate(`document.documentElement.localName==='svg'&&!document.querySelector('parsererror')`));await click('#start');await sleep(150);await click('#info_0');check('Standalone SVG interaction works',await evaluate(`getComputedStyle(document.querySelector('#info_0')).visibility==='hidden'`));
 await cdp('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});await cdp('Page.navigate',{url:base+'/index.html'});await sleep(400);check('320px layout has no overflow',await evaluate(`document.documentElement.scrollWidth<=innerWidth`));
 fs.writeFileSync(path.join(dir,'qa-results.json'),JSON.stringify({testedAt:new Date().toISOString(),browser:'Microsoft Edge headless',pageScriptsBlockedByCSP:true,results},null,2));console.log(JSON.stringify({passed:results.length,results},null,2));
}catch(e){try{const shot=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(dir,'qa-failure.png'),Buffer.from(shot.data,'base64'));const state=await cdp('Runtime.evaluate',{expression:`JSON.stringify({scrollY,innerHeight,info:getComputedStyle(document.querySelector('#info_0')).visibility,rect:document.querySelector('#info_0').getBoundingClientRect().toJSON()})`,returnByValue:true});console.error(state.result.value);}catch{}fs.writeFileSync(path.join(dir,'qa-results.json'),JSON.stringify({error:e.message,results},null,2));console.error(e.stack);process.exitCode=1;}
finally{try{if(cdp)await cdp('Browser.close')}catch{}if(ws)ws.close();child.kill();server.close();}
