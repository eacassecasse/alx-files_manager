import express from 'express';
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import redisClient from '../utils/redis';
import AuthController from '../controllers/AuthController';
import redisClient from '../utils/redis';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// Helper function to send error responses and stop further processing
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ error: message });
};

export default injectRoutes;