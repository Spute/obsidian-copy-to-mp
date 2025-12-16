import {
	App,                  // Obsidian 应用实例，可访问 vault、workspace、插件管理器等全局对象
	arrayBufferToBase64,  // 工具函数，将 ArrayBuffer 转为 Base64，常用于图片或二进制数据处理
	Component,            // UI 组件基类，可管理事件生命周期等
	FileSystemAdapter,    // 文件系统适配器，用于读写本地或远程文件
	MarkdownRenderer,     // Markdown 渲染器，将 Markdown 内容渲染为 HTML
	MarkdownView,         // Markdown 窗口视图，表示当前打开的编辑器
	Modal,                // 弹窗类，用于创建自定义模态窗口
	Notice,               // 系统通知类，在屏幕右下角显示提示信息
	Plugin,               // 插件基类，所有 Obsidian 插件必须继承它
	PluginSettingTab,     // 插件设置面板类，用于创建插件设置界面
	Setting,              // 设置项类，用于在设置面板中添加单个控件（开关、输入框等）
	TAbstractFile,        // 抽象文件类，代表文件系统中的任意文件或文件夹
	TFile                 // 文件类，继承自 TAbstractFile，表示具体文件（如 Markdown 文件）
  } from 'obsidian';
  
/*
 * 通用库函数
 */

/**
 * 类似 Promise.all()，但带有进度回调。感谢来自
 * https://stackoverflow.com/a/42342373/1341132
 */
function allWithProgress(promises: Promise<never>[], callback: (percentCompleted: number) => void) {
	let count = 0;
	callback(0);
	for (const promise of promises) {
		promise.then(() => {
			count++;
			callback((count * 100) / promises.length);
		});
	}
	return Promise.all(promises);
}

/**
 * 延迟一段时间
 */
async function delay(milliseconds: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * 静态资源
 */

const DEFAULT_STYLESHEET =
	`body,input {
  font-family: "Roboto","Helvetica Neue",Helvetica,Arial,sans-serif
}

code, kbd, pre {
  font-family: "Roboto Mono", "Courier New", Courier, monospace;
  background-color: #f5f5f5;
}

pre {
  padding: 1em 0.5em;
}

table {
  background: white;
  border: 1px solid #666;
  border-collapse: collapse;
  padding: 0.5em;
}

table thead th,
table tfoot th {
  text-align: left;
  background-color: #eaeaea;
  color: black;
}

table th, table td {
  border: 1px solid #ddd;
  padding: 0.5em;
}

table td {
  color: #222222;
}

.callout[data-callout="abstract"] .callout-title,
.callout[data-callout="summary"] .callout-title,
.callout[data-callout="tldr"]  .callout-title,
.callout[data-callout="faq"] .callout-title,
.callout[data-callout="info"] .callout-title,
.callout[data-callout="help"] .callout-title {
  background-color: #828ee7;
}
.callout[data-callout="tip"] .callout-title,
.callout[data-callout="hint"] .callout-title,
.callout[data-callout="important"] .callout-title {
  background-color: #34bbe6;
}
.callout[data-callout="success"] .callout-title,
.callout[data-callout="check"] .callout-title,
.callout[data-callout="done"] .callout-title {
  background-color: #a3e048;
}
.callout[data-callout="question"] .callout-title,
.callout[data-callout="todo"] .callout-title {
  background-color: #49da9a;
}
.callout[data-callout="caution"] .callout-title,
.callout[data-callout="attention"] .callout-title {
  background-color: #f7d038;
}
.callout[data-callout="warning"] .callout-title,
.callout[data-callout="missing"] .callout-title,
.callout[data-callout="bug"] .callout-title {
  background-color: #eb7532;
}
.callout[data-callout="failure"] .callout-title,
.callout[data-callout="fail"] .callout-title,
.callout[data-callout="danger"] .callout-title,
.callout[data-callout="error"] .callout-title {
  background-color: #e6261f;
}
.callout[data-callout="example"] .callout-title {
  background-color: #d23be7;
}
.callout[data-callout="quote"] .callout-title,
.callout[data-callout="cite"] .callout-title {
  background-color: #aaaaaa;
}

.callout-icon {
  flex: 0 0 auto;
  display: flex;
  align-self: center;
}

svg.svg-icon {
  height: 18px;
  width: 18px;
  stroke-width: 1.75px;
}

.callout {
  overflow: hidden;
  margin: 1em 0;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.callout-title {
  padding: .5em;
  display: flex;
  gap: 8px;
  font-size: inherit;
  color: black;
  line-height: 1.3em;
}

.callout-title-inner {
  font-weight: bold;
  color: black;
}

.callout-content {
  overflow-x: auto;
  padding: 0.25em .5em;
  color: #222222;
  background-color: white !important;
}

ul.contains-task-list {
  padding-left: 0;
  list-style: none;
}

ul.contains-task-list ul.contains-task-list {
  padding-left: 2em;
}

ul.contains-task-list li input[type="checkbox"] {
  margin-right: .5em;
}

.callout-table,
.callout-table tr,
.callout-table p {
  width: 100%;
  padding: 0;
}

.callout-table td {
  width: 100%;
  padding: 0 1em;
}

.callout-table p {
  padding-bottom: 0.5em;
}

.source-table {
  width: 100%;
  background-color: #f5f5f5;
}
`;

// 再次感谢 Olivier Balfour！
const MERMAID_STYLESHEET = `
:root {
  --default-font: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Microsoft YaHei Light", sans-serif;
  --font-monospace: 'Source Code Pro', monospace;
  --background-primary: #ffffff;
  --background-modifier-border: #ddd;
  --text-accent: #705dcf;
  --text-accent-hover: #7a6ae6;
  --text-normal: #2e3338;
  --background-secondary: #f2f3f5;
  --background-secondary-alt: #fcfcfc;
  --text-muted: #888888;
  --font-mermaid: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Microsoft YaHei Light", sans-serif;
  --text-error: #E4374B;
  --background-primary-alt: '#fafafa';
  --background-accent: '';
  --interactive-accent: hsl( 254,  80%, calc( 68% + 2.5%));
  --background-modifier-error: #E4374B;
  --background-primary-alt: #fafafa;
  --background-modifier-border: #e0e0e0;
}
`;

const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>\${title}</title>
  <style>
    \${MERMAID_STYLESHEET}
    \${stylesheet}
  </style>
</head>
<body>
\${body}
</body>
</html>
`;


/*
 * 插件代码
 */

/** Don't allow multiple copy processes to run at the same time - 防止多个复制进程同时运行 */
let copyIsRunning = false;

/** true while a block is being processed by MarkDownPostProcessor instances - 当块正在被 Markdown 后处理器处理时为 true */
let ppIsProcessing = false;

/** moment at which the last block finished post-processing - 最后一个块完成处理后处理的时间 */
let ppLastBlockDate = Date.now();


/**
 * 脚注处理方式枚举
 */
enum FootnoteHandling {
	/** 移除所有引用和链接 */
	REMOVE_ALL,

	/** 保留链接（使用唯一ID链接到脚注） */
	LEAVE_LINK,

	/** 移除链接（从引用和脚注中移除链接，只显示文本） */
	REMOVE_LINK,

	/** 将脚注移动到 title 属性中（暂不支持） */
	TITLE_ATTRIBUTE
}

/**
 * 内部链接处理方式枚举
 */
enum InternalLinkHandling {
	/**
	 * 转换为文本（移除链接，只显示链接文本）
	 */
	CONVERT_TO_TEXT,

	/**
	 * 转换为 obsidian:// 链接（在 Obsidian 中打开文件或标签）
	 */
	CONVERT_TO_OBSIDIAN_URI,

	/**
	 * 链接到 HTML（保留链接，但将扩展名转换为 .html）
	 */
	LINK_TO_HTML,

	/**
	 * 保持原样（保留生成的链接）
	 */
	LEAVE_AS_IS
}

/**
 * DocumentRenderer 的选项类型
 * 用于配置文档渲染器的行为
 */
type DocumentRendererOptions = {
	convertSvgToBitmap: boolean,
	removeFrontMatter: boolean,
	formatCodeWithTables: boolean,
	formatCalloutsWithTables: boolean,
	embedExternalLinks: boolean,
	removeDataviewMetadataLines: boolean,
	footnoteHandling: FootnoteHandling
	internalLinkHandling: InternalLinkHandling,
	disableImageEmbedding: boolean
};

const documentRendererDefaults: DocumentRendererOptions = {
	convertSvgToBitmap: true,
	removeFrontMatter: true,
	formatCodeWithTables: false,
	formatCalloutsWithTables: false,
	embedExternalLinks: false,
	removeDataviewMetadataLines: false,
	footnoteHandling: FootnoteHandling.REMOVE_LINK,
	internalLinkHandling: InternalLinkHandling.CONVERT_TO_TEXT,
	disableImageEmbedding: false
};

/**
 * 将 Markdown 渲染为 DOM，并进行清理和将图片嵌入为 data URI。
 * 这个是md转成html的核心逻辑
 */
class DocumentRenderer {
	private modal: CopyingToHtmlModal;
	private view: Component;

	// 在决定视图渲染完成之前，最后一个块渲染后需要等待的时间
	private optionRenderSettlingDelay: number = 100;

	// 仅包含与 image/${extension} 不同的 MIME 类型映射
	private readonly mimeMap = new Map([
		['svg', 'image/svg+xml'],
		['jpg', 'image/jpeg'],
	]);

	private readonly externalSchemes = ['http', 'https'];

	private readonly vaultPath: string;
	private readonly vaultLocalUriPrefix: string;
	private readonly vaultOpenUri: string;
	private readonly vaultSearchUri: string;

	constructor(private app: App,
				private options: DocumentRendererOptions = documentRendererDefaults) {
		this.vaultPath = (this.app.vault.getRoot().vault.adapter as FileSystemAdapter).getBasePath()
			.replace(/\\/g, '/');

		this.vaultLocalUriPrefix = `app://local/${this.vaultPath}`;

		this.vaultOpenUri = `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}`;
		this.vaultSearchUri = `obsidian://search?vault=${encodeURIComponent(this.app.vault.getName())}`;

		this.view = new Component();
	}

	/**
	 * 将文档渲染为分离的 HTML Element
	 */
	public async renderDocument(markdown: string, path: string): Promise<HTMLElement> {
		this.modal = new CopyingToHtmlModal(this.app);
		this.modal.open();

		try {
			const topNode = await this.renderMarkdown(markdown, path);
			return await this.transformHTML(topNode!);
		} finally {
			this.modal.close();
		}
	}

	/**
	 * 将当前视图渲染为 HTMLElement，展开嵌入的链接
	 * 
	 * @param markdown 要渲染的 Markdown 文本
	 * @param path 当前 Markdown 文件路径，用于处理内部链接、附件等
	 * @returns Promise<HTMLElement> 渲染后的 HTML 元素
	 * 
	 * 注意：
	 * - 这是一个私有方法（private），只能在类内部调用
	 * - 使用 async/await 处理异步渲染
	 */
	private async renderMarkdown(markdown: string, path: string): Promise<HTMLElement> {
		const processedMarkdown = this.preprocessMarkdown(markdown);

		const wrapper = document.createElement('div');
		wrapper.style.display = 'hidden';
		document.body.appendChild(wrapper);
		await MarkdownRenderer.render(this.app, processedMarkdown, wrapper, path, this.view);
		await this.untilRendered();

		await this.loadComponents(this.view);

		const result = wrapper.cloneNode(true) as HTMLElement;
		document.body.removeChild(wrapper);

		this.view.unload();
		return result;
	}



	/**
	 * 一些插件可能暴露依赖于 onload() 被调用的组件，但由于我们渲染 Markdown 的方式，这不会发生。
	 * 我们需要在所有组件上调用 onload() 以确保它们正确加载。
	 * 由于这有点 hack（我们需要访问 Obsidian 内部），我们将其限制在我们知道否则无法正确渲染的组件。
	 * 我们尝试确保如果 Obsidian 内部发生变化，这将优雅地失败。
	 */
	private async loadComponents(view: Component) {
		type InternalComponent = Component & {
			_children: Component[];
			onload: () => void | Promise<void>;
		}

		const internalView = view as InternalComponent;

		// 递归调用所有子组件的 onload()，深度优先
		const loadChildren = async (
			component: Component,
			visited: Set<Component> = new Set()
		): Promise<void> => {
			if (visited.has(component)) {
				return;  // 如果已经访问过，跳过
			}

			visited.add(component);

			const internalComponent = component as InternalComponent;

			if (internalComponent._children?.length) {
				for (const child of internalComponent._children) {
					await loadChildren(child, visited);
				}
			}

			try {
				// 依赖于 Sheet 插件（advanced-table-xt）没有被压缩
				if (component?.constructor?.name === 'SheetElement') {
					await component.onload();
				}
			} catch (error) {
				console.error(`Error calling onload()`, error);
			}
		};

		await loadChildren(internalView);
	}

	private preprocessMarkdown(markdown: string): string {
		let processed = markdown;

		if (this.options.removeDataviewMetadataLines) {
			processed = processed.replace(/^[^ \t:#`<>][^:#`<>]+::.*$/gm, '');
		}

		return processed;
	}

	/**
	 * 等待视图完成渲染
	 *
	 * 注意，这是一个肮脏的 hack...
	 *
	 * 我们没有可靠的方法知道文档是否已完成渲染。例如，dataviews 或任务块可能尚未进行后处理。
	 * MarkdownPostProcessors 在 HTML 视图中的所有"块"上被调用。因此我们注册一个高优先级（低数字以标记块正在处理）的后处理器，
	 * 和另一个在所有其他后处理器之后运行的低优先级后处理器。
	 * 现在如果我们看到没有块正在被后处理，这可能意味着两件事：
	 *  - 要么我们处于块之间
	 *  - 要么我们完成了视图渲染
	 * 基于连续块后处理之间经过的时间总是非常短（只是迭代，没有工作完成）的前提，
	 * 我们得出结论：如果没有块在足够长的时间内被渲染，则渲染已完成。
	 */
	private async untilRendered() {
		while (ppIsProcessing || Date.now() - ppLastBlockDate < this.optionRenderSettlingDelay) {
			if (ppLastBlockDate === 0) {
				break;
			}
			await delay(20);
		}
	}

	/**
	 * 转换渲染的 Markdown 以清理并嵌入图片
	 */
	private async transformHTML(element: HTMLElement): Promise<HTMLElement> {
		// 移除强制预览垂直填充窗口的样式
		// @ts-ignore
		const node: HTMLElement = element.cloneNode(true);
		node.removeAttribute('style');

		if (this.options.removeFrontMatter) {
			this.removeFrontMatter(node);
		}

		this.replaceLinksOfClass(node, 'internal-link');
		this.replaceLinksOfClass(node, 'tag');
		this.makeCheckboxesReadOnly(node);
		this.removeCollapseIndicators(node);
		this.removeButtons(node);
		this.removeStrangeNewWorldsLinks(node);

		if (this.options.formatCodeWithTables) {
			this.transformCodeToTables(node);
		}

		if (this.options.formatCalloutsWithTables) {
			this.transformCalloutsToTables(node);
		}

		if (this.options.footnoteHandling == FootnoteHandling.REMOVE_ALL) {
			this.removeAllFootnotes(node);
		}
		if (this.options.footnoteHandling == FootnoteHandling.REMOVE_LINK) {
			this.removeFootnoteLinks(node);
		} else if (this.options.footnoteHandling == FootnoteHandling.TITLE_ATTRIBUTE) {
			// not supported yet
		}

		if (!this.options.disableImageEmbedding) {
			await this.embedImages(node);
			await this.renderSvg(node);
		}

		return node;
	}

	/** Remove front-matter */
	private removeFrontMatter(node: HTMLElement) {
		node.querySelectorAll('.frontmatter, .frontmatter-container')
			.forEach(node => node.remove());
	}

	private replaceLinksOfClass(node: HTMLElement, className: string) {
		if (this.options.internalLinkHandling === InternalLinkHandling.LEAVE_AS_IS) {
			return;
		}

		node.querySelectorAll(`a.${className}`)
			.forEach(node => {
				switch (this.options.internalLinkHandling) {
					case InternalLinkHandling.CONVERT_TO_OBSIDIAN_URI: {
						const linkNode = node.parentNode!.createEl('a');
						linkNode.innerText = node.getText();

						if (className === 'tag') {
							linkNode.href = this.vaultSearchUri + "&query=tag:" + encodeURIComponent(node.getAttribute('href')!);
						} else {
							if (node.getAttribute('href')!.startsWith('#')) {
								linkNode.href = node.getAttribute('href')!;
							} else {
								linkNode.href = this.vaultOpenUri + "&file=" + encodeURIComponent(node.getAttribute('href')!);
							}
						}
						linkNode.className = className;
						node.parentNode!.replaceChild(linkNode, node);
					}
						break;

					case InternalLinkHandling.LINK_TO_HTML: {
						const linkNode = node.parentNode!.createEl('a');
						linkNode.innerText = node.getAttribute('href')!; //node.getText();
						linkNode.className = className;
						if (node.getAttribute('href')!.startsWith('#')) {
							linkNode.href = node.getAttribute('href')!;
						} else {
							linkNode.href = node.getAttribute('href')!.replace(/^(.*?)(?:\.md)?(#.*?)?$/, '$1.html$2');
						}
						node.parentNode!.replaceChild(linkNode, node);
					}
						break;

					case InternalLinkHandling.CONVERT_TO_TEXT:
					default: {
						const textNode = node.parentNode!.createEl('span');
						textNode.innerText = node.getText();
						textNode.className = className;
						node.parentNode!.replaceChild(textNode, node);
					}
						break;
				}
			});
	}

	private makeCheckboxesReadOnly(node: HTMLElement) {
		node.querySelectorAll('input[type="checkbox"]')
			.forEach(node => node.setAttribute('disabled', 'disabled'));
	}

	/** Remove the collapse indicators from HTML, not needed (and not working) in copy */
	private removeCollapseIndicators(node: HTMLElement) {
		node.querySelectorAll('.collapse-indicator')
			.forEach(node => node.remove());
	}

	/** Remove button elements (which appear after code blocks) */
	private removeButtons(node: HTMLElement) {
		node.querySelectorAll('button')
			.forEach(node => node.remove());
	}

	/** 移除由 Strange New Worlds 插件添加的计数器 (https://github.com/TfTHacker/obsidian42-strange-new-worlds) */
	private removeStrangeNewWorldsLinks(node: HTMLElement) {
		node.querySelectorAll('.snw-reference')
			.forEach(node => node.remove());
	}

	/** Transform code blocks to tables */
	private transformCodeToTables(node: HTMLElement) {
		node.querySelectorAll('pre')
			.forEach(node => {
				const codeEl = node.querySelector('code');
				if (codeEl) {
					const code = codeEl.innerHTML.replace(/\n*$/, '');
					const table = node.parentElement!.createEl('table');
					table.className = 'source-table';
					table.innerHTML = `<tr><td><pre>${code}</pre></td></tr>`;
					node.parentElement!.replaceChild(table, node);
				}
			});
	}

	/** Transform callouts to tables */
	private transformCalloutsToTables(node: HTMLElement) {
		node.querySelectorAll('.callout')
			.forEach(node => {
				const callout = node.parentElement!.createEl('table');
				callout.addClass('callout-table', 'callout');
				callout.setAttribute('data-callout', node.getAttribute('data-callout') ?? 'quote');
				const headRow = callout.createEl('tr');
				const headColumn = headRow.createEl('td');
				headColumn.addClass('callout-title');
				// const img = node.querySelector('svg');
				const title = node.querySelector('.callout-title-inner');

				// if (img) {
				// 	headColumn.appendChild(img);
				// }

				if (title) {
					const span = headColumn.createEl('span');
					span.innerHTML = title.innerHTML;
				}

				const originalContent = node.querySelector('.callout-content');
				if (originalContent) {
					const row = callout.createEl('tr');
					const column = row.createEl('td');
					column.innerHTML = originalContent.innerHTML;
				}

				node.replaceWith(callout);
			});
	}

	/** Remove references to footnotes and the footnotes section */
	private removeAllFootnotes(node: HTMLElement) {
		node.querySelectorAll('section.footnotes')
			.forEach(section => section.parentNode!.removeChild(section));

		node.querySelectorAll('.footnote-link')
			.forEach(link => {
				link.parentNode!.parentNode!.removeChild(link.parentNode!);
			});
	}

	/** Keep footnotes and references, but remove links */
	private removeFootnoteLinks(node: HTMLElement) {
		node.querySelectorAll('.footnote-link')
			.forEach(link => {
				const text = link.getText();
				if (text === '↩︎') {
					// 移除返回链接
					link.parentNode!.removeChild(link);
				} else {
					// 从引用中移除
					const span = link.parentNode!.createEl('span', {text: link.getText(), cls: 'footnote-link'})
					link.parentNode!.replaceChild(span, link);
				}
			});
	}

	/** 将所有图片源替换为 data-uri */
	private async embedImages(node: HTMLElement): Promise<HTMLElement> {
		const promises: Promise<void>[] = [];

		// 替换所有图片源
		node.querySelectorAll('img')
			.forEach(img => {
				if (img.src) {
					if (img.src.startsWith('data:image/svg+xml') && this.options.convertSvgToBitmap) {
						// 图片是 SVG，编码为 data URI。例如 Excalidraw 就是这种情况。
						// 将其转换为位图
						promises.push(this.replaceImageSource(img));
						return;
					}

					if (!this.options.embedExternalLinks) {
						const [scheme] = img.src.split(':', 1);
						if (this.externalSchemes.includes(scheme.toLowerCase())) {
							// 不处理外部图片
							return;
						} else {
							// 不是外部图片，继续下面的处理
						}
					}

					if (!img.src.startsWith('data:')) {
						// 渲染位图，除非已经是 data-uri
						promises.push(this.replaceImageSource(img));
						return;
					}
				}
			});

		// @ts-ignore
		this.modal.progress.max = 100;

		// @ts-ignore
		await allWithProgress(promises, percentCompleted => this.modal.progress.value = percentCompleted);
		return node;
	}

	private async renderSvg(node: HTMLElement): Promise<Element> {
		const xmlSerializer = new XMLSerializer();

		if (!this.options.convertSvgToBitmap) {
			return node;
		}

		const promises: Promise<void>[] = [];

		const replaceSvg = async (svg: SVGSVGElement) => {
			const style: HTMLStyleElement = svg.querySelector('style') || svg.appendChild(document.createElement('style'));
			style.innerHTML += MERMAID_STYLESHEET;

			const svgAsString = xmlSerializer.serializeToString(svg);

			const svgData = `data:image/svg+xml;base64,` + Buffer.from(svgAsString).toString('base64');
			const dataUri = await this.imageToDataUri(svgData);

			const img = svg.createEl('img');
			img.style.cssText = svg.style.cssText;
			img.src = dataUri;

			svg.parentElement!.replaceChild(img, svg);
		};

		node.querySelectorAll('svg')
			.forEach(svg => {
				promises.push(replaceSvg(svg));
			});

		// @ts-ignore
		this.modal.progress.max = 0;

		// @ts-ignore
		await allWithProgress(promises, percentCompleted => this.modal.progress.value = percentCompleted);
		return node;
	}

	/** replace image src attribute with data uri */
	private async replaceImageSource(image: HTMLImageElement): Promise<void> {
		const imageSourcePath = decodeURI(image.src);

		if (imageSourcePath.startsWith(this.vaultLocalUriPrefix)) {
			// Transform uri to Obsidian relative path
			let path = imageSourcePath.substring(this.vaultLocalUriPrefix.length + 1)
				.replace(/[?#].*/, '');
			path = decodeURI(path);

			const mimeType = this.guessMimeType(path);
			const data = await this.readFromVault(path, mimeType);

			if (this.isSvg(mimeType) && this.options.convertSvgToBitmap) {
				// render svg to bitmap for compatibility w/ for instance gmail
				image.src = await this.imageToDataUri(data);
			} else {
				// file content as base64 data uri (including svg)
				image.src = data;
			}
		} else {
			// Attempt to render uri to canvas. This is not an uri that points to the vault. Not needed for public
			// urls, but we may have un uri that points to our local machine or network, that will not be accessible
			// wherever we intend to paste the document.
			image.src = await this.imageToDataUri(image.src);
		}
	}

	/**
	 * Draw image url to canvas and return as data uri containing image pixel data
	 */
	private async imageToDataUri(url: string): Promise<string> {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		const image = new Image();
		image.setAttribute('crossOrigin', 'anonymous');

		const dataUriPromise = new Promise<string>((resolve, reject) => {
			image.onload = () => {
				canvas.width = image.naturalWidth;
				canvas.height = image.naturalHeight;

				ctx!.drawImage(image, 0, 0);

				try {
					const uri = canvas.toDataURL('image/png');
					resolve(uri);
				} catch (err) {
					// leave error at `log` level (not `error`), since we leave an url that may be workable
					console.log(`failed ${url}`, err);
					// if we fail, leave the original url.
					// This way images that we may not load from external sources (tainted) may still be accessed
					// (eg. plantuml)
					// TODO: should we attempt to fallback with fetch ?
					resolve(url);
				}

				canvas.remove();
			}

			image.onerror = (err) => {
				console.log('could not load data uri');
				// if we fail, leave the original url
				resolve(url);
			}
		})

		image.src = url;

		return dataUriPromise;
	}

	/**
	 * Get binary data as b64 from a file in the vault
	 */
	private async readFromVault(path: string, mimeType: string): Promise<string> {
		const tfile = this.app.vault.getAbstractFileByPath(path) as TFile;
		const data = await this.app.vault.readBinary(tfile);
		return `data:${mimeType};base64,` + arrayBufferToBase64(data);
	}

	/** Guess an image's mime-type based on its extension */
	private guessMimeType(filePath: string): string {
		const extension = this.getExtension(filePath) || 'png';
		return this.mimeMap.get(extension) || `image/${extension}`;
	}

	/** Get lower-case extension for a path */
	private getExtension(filePath: string): string {
		// avoid using the "path" library
		const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
		return fileName.slice(fileName.lastIndexOf('.') + 1 || fileName.length)
			.toLowerCase();
	}

	private isSvg(mimeType: string): boolean {
		return mimeType === 'image/svg+xml';
	}
}

/**
 * 在转换过程中显示进度的模态框
 */
class CopyingToHtmlModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	private _progress: HTMLElement;

	get progress() {
		return this._progress;
	}

	onOpen() {
		const {titleEl, contentEl} = this;
		titleEl.setText('Copying to clipboard');
		this._progress = contentEl.createEl('progress');
		this._progress.style.width = '100%';
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

/**
 * 设置对话框
 */
class CopyDocumentAsHTMLSettingsTab extends PluginSettingTab {
	constructor(app: App, private plugin: CopyDocumentAsHTMLPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// 感谢 Obsidian Tasks 插件！
	private static createFragmentWithHTML = (html: string) =>
		createFragment((documentFragment) => (documentFragment.createDiv().innerHTML = html));

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Copy document as HTML Settings'});

		containerEl.createEl('h3', {text: 'Compatibility'});

		new Setting(containerEl)
			.setName('Convert SVG files to bitmap')
			.setDesc('If checked, SVG files are converted to bitmap. This makes the copied documents heavier but improves compatibility (eg. with gmail).')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.convertSvgToBitmap)
				.onChange(async (value) => {
					this.plugin.settings.convertSvgToBitmap = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Embed external images')
			.setDesc('If checked, external images are downloaded and embedded. If unchecked, the resulting document may contain links to external resources')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.embedExternalLinks)
				.onChange(async (value) => {
					this.plugin.settings.embedExternalLinks = value;
					await this.plugin.saveSettings();
				}));


		new Setting(containerEl)
			.setName('Render code with tables')
			.setDesc("If checked code blocks are rendered as tables, which makes pasting into Google docs somewhat prettier.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.formatCodeWithTables)
				.onChange(async (value) => {
					this.plugin.settings.formatCodeWithTables = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Render callouts with tables')
			.setDesc("If checked callouts are rendered as tables, which makes pasting into Google docs somewhat prettier.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.formatCalloutsWithTables)
				.onChange(async (value) => {
					this.plugin.settings.formatCalloutsWithTables = value;
					await this.plugin.saveSettings();
				}));


		containerEl.createEl('h3', {text: 'Rendering'});

		new Setting(containerEl)
			.setName('Include filename as header')
			.setDesc("If checked, the filename is inserted as a level 1 header. (only if an entire document is copied)")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.fileNameAsHeader)
				.onChange(async (value) => {
					this.plugin.settings.fileNameAsHeader = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('Copy HTML fragment only')
			.setDesc("If checked, only generate a HTML fragment and not a full HTML document. This excludes the header, and effectively disables all styling.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.bareHtmlOnly)
				.onChange(async (value) => {
					this.plugin.settings.bareHtmlOnly = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Remove properties / front-matter sections')
			.setDesc("If checked, the YAML content between --- lines at the front of the document are removed. If you don't know what this means, leave it on.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.removeFrontMatter)
				.onChange(async (value) => {
					this.plugin.settings.removeFrontMatter = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Remove dataview metadata lines')
			.setDesc(CopyDocumentAsHTMLSettingsTab.createFragmentWithHTML(`
				<p>Remove lines that only contain dataview meta-data, eg. "rating:: 9". Metadata between square brackets is left intact.</p>
				<p>Current limitations are that lines starting with a space are not removed, and lines that look like metadata in code blocks are removed if they don't start with a space</p>`))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.removeDataviewMetadataLines)
				.onChange(async (value) => {
					this.plugin.settings.removeDataviewMetadataLines = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Footnote handling')
			.setDesc(CopyDocumentAsHTMLSettingsTab.createFragmentWithHTML(`
				<ul>
				  <li>Remove everything: Remove references and links.</li>
				  <li>Display only: leave reference and foot-note, but don't display as a link.</li> 
				  <li>Display and link: attempt to link the reference to the footnote, may not work depending on paste target.</li>
				</ul>`)
			)
			.addDropdown(dropdown => dropdown
				.addOption(FootnoteHandling.REMOVE_ALL.toString(), 'Remove everything')
				.addOption(FootnoteHandling.REMOVE_LINK.toString(), 'Display only')
				.addOption(FootnoteHandling.LEAVE_LINK.toString(), 'Display and link')
				.setValue(this.plugin.settings.footnoteHandling.toString())
				.onChange(async (value) => {
					switch (value) {
						case FootnoteHandling.TITLE_ATTRIBUTE.toString():
							this.plugin.settings.footnoteHandling = FootnoteHandling.TITLE_ATTRIBUTE;
							break;
						case FootnoteHandling.REMOVE_ALL.toString():
							this.plugin.settings.footnoteHandling = FootnoteHandling.REMOVE_ALL;
							break;
						case FootnoteHandling.REMOVE_LINK.toString():
							this.plugin.settings.footnoteHandling = FootnoteHandling.REMOVE_LINK;
							break;
						case FootnoteHandling.LEAVE_LINK.toString():
						default:
							this.plugin.settings.footnoteHandling = FootnoteHandling.LEAVE_LINK;
							break;
					}
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName('Link handling')
			.setDesc(CopyDocumentAsHTMLSettingsTab.createFragmentWithHTML(`
				This option controls how links to Obsidian documents and tags are handled.
				<ul>
				  <li>Don't link: only render the link title</li>
				  <li>Open with Obsidian: convert the link to an obsidian:// URI</li> 
				  <li>Link to HTML: keep the link, but convert the extension to .html</li>
				  <li>Leave as is: keep the generated link</li>	
				</ul>`)
			)
			.addDropdown(dropdown => dropdown
				.addOption(InternalLinkHandling.CONVERT_TO_TEXT.toString(), 'Don\'t link')
				.addOption(InternalLinkHandling.CONVERT_TO_OBSIDIAN_URI.toString(), 'Open with Obsidian')
				.addOption(InternalLinkHandling.LINK_TO_HTML.toString(), 'Link to HTML')
				.addOption(InternalLinkHandling.LEAVE_AS_IS.toString(), 'Leave as is')
				.setValue(this.plugin.settings.internalLinkHandling.toString())
				.onChange(async (value) => {
					switch (value) {
						case InternalLinkHandling.CONVERT_TO_OBSIDIAN_URI.toString():
							this.plugin.settings.internalLinkHandling = InternalLinkHandling.CONVERT_TO_OBSIDIAN_URI;
							break;
						case InternalLinkHandling.LINK_TO_HTML.toString():
							this.plugin.settings.internalLinkHandling = InternalLinkHandling.LINK_TO_HTML;
							break;
						case InternalLinkHandling.LEAVE_AS_IS.toString():
							this.plugin.settings.internalLinkHandling = InternalLinkHandling.LEAVE_AS_IS;
							break;
						case InternalLinkHandling.CONVERT_TO_TEXT.toString():
						default:
							this.plugin.settings.internalLinkHandling = InternalLinkHandling.CONVERT_TO_TEXT;
							break;
					}
					await this.plugin.saveSettings();
				})
			)

		containerEl.createEl('h3', {text: 'Custom templates (advanced)'});

		const useCustomStylesheetSetting = new Setting(containerEl)
			.setName('Provide a custom stylesheet')
			.setDesc('The default stylesheet provides minimalistic theming. You may want to customize it for better looks. Disabling this setting will restore the default stylesheet.');

		const customStylesheetSetting = new Setting(containerEl)
			.setClass('customizable-text-setting')
			.addTextArea(textArea => textArea
				.setValue(this.plugin.settings.styleSheet)
				.onChange(async (value) => {
					this.plugin.settings.styleSheet = value;
					await this.plugin.saveSettings();
				}));

		useCustomStylesheetSetting.addToggle(toggle => {
			customStylesheetSetting.settingEl.toggle(this.plugin.settings.useCustomStylesheet);

			toggle
				.setValue(this.plugin.settings.useCustomStylesheet)
				.onChange(async (value) => {
					this.plugin.settings.useCustomStylesheet = value;
					customStylesheetSetting.settingEl.toggle(this.plugin.settings.useCustomStylesheet);
					if (!value) {
						this.plugin.settings.styleSheet = DEFAULT_STYLESHEET;
					}
					await this.plugin.saveSettings();
				});
		});

		const useCustomHtmlTemplateSetting = new Setting(containerEl)
			.setName('Provide a custom HTML template')
			.setDesc(CopyDocumentAsHTMLSettingsTab.createFragmentWithHTML(`For even more customization, you can 
provide a custom HTML template. Disabling this setting will restore the default template.<br/><br/>
Note that the template is not used if the "Copy HTML fragment only" setting is enabled.`));

		const customHtmlTemplateSetting = new Setting(containerEl)
			.setDesc(CopyDocumentAsHTMLSettingsTab.createFragmentWithHTML(`
			The template should include the following placeholders :<br/>
<ul>
	<li><code>$\{title}</code>: the document title</li>
	<li><code>$\{stylesheet}</code>: the CSS stylesheet. The custom stylesheet will be applied if any is specified</li>
	<li><code>$\{MERMAID_STYLESHEET}</code>: the CSS for mermaid diagrams</li>
	<li><code>$\{body}</code>: the document body</li>
</ul>`))
			.setClass('customizable-text-setting')
			.addTextArea(textArea => textArea
				.setValue(this.plugin.settings.htmlTemplate)
				.onChange(async (value) => {
					this.plugin.settings.htmlTemplate = value;
					await this.plugin.saveSettings();
				}));

		useCustomHtmlTemplateSetting.addToggle(toggle => {
			customHtmlTemplateSetting.settingEl.toggle(this.plugin.settings.useCustomHtmlTemplate);

			toggle
				.setValue(this.plugin.settings.useCustomHtmlTemplate)
				.onChange(async (value) => {
					this.plugin.settings.useCustomHtmlTemplate = value;
					customHtmlTemplateSetting.settingEl.toggle(this.plugin.settings.useCustomHtmlTemplate);
					if (!value) {
						this.plugin.settings.htmlTemplate = DEFAULT_HTML_TEMPLATE;
					}
					await this.plugin.saveSettings();
				});
		});

		containerEl.createEl('h3', {text: 'Exotic / Developer options'});

		new Setting(containerEl)
			.setName("Don't embed images")
			.setDesc("When this option is enabled, images will not be embedded in the HTML document, but <em>broken</em> links will be left in place. This is not recommended.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.disableImageEmbedding)
				.onChange(async (value) => {
					this.plugin.settings.disableImageEmbedding = value;
					await this.plugin.saveSettings();
				}));
	}
}

/**
 * 插件设置类型定义
 * 包含了所有用户可配置的选项
 */
type CopyDocumentAsHTMLSettings = {
	/** 是否移除 front-matter（文档开头的 YAML 元数据部分） */
	removeFrontMatter: boolean;

	/** 是否将 SVG 转换为位图（提高兼容性，例如在 Gmail 中） */
	convertSvgToBitmap: boolean;

	/** 是否将代码块渲染为表格（使粘贴到 Google Docs 中更美观） */
	formatCodeWithTables: boolean;

	/** 是否将 callouts（提示框）渲染为表格（使粘贴到 Google Docs 中更美观） */
	formatCalloutsWithTables: boolean;

	/** 是否嵌入外部链接（下载并嵌入其内容） */
	embedExternalLinks: boolean;

	/** 是否移除 dataview 元数据行（格式：`some-tag:: value`） */
	removeDataviewMetadataLines: boolean;

	/** 脚注处理方式 */
	footnoteHandling: FootnoteHandling;

	/** 内部链接处理方式 */
	internalLinkHandling: InternalLinkHandling;

	/** 是否使用自定义样式表 */
	useCustomStylesheet: boolean;

	/**
	 * 是否使用自定义 HTML 模板
	 */
	useCustomHtmlTemplate: boolean;

	/** 样式表内容 */
	styleSheet: string;

	/**
	 * HTML 模板内容
	 */
	htmlTemplate: string;

	/** 是否只生成 HTML 片段（不包含 <head> 部分） */
	bareHtmlOnly: boolean;

	/** 是否在复制时包含文件名作为标题（仅当复制整个文档时生效） */
	fileNameAsHeader: boolean;

	/**
	 * 是否禁用图片嵌入（不推荐，会留下损坏的链接）
	 */
	disableImageEmbedding: boolean;
}

const DEFAULT_SETTINGS: CopyDocumentAsHTMLSettings = {
	removeFrontMatter: true,
	convertSvgToBitmap: true,
	useCustomStylesheet: false,
	useCustomHtmlTemplate: false,
	embedExternalLinks: false,
	removeDataviewMetadataLines: false,
	formatCodeWithTables: false,
	formatCalloutsWithTables: false,
	footnoteHandling: FootnoteHandling.REMOVE_LINK,
	internalLinkHandling: InternalLinkHandling.CONVERT_TO_TEXT,
	styleSheet: DEFAULT_STYLESHEET,
	htmlTemplate: DEFAULT_HTML_TEMPLATE,
	bareHtmlOnly: false,
	fileNameAsHeader: false,
	disableImageEmbedding: false,
}

/**
 * 这是整个插件的“根组件”，负责控制插件的生命周期与所有功能注册。
 */
export default class CopyDocumentAsHTMLPlugin extends Plugin {
	settings: CopyDocumentAsHTMLSettings;

	/**
	 * 插件加载时的初始化方法
	 * 1. 加载设置
	 * 2. 注册三个复制命令
	 * 3. 注册 Markdown 后处理器来跟踪渲染进度
	 * 4. 添加设置标签页
	 * 5. 设置编辑器菜单项
	 */
	async onload() {
		await this.loadSettings();

		// 注册智能复制命令：根据是否有选择内容决定复制整个文档还是选择部分
		this.addCommand({
			id: 'smart-copy-as-html',
			name: 'Copy selection or document to clipboard',
			checkCallback: this.buildCheckCallback(
				view => this.copyFromView(view, view.editor.somethingSelected()))
		})

		// 注册复制整个文档命令
		this.addCommand({
			id: 'copy-as-html',
			name: 'Copy entire document to clipboard',
			checkCallback: this.buildCheckCallback(view => this.copyFromView(view, false))
		});

		// 注册复制选择内容命令
		this.addCommand({
			id: 'copy-selection-as-html',
			name: 'Copy current selection to clipboard',
			checkCallback: this.buildCheckCallback(view => this.copyFromView(view, true))
		});

		// 注册后处理器来跟踪块渲染进度。详细解释见 DocumentRenderer#untilRendered()
		// 这些后处理器用于检测 Markdown 渲染何时完成
		const beforeAllPostProcessor = this.registerMarkdownPostProcessor(async () => {
			ppIsProcessing = true; // 标记正在处理中
		});
		beforeAllPostProcessor.sortOrder = -10000; // 高优先级，最先执行

		const afterAllPostProcessor = this.registerMarkdownPostProcessor(async () => {
			ppLastBlockDate = Date.now(); // 更新最后处理时间
			ppIsProcessing = false; // 标记处理完成
		});
		afterAllPostProcessor.sortOrder = 10000; // 低优先级，最后执行

		// 注册 UI 元素
		this.addSettingTab(new CopyDocumentAsHTMLSettingsTab(this.app, this));
		this.setupEditorMenuEntry();
	}

	/**
	 * 加载插件设置
	 * 1. 从存储中读取设置，与默认设置合并
	 * 2. 如果用户没有使用自定义样式表，重置为默认样式表
	 * 3. 如果用户没有使用自定义 HTML 模板，重置为默认模板
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// 重新加载以便在新版本中更新
		if (!this.settings.useCustomStylesheet) {
			this.settings.styleSheet = DEFAULT_STYLESHEET;
		}

		if (!this.settings.useCustomHtmlTemplate) {
			this.settings.htmlTemplate = DEFAULT_HTML_TEMPLATE;
		}
	}

	/**
	 * 保存插件设置到存储
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * 构建命令检查回调函数
	 * Obsidian 命令系统使用此函数来检查命令是否可用
	 * @param action 实际执行的操作函数
	 * @returns 返回一个检查回调函数
	 */
	private buildCheckCallback(action: (activeView: MarkdownView) => void) {
		return (checking: boolean): boolean => {
			// 检查是否已经有复制操作在进行中
			if (copyIsRunning) {
				console.log('Document is already being copied');
				return false;
			}

			// 获取当前活动的 Markdown 视图
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) {
				console.log('Nothing to copy: No active markdown view');
				return false;
			}

			// 如果 checking 为 true，表示只是检查命令是否可用
			// 如果 checking 为 false，表示实际执行命令
			if (!checking) {
				action(activeView);
			}

			return true;
		}
	}

	/**
	 * 从当前活动视图复制内容
	 * @param activeView 当前活动的 Markdown 视图
	 * @param onlySelected 是否只复制选中的内容（true=只复制选中内容，false=复制整个文档）
	 */
	private async copyFromView(activeView: MarkdownView, onlySelected: boolean) {
		if (!activeView.editor) {
			console.error('No editor in active view, nothing to copy');
			return;
		}

		if (!activeView.file) {
			// 如果视图中有编辑器，通常应该有文件，但这里做安全检查
			console.error('No file in active view, nothing to copy');
			return;
		}

		// 根据 onlySelected 参数决定复制选中内容还是整个文档
		const markdown = onlySelected ? activeView.editor.getSelection() : activeView.data;

		const path = activeView.file.path;
		const name = activeView.file.name;
		// 调用实际复制方法，isFullDocument = !onlySelected
		return this.doCopy(markdown, path, name, !onlySelected);
	}

	/**
	 * 从文件复制内容（用于文件菜单中的复制操作）
	 * @param file 要复制的文件
	 */
	private async copyFromFile(file: TAbstractFile) {
		// 检查是否是文件（不是文件夹）
		if (!(file instanceof TFile)) {
			console.log(`cannot copy folder to HTML: ${file.path}`);
			return;
		}

		// 检查文件扩展名是否为 .md
		if (file.extension.toLowerCase() !== 'md') {
			console.log(`cannot only copy .md files to HTML: ${file.path}`);
			return;
		}

		// 读取文件内容并复制
		const markdown = await file.vault.cachedRead(file);
		return this.doCopy(markdown, file.path, file.name, true);
	}

	/**
	 * 实际执行复制操作的核心方法
	 * @param markdown Markdown 内容
	 * @param path 文件路径
	 * @param name 文件名
	 * @param isFullDocument 是否是完整文档（true=完整文档，false=部分内容）
	 */
	private async doCopy(markdown: string, path: string, name: string, isFullDocument: boolean) {
		console.log(`Copying "${path}" to clipboard...`);
		const title = name.replace(/\.md$/i, ''); // 移除 .md 扩展名作为标题

		// 创建文档渲染器，传入当前应用实例和设置
		const copier = new DocumentRenderer(this.app, this.settings);

		try {
			copyIsRunning = true; // 标记复制操作正在进行

			// 重置后处理器状态
			ppLastBlockDate = Date.now();
			ppIsProcessing = true;

			// 渲染 Markdown 为 HTML
			const htmlBody = await copier.renderDocument(markdown, path);

			// 如果设置中要求添加文件名作为标题，并且是完整文档
			if (this.settings.fileNameAsHeader && isFullDocument) {
				const h1 = htmlBody.createEl('h1');
				h1.innerHTML = title;
				htmlBody.insertBefore(h1, htmlBody.firstChild);
			}

			// 根据设置决定生成完整的 HTML 文档还是仅 HTML 片段
			const htmlDocument = this.settings.bareHtmlOnly
				? htmlBody.outerHTML  // 仅 HTML 片段
				: this.expandHtmlTemplate(htmlBody.outerHTML, title); // 完整的 HTML 文档

			// 创建剪贴板项，同时包含 HTML 和纯文本格式
			const data =
				new ClipboardItem({
					"text/html": new Blob([htmlDocument], {
						// @ts-ignore
						type: ["text/html", 'text/plain']
					}),
					"text/plain": new Blob([htmlDocument], {
						type: "text/plain"
					}),
				});

			// 写入剪贴板
			await navigator.clipboard.write([data]);
			console.log(`Copied to clipboard as HTML`);
			new Notice(`Copied to clipboard as HTML`)
		} catch (error) {
			new Notice(`copy failed: ${error}`);
			console.error('copy failed', error);
		} finally {
			copyIsRunning = false; // 无论成功失败，都标记复制操作结束
		}
	}

	/**
	 * 扩展 HTML 模板，将占位符替换为实际内容
	 * @param html HTML 内容
	 * @param title 文档标题
	 * @returns 完整的 HTML 文档字符串
	 */
	private expandHtmlTemplate(html: string, title: string) {
		// 根据设置决定使用自定义模板还是默认模板
		const template = this.settings.useCustomHtmlTemplate
			? this.settings.htmlTemplate
			: DEFAULT_HTML_TEMPLATE;

		// 替换模板中的占位符
		return template
			.replace('${title}', title)  // 文档标题
			.replace('${body}', html)    // HTML 内容
			.replace('${stylesheet}', this.settings.styleSheet)  // 样式表
			.replace('${MERMAID_STYLESHEET}', MERMAID_STYLESHEET);  // Mermaid 图表样式
	}

	/**
	 * 设置编辑器菜单项（在文件右键菜单中添加"Copy as HTML"选项）
	 */
	private setupEditorMenuEntry() {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file, view) => {
				menu.addItem((item) => {
					item
						.setTitle("Copy as HTML")  // 菜单项标题
						.setIcon("clipboard-copy")  // 菜单项图标
						.onClick(async () => {
							return this.copyFromFile(file);  // 点击时调用复制方法
						});
				});
			})
		);
	}
}
