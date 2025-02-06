/* eslint-disable import/no-named-as-default */
import { v4 as uuidv4 } from 'uuid';
<<<<<<< HEAD
import dbClient from '../utils/db';
import { AuthError } from '../models/errors';

class AuthController {
  static async getConnect(email, password) {
    const user = await dbClient.find('users', { email });

    if (!user || Sha1(password) !== user.password) {
      throw new AuthError('Unauthorized');
    }
=======
import redisClient from '../utils/redis';
>>>>>>> 3ab2494e6d23c1ede93108797d800ae87b32b1ea

export default class AuthController {
  static async getConnect(req, res) {
    const { user } = req;
    const token = uuidv4();

    await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);
    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

<<<<<<< HEAD
    if (!user) {
      throw new AuthError('Unauthorized');
    }

    await dbClient.update('users', user._id, { token: '' });
=======
    await redisClient.del(`auth_${token}`);
    res.status(204).send();
>>>>>>> 3ab2494e6d23c1ede93108797d800ae87b32b1ea
  }
}
