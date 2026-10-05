import { AppName } from './util/constants';
// components
import '../library/components/---/script';
// styles
import './styles/style.css';
// services
import { State } from '../library/services/state';
import { Logger } from '../library/services/logger';

const logger: Logger = Logger.getInstance();
logger.setLevel('info');
logger.info("Test?!?!?", { a: 1, b: 2 });

const state: State = State.getInstance(AppName);
