/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import BusinessError, { AuthError } from '../models/errors';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
<<<<<<< HEAD
      throw new BusinessError('Already exists');
=======
      res.status(400).json({ error: 'Already exist' });
      return;
>>>>>>> 3ab2494e6d23c1ede93108797d800ae87b32b1ea
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
    const { user } = req;

<<<<<<< HEAD
    if (!user) {
      throw new AuthError('Unauthorized');
    }

    return user;
=======
    res.status(200).json({ email: user.email, id: user._id.toString() });
>>>>>>> 3ab2494e6d23c1ede93108797d800ae87b32b1ea
  }
}
