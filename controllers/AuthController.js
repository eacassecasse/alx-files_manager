import Sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(email, password) {
    const user = await dbClient.find('users', { email });

    if (!user || Sha1(password) !== user.hash) {
      throw new Error('Unauthorized');
    }

    const token = uuidv4();

    await dbClient.update('users', user._id, { token });

    return token;
  }

  static async getDisconnect(token) {
    const user = await dbClient.find('users', { token });

    if (!user) {
      throw new Error('Unauthorized');
    }

    await dbClient.update('users', user._id, { token: '' });
  }
}

export default AuthController;
