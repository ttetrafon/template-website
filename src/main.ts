// styles
import './styles/style.css';
// data
import { AppName } from './util/constants';
import { domainRoot } from './data/config';
import { aliases, routes } from './data/routes';
// components
import '../library/components/---/script';
import './components/page-1/script';
import './components/page-2/script';
// services
import { Logger } from '../library/services/logger';
import { Navigator } from 'lib/services/navigator';
import { State } from '../library/services/state';

const logger: Logger = Logger.getInstance();
logger.setLevel('debug');

document.body.classList.add('app-loading');

State.getInstance(AppName);
Navigator.getInstance(domainRoot, '#app', routes, aliases);

window.customElements.whenDefined('page-1').then(() => {
  const navPage1 = document.getElementById("page-1-link");
  if (navPage1) navPage1.addEventListener("click", Navigator.followLink.bind(this, navPage1, "page-one"));
});

window.customElements.whenDefined('page-2').then(() => {
  const navPage2 = document.getElementById("page-2-link");
  if (navPage2) navPage2.addEventListener("click", Navigator.followLink.bind(this, navPage2, "page-two"));
});

setTimeout(() => {
  document.body.classList.remove('app-loading');
}, 300);