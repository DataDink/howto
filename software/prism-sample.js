import * as PRISMJS from '/howto/software/prism.js'; // TODO: Investigate the prismjs module support / looks to be there, but non standard

if (!customElements.get('prism-sample')) { 
  customElements.define('prism-sample', class extends HTMLElement {
    connectedCallback() {
      if (this.hasAttribute('src')) { this.#loadSrc(); }
      else { this.#loadContent(); }
    }
    async #loadSrc() {
      const src = this.getAttribute('src');
      const ext = src.split('.').pop().toLowerCase();
      const language = this.hasAttribute('language') ? this.getAttribute('language')
                      : ext === 'js' ? 'javascript'
                      : ext === 'css' ? 'css'
                      : 'html';
      const content = await (await fetch(src)).text();
      this.load(content, language);
    }
    async #loadContent() {
      await new Promise(resolve => setTimeout(resolve));
      const template = this.querySelector('template');
      const content = [...template?.content.cloneNode(true).childNodes]
        .map(n => n.nodeType === Node.TEXT_NODE ? n.textContent : n.outerHTML)
        .join('');
      const language = this.hasAttribute('language') ? this.getAttribute('language') : 'html';
      this.load(content, language);
    }
    load(content, language) {
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          @import '/howto/theme.css';
          @import '/howto/software/prism.css';
          :host {
            position: relative;
            min-width: 0;
            width: 100%;
          }
          pre[part="source"] {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: stretch;
            align-items: stretch;
            margin: 1em 0;
            padding: 2em 1em 0.5em;
            background: var(--background-contrast);
            color: var(--foreground-contrast);
            min-height: max-content;
            min-width: 7em;
            border-radius: 1rem;
            box-shadow: .5rem .5rem 1rem rgba(0,0,0,.5);
            gap: .25em;
          }
          pre[part="source"] > code {
            display: block;
            padding: 0;
            margin: 0;
            min-height: max-content;
            min-width: 0
            flex: 1;
            overflow: auto;
          }
          [part="preview"] {
            position: relative;
            display: block;
            margin: 1em 0;
            padding: .5em 1em;
            border: .1rem solid var(--foreground);
            border-radius: 1rem;
            box-shadow: .5rem .5rem 1rem rgba(0,0,0,.5);
          }
          [part="preview"]::before, 
          pre[part="source"]::before {
            content: 'sample';
            display: block;
            position: absolute;
            top: 0; left: 0;
            text-align: center;
            font-style: italic;
            opacity: .5;
            border: .1rem solid var(--foreground);
            border-radius: 1rem 0 1rem 0;
            padding: 0 1em;
          }
          pre[part="source"]::before { 
            content: 'source';
            border-color: var(--foreground-contrast); 
          }
        </style>
      `;

      const trimmed = content.replace(/^[\s\n\r]*[\r\n]+|[\s\r\n]+$/g, '');
      const indent = [...trimmed.matchAll(/^\s*(?=\S)/mg)].reduce((a, b) => Math.min(a, b[0].length), Infinity);
      const undented = trimmed.split('\n').map(l => l.slice(indent)).join('\n');

      if (this.hasAttribute('show-preview')) {
        const preview = document.createElement('div');
        preview.setAttribute('part', 'preview');
        preview.innerHTML = undented;
        const scripts = [...preview.querySelectorAll('script')];
        for (const script of scripts) { script.remove(); }
        shadow.appendChild(preview);
        for (const script of scripts) { new Function('sample', script.innerHTML)(preview); }
      }

      const source = document.createElement('pre');
      source.setAttribute('part', 'source');
      const code = source.appendChild(document.createElement('code'));
      code.classList.add('language-' + language);
      code.textContent = undented;
      shadow.appendChild(source);
      Prism.highlightElement(code);
    }
  });
}