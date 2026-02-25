// 代码高亮样式配置
export const CODE_HIGHLIGHT_STYLES = {
  'vs2015': {
    name: 'VS2015',
    styles: `
.hljs {
  background: #1e1e1e;
  color: #dcdcdc
}
.hljs-keyword,
.hljs-literal,
.hljs-name,
.hljs-symbol {
  color: #569cd6
}
.hljs-link {
  color: #569cd6;
  text-decoration: underline
}
.hljs-built_in,
.hljs-type {
  color: #4ec9b0
}
.hljs-class,
.hljs-number {
  color: #b8d7a3
}
.hljs-meta .hljs-string,
.hljs-string {
  color: #d69d85
}
.hljs-regexp,
.hljs-template-tag {
  color: #9a5334
}
.hljs-formula,
.hljs-function,
.hljs-params,
.hljs-subst,
.hljs-title {
  color: #dcdcdc
}
.hljs-comment,
.hljs-quote {
  color: #57a64a;
  font-style: italic
}
.hljs-doctag {
  color: #608b4e
}
.hljs-meta,
.hljs-meta .hljs-keyword,
.hljs-tag {
  color: #9b9b9b
}
.hljs-template-variable,
.hljs-variable {
  color: #bd63c5
}
.hljs-attr,
.hljs-attribute {
  color: #9cdcfe
}
.hljs-section {
  color: gold
}
.hljs-emphasis {
  font-style: italic
}
.hljs-strong {
  font-weight: 700
}
.hljs-bullet,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id,
.hljs-selector-pseudo,
.hljs-selector-tag {
  color: #d7ba7d
}
.hljs-addition {
  background-color: #144212;
  display: inline-block;
  width: 100%
}
.hljs-deletion {
  background-color: #600;
  display: inline-block;
  width: 100%
}
`
  },
  'atom-one-dark': {
    name: 'Atom One Dark',
    styles: `
.hljs {
  color: #abb2bf;
  background: #282c34
}
.hljs-comment,
.hljs-quote {
  color: #5c6370;
  font-style: italic
}
.hljs-doctag,
.hljs-keyword,
.hljs-formula {
  color: #c678dd
}
.hljs-section,
.hljs-name,
.hljs-selector-tag,
.hljs-deletion,
.hljs-subst {
  color: #e06c75
}
.hljs-literal {
  color: #56b6c2
}
.hljs-string,
.hljs-regexp,
.hljs-addition,
.hljs-attribute,
.hljs-meta .hljs-string {
  color: #98c379
}
.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-type,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-number {
  color: #d19a66
}
.hljs-symbol,
.hljs-bullet,
.hljs-link,
.hljs-meta,
.hljs-selector-id,
.hljs-title {
  color: #61aeee
}
.hljs-built_in,
.hljs-title.class_,
.hljs-class .hljs-title {
  color: #e6c07b
}
.hljs-emphasis {
  font-style: italic
}
.hljs-strong {
  font-weight: bold
}
.hljs-link {
  text-decoration: underline
}
`
  },
  'github': {
    name: 'GitHub',
    styles: `
.hljs {
  color: #24292e;
  background: #ffffff
}
.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
  color: #d73a49
}
.hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__,
.hljs-title.function_ {
  color: #6f42c1
}
.hljs-attr,
.hljs-attribute,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-operator,
.hljs-variable,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id {
  color: #005cc5
}
.hljs-regexp,
.hljs-string,
.hljs-meta .hljs-string {
  color: #032f62
}
.hljs-built_in,
.hljs-symbol {
  color: #e36209
}
.hljs-comment,
.hljs-code,
.hljs-formula {
  color: #6a737d
}
.hljs-name,
.hljs-quote,
.hljs-selector-tag,
.hljs-selector-pseudo {
  color: #22863a
}
.hljs-subst {
  color: #24292e
}
.hljs-section {
  color: #005cc5;
  font-weight: bold
}
.hljs-bullet {
  color: #735c0f
}
.hljs-emphasis {
  color: #24292e;
  font-style: italic
}
.hljs-strong {
  color: #24292e;
  font-weight: bold
}
.hljs-addition {
  color: #22863a;
  background-color: #f0fff4
}
.hljs-deletion {
  color: #b31d28;
  background-color: #ffeef0
}
.hljs-char.escape_,
.hljs-link,
.hljs-params,
.hljs-property,
.hljs-punctuation,
.hljs-tag {
  color: #24292e
}
`
  },
};
