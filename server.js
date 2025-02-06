import express from 'express';
import router from './routes';
import errorHandler from './middleware';

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(errorHandler);

app.use(router);

app.listen(port, () => {
  console.log('App running on port: ', port);
});
