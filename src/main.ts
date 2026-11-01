// styles
import './styles/style.css';
// data
import { AppName } from './util/constants';
import { domainRoot } from './data/config';
import { aliases, routes } from './data/routes';
// components
import 'library/lib-fe/components/404/script';
import 'library/lib-fe/components/md-editor/script';
import 'library/lib-fe/components/mk-line/script';
import './components/page-1/script';
import './components/page-2/script';
// services
import { Logger } from 'library/lib/services/logger';
import { Navigator } from 'library/lib-fe/services/navigator';
import { State } from 'library/lib-fe/services/state';
// util
import { WindowSizeWatcher } from 'library/lib-fe/util/WindowSize';
import { MkDocument } from 'library/lib-fe/types/mkEditor';
import { requestGet } from 'library/lib-fe/util/Requests';

const logger: Logger = Logger.getInstance();
logger.setLevel('debug');

const state = State.getInstance(AppName);
Navigator.getInstance(domainRoot, '#app', routes, aliases);
const wsw: WindowSizeWatcher = WindowSizeWatcher.getInstance(state);

window.customElements.whenDefined('page-1').then(() => {
  const navPage = document.getElementById("page-1-link");
  if (navPage) navPage.addEventListener("click", Navigator.followLink.bind(this, navPage, "page-one"));
});

window.customElements.whenDefined('page-2').then(() => {
  const navPage = document.getElementById("page-2-link");
  if (navPage) navPage.addEventListener("click", Navigator.followLink.bind(this, navPage, "page-two"));
});

window.customElements.whenDefined('mk-editor').then(() => {
  const navPage = document.getElementById("mk-editor-link");
  if (navPage) navPage.addEventListener("click", Navigator.followLink.bind(this, navPage, "mk-editor"));
});


setTimeout(() => {
  document.body.classList.remove('app-loading');
}, 300);

const testDoc: MkDocument = await requestGet<MkDocument>("./test-document.json");
if (testDoc) state.createObservable("0001-test-1000", testDoc);