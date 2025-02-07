import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
<<<<<<< HEAD
import { ObjectId } from 'mongodb';
=======
>>>>>>> parent of 3ab2494 (Reapply "feat: An api using express.js")
import dbClient from '../utils/db';
import createFileWithDirectories from '../utils/shared';

class FilesController {
  static async postUpload(obj) {
    const toSave = {
      userId: ObjectId(obj.userId),
      name: obj.name,
      type: obj.type,
      isPublic: obj.isPublic,
      parentId: ObjectId(obj.parentId),
    };

    if (obj.type !== 'folder') {
      const dir = process.env.FOLDER_PATH
        ? process.env.FOLDER_PATH : '/tmp/files_manager';
      const localPath = `${dir}/${uuidv4()}`;
      const content = Buffer.from(obj.data, 'base64')
        .toString('utf-8');

      createFileWithDirectories(localPath, content);
      toSave.localPath = localPath;
    }

    return dbClient.add('files', toSave);
  }

  static async findFile(id) {
    const file = await dbClient.find('files', { _id: ObjectId(id) });

    if (!file) {
      throw new Error();
<<<<<<< HEAD
    }

    return file;
  }

  static async getShow(userId, id) {
    const file = await dbClient.find('files', { _id: ObjectId(id), userId });

    if (!file) {
      throw new Error('Not found');
=======
>>>>>>> parent of 3ab2494 (Reapply "feat: An api using express.js")
    }

    return file;
  }

  static async getShow(userId, id) {
    const file = await dbClient.find('files', { _id: ObjectId(id), userId });

    if (!file) {
      throw new Error('Not found');
    }

    return file;
  }

  static async getIndex(parentId, page) {
    const filter = parentId ? { parentId } : {};
    const size = 20;
    const offset = size * (page - 1);
    return dbClient.findPaginated('files', filter, offset, size);
  }
}

export default FilesController;
