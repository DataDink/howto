import {ImportComponent} from '../import-component.js';

export default class FirstScript extends ImportComponent {
  attach(content) {
    const div = content.querySelector('div');
    const button = content.querySelector('button');
    button.addEventListener('click', e => {
      div.textContent = div.textContent.split('').reverse().join('');
    });
  }
}