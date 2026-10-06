import { AppName } from './util/constants';
// data
import { domainRoot } from './data/config';
import { aliases, routes } from './data/routes';
// components
import '../library/components/---/script';
import './components/page-1/script';
import './components/page-2/script';
// styles
import './styles/style.css';
// services
import { Logger } from '../library/services/logger';
import { Navigator } from 'lib/services/navigator';
import { State } from '../library/services/state';

const logger: Logger = Logger.getInstance();
logger.setLevel('debug');

State.getInstance(AppName);
Navigator.getInstance(domainRoot, '#app', routes, aliases);

const navPage1 = document.getElementById("page-1-link");
if (navPage1) {
  const followLinkBound = Navigator.followLink.bind(this, navPage1, "page-one");
  navPage1.addEventListener("click", followLinkBound);
}

const navPage2 = document.getElementById("page-2-link");
if (navPage2) {
  const followLinkBound = Navigator.followLink.bind(this, navPage2, "page-two");
  navPage2.addEventListener("click", followLinkBound);
}
