import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middlewares/authenticate';

const jsonParser = express.json();

const router = Router();

export default router;
