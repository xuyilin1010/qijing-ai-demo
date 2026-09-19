# 公众号适配候选版

旧版直接复制到公众号的流程已确认出现缺图和交互失效，原复制入口已撤下。

- `index.html`：状态与候选版入口。
- `native-v2/preview.html`：无脚本浏览器预览；不是公众号预览。
- `native-v2/index.html`：填写微信图片地址，生成供排版器 HTML 模式导入的正文。
- `native-v2/article-template.html`：带图片地址占位符的源码，不能直接发布。
- `research/findings.md`：参考案例、官方文档、实际验证及未完成项。

当前已验证禁用脚本的浏览器点击、三张卡片键盘滚动、135 完整源码导出后的实际运行。路线已用 CSS 阅读进度动画实现，并通过前后附加内容的范围测试；公众号保存后是否保留、手机是否支持仍待验证。当前未接入视频。

候选版构建脚本：工作区 work/build-wechat-v2.py。原 work/build-wechat.py 仅保留旧版取证代码；重建后还需运行 v2 脚本。

线上入口：https://xuyilin1010.github.io/qijing-ai-demo/%E5%85%AC%E4%BC%97%E5%8F%B7demo1/wechat/
