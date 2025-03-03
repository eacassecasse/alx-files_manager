import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import redisClient from '../utils/redis';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// Helper function to send error responses and stop further processing
const sendErrorResponse = (res, status, message) => res.status(status).json({ error: message });

// Status route
router.get('/status', (req, res) => {
  res.status(200).json(AppController.getStatus());
});

// Stats route
router.get('/stats', async (req, res) => {
  try {
    const stats = await AppController.getStats();
    return res.status(200).json(stats);
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
});

// Create a new user
router.post('/users', UsersController.postNew);

// Connect route
router.get('/connect', AuthController.getConnect);

// Disconnect route
router.get('/disconnect', AuthController.getDisconnect);

// Get the current user
router.get('/users/me', UsersController.getMe);

// Upload a file
router.post('/files', async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return sendErrorResponse(res, 401, 'Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    const {
      name,
      type,
      parentId,
      isPublic,
      data,
    } = req.body;

    if (!name) return sendErrorResponse(res, 400, 'Missing name');
    if (!type || !['file', 'folder', 'image'].includes(type)) {
      return sendErrorResponse(res, 400, 'Invalid or missing type');
    }
    if (type !== 'folder' && !data) {
      return sendErrorResponse(res, 400, 'Missing data');
    }

    if (parentId) {
      const file = await FilesController.findFile(parentId);
      if (file.type !== 'folder') {
        return sendErrorResponse(res, 400, 'Parent is not a folder');
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
    return res.status(201).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  } catch (err) {
    return sendErrorResponse(res, 400, err.message);
  }
});

// Get a specific file
router.get('/files/:id', async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return sendErrorResponse(res, 401, 'Unauthorized');

  try {
    const user = await UsersController.getMe(token);
    const { id } = req.params;

    if (!id) return sendErrorResponse(res, 400, 'Missing required ID param');

    const file = await FilesController.getShow(user._id, id);
    return res.status(200).json(file);
  } catch (err) {
    return sendErrorResponse(res, 404, err.message);
  }
});

// List files with pagination
router.get('/files', async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return sendErrorResponse(res, 401, 'Unauthorized');

  try {
    const { parentId, page = 1 } = req.query;
    const files = await FilesController.getIndex(parentId, page);
    return res.status(200).json(files);
  } catch (err) {
    return sendErrorResponse(res, 400, err.message);
  }
});

export default router;
