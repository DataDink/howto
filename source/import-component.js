export class ImportComponent {
  attach(content) { }
  detach(content) { }
}

customElements.define('import-component', class extends HTMLElement {
  static get observedAttributes() { return ['src', 'src-style', 'src-layout', 'src-script']; }

  get src() { return this.hasAttribute('src') ? this.getAttribute('src') : null; }
  set src(value) { value == null ? this.removeAttribute('src') : this.setAttribute('src', value); }
  get srcStyle() { return this.hasAttribute('src-style') ? this.getAttribute('src-style') : null; }
  set srcStyle(value) { value == null ? this.removeAttribute('src-style') : this.setAttribute('src-style', value); }
  get srcLayout() { return this.hasAttribute('src-layout') ? this.getAttribute('src-layout') : null; }
  set srcLayout(value) { value == null ? this.removeAttribute('src-layout') : this.setAttribute('src-layout', value); }
  get srcScript() { return this.hasAttribute('src-script') ? this.getAttribute('src-script') : null; }
  set srcScript(value) { value == null ? this.removeAttribute('src-script') : this.setAttribute('src-script', value); }

  #shadow = this.attachShadow({ mode: 'open' });
  #loadtimeout;
  #loadcallback() {
    clearTimeout(this.#loadtimeout);
    this.#loadtimeout = setTimeout(() => this.load());
  }
  attributeChangedCallback() { this.#loadcallback(); }
  connectedCallback() { this.#loadcallback(); }
  disconnectedCallback() { this.unload(); }

  #module;
  unload() {
    this.#shadow.innerHTML = '';
    if (!this.#module) { return; }
    this.#module.detach.call(this, this.#shadow);
    this.#module = null;
  }

  async load() {
    try {
      this.unload();
      const src = this.src;
      const srcStyle = this.srcStyle ?? src + '.css';
      const srcLayout = this.srcLayout ?? src + '.html';
      const srcScript = this.srcScript ?? src + '.js';
      const style = srcStyle.length ? `<style>@import url('${srcStyle}');</style>` : '';
      const layout = srcLayout.length ? await (await fetch(srcLayout)).text() : '';
      this.#shadow.innerHTML = `
        ${style}
        ${layout}
      `;
      if (srcScript.length) {
        const srcMod = new URL(srcScript, location);
        const script = await import(srcMod);
        this.#module = new script.default();
        this.#module.attach.call(this, this.#shadow);
      }
    } catch (error) {
      this.unload();
      throw error;
    }
  }
});
