# 当代人身体“拥堵”地图 · 原生 SVG 版

完成日期：2026-09-18。

在线预览：[手机／桌面预览](https://xuyilin1010.github.io/qijing-ai-demo/mengniu-native-svg/) · [独立 SVG](https://xuyilin1010.github.io/qijing-ai-demo/mengniu-native-svg/mengniu-native.svg)。

沿用用户指定页面的黏土素材、薄荷绿底色、奶油纸卡、粉黄路牌，以及一天六站的内容结构。交互重新编写为原生 SVG SMIL，不含 JavaScript。

## 打开与体验

- `index.html`：推荐预览入口，包含桌面与移动布局。可以直接在浏览器中打开，不需要启动服务。
- `mengniu-native.svg`：独立交互 SVG。图片已经嵌入，可离线打开。约 668 KB，画布为 720 × 9460。
- `article-fragment.html`：去除预览页外壳的发布候选片段；仍需公众号适配验证。
- `qa-results.json`：本地浏览器验收记录。
- `build.mjs`：生成源码，使用 Node.js 执行，读取 assets 下的原始素材生成交付文件。它是构建工具，不是成品页面运行依赖。
- `verify.mjs`：本地测试工具，运行独立的隐藏 Edge 浏览器；不属于成品运行代码。

点击封面的“开始”，进入早餐站；点击每站的知识卡片，查看／收起说明；点击“再走一次”，重播道路点亮和角色移动；通过“下一站”进入对应章节。末尾“再走一遍”返回开头，并重置知识卡片和路线。

正文采用连续长图布局。这里的“展开”是卡片内容展开，不是改变整个文档高度；此结构能保持不同屏宽下的画面比例，也允许不操作直接浏览所有章节。

## 实现与区别

| 参考 H5 | 原生 SVG 版 |
| --- | --- |
| JavaScript 根据滚动进度更新道路 | 点击触发 `<animate>`，改变 `stroke-dashoffset` |
| getPointAtLength + HTML 图片定位 | `<animateMotion>` 沿预设曲线移动角色 |
| 脚本控制界面状态 | `<set>` 处理卡片显隐和复位 |
| JavaScript 更新导航内容 | `<a href="#...">` 原生章节定位 |
| IntersectionObserver 入场效果 | 不依赖滚动观察器，正文自然连续显示 |

成品不含 `<script>`、JavaScript 事件处理器、Canvas、iframe 或 foreignObject。道路和布局是 SVG；黏土视觉仍然是 WebP 位图素材，因此“原生 SVG”指交互实现，不表示所有图片都是矢量绘制。

## 已完成的验证

在独立 Microsoft Edge headless 中，通过响应头 `Content-Security-Policy: script-src 'none'` 禁用页面脚本后，19 项检查通过：

- 390 px 手机宽度下，SVG 按比例显示且无横向溢出；320 px 也无横向溢出。
- 封面进入第一站、六站导航和返回起点正常。
- 知识卡片可打开和关闭，重置后可再次打开和关闭。
- 路径动画实际改变了角色位置。
- 桌面页面无横向溢出。
- 独立 SVG 文档正常解析，点击交互正常。
- 检查了手机封面、知识卡片、夜间地图与桌面截图，修正了素材裁切与文字断行。

测试工具会使用 JavaScript 检查浏览器状态；交付 SVG 和预览页本身不包含、也不依赖 JavaScript。

## 公众号发布状态

**未导入公众号草稿，未完成 iOS／Android 微信真机验收，不标记为可直接发布版本。**

`mengniu-native.svg` 的内嵌图片适合独立浏览器预览。`article-fragment.html` 改为引用原站图片，但这些地址不是公众号素材地址。正式发布前需要：

1. 将三张图片上传到公众号素材系统，按实际接受的图片格式处理，替换片段中三处图片 URL。
2. 通过支持复杂 SVG 的导入／同步流程写入草稿，保存后确认 `defs`、`use`、裁切、SMIL、事件标识及链接属性的保留情况。
3. 重点验证 `animateMotion`、点击显隐、章节锚点、重播，以及不同客户端的图片加载。若锚点被过滤，保留自然滚动；若某些动画结构被过滤，需要替换为该发布链路允许的组件写法。
4. 在手机微信中验收后，再确定发布版。浏览器测试通过不等于微信发布通过。

## 来源

- 参考页面与三张视觉素材：[用户指定页面](https://anitashianyi-create.github.io/mengniu-body-route/)。素材文件名为 `hero.webp`、`actors-v2.webp`、`atlas.webp`。
- 六站科普文字沿用参考页面，未新增产品功效承诺。原页面的公开参考资料：[消化系统](https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works)、[纤维与饮水](https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition)、[反流与饮食](https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/eating-diet-nutrition)。
