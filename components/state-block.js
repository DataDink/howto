export default
/**
 * @class StateBlock
 * @extends HTMLElement
 * @description A declarative component that allows cycling content through a set of states.
 */
class StateBlock extends HTMLElement {
  static get observedAttributes() { return ['state']; }
  /**
   * @static
   * @readonly
   * @property {String} TAGNAME - The tag name for the custom element.
   */
  static get TAGNAME() { return 'state-block'; }
  /**
   * @static
   * @readonly
   * @property {String} CHANGEEVENTNAME - The name of the event fired when the state changes.
   */
  static get CHANGEEVENTNAME() { return 'state-changed'; }
  /** @property {String} state - The current state of the block. */
  get state() { return this.hasAttribute('state') ? this.getAttribute('state') : null; }
  set state(value) { value == null ? this.removeAttribute('state') : this.setAttribute('state', value); }
  /** @property {Array<string>} states - The valid states for the block in cycle order. */
  get states() { return this.hasAttribute('states') ? this.getAttribute('states').split(/\s+/g).filter(s => s.length) : []; }
  set states(value) { value == null ? this.removeAttribute('states') : this.setAttribute('states', StateBlock.normalize(value).join(' ')); }
  /**
   * @method next - Advances the state to the next in the cycle.
   */
  next() {
    const states = this.states;
    const index = (Math.max(0, states.indexOf(this.state))+1) % states.length;
    this.state = states[index];
  }
  /**
   * @static
   * @method split - Splits a string of space-delimited items into an array of unique items.
   * @param {String} items - A string of space-delimited items.
   * @returns {Array} An array of unique items.
   */
  static split(items) { 
    return items instanceof String 
      ? [...new Set(items.split(/\s+/g))].filter(s => s.length)
      : []; 
  }
  /**
   * @static
   * @method join - Joins a collection of values into a space-delimited string of unique values.
   * @param {String|Array} items - An array of values. Passing a string will assume it to be a single value.
   * @returns {String} a space-delimited string of unique values.
   */
  static join(items) { 
    return Symbol.iterator in items && (items = items instanceof String ? [items] : [...items]).length 
      ? [...new Set(items.map(v => `${v}`.replaceAll(/\s+/g, '-')))].join(' ') 
      : ''; 
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'state') { return; }
    this.dispatchEvent(new CustomEvent(StateBlock.CHANGEEVENTNAME, {
      bubbles: true,
      composed: true,
      detail: {
        oldState: oldValue,
        newState: newValue
      }
    }));
  }
  static StateTrigger = 
  /**
   * @static
   * @class StateTrigger
   * @memberof StateBlock
   * @extends HTMLElement
   * @description A custom element that listens for events and triggers the next state in a StateBlock.
   */
  class StateTrigger extends HTMLElement {
    static get observedAttributes() { return ['events']; }
    /**
     * @static
     * @readonly
     * @property {String} TAGNAME - The tag name for the custom element.
     */
    static get TAGNAME() { return 'state-trigger'; }
    /** @property {Array<string>} events - The events that will trigger the next state in the StateBlock. */
    get events() { return this.hasAttribute('event') ? StateBlock.split(this.getAttribute('events')) : []; }
    set events(value) { value == null ? this.removeAttribute('events') : this.setAttribute('events', StateBlock.join(value)); }
    #handler = e => { e.target.closest(StateBlock.TAGNAME)?.next(); }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name !== 'events') { return; }
      for (const remove of StateBlock.split(oldValue)) { this.removeEventListener(remove, this.#handler); }
      for (const add of StateBlock.split(newValue)) { this.addEventListener(add, this.#handler); }
    }
  }
}

export {StateBlock};
export const StateTrigger = StateBlock.StateTrigger;

customElements.define(StateBlock.TAGNAME, StateBlock);
customElements.define(StateTrigger.TAGNAME, StateTrigger);