import { setupServer } from './server.js';

const bootServer = async (): Promise<void> => {
  setupServer();
};

bootServer();
