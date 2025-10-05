import {ImportComponent} from 'import-component';

export default class FirstScript extends ImportComponent {
  attach(content) {
    const div = content.querySelector('div');
    div.style.border = '3px solid green';
    const button = content.querySelector('button');
    button.addEventListener('click', e => {
      div.textContent = div.textContent.split('').reverse().join('');
    });
  }
}