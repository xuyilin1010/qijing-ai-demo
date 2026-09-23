# 向未知前行｜公众号原生 SVG 竖版 V1

这是从 `explorer-long-scroll-demo` 独立派生的新版本。原目录保持不变。本版用于探索公众号正文交付：竖向长图、JPG 场景图片、内联 SVG 文案与三个点击揭晓模块，不依赖 JavaScript、Canvas 或 WebP。

## 文件

- `index.html`：本地及 GitHub Pages 视觉预览，图片使用同目录的相对路径。
- `article-fragment.html`：公众号正文片段；所有图片为 `{{WECHAT_IMAGE:xxx.jpg}}` 占位符，**不能直接导入后台**。
- `assets/*.jpg`：由原始 PNG 独立导出的公众号候选素材，9 张合计约 973 KiB。
- `make-assets.ps1`：从上一版源 PNG 生成本版 JPG；只写本目录。
- `build.mjs`：生成预览和正文片段；只写本目录。
- `wechat-image-map.example.json`：图片上传到公众号后的地址填写样例。
- `inject-wechat-images.mjs`：将实际微信图片地址写入正文片段，输出 `article-wechat-ready.html`。

## 设计与性能

- 封面 900×1600、约 176 KiB；场景主图 900×1100、约 83–167 KiB；人物图 720×1080、约 71–145 KiB。
- 图片边缘渐隐到深蓝底色，使分段在竖向阅读中连续。文字和简单图形留在 SVG，不烘焙进照片，以保持手机上的清晰度。
- 点击揭晓使用内联 SVG `<animate begin="click">`，单模块自触发，不使用跨元素 `id`、脚本或外部样式表。
- 正文 SVG 的图片 URL 必须先换成目标公众号可访问的微信素材地址；不要引用 GitHub 或本地文件作为正式素材。

## 公众号导入

1. 将本目录 `assets/*.jpg` 上传到目标公众号可用于正文的图片素材流程，记录每张图的完整 HTTPS 地址。
2. 复制 `wechat-image-map.example.json` 为 `wechat-image-map.json`，填入实际地址。
3. 运行 `node inject-wechat-images.mjs`。脚本会拒绝未填完的映射。
4. 使用支持源码/授权同步的编辑器将 `article-wechat-ready.html` 导入公众号草稿，保存并重新打开检查 SVG 与图片是否保留。
5. 发手机预览，检查 iOS / Android 的首屏、滑动、三张揭晓卡的首次点击、图片接缝和深色模式。

`article-wechat-ready.html` 只是地址替换后的候选交付，**不是已通过微信后台的证明**。当前尚无目标公众号图片地址及后台预览权限，因此未声称已通过微信编辑器或真机验证。

## 与网页版的取舍

原版的横屏旋转、Canvas 连续背景、JS Tab 和故事切换不适用于这份无脚本公众号正文。V1 将内容改成竖向顺序阅读，保留三个可点击的 SVG 揭晓模块；原版网页仍在独立目录供对照。正式视频和二维码素材在原版本来就是占位，本版没有制作假视频或假二维码。
