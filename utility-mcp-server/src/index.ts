import {McpServerApplication} from './mcpServerApplication.js';
import {Configuration} from './configuration.js';

const configuration = new Configuration();
const mcpServerApplication = new McpServerApplication(configuration);
mcpServerApplication.start();
