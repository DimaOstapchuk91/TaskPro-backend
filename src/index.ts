import { checkDbConnection } from './db/db.js';
import { setupServer } from './server.js';

const bootServer = async (): Promise<void> => {
  await checkDbConnection();
  setupServer();
};

bootServer();
