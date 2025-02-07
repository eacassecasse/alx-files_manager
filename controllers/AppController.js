import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus() {
    return {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
  }

  static async getStats() {
    try {
      const nbUsers = await dbClient.nbUsers();
      const nbFiles = await dbClient.nbFiles();

      return {
        users: nbUsers,
        files: nbFiles,
      };
    } catch (err) {
      console.log('Error fetching stats:', err);
      return {
        error: 'Unable to fetch stats',
      };
    }
  }
}

export default AppController;
