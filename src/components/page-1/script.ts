import { Logger } from "library/lib/services/logger";
import { State } from "library/lib-fe/services/state";
import { Translations, Translator } from "library/lib-fe/services/translator";
import resetStyles from 'library/lib-fe/styles/reset.css?inline';
import componentStyles from './styles.css?inline';
import pageStyles from '../../styles/style.css?inline';
import templateHtml from './doc.html?raw';
import { AppName } from "../../util/constants";
import { OBSERVABLE_WINDOW_SIZE } from "library/lib-fe/data/constants";
import { WindowSize } from "library/lib-fe/types";

export type TestObservable = {
  counter: number;
}

const template: HTMLTemplateElement = document.createElement('template');
const componentName: string = "page-1";

template.innerHTML = /*html*/`
<style>
  ${resetStyles}
  ${pageStyles}
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

  private btn: HTMLButtonElement | null = null;
  private testObservable: TestObservable = { counter: 0 }

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
    if (this.initialised) return;

    Object.keys(this.translations).forEach((t: string) => {
      const el: HTMLElement | null = this.#shadow.getElementById(t);
      if (!el) return;

      this.textElements[t] = el;
    });

    this.s.createObservable("test-obs", this.testObservable, { broadcastCreation: true, localStorage: true });

    this.btn = this.#shadow.querySelector("button");
    this.btn?.addEventListener("click", () => {
      this.testObservable.counter += 1;
      this.l.debug("... testObservable:", this.testObservable);
      if (this.btn) {
        this.btn.innerText = `Value: ${this.testObservable.counter}`;
      }
      this.s.updateObservable("test-obs", this.testObservable);
    });

    this.s.subscribeToObservable(OBSERVABLE_WINDOW_SIZE, componentName, { "page-1-window-size": this.windowResized.bind(this) });
    this.windowResized(componentName, OBSERVABLE_WINDOW_SIZE, {
      height: window.innerHeight,
      width: window.innerWidth,
    });

    this.initialised = true;
  }
  disconnectedCallback() {
    this.s.unsubscribeFromObservable(OBSERVABLE_WINDOW_SIZE, componentName);
    if (this.i18n && this.t) this.t.unregisterElementsForTranslations(this.i18n, this.textElements);
  }
  adoptedCallback() {
  }

  async windowResized(subscriber: string, watchedPath: string, updatedValue: any) {
    console.log(`---> windowResized(${subscriber}, ${watchedPath}, ${JSON.stringify(updatedValue)})`);
    const value = updatedValue as WindowSize;

    const h: HTMLElement | null = this.#shadow.getElementById('window-height');
    if (h) h.innerText = value.height.toString();

    const w: HTMLElement | null = this.#shadow.getElementById('window-width');
    if (w) w.innerText = value.width.toString();
  }
}

window.customElements.define(componentName, Component);