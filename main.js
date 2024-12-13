import redisClient from './utils/redis';
import dbClient from './utils/db';

(async () => {
  console.log(await dbClient.addUser('admin1@servor.tech', '@6m!n1;'));
})();
