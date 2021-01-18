import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {css, js, html, raw, svg} from '../dist';

const htmlTest = suite('html parsing');

function same(actual, expected){
  assert.equal(actual.toString(), expected)
}

htmlTest('Correctly expand self-closing tags', () => {
  same(html`<div />`, '<div></div>')
  same(html`<div/>`, '<div></div>')
  same(html`<span />`, '<span></span>')
  same(html`<picture class="test" />`, '<picture class="test"></picture>')
})

htmlTest("Don't expand built-in self-closing tags", () => {
  same(html`<img />`, '<img />')
  same(html`<input/>`, '<input/>')
  same(html`<meta/>`, '<meta/>')
})

htmlTest("Function parsing", () => {
  same(html`<div onclick=${Object}/>`, '<div></div>')
  same(html`<div onclick=${{}}/>`, '<div></div>')
  same(html`<div onclick=${ () => {} }/>`, '<div></div>')

  same(html`<div onclick=${'callback(event)'}/>`, '<div onclick="callback(event)"></div>')
  same(html`<div onclick="callback(event)"/>`, '<div onclick="callback(event)"></div>')
  same(html`<div onclick='callback(event)'/>`, '<div onclick=\'callback(event)\'></div>')
  same(html`<div onclick=callback(event)/>`, '<div onclick=callback(event)></div>')

  const onclick = () => {};
  onclick.toString = () => 'test';
  const clickHandler = {onclick};
  same(html`<div onclick=${clickHandler} />`, '<div onclick="test"></div>');

  const fn = () => {};
  fn.toString = () => 'console.log("test")';
  same(html`<div onclick=${fn}></div>`, '<div onclick="console.log(&quot;test&quot;)"></div>');

  const badClickHandler = {onclick: true};
  same(html`<div onclick=${badClickHandler} />`, '<div></div>');
})

htmlTest("Boolean setters", () => {
  same(html`<div .contentEditable=${false}/>`, '<div></div>');
  same(html`<div .contentEditable=${null}/>`, '<div></div>');
  same(html`<div .contentEditable=${undefined}/>`, '<div></div>');
  same(html`<div .contentEditable=${true}/>`, '<div contenteditable></div>');
  same(html`<div .whatever=${''}/>`, '<div whatever=""></div>');
  same(html`<div .whatever=${'hello'}/>`, '<div whatever="hello"></div>');
  same(html`<div .whatever=${false}/>`, '<div></div>');
})

htmlTest("Escaping", () => {
  same(html`<div escaped=${'"'}/>`, '<div escaped="&quot;"></div>');
  same(html`<div escaped=${null}/>`, '<div></div>');
})

htmlTest.run()
// const rect = svg.for({})`<rect/>`;
// assert(html.node`<div>${rect}</div>`, '<div><rect/></div>');
// assert(html`<svg>${rect}</svg>`, '<svg><rect/></svg>');
// assert(html`<svg>${rect.min().min()}</svg>`, '<svg><rect/></svg>');
// assert(html`<div>${Buffer.from('"')}</div>`, '<div>&quot;</div>');
// assert(html`<div>${new String('"')}</div>`, '<div>&quot;</div>');
// assert(html`<div data=${{no:1, withHyphens:2}}/>`, '<div data-no="1" data-with-hyphens="2"></div>');
// assert(html`<div .dataset=${{no:1, withHyphens:2}}/>`, '<div data-no="1" data-with-hyphens="2"></div>');
// assert(html`<object data=${'path'}/>`, '<object data="path"></object>');
// assert(html`<div aria=${{role: 'button', labelledby: 'id'}}/>`, '<div role="button" aria-labelledby="id"></div>');
// assert(html`<div>${[1,2].map(n => html`<p>${n}</p>`)}</div>`, '<div><p>1</p><p>2</p></div>');
// assert(html`<div>${[1,2].map(n => `<p>${n}</p>`)}</div>`, '<div>&lt;p&gt;1&lt;/p&gt;&lt;p&gt;2&lt;/p&gt;</div>');
// assert(html`<div>${{}}</div>`, '<div>[object Object]</div>');
// assert(html`<div>${null}</div>`, '<div></div>');
// assert(html`<div>${void 0}</div>`, '<div></div>');
// assert(html`<div>${true}</div>`, '<div>true</div>');
// assert(html.for({})`<div>${123}</div>`, '<div>123</div>');

// assert(html`<script>${js`function test() { console.log(1); }`}</script>`, '<script>function test() { console.log(1); }</script>');
// assert(html`<script>${js(function test() { console.log(0); })}</script>`, '<script>function test() { console.log(0); }</script>');
// assert(html`<style>${css`body { font-family: sans-serif; }`.min().min()}</style>`, '<style>body { font-family: sans-serif; }</style>');
// assert(html`<div>${raw`<bro"ken />`.min().min()}</div>`, '<div><bro"ken /></div>');
// assert(html`<div>${raw`<bro"ken ${2} />`}</div>`, '<div><bro"ken 2 /></div>');
// assert(html`<div>${raw('<bro"ken />')}</div>`, '<div><bro"ken /></div>');
// assert(html`<div test="${true}"></div>`.min().min(), '<div test="true"></div>');
// assert(html`<div test="${123}"></div>`.min(), '<div test="123"></div>');
// assert(html`<div onclick="${js`alert(1)`}"></div>`.min(), '<div onclick="alert(1)"></div>');
// const inlineStyle = css`font-family: sans-serif`;
// assert(html`<div style="${inlineStyle}"></div>`, '<div style="font-family: sans-serif"></div>');
// assert(html`<div style="${inlineStyle}"></div>`, '<div style="font-family: sans-serif"></div>');
// assert(html`<div style="${'font-family: sans-serif'}"></div>`, '<div style="font-family: sans-serif"></div>');