import express from 'express';
import router from './routes';
import { errorResponse } from './middlewares/error';

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(router);

app.use(errorResponse);

app.listen(port, () => {
  console.log('App running on port: ', port);
});
