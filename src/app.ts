import express from 'express';
import config from 'config';
import connectDB from './utils/connectDB';
import log from './utils/logger';
import 'dotenv/config';
import router from './routes/index.routes';
import deserializeUser from './middleware/deserializeUser';

const app = express();

app.use(express.json());

app.use(deserializeUser);

app.use(router);

const port = config.get('port');

app.listen(port, async () => {
  log.info(`Server listening on port ${port}`);

  await connectDB();
});
