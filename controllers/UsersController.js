import Sha1 from 'sha1';
import dbClient from '../utils/db';
import { BusinessError } from '../models/errors';

class UsersController {
  static async postNew(req, res, next) {
    const { email, password } = req.body;

    if (!email) return next(new BusinessError('Missing email'));
    if (!password) return next(new BusinessError('Missing password'));

    try {
      const user = await dbClient.find('users', { email });

      if (user) {
        return next(new BusinessError('Already exist'));
      }

      const hash = Sha1(password);

      const result = await dbClient.add('users', { email, password: hash });

      return res.status(201).json({ id: result.ops[0]._id, email: result.ops[0].email });
    } catch (err) {
      return next(err);
    }
  }

  static async getMe(token) {
    const user = await dbClient.find('users', { token });

    if (!user) {
      throw new Error('Unauthorized');
    }

    return user;
  }
}

export default UsersController;
