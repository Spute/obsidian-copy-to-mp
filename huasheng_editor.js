
// 复制到剪切板，怀疑这里做了md转公众号的格式转换。。
function copyToClipboard() {
if (!this.renderedContent) {
	this.showToast('没有内容可复制', 'error');
	return;
}

try {
	const parser = new DOMParser();
	const doc = parser.parseFromString(this.renderedContent, 'text/html');

	// Section 容器包裹
	const styleConfig = STYLES[this.currentStyle];
	const containerBg = this.extractBackgroundColor(styleConfig.styles.container);

	if (containerBg && containerBg !== '#fff' && containerBg !== '#ffffff') {
	const section = doc.createElement('section');
	const containerStyle = styleConfig.styles.container;
	const paddingMatch = containerStyle.match(/padding:\s*([^;]+)/);
	const maxWidthMatch = containerStyle.match(/max-width:\s*([^;]+)/);
	const padding = paddingMatch ? paddingMatch[1].trim() : '40px 20px';
	const maxWidth = maxWidthMatch ? maxWidthMatch[1].trim() : '100%';

	section.setAttribute('style',
		`background-color: ${containerBg}; ` +
		`padding: ${padding}; ` +
		`max-width: ${maxWidth}; ` +
		`margin: 0 auto; ` +
		`box-sizing: border-box; ` +
		`word-wrap: break-word;`
	);

	while (doc.body.firstChild) {
		section.appendChild(doc.body.firstChild);
	}

	const allElements = section.querySelectorAll('*');
	allElements.forEach(el => {
		const currentStyle = el.getAttribute('style') || '';
		let newStyle = currentStyle;
		newStyle = newStyle.replace(/max-width:\s*[^;]+;?/g, '');
		newStyle = newStyle.replace(/margin:\s*0\s+auto;?/g, '');
		if (newStyle.includes(`background-color: ${containerBg}`)) {
		newStyle = newStyle.replace(new RegExp(`background-color:\\s*${containerBg.replace(/[()]/g, '\\$&')};?`, 'g'), '');
		}
		newStyle = newStyle.replace(/;\s*;/g, ';').replace(/^\s*;\s*|\s*;\s*$/g, '').trim();
		if (newStyle) {
		el.setAttribute('style', newStyle);
		} else {
		el.removeAttribute('style');
		}
	});

	doc.body.appendChild(section);
	}

	// 代码块简化
	const codeBlocks = doc.querySelectorAll('div[style*="border-radius: 8px"]');
	codeBlocks.forEach(block => {
	const codeElement = block.querySelector('code');
	if (codeElement) {
		const codeText = codeElement.textContent || codeElement.innerText;
		const pre = doc.createElement('pre');
		const code = doc.createElement('code');

		pre.setAttribute('style',
		'background: linear-gradient(to bottom, #2a2c33 0%, #383a42 8px, #383a42 100%);' +
		'padding: 0;' +
		'border-radius: 6px;' +
		'overflow: hidden;' +
		'margin: 24px 0;' +
		'box-shadow: 0 2px 8px rgba(0,0,0,0.15);'
		);

		code.setAttribute('style',
		'color: #abb2bf;' +
		'font-family: "SF Mono", Consolas, Monaco, "Courier New", monospace;' +
		'font-size: 14px;' +
		'line-height: 1.7;' +
		'display: block;' +
		'white-space: pre;' +
		'padding: 16px 20px;' +
		'-webkit-font-smoothing: antialiased;' +
		'-moz-osx-font-smoothing: grayscale;'
		);

		code.textContent = codeText;
		pre.appendChild(code);
		block.parentNode.replaceChild(pre, block);
	}
	});

	// 列表项扁平化
	const listItems = doc.querySelectorAll('li');
	listItems.forEach(li => {
	let text = li.textContent || li.innerText;
	text = text.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim();
	li.innerHTML = '';
	li.textContent = text;
	const currentStyle = li.getAttribute('style') || '';
	li.setAttribute('style', currentStyle);
	});

	const simplifiedHTML = doc.body.innerHTML;
	const plainText = doc.body.textContent || '';

	const htmlBlob = new Blob([simplifiedHTML], { type: 'text/html' });
	const textBlob = new Blob([plainText], { type: 'text/plain' });

	const clipboardItem = new ClipboardItem({
	'text/html': htmlBlob,
	'text/plain': textBlob
	});

	await navigator.clipboard.write([clipboardItem]);

	this.copySuccess = true;
	this.showToast('复制成功', 'success');

	setTimeout(() => {
	this.copySuccess = false;
	}, 2000);
} catch (error) {
	console.error('复制失败:', error);
	this.showToast('复制失败', 'error');
}
}
