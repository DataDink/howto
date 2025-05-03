import * as IMPORTCONTENT from '/howto/source/import-component.js';

customElements.define('tab-content', class extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        @import url('/howto/site.css');
        :host {
          width: 100%;
          height: max-content;
          min-height: 75vh;
        }
        a.active {
          color: var(--background-highlight);
          background-color: var(--foreground-highlight);
        }
      </style>
      <nav part="tabs"></nav>
      <import-component part="content"
                        src-style="/howto/site.css"
                        src-script="">
      </import-component>
    `;
    const target = shadow.querySelector('import-component');
    const nav = shadow.querySelector('nav');
    const tabs = [...this.querySelectorAll('a')].map(a => nav.appendChild(a));
    function select(tab) {
      target.srcLayout = tab.href;
      for (let t of tabs) { t.classList.remove('active'); }
      tab.classList.add('active');
    }
    select(tabs[0]);
    for (let tab of tabs) {
      tab.addEventListener('click', event => {
        event.preventDefault();
        select(tab);
      });
    }
  }
});