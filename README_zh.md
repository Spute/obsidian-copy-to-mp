# 复制文档为 HTML

这是一个 [Obsidian](https://obsidian.md) 插件，可将当前文档复制到微信公众号，以便快速将文档内容分享到微信公众号。

该插件提供了 `复制文档为公众号` 命令，可以绑定到键盘快捷键（见下文）。也可以从文件资源管理器视图中复制内容。


## 功能特性

### 命令

这些命令可以从热键菜单绑定到键盘快捷键，或使用命令菜单运行（Ctrl+P）

**复制选中内容或整个文档到剪贴板**：如果选中了文本，将其复制到剪贴板。如果没有选中文本，则复制整个文档。这应该是你的默认键盘快捷键。（建议：`Ctrl+Shift+C`）

**复制整个文档到剪贴板**：复制整个文档

**复制当前选中内容到剪贴板**：仅复制选中的文本

### 媒体支持

目前支持：

- ✅ 图片
- ✅ PlantUML
- ✅ 图表
- ✅ Obsidian 任务
- ✅ Obsidian Dataview - 对于大型 Dataview 块，内容可能不完整
- ✅ Excalidraw - 渲染为位图以解决在 Gmail 中粘贴的问题
- ✅ Mermaid


### 样式

默认情况下，文档会应用简单的样式。可以通过插件设置自定义样式表，例如自定义表格或引用的外观。

## 高级功能

- 您可以选择是否要嵌入外部链接（http、https）。如果不嵌入（默认），您需要互联网访问才能查看文档，并且链接的图片可能会离线。如果嵌入，您的文档会更大。
- 可以在设置对话框中自定义或替换样式表。
- 默认将 SVG 转换为位图以获得更好的兼容性，但可能会损失质量。如果您知道要粘贴到支持 .svg 良好的应用程序中，可以禁用 `将 SVG 转换为位图` 设置。
- 可以将代码块和标注渲染为 HTML 表格。这会使它们变得丑陋，除了在 Google Docs 中会使文档稍微漂亮一些。
- 如果您的 Markdown 文件中有标题，使用文件名作为标题
- 如果您不需要完整的 HTML 文档，只需要 HTML 片段，例如要粘贴到现有文档中，请启用"仅复制 HTML 片段"选项。
- 您也可以通过粘贴到非 HTML 编辑器（如记事本）来检索 HTML 内容。
- 提供您自己的 HTML 模板

## 实现原理

该插件将图片引用转换为数据 URL，因此转换后的内容不包含对图片的引用。

## 已知问题

- 不支持移动端
- 对删除特殊 Dataview 字段（双冒号属性等）的支持是实验性的，不支持括号表示法。它们也不会从包含的文件中删除。
- 数据 URI 对于大/多图片可能会占用大量内存

## 安装

在 Obsidian 设置的社区插件部分中查找 *复制文档为 HTML*。

如果发现任何问题，请不要害怕[报告](https://github.com/mvdkwast/obsidian-copy-as-html/issues)或[提问](https://github.com/mvdkwast/obsidian-copy-as-html/discussions)！

## 开发

请参阅 [Obsidian 示例插件](https://github.com/obsidianmd/obsidian-sample-plugin)。
官方文档：https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin


## 致谢

- Oliver Balfour 的 [obsidian-pandoc](https://github.com/OliverBalfour/obsidian-pandoc) 插件，帮助我解决了一些渲染问题。
- @TfTHacker 的 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件，使 Beta 测试变得轻松。
- PJ Eby 的 [Hot-reload](https://github.com/pjeby/hot-reload) 插件，使插件开发快速而有趣。
- @jkunczik 使包含功能能够与标题引用一起工作
- @Ivan1248 使生成的 HTML 更符合标准，以及 @fetwar 对此主题的建设性评论
- @vgyenge6 的建议
- @HMLeeSoundcat 提供更多自定义想法和示例代码
- @Luiz-nyan 建议包含 Obsidian 链接