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
    target.srcLayout = tabs[0]?.href;
    for (let tab of tabs) {
      tab.addEventListener('click', event => {
        event.preventDefault();
        target.srcLayout = event.target.href;
      });
    }
  }
});