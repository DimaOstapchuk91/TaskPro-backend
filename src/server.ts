import express from 'express';
import { env } from './utils/env';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler.';

// import cors from 'cors';
// // import pino from 'pino-http';
// import cookieParser from 'cookie-parser';
import allRouters from './routers/index';
// import { env } from './utils/env.ts';
// import { notFoundHandler } from './middlewares/notFoundHandler.ts';
// import { errorHandler } from './middlewares/errorHandler.ts';

const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  app.use(cors());

  app.use(cookieParser());

  //   app.use(
  //     pino({
  //       transport: {
  //         target: 'pino-pretty',
  //       },
  //     }),
  //   );
  // закоментовано для розробки

  app.get('/', (req, res) => {
    res.json({
      message: 'Start page!',
    });
  });

  app.use(allRouters);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
