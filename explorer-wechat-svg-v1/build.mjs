import { writeFileSync } from 'node:fs';

const gold = '#E8BE79';
const white = '#F6F2EA';
const muted = '#A9BDD0';
const navy = '#061323';
const url = (name, article) => article ? `{{WECHAT_IMAGE:${name}.jpg}}` : `assets/${name}.jpg`;
const image = (name, width, height, article, attrs = '') => `<image x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" xlink:href="${url(name, article)}" ${attrs}/>`;
const txt = (x, y, value, size, color = white, weight = 400, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="Arial,'PingFang SC','Microsoft YaHei',sans-serif" font-weight="${weight}" ${extra}>${value}</text>`;
const svg = (label, height, body) => `<section style="margin:0;padding:0;line-height:0;background:${navy};"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 900 ${height}" width="100%" role="img" aria-label="${label}" style="display:block;width:100%;height:auto;margin:0;padding:0;background:${navy};">${body}</svg></section>`;
const thinRule = (y, width = 780) => `<line x1="60" y1="${y}" x2="${60 + width}" y2="${y}" stroke="${gold}" stroke-opacity=".58" stroke-width="2"/>`;

function cover(article) {
  return svg('向未知前行，探索长卷封面', 1600, `
    <rect width="900" height="1600" fill="${navy}"/>
    ${image('entry', 900, 1600, article)}
    <rect x="0" y="0" width="900" height="550" fill="${navy}" opacity=".27"/>
    ${txt(60, 115, 'BEYOND THE KNOWN', 25, gold, 700, 'letter-spacing="5"')}
    ${thinRule(146, 385)}
    ${txt(60, 310, '心所向', 104, white, 800)}
    ${txt(60, 432, '行致远', 104, white, 800)}
    ${txt(66, 514, '向未知前行 · 探索者系列', 35, muted, 500)}
    <rect x="60" y="1390" width="390" height="94" rx="47" fill="${navy}" opacity=".84" stroke="${gold}" stroke-width="2"/>
    ${txt(108, 1452, '向下滑动，开启探索', 34, white, 600)}
    <path d="M770 1400v66m-18-18 18 18 18-18" fill="none" stroke="${gold}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  `);
}

function prologue(article) {
  return svg('探索序言', 1100, `
    <rect width="900" height="1100" fill="${navy}"/>
    ${image('cover', 900, 1100, article)}
    <rect x="0" y="0" width="900" height="440" fill="${navy}" opacity=".72"/>
    ${txt(60, 100, '01 / THE JOURNEY BEGINS', 25, gold, 700, 'letter-spacing="4"')}
    ${thinRule(135)}
    ${txt(60, 267, '世界的边界，', 64, white, 700)}
    ${txt(60, 362, '值得一次新的探索。', 64, white, 700)}
    <rect x="0" y="875" width="900" height="225" fill="${navy}" opacity=".72"/>
    ${txt(60, 970, '以好奇感知世界，以行动回应向往。', 31, white)}
    ${txt(60, 1022, '在星空、山野与海岸之间，发现方向。', 31, muted)}
  `);
}

function landscape(article, name, number, english, titleA, titleB, copyA, copyB) {
  return svg(`${titleA}${titleB}`, 1100, `
    <rect width="900" height="1100" fill="${navy}"/>
    ${image(name, 900, 1100, article)}
    <rect x="0" y="0" width="900" height="385" fill="${navy}" opacity=".38"/>
    ${txt(60, 104, `${number} / ${english}`, 26, gold, 700, 'letter-spacing="3"')}
    ${thinRule(135, 475)}
    ${txt(60, 238, titleA, 71, white, 800)}
    ${txt(60, 330, titleB, 71, white, 800)}
    <rect x="0" y="898" width="900" height="202" fill="${navy}" opacity=".66"/>
    ${txt(60, 984, copyA, 30, white)}
    ${txt(60, 1034, copyB, 30, muted)}
  `);
}

function featureIntro() {
  return svg('感官、体验、情感，点击探索', 490, `
    <rect width="900" height="490" fill="${navy}"/>
    ${txt(60, 96, '05 / DISCOVER THE DETAILS', 26, gold, 700, 'letter-spacing="3"')}
    ${thinRule(130)}
    ${txt(60, 262, '细节之中', 72, white, 800)}
    ${txt(60, 354, '看见不同。', 72, white, 800)}
    ${txt(60, 434, '轻触下方三个画面，展开不同的探索角度。', 30, muted)}
  `);
}

function revealCard(number, title, english, lineA, lineB) {
  const y = 100;
  return svg(`${title}，点击揭晓`, 450, `
    <rect width="900" height="450" fill="${navy}"/>
    <rect x="44" y="24" width="812" height="394" rx="17" fill="#0D2943" stroke="#42627B" stroke-width="2"/>
    <circle cx="754" cy="220" r="106" fill="none" stroke="${gold}" stroke-opacity=".38" stroke-width="3"/>
    <circle cx="754" cy="220" r="74" fill="none" stroke="${gold}" stroke-opacity=".18" stroke-width="2"/>
    ${txt(83, 112, `${number} / ${english}`, 25, gold, 700, 'letter-spacing="3"')}
    ${txt(83, 220, lineA, 44, white, 700)}
    ${txt(83, 284, lineB, 32, muted)}
    <g>
      <rect x="44" y="24" width="812" height="394" rx="17" fill="#0B2035" stroke="${gold}" stroke-opacity=".55" stroke-width="2"/>
      <path d="M636 150h140m-56-56 56 56-56 56" fill="none" stroke="${gold}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${txt(83, 120, `${number} / ${english}`, 25, gold, 700, 'letter-spacing="3"')}
      ${txt(83, 250, title, 78, white, 800)}
      ${txt(83, 350, '点击，展开这一面', 32, muted)}
      <animate attributeName="opacity" from="1" to="0" dur="0.35s" begin="click" fill="freeze"/>
    </g>
  `);
}

function audienceIntro() {
  return svg('三大先锋圈层', 650, `
    <rect width="900" height="650" fill="${navy}"/>
    ${txt(60, 100, '06 / DIFFERENT PATHS', 26, gold, 700, 'letter-spacing="3"')}
    ${thinRule(136)}
    ${txt(60, 270, '三大先锋圈层', 76, white, 800)}
    ${txt(60, 357, '不同的热爱，汇聚鲜明的生活方式。', 32, muted)}
    <circle cx="162" cy="492" r="70" fill="none" stroke="${gold}" stroke-opacity=".75" stroke-width="3"/>
    <circle cx="450" cy="492" r="70" fill="none" stroke="${gold}" stroke-opacity=".55" stroke-width="3"/>
    <circle cx="738" cy="492" r="70" fill="none" stroke="${gold}" stroke-opacity=".35" stroke-width="3"/>
    ${txt(127, 504, '01', 35, gold, 700)}${txt(415, 504, '02', 35, gold, 700)}${txt(703, 504, '03', 35, gold, 700)}
    ${txt(60, 615, '生活方式画像示意 · 非消费者调研结论', 24, muted)}
  `);
}

function story(article, name, number, label, headingA, headingB, bodyA, bodyB, bodyC) {
  return svg(`${label}人物故事`, 1430, `
    <rect width="900" height="1430" fill="${navy}"/>
    ${txt(60, 91, `0${number} / FIELD NOTES`, 25, gold, 700, 'letter-spacing="3"')}
    ${thinRule(126)}
    ${txt(60, 226, headingA, 67, white, 800)}
    ${txt(60, 310, headingB, 67, white, 800)}
    <rect x="88" y="390" width="724" height="844" fill="#0C2135" stroke="${gold}" stroke-opacity=".35" stroke-width="2"/>
    <image x="90" y="392" width="720" height="840" preserveAspectRatio="xMidYMid slice" xlink:href="${url(name, article)}"/>
    ${txt(60, 1298, bodyA, 30, white)}
    ${txt(60, 1345, bodyB, 30, muted)}
    ${txt(60, 1392, bodyC, 30, muted)}
  `);
}

function ending(article) {
  return svg('探索长卷结尾', 900, `
    <rect width="900" height="900" fill="${navy}"/>
    <image x="0" y="300" width="900" height="600" preserveAspectRatio="xMidYMid slice" xlink:href="${url('ending-light-trails', article)}"/>
    ${txt(60, 104, 'BEYOND THE KNOWN', 25, gold, 700, 'letter-spacing="4"')}
    ${thinRule(136)}
    ${txt(60, 266, '追逐梦想', 72, white, 800)}
    ${txt(60, 358, '敢于探索', 72, white, 800)}
    ${txt(60, 450, '向往自由', 72, white, 800)}
    ${txt(60, 705, '知行合一，便是自由。', 40, white, 600)}
    ${txt(60, 798, '下一段旅程，仍在前方。', 30, muted)}
  `);
}

function article(article) {
  return [
    cover(article), prologue(article),
    landscape(article, 'stars', '02', 'UNDER THE STARS', '抬头，看见', '无垠的可能。', '把目光交给星空，把答案留给自己。', '在辽阔之中，为好奇留一片空白。'),
    landscape(article, 'climb', '03', 'ABOVE THE ORDINARY', '向上，让世界', '多一种视角。', '每一步，都有脚下的回响。', '新的风景，藏在下一次出发里。'),
    landscape(article, 'run', '04', 'FOLLOW YOUR PACE', '迎着风，找到', '自己的节奏。', '让脚步回应心里的热望。', '不必追赶谁，奔向自己的远方。'),
    featureIntro(),
    revealCard('01', '感官', 'SENSORY', '光影交汇，唤醒感知。', '用克制的色彩，打开探索的第一重视野。'),
    revealCard('02', '体验', 'EXPERIENCE', '走入风景，亲身抵达。', '在行进与停留之间，找到自己的节奏。'),
    revealCard('03', '情感', 'EMOTION', '心向远方，自由生长。', '把好奇、勇气与热爱，带向更远的地方。'),
    audienceIntro(),
    story(article, 'story-outdoor', 1, '户外探索者', '脚踏泥土', '心才落地。', '走进山野，也走近自己。', '听风、鸟鸣和自己的呼吸，', '让脚下的每一步，带来新的答案。'),
    story(article, 'story-design', 2, '品质创造者', '认真之处', '自有光芒。', '一张图纸，一次推敲。', '那些不易被看见的耐心，', '最终会留在作品的细节里。'),
    story(article, 'story-coffee', 3, '生活创作者', '日常一刻', '也有新意。', '留出一点时间，认真做一杯咖啡。', '把喜欢的细节慢慢积攒，', '日常也能成为自己的创作。'),
    ending(article),
  ].join('\n');
}

const fragment = article(true);
const preview = article(false);
writeFileSync(new URL('./article-fragment.html', import.meta.url), fragment + '\n', 'utf8');
writeFileSync(new URL('./index.html', import.meta.url), `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="${navy}"><title>向未知前行 · 公众号 SVG 竖版 V1</title><style>*{box-sizing:border-box}html,body{margin:0;background:#111923}body{min-width:320px}.page{max-width:450px;margin:0 auto;box-shadow:0 0 60px #0008}.page section{display:block}.page svg{display:block}@media(min-width:500px){.page{margin:28px auto}}</style></head><body><main class="page">${preview}</main></body></html>\n`, 'utf8');
console.log('Built JS-free SVG article and local preview.');
