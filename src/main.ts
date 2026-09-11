import { AppName } from './util/constants';
// components
// styles
import './styles/style.css';
// services
import { Logger } from '../library/services/logger';

const logger: Logger = new Logger('debug', AppName);

logger.log("Test?!?!?");
