import Sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(email, password) {
    const user = await dbClient.find('users', { email });

    if (user) {
      throw new Error('Already exists');
    }

    const hash = Sha1(password);

    return dbClient.add('users', { email, password: hash });
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
