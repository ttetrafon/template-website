import { Logger } from "lib/services/logger";
import { Translations, Translator } from "lib/services/translator";
import { State } from "lib/services/state";
import resetStyles from 'lib/styles/reset.css?inline';
import componentStyles from './styles.css?inline';
import templateHtml from './doc.html?raw';
import { AppName } from "../../util/constants";
import { type TestObservable } from "../page-1/script";

const template: HTMLTemplateElement = document.createElement('template');
const componentName: string = "page-2";

template.innerHTML = /*html*/`
<style>
  ${resetStyles}
  ${componentStyles}
</style>

${templateHtml}
`;

class Component extends HTMLElement {
  #shadow: ShadowRoot;
  private initialised: boolean = false;
  private l: Logger;
  private t: Translator;
  private s: State;

  private textElements: Record<string, HTMLElement> = {};
  private translations: Record<string, Translations> = {};

  private observableHolder: HTMLParagraphElement | null = null;

  constructor() {
    // Note that the DOM cannot be affected within the constructor and instead such manipulations must be deferred to the lifecycle methods.
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.

    template.shadowRootDelegatesFocus = true; // focused can be delegated within the component from the outside
    this.#shadow.appendChild(template.content.cloneNode(true));

    this.l = Logger.getInstance();
    this.t = Translator.getInstance();
    this.s = State.getInstance(AppName);
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'data', 'i18n']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get data() { return JSON.parse(this.getAttribute('data') ?? "{}"); }
  get label() { return this.getAttribute('label'); }
  get i18n() { return this.getAttribute('i18n'); }

  set data(value: string) { this.setAttribute('data', value); }
  set label(value: string | null) { this.setAttribute('label', value ?? ""); }
  set i18n(value: string | null) { this.setAttribute('i18n', value ?? 'en'); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    this.l.debug(`---> attributeChangedCallback(${name}, ${oldVal}, ${newVal})`, componentName);
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case 'i18n':
        this.t?.registerElementsForTranslations(newVal, this.textElements, this.translations);
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM. Note that this is not triggered when the element is created.
    // Can be triggered multiple times, especially if the component is moved around.
    if (this.initialised) return;

    Object.keys(this.translations).forEach((t: string) => {
      const el: HTMLElement | null = this.#shadow.getElementById(t);
      if (!el) return;

      this.textElements[t] = el;
    });

    this.observableHolder = this.#shadow.getElementById("obs-holder") as HTMLParagraphElement;
    this.getObservableValue();
    this.s.subscribeToObservable("test-obs", "page-2", this.observableSubscriber.bind(this));

    // Note that custom elements cannot access custom properties or custom methods of another custom element from `connectedCallback` if the second element appears later in the DOM.
    // This can be overcome by using `window.customElements.whenDefined('element-name').then(() => { ... })`.

    this.initialised = true;
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.

    if (this.i18n && this.t) this.t.unregisterElementsForTranslations(this.i18n, this.textElements);
    this.s.unsubscribeFromObservable("test-obs", "page-2");
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  async getObservableValue() {
    const value: number | null = await this.s.getValueFromObservable<number>("test-obs", "value");
    this.l.debug("... Page-2.getObservableValue:", value);
    if (value !== null) this.updateObservableValue(value);
  }

  observableSubscriber(subscriber: string, property: string, newValue: unknown) {
    this.l.debug(`---> Page-2.observableSubscriber(${subscriber}, ${property}, ${JSON.stringify(newValue)})`);
    const v = newValue as number;
    if (v === null || v === undefined) return;

    this.updateObservableValue(v);
  }

  updateObservableValue(value: number) {
    this.l.debug(`---> Page-2.updateObservableValue(${value})`);
    if (!this.observableHolder) return;
    this.observableHolder.textContent = `Observable value: ${value}`;
  }
}

window.customElements.define(componentName, Component);