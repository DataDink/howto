import {ImportComponent} from '../import-component.js';

export default class ThirdScript extends ImportComponent {
  attach(content) {
    const div = content.querySelector('div');
    div.style.border = '3px solid yellow';
    const button = content.querySelector('button');
    button.addEventListener('click', e => {
      const text = div.textContent;
      const incremented = text.split('').map(c => String.fromCharCode(Math.max(32, (c.charCodeAt(0) + 1) % 128))).join('');
      div.textContent = incremented;
    });
  }
}