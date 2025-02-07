import Sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { AuthError } from '../models/errors';

class AuthController {
  static async getConnect(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return next(new AuthError('Unauthorized'));
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    try {
      const user = await dbClient.find('users', { email });

      if (!user || Sha1(password) !== user.password) {
        return next(new AuthError('Unauthorized'));
      }

      const token = uuidv4();

      await dbClient.update('users', user._id, { token });

      redisClient.set(`auth_${token}`, token, 86400);
      return res.status(200).json({ token });
    } catch (error) {
      return next(error);
    }
  }

  static async getDisconnect(req, res, next) {
    const token = req.headers['x-token'];

    if (!token) return next(new AuthError('Unauthorized'));

    try {
      const user = await dbClient.find('users', { token });

      if (!user) {
        return next(new AuthError('Unauthorized'));
      }

      await dbClient.update('users', user._id, { token: '' });

      redisClient.del(`auth_${token}`);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;
