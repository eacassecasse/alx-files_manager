import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this._host = process.env.DB_HOST || 'localhost';
    this._port = process.env.DB_PORT || 27017;
    this._db = process.env.DB_DATABASE || 'files_manager';
    this._uri = `mongodb://${this._host}:${this._port}/${this._db}`;

    this.client = new MongoClient(this._uri, { useUnifiedTopology: true });

    try {
      this.client.connect();
    } catch (e) {
      throw new Error(('Failed to connect to the Database'));
    }
  }

  isAlive() {
    return this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      return await this.client.db().collection('users').countDocuments();
    } catch (e) {
      throw new Error('Unable to fetch the users count');
    }
  }

  async add(collection, data) {
    try {
      if (!collection || !data) {
        throw new Error('Required parameters not provided');
      }
      return await this.client.db().collection(collection).insertOne(data);
    } catch (e) {
      throw new Error('Insert operation failed');
    }
  }

  async find(collection, filter) {
    try {
      if (!collection || !filter) {
        throw new Error('Required parameters not provided');
      }
      return await this.client.db().collection(collection).findOne(filter);
    } catch (e) {
      throw new Error('Unable to fetch data');
    }
  }

  async findPaginated(collection, filter = {}, offset, size) {
    try {
      const pipeline = [];

      if (Object.keys(filter).length > 0) {
        pipeline.push({ $match: filter });
      }

      pipeline.push(
        { $skip: offset },
        { $limit: size },
      );

      return await this.client.db().collection(collection)
        .aggregate(pipeline).toArray();
    } catch (e) {
      throw new Error('Failed to fetch data');
    }
  }

  async update(collection, id, data) {
    try {
      if (!collection || !id || typeof data !== 'object') {
        throw new Error('Invalid parameters');
      }
      return await this.client.db().collection(collection)
        .updateOne({ _id: id }, { $set: data });
    } catch (e) {
      throw new Error('Insert operation failed');
    }
  }

  async nbFiles() {
    try {
      return await this.client.db().collection('files').countDocuments();
    } catch (e) {
      throw new Error('Unable to fetch the files count');
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
