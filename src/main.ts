import { AppName } from './util/constants';
// components
import '../library/components/---';
// styles
import './styles/style.css';
// services
import { State } from '../library/services/state';
import { Logger } from '../library/services/logger';

const logger: Logger = Logger.getInstance();
logger.setLevel('error');
logger.info("Test?!?!?");

const state: State = State.getInstance(AppName);
