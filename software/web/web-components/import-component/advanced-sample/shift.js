import {ImportComponent} from '../import-component.js';

export default class SecondScript extends ImportComponent {
  interval;
  attach(content) {
    const div = content.querySelector('div');
    div.style.border = '3px solid red';
    const button = content.querySelector('button');
    button.addEventListener('click', e => {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        div.textContent = div.textContent.slice(1) + div.textContent[0];
      }, 100);
    });
  }
  detach(content) { clearInterval(this.interval); }
}