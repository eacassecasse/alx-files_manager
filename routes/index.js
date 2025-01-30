import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import redisClient from '../utils/redis';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import BusinessError, { AuthError } from '../models/errors';

const router = express.Router();

// Status route
router.get('/status', (req, res) => {
  res.status(200).json(AppController.getStatus());
});

// Stats route
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await AppController.getStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
});

// Create a new user
router.post('/users', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) throw new BusinessError('Missing email');
  if (!password) throw new BusinessError('Missing password');

  try {
    const result = await UsersController.postNew(email, password);
    const user = result.ops[0];
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
});

// Connect route
router.get('/connect', async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    throw new AuthError('Unauthorized');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [email, password] = credentials.split(':');

  try {
    const token = await AuthController.getConnect(email, password);
    await redisClient.set(`auth_${token}`, token, 86400);
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

// Disconnect route
router.get('/disconnect', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new AuthError('Unauthorized');

  try {
    await AuthController.getDisconnect(token);
    await redisClient.del(`auth_${token}`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Get the current user
router.get('/users/me', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new AuthError('Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    res.status(200).json({ id: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
});

// Upload a file
router.post('/files', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new AuthError('Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    if (!name) throw new BusinessError('Missing name');
    if (!type || !['file', 'folder', 'image'].includes(type)) {
      throw new BusinessError('Invalid or missing type');
    }
    if (type !== 'folder' && !data) {
      throw new BusinessError('Missing data');
    }

    if (parentId) {
      const file = await FilesController.findFile(parentId);
      if (file.type !== 'folder') {
        throw new BusinessError('Parent is not a folder');
      }
    }

    const fileData = {
      userId: user._id,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      ...(type !== 'folder' && { data }),
    };

    const result = await FilesController.postUpload(fileData);
    const file = result.ops[0];
    res.status(201).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  } catch (err) {
    next(err);
  }
});

// Get a specific file
router.get('/files/:id', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new AuthError('Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    const { id } = req.params;

    if (!id) throw new BusinessError('Missing required ID param');

    const file = await FilesController.getShow(user._id, id);
    res.status(200).json(file);
  } catch (err) {
    next(err);
  }
});

// List files with pagination
router.get('/files', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new Auth('Unauthorized');

  try {
    const { parentId, page = 1 } = req.query;
    const files = await FilesController.getIndex(parentId, page);
    res.status(200).json(files);
  } catch (err) {
    next(err);
  }
});

router.put('/files/:id/publish', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new AuthError('Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    const { id } = req.params;

    if (!id) throw new BusinessError('Missing required ID param');

    const file = await FilesController.putPublish(user._id, id);

    res.status(200).json(file);
  } catch (err) {
    next(err);
  }
});

router.put('/files/:id/unpublish', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new AuthError('Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    const { id } = req.params;

    if (!id) throw new BusinessError('Missing required ID param');

    const file = await FilesController.putUnpublish(user._id, id);

    res.status(200).json(file);
  } catch (err) {
    next(err);
  }
});

router.get('/files/:id/data', async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) throw new AuthError('Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    const { id } = req.params;

    if (!id) throw new BusinessError('Missing required ID param');

    const content = await FilesController.getFile(user._id, id);
    res.status(200).json(content);
  } catch (err) {
    next(err);
  }
});

export default router;
