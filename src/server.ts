import express from 'express';
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import allRouters from './routers/index';

const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  const corsOptions = {
    origin: ['http://localhost:5173'],
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    console.log('Request received at root path');
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
