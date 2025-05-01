import * as PRISMJS from '/howto/source/prism.js'; // TODO: Investigate the prismjs module support / looks to be there, but non standard

if (!customElements.get('code-sample')) { 
  customElements.define('code-sample', class extends HTMLElement {
    get shadow() { return this.#shadow; } #shadow = this.attachShadow({ mode: 'open' });
    get content() { return this.#content; } #content = '';
    get language() { return this.#language; } #language = '';
    get name() { return this.#name; } #name = 'sample';

    connectedCallback() { this.load(); }

    async load() {
      const style = import.meta.resolve('./code-sample.css');
      this.#shadow.innerHTML = `<style>@import '${style}'</style>`;
      if (this.hasAttribute('src')) { await this.#configureFromSrc(); }
      else { await this.#configureFromTemplate(); }
      this.#render();
    }

    async #configureFromSrc() {
      const src = this.getAttribute('src');
      const file = src.split('/').pop();
      const ext = file.split('.').pop().toLowerCase();
      this.#name = file.length ? file.split('.').shift() : 'sample';
      this.#language = this.hasAttribute('language') ? this.getAttribute('language')
                      : ext === 'js' ? 'javascript'
                      : ext === 'css' ? 'css'
                      : 'html';
      this.#content = await (await fetch(src)).text();
    }

    async #configureFromTemplate() {
      await new Promise(resolve => setTimeout(resolve));
      const template = this.querySelector('template');
      this.#content = [...template?.content?.cloneNode(true).childNodes]
        .map(n => n.nodeType === Node.TEXT_NODE ? n.textContent : n.outerHTML)
        .join('');
      this.#language = this.hasAttribute('language') ? this.getAttribute('language') : 'html';
    }

    #render() {
      const formatted = this.#format();

      if (this.hasAttribute('show-preview')) {
        const preview = document.createElement('div');
        preview.setAttribute('part', 'preview');
        preview.innerHTML = formatted;
        const scripts = [...preview.querySelectorAll('script')];
        for (const script of scripts) { script.remove(); }
        this.#shadow.appendChild(preview);
        for (const script of scripts) { new Function('sample', script.innerHTML)(preview); }
      }

      const source = document.createElement('pre');
      source.setAttribute('part', 'source');
      const menu = source.appendChild(document.createElement('menu'));
      const copy = menu.appendChild(document.createElement('button'));
      copy.textContent = 'copy';
      copy.addEventListener('click', e => this.copyToClipboard());
      const download = menu.appendChild(document.createElement('button'));
      download.textContent = 'download';
      download.addEventListener('click', e => this.download());
      const code = source.appendChild(document.createElement('code'));
      code.classList.add('language-' + this.#language);
      code.textContent = formatted;
      this.#shadow.appendChild(source);
      Prism.highlightElement(code);
    }

    #format() {
      const trimmed = this.#content.replace(/^[\s\n\r]*[\r\n]+|[\s\r\n]+$/g, '');
      const indent = [...trimmed.matchAll(/^\s*(?=\S)/mg)].reduce((a, b) => Math.min(a, b[0].length), Infinity);
      const undented = trimmed.split('\n').map(l => l.slice(indent)).join('\n');
      return this.#language === 'html' 
        ? this.#formatNodes([...new DOMParser().parseFromString(undented, 'text/html').body.childNodes])
        : undented;
    }

    #formatNodes(nodes) { // Because template content looses its formatting
      let reformatted = '';
      let current = 1;
      for (let node of nodes) {
        if (node instanceof Element) {
          const tag = node.tagName.toLowerCase();
          const attrs = [...node.attributes].map(a => `${a.name}="${a.value}"`);
          reformatted += `<${tag}`;
          if (attrs.length) { reformatted += ` ${attrs.shift()}`; }
          for (const attr of attrs) {
            reformatted += `\n${' '.repeat(tag.length + 1 + current, ' ')}${attr}`;
          }
          reformatted += '>';
          reformatted += this.#formatNodes([...node.childNodes]);
          reformatted += `</${tag}>`;
          continue;
        }
        const text = node.outerHTML?.length ? node.outerHTML : node.textContent ?? '';
        reformatted += text;
        const space = [...text.matchAll(/^\s+?$/gm)]?.at(-1)?.at(-1);
        if (space != null) { current = space.length; }
      }
      return reformatted;
    }

    copyToClipboard() {
      const range = document.createRange();
      range.selectNodeContents(this.#shadow.querySelector('code'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const item = new ClipboardItem({ 'text/plain': this.#content });
      navigator.clipboard.write([item]);
    }

    download() {
      const ext = this.#language === 'javascript' ? 'js'
                : this.#language === 'css' ? 'css'
                : 'html';
      const blob = new Blob([this.#content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.#name}.${ext}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 1000);
    }
  });
}
